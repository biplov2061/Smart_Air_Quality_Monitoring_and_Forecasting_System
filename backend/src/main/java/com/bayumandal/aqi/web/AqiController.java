package com.bayumandal.aqi.web;

import com.bayumandal.aqi.dto.CityAqiDto;
import com.bayumandal.aqi.dto.CountryRankDto;
import com.bayumandal.aqi.dto.GeoResultDto;
import com.bayumandal.aqi.dto.GlobalStatsDto;
import com.bayumandal.aqi.dto.PollutantDto;
import com.bayumandal.aqi.dto.RecommendationDto;
import com.bayumandal.aqi.dto.TrendPointDto;
import com.bayumandal.aqi.dto.WeatherDto;
import com.bayumandal.aqi.service.AqiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AqiController {

    private final AqiService aqiService;

    public AqiController(AqiService aqiService) {
        this.aqiService = aqiService;
    }

    @GetMapping("/cities")
    public List<CityAqiDto> cities() {
        return aqiService.getMonitoredSnapshot();
    }

    @GetMapping("/aqi")
    public CityAqiDto point(@RequestParam double lat,
                            @RequestParam double lng,
                            @RequestParam(required = false) String name,
                            @RequestParam(required = false) String country) {
        return aqiService.getPoint(lat, lng, name, country);
    }

    @GetMapping("/search")
    public ResponseEntity<CityAqiDto> search(@RequestParam("q") String query) {
        return aqiService.search(query)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/geocode")
    public List<GeoResultDto> geocode(@RequestParam("q") String query) {
        return aqiService.geocode(query);
    }

    @GetMapping("/trend")
    public List<TrendPointDto> trend(@RequestParam double lat, @RequestParam double lng) {
        return aqiService.getTrend(lat, lng);
    }

    @GetMapping("/history")
    public List<TrendPointDto> history(@RequestParam double lat,
                                       @RequestParam double lng,
                                       @RequestParam(defaultValue = "24") int hours) {
        return aqiService.getHistory(lat, lng, hours);
    }

    @GetMapping("/weather")
    public WeatherDto weather(@RequestParam double lat, @RequestParam double lng) {
        return aqiService.getWeather(lat, lng);
    }

    @GetMapping("/pollutants")
    public List<PollutantDto> pollutants(@RequestParam double lat, @RequestParam double lng) {
        return aqiService.getPollutants(lat, lng);
    }

    @GetMapping("/countries/ranking")
    public List<CountryRankDto> countryRanking(@RequestParam(defaultValue = "5") int limit) {
        return aqiService.getCountryRanking(limit);
    }

    @GetMapping("/stats")
    public GlobalStatsDto stats() {
        return aqiService.getStats();
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Instant last = aqiService.getLastRefresh();
        return Map.of(
                "status", "UP",
                "citiesMonitored", aqiService.getMonitoredSnapshot().size(),
                "lastRefresh", last != null ? last.toString() : "pending"
        );
    }
}
