package com.bayumandal.aqi.service;

import com.bayumandal.aqi.config.AppProperties;
import com.bayumandal.aqi.dto.AqiSample;
import com.bayumandal.aqi.dto.GeoResultDto;
import com.bayumandal.aqi.dto.TrendPointDto;
import com.bayumandal.aqi.dto.WeatherDto;
import com.bayumandal.aqi.entity.MonitoredLocation;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class OpenMeteoClient {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoClient.class);

    private static final String CURRENT_FIELDS =
            "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide";

    private final RestClient restClient;
    private final AppProperties props;

    public OpenMeteoClient(RestClient openMeteoRestClient, AppProperties props) {
        this.restClient = openMeteoRestClient;
        this.props = props;
    }

    public List<AqiSample> fetchCurrentBatch(List<MonitoredLocation> locations) {
        List<AqiSample> results = new ArrayList<>(locations.size());
        if (locations.isEmpty()) return results;

        StringBuilder lats = new StringBuilder();
        StringBuilder lngs = new StringBuilder();
        for (int i = 0; i < locations.size(); i++) {
            if (i > 0) { lats.append(','); lngs.append(','); }
            lats.append(fmt(locations.get(i).getLatitude()));
            lngs.append(fmt(locations.get(i).getLongitude()));
        }

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getOpenmeteo().getAirQualityUrl())
                    .queryParam("latitude", lats.toString())
                    .queryParam("longitude", lngs.toString())
                    .queryParam("current", CURRENT_FIELDS)
                    .queryParam("timeformat", "unixtime")
                    .build()
                    .encode()
                    .toUri();

            JsonNode root = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            if (root == null) {
                return fillEmpty(locations.size());
            }
            if (root.isArray()) {
                for (JsonNode entry : root) {
                    results.add(parseCurrent(entry.path("current")));
                }
            } else {
                results.add(parseCurrent(root.path("current")));
            }
        } catch (Exception e) {
            log.warn("Open-Meteo batch fetch failed for {} locations: {}", locations.size(), e.getMessage());
            return fillEmpty(locations.size());
        }

        while (results.size() < locations.size()) results.add(AqiSample.EMPTY);
        return results;
    }

    public AqiSample fetchCurrentPoint(double lat, double lng) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getOpenmeteo().getAirQualityUrl())
                    .queryParam("latitude", fmt(lat))
                    .queryParam("longitude", fmt(lng))
                    .queryParam("current", CURRENT_FIELDS)
                    .queryParam("timeformat", "unixtime")
                    .build()
                    .encode()
                    .toUri();
            JsonNode root = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            if (root == null) return AqiSample.EMPTY;
            JsonNode entry = root.isArray() ? root.get(0) : root;
            return parseCurrent(entry == null ? null : entry.path("current"));
        } catch (Exception e) {
            log.warn("Open-Meteo point fetch failed for {},{}: {}", lat, lng, e.getMessage());
            return AqiSample.EMPTY;
        }
    }

    public List<TrendPointDto> fetchTrend(double lat, double lng) {
        List<TrendPointDto> points = new ArrayList<>();
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getOpenmeteo().getAirQualityUrl())
                    .queryParam("latitude", fmt(lat))
                    .queryParam("longitude", fmt(lng))
                    .queryParam("hourly", "us_aqi")
                    .queryParam("current", "us_aqi")
                    .queryParam("timezone", "auto")
                    .queryParam("past_days", 1)
                    .queryParam("forecast_days", 1)
                    .build()
                    .encode()
                    .toUri();

            JsonNode root = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            if (root == null) return points;
            if (root.isArray()) root = root.get(0);
            if (root == null) return points;

            JsonNode hourly = root.path("hourly");
            JsonNode times = hourly.path("time");
            JsonNode values = hourly.path("us_aqi");
            if (!times.isArray() || !values.isArray()) return points;

            String currentTime = root.path("current").path("time").asText("");

            int nowIdx = 0;
            for (int i = 0; i < times.size(); i++) {
                if (times.get(i).asText("").compareTo(currentTime) <= 0) nowIdx = i;
                else break;
            }

            int start = Math.max(0, nowIdx - 6);
            int end = Math.min(times.size(), start + 24);

            for (int i = start; i < end; i++) {
                JsonNode v = values.get(i);
                if (v == null || v.isNull()) continue;
                String iso = times.get(i).asText("");
                String hhmm = iso.length() >= 16 ? iso.substring(11, 16) : iso;
                boolean isForecast = iso.compareTo(currentTime) > 0;
                points.add(new TrendPointDto(hhmm, clampAqi((int) Math.round(v.asDouble())), isForecast));
            }
        } catch (Exception e) {
            log.warn("Open-Meteo trend fetch failed for {},{}: {}", lat, lng, e.getMessage());
        }
        return points;
    }

    public WeatherDto fetchWeather(double lat, double lng) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getOpenmeteo().getWeatherUrl())
                    .queryParam("latitude", fmt(lat))
                    .queryParam("longitude", fmt(lng))
                    .queryParam("current",
                            "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m")
                    .queryParam("timezone", "auto")
                    .build()
                    .encode()
                    .toUri();

            JsonNode root = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            if (root == null) return null;
            if (root.isArray()) root = root.get(0);
            if (root == null) return null;
            JsonNode c = root.path("current");
            if (c.isMissingNode() || c.isNull()) return null;

            Integer code = asInt(c, "weather_code");
            return new WeatherDto(
                    asDouble(c, "temperature_2m"),
                    asDouble(c, "apparent_temperature"),
                    asInt(c, "relative_humidity_2m"),
                    asDouble(c, "wind_speed_10m"),
                    asDouble(c, "pressure_msl"),
                    code,
                    weatherDescription(code)
            );
        } catch (Exception e) {
            log.warn("Open-Meteo weather fetch failed for {},{}: {}", lat, lng, e.getMessage());
            return null;
        }
    }

    private static String weatherDescription(Integer code) {
        if (code == null) return "—";
        return switch (code) {
            case 0 -> "Clear sky";
            case 1 -> "Mainly clear";
            case 2 -> "Partly cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Fog";
            case 51, 53, 55 -> "Drizzle";
            case 56, 57 -> "Freezing drizzle";
            case 61, 63, 65 -> "Rain";
            case 66, 67 -> "Freezing rain";
            case 71, 73, 75 -> "Snowfall";
            case 77 -> "Snow grains";
            case 80, 81, 82 -> "Rain showers";
            case 85, 86 -> "Snow showers";
            case 95 -> "Thunderstorm";
            case 96, 99 -> "Thunderstorm with hail";
            default -> "—";
        };
    }

    public List<GeoResultDto> geocode(String query, int count) {
        List<GeoResultDto> matches = new ArrayList<>();
        if (query == null || query.isBlank()) return matches;
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getOpenmeteo().getGeocodingUrl())
                    .queryParam("name", query.trim())
                    .queryParam("count", count)
                    .queryParam("language", "en")
                    .queryParam("format", "json")
                    .build()
                    .encode()
                    .toUri();

            JsonNode root = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            JsonNode results = root == null ? null : root.path("results");
            if (results == null || !results.isArray()) return matches;

            for (JsonNode r : results) {
                matches.add(new GeoResultDto(
                        r.path("name").asText(""),
                        r.path("country").asText(""),
                        r.path("admin1").asText(null),
                        r.path("latitude").asDouble(),
                        r.path("longitude").asDouble()
                ));
            }
        } catch (Exception e) {
            log.warn("Open-Meteo geocoding failed for '{}': {}", query, e.getMessage());
        }
        return matches;
    }

    public GeoResultDto reverseGeocode(double lat, double lng) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(props.getReverseGeocodeUrl())
                    .queryParam("latitude", fmt(lat))
                    .queryParam("longitude", fmt(lng))
                    .queryParam("localityLanguage", "en")
                    .build()
                    .encode()
                    .toUri();

            JsonNode r = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            if (r == null) return null;

            String name = firstNonBlank(
                    r.path("city").asText(""),
                    r.path("locality").asText(""),
                    r.path("principalSubdivision").asText(""));
            String country = r.path("countryName").asText("");
            if (name.isBlank() && country.isBlank()) return null;

            return new GeoResultDto(name, country, r.path("principalSubdivision").asText(null), lat, lng);
        } catch (Exception e) {
            log.warn("Reverse geocoding failed for {},{}: {}", lat, lng, e.getMessage());
            return null;
        }
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return "";
    }

    private AqiSample parseCurrent(JsonNode current) {
        if (current == null || current.isMissingNode() || current.isNull()) {
            return AqiSample.EMPTY;
        }
        Integer aqi = clampAqi(asInt(current, "us_aqi"));
        Double pm25 = asDouble(current, "pm2_5");
        Double pm10 = asDouble(current, "pm10");
        Double ozone = asDouble(current, "ozone");
        Double no2 = asDouble(current, "nitrogen_dioxide");
        Double so2 = asDouble(current, "sulphur_dioxide");
        Double co = asDouble(current, "carbon_monoxide");
        Instant time = null;
        JsonNode t = current.get("time");
        if (t != null && t.isNumber()) time = Instant.ofEpochSecond(t.asLong());
        return new AqiSample(aqi, pm25, pm10, ozone, no2, so2, co, time);
    }

    private static Integer clampAqi(Integer v) {
        if (v == null) return null;
        return Math.max(0, Math.min(500, v));
    }

    private static Integer asInt(JsonNode node, String field) {
        JsonNode n = node.get(field);
        if (n == null || n.isNull()) return null;
        return (int) Math.round(n.asDouble());
    }

    private static Double asDouble(JsonNode node, String field) {
        JsonNode n = node.get(field);
        if (n == null || n.isNull()) return null;
        return n.asDouble();
    }

    private static String fmt(double coord) {
        return String.format(Locale.US, "%.4f", coord);
    }

    private static List<AqiSample> fillEmpty(int size) {
        List<AqiSample> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) list.add(AqiSample.EMPTY);
        return list;
    }
}
