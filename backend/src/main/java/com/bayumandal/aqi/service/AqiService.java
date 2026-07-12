package com.bayumandal.aqi.service;

import com.bayumandal.aqi.config.AppProperties;
import com.bayumandal.aqi.dto.AqiSample;
import com.bayumandal.aqi.dto.CityAqiDto;
import com.bayumandal.aqi.dto.CountryRankDto;
import com.bayumandal.aqi.dto.GeoResultDto;
import com.bayumandal.aqi.dto.GlobalStatsDto;
import com.bayumandal.aqi.dto.PollutantDto;
import com.bayumandal.aqi.dto.RecommendationDto;
import com.bayumandal.aqi.dto.TrendPointDto;
import com.bayumandal.aqi.dto.WeatherDto;
import com.bayumandal.aqi.entity.AirQualityReading;
import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.AirQualityReadingRepository;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class AqiService {

    private static final Logger log = LoggerFactory.getLogger(AqiService.class);
    private static final DateTimeFormatter HHMM =
            DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter MMDD_HHMM =
            DateTimeFormatter.ofPattern("MM-dd HH:mm").withZone(ZoneId.systemDefault());

    private final OpenMeteoClient client;
    private final AqiCalculator calc;
    private final MonitoredLocationRepository locationRepo;
    private final AirQualityReadingRepository readingRepo;
    private final AppProperties props;

    private final Cache<String, CityAqiDto> pointCache;
    private final Cache<String, List<TrendPointDto>> trendCache;
    private final Cache<String, WeatherDto> weatherCache;

    private volatile Map<String, CityAqiDto> snapshot = new LinkedHashMap<>();
    private volatile Instant lastRefresh;

    public AqiService(OpenMeteoClient client,
                      AqiCalculator calc,
                      MonitoredLocationRepository locationRepo,
                      AirQualityReadingRepository readingRepo,
                      AppProperties props) {
        this.client = client;
        this.calc = calc;
        this.locationRepo = locationRepo;
        this.readingRepo = readingRepo;
        this.props = props;
        this.pointCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(props.getPointCacheTtlSeconds()))
                .maximumSize(5_000)
                .build();
        this.trendCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(props.getTrendCacheTtlSeconds()))
                .maximumSize(2_000)
                .build();
        this.weatherCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(props.getPointCacheTtlSeconds()))
                .maximumSize(2_000)
                .build();
    }

    public void initPlaceholderSnapshot() {
        Map<String, CityAqiDto> placeholder = new LinkedHashMap<>();
        for (MonitoredLocation loc : locationRepo.findAll()) {
            String key = key(loc.getName(), loc.getCountry());
            placeholder.put(key, toDto(idFor(key), loc.getName(), loc.getCountry(),
                    loc.getLatitude(), loc.getLongitude(), AqiSample.EMPTY));
        }
        if (this.snapshot.isEmpty()) {
            this.snapshot = placeholder;
        }
    }

    public void refreshAll() {
        List<MonitoredLocation> locations = locationRepo.findAll();
        if (locations.isEmpty()) {
            log.warn("No monitored locations to refresh.Is the seeder configured?");
            return;
        }

        int batchSize = Math.max(1, props.getBatchSize());
        Map<String, CityAqiDto> next = new LinkedHashMap<>();
        List<AirQualityReading> toPersist = new ArrayList<>();
        Instant now = Instant.now();
        int fetched = 0;

        for (int i = 0; i < locations.size(); i += batchSize) {
            List<MonitoredLocation> batch = locations.subList(i, Math.min(i + batchSize, locations.size()));
            List<AqiSample> samples = client.fetchCurrentBatch(batch);
            for (int j = 0; j < batch.size(); j++) {
                MonitoredLocation loc = batch.get(j);
                AqiSample s = j < samples.size() ? samples.get(j) : AqiSample.EMPTY;
                String key = key(loc.getName(), loc.getCountry());
                CityAqiDto dto = toDto(idFor(key), loc.getName(), loc.getCountry(),
                        loc.getLatitude(), loc.getLongitude(), s);
                next.put(key, dto);
                if (s.aqi() != null) {
                    toPersist.add(toEntity(dto, s, now));
                    fetched++;
                }
            }
        }

        this.snapshot = next;
        this.lastRefresh = now;
        if (!toPersist.isEmpty()) {
            readingRepo.saveAll(toPersist);
        }
        log.info("Refreshed {} cities from Open-Meteo, persisted {} readings", next.size(), fetched);
    }

    public List<CityAqiDto> getMonitoredSnapshot() {
        return new ArrayList<>(snapshot.values());
    }

    public CityAqiDto getPoint(double lat, double lng, String name, String country) {
        double nLat = Math.max(-90, Math.min(90, lat));
        double nLng = normalizeLng(lng);

        String cacheKey = coordKey(nLat, nLng);
        CityAqiDto cached = pointCache.getIfPresent(cacheKey);
        if (cached != null) {
            return relabel(cached, name, country);
        }
        AqiSample sample = client.fetchCurrentPoint(nLat, nLng);

        String label;
        String ctry;
        if (name != null && !name.isBlank()) {
            label = name;
            ctry = country == null ? "" : country;
        } else {
            GeoResultDto place = client.reverseGeocode(nLat, nLng);
            if (place != null && !place.name().isBlank()) {
                label = place.name();
                ctry = place.country() == null ? "" : place.country();
            } else {
                label = String.format(Locale.US, "Location %.2f, %.2f", nLat, nLng);
                ctry = place != null && place.country() != null ? place.country() : "";
            }
        }

        CityAqiDto dto = toDto(idFor(cacheKey), label, ctry, nLat, nLng, sample);
        if (sample.aqi() != null) {
            pointCache.put(cacheKey, dto);
            readingRepo.save(toEntity(dto, sample, Instant.now()));
        }
        return dto;
    }

    public Optional<CityAqiDto> search(String query) {
        List<GeoResultDto> matches = client.geocode(query, 1);
        if (matches.isEmpty()) return Optional.empty();
        GeoResultDto m = matches.get(0);
        return Optional.of(getPoint(m.latitude(), m.longitude(), m.name(), m.country()));
    }

    public List<GeoResultDto> geocode(String query) {
        return client.geocode(query, 5);
    }

    public List<TrendPointDto> getTrend(double lat, double lng) {
        return trendCache.get(coordKey(lat, lng), k -> client.fetchTrend(lat, lng));
    }

    public WeatherDto getWeather(double lat, double lng) {
        return weatherCache.get(coordKey(lat, lng), k -> client.fetchWeather(lat, lng));
    }

    public List<TrendPointDto> getHistory(double lat, double lng, int hours) {
        int h = Math.max(1, Math.min(hours, 168));
        Instant since = Instant.now().minus(Duration.ofHours(h));
        double eps = 0.05;
        DateTimeFormatter fmt = h <= 48 ? HHMM : MMDD_HHMM;

        List<TrendPointDto> points = new ArrayList<>();
        var rows = readingRepo.findByLatitudeBetweenAndLongitudeBetweenAndFetchedAtAfterOrderByFetchedAtAsc(
                lat - eps, lat + eps, lng - eps, lng + eps, since);
        for (var r : rows) {
            if (r.getAqi() == null) continue;
            int a = Math.max(0, Math.min(500, r.getAqi()));
            points.add(new TrendPointDto(fmt.format(r.getFetchedAt()), a, false));
        }
        return points;
    }

    public List<PollutantDto> getPollutants(double lat, double lng) {
        CityAqiDto dto = getPoint(lat, lng, null, null);
        return calc.pollutants(sampleFrom(dto));
    }

    public List<CountryRankDto> getCountryRanking(int limit) {
        record Agg(double sum, int count) {}
        Map<String, Agg> byCountry = new LinkedHashMap<>();
        for (CityAqiDto c : snapshot.values()) {
            if (c.aqi() == null || c.country() == null || c.country().isBlank()) continue;
            byCountry.merge(c.country(), new Agg(c.aqi(), 1),
                    (a, b) -> new Agg(a.sum() + b.sum(), a.count() + b.count()));
        }

        List<CountryRankDto> ranked = new ArrayList<>();
        byCountry.entrySet().stream()
                .map(e -> Map.entry(e.getKey(), (int) Math.round(e.getValue().sum() / e.getValue().count())))
                .sorted(Comparator.comparingInt((Map.Entry<String, Integer> e) -> e.getValue()).reversed())
                .limit(Math.max(1, limit))
                .forEach(e -> {
                    int rank = ranked.size() + 1;
                    ranked.add(new CountryRankDto(rank, e.getKey(), e.getValue(),
                            CountryFlags.of(e.getKey()), calc.band(e.getValue()), calc.color(e.getValue())));
                });
        return ranked;
    }

    public GlobalStatsDto getStats() {
        List<CityAqiDto> withData = snapshot.values().stream()
                .filter(c -> c.aqi() != null)
                .toList();
        int count = snapshot.size();
        long countries = snapshot.values().stream()
                .map(CityAqiDto::country)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();
        int avg = withData.isEmpty() ? 0
                : (int) Math.round(withData.stream().mapToInt(CityAqiDto::aqi).average().orElse(0));
        String updatedAt = lastRefresh != null ? lastRefresh.toString() : Instant.now().toString();
        return new GlobalStatsDto(count, (int) countries, avg, updatedAt);
    }

    public Instant getLastRefresh() {
        return lastRefresh;
    }

    private CityAqiDto toDto(String id, String name, String country, double lat, double lng, AqiSample s) {
        Integer aqi = s.aqi();
        String updatedAt = s.sourceTime() != null ? s.sourceTime().toString() : Instant.now().toString();
        return new CityAqiDto(id, name, country, lat, lng, aqi,
                s.pm25(), s.pm10(), s.ozone(), s.no2(), s.so2(), s.co(),
                calc.dominantPollutant(s), calc.band(aqi), calc.color(aqi), updatedAt);
    }

    private AirQualityReading toEntity(CityAqiDto dto, AqiSample s, Instant fetchedAt) {
        return new AirQualityReading(dto.name(), dto.country(), dto.lat(), dto.lng(),
                dto.aqi(), s.pm25(), s.pm10(), s.ozone(), s.no2(), s.so2(), s.co(),
                dto.dominantPollutant(), dto.band(), s.sourceTime(), fetchedAt);
    }

    private AqiSample sampleFrom(CityAqiDto d) {
        return new AqiSample(d.aqi(), d.pm25(), d.pm10(), d.ozone(), d.no2(), d.so2(), d.co(), null);
    }

    private CityAqiDto relabel(CityAqiDto dto, String name, String country) {
        if ((name == null || name.isBlank()) && (country == null || country.isBlank())) {
            return dto;
        }
        String newName = (name == null || name.isBlank()) ? dto.name() : name;
        String newCountry = (country == null || country.isBlank()) ? dto.country() : country;
        return new CityAqiDto(dto.id(), newName, newCountry, dto.lat(), dto.lng(), dto.aqi(),
                dto.pm25(), dto.pm10(), dto.ozone(), dto.no2(), dto.so2(), dto.co(),
                dto.dominantPollutant(), dto.band(), dto.color(), dto.updatedAt());
    }

    private static String key(String name, String country) {
        return name + "|" + country;
    }

    private static String idFor(String key) {
        return Integer.toHexString(key.hashCode());
    }

    private static String coordKey(double lat, double lng) {
        return String.format(Locale.US, "%.2f,%.2f", lat, lng);
    }

    private static double normalizeLng(double lng) {
        return ((lng + 180) % 360 + 360) % 360 - 180;
    }
}
