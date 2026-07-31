package com.bayumandal.aqi.service;

import com.bayumandal.aqi.config.AppProperties;
import com.bayumandal.aqi.dto.WeatherDto;
import com.bayumandal.aqi.entity.AirQualityReading;
import com.bayumandal.aqi.repository.AirQualityReadingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final AirQualityReadingRepository readingRepo;
    private final AqiService aqiService;
    private final RestClient restClient;
    private final AppProperties props;

    public PredictionService(AirQualityReadingRepository readingRepo,
                             AqiService aqiService,
                             RestClient openMeteoRestClient,
                             AppProperties props) {
        this.readingRepo = readingRepo;
        this.aqiService = aqiService;
        this.restClient = openMeteoRestClient;
        this.props = props;
    }

    public JsonNode predict(String country, String city) {
        AirQualityReading reading = latestReading(city, country);

        double pm25 = reading != null && reading.getPm25() != null ? reading.getPm25() : 0.0;
        double pm10 = reading != null && reading.getPm10() != null ? reading.getPm10() : 0.0;
        double temperature = 0.0;
        double humidity = 0.0;

        if (reading != null) {
            try {
                WeatherDto w = aqiService.getWeather(reading.getLatitude(), reading.getLongitude());
                if (w != null) {
                    if (w.temperature() != null) temperature = w.temperature();
                    if (w.humidity() != null) humidity = w.humidity();
                }
            } catch (Exception e) {
                log.warn("Weather lookup failed for {}: {}", city, e.getMessage());
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        String cityName = (city != null && !city.isBlank())
                ? city
                : (reading != null ? reading.getName() : country);
        body.put("city", cityName);
        body.put("pm25", pm25);
        body.put("pm10", pm10);
        body.put("temperature", temperature);
        body.put("humidity", humidity);

        String url = props.getMlServiceUrl().replaceAll("/+$", "") + "/predict";
        log.info("Requesting prediction: POST {} body={}", url, body);
        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    private AirQualityReading latestReading(String city, String country) {
        if (city != null && !city.isBlank()) {
            AirQualityReading byCity = readingRepo.findTopByNameOrderByFetchedAtDesc(city).orElse(null);
            if (byCity != null) return byCity;
        }
        if (country != null && !country.isBlank()) {
            return readingRepo.findTopByCountryOrderByFetchedAtDesc(country).orElse(null);
        }
        return null;
    }
}
