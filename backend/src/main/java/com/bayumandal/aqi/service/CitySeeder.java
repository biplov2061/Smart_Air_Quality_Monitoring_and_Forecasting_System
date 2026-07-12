package com.bayumandal.aqi.service;

import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.util.List;

@Component
@Order(1)
public class CitySeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CitySeeder.class);

    private final MonitoredLocationRepository repo;
    private final AqiService aqiService;
    private final ObjectMapper objectMapper;

    public CitySeeder(MonitoredLocationRepository repo, AqiService aqiService, ObjectMapper objectMapper) {
        this.repo = repo;
        this.aqiService = aqiService;
        this.objectMapper = objectMapper;
    }

    private record CitySeed(String name, String country, double latitude, double longitude) {}

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seedCities();
        aqiService.initPlaceholderSnapshot();
        try {
            log.info("Performing initial air-quality fetch from Open-Meteo...");
            aqiService.refreshAll();
        } catch (Exception e) {
            log.warn("Initial fetch failed (will retry on schedule): {}", e.getMessage());
        }
    }

    private void seedCities() throws Exception {
        long existing = repo.count();
        if (existing > 0) {
            log.info("{} monitored cities already present, skipping seed", existing);
            return;
        }
        try (InputStream in = new ClassPathResource("cities.json").getInputStream()) {
            List<CitySeed> seeds = objectMapper.readValue(in, new TypeReference<List<CitySeed>>() {});
            List<MonitoredLocation> entities = seeds.stream()
                    .map(s -> new MonitoredLocation(s.name(), s.country(), s.latitude(), s.longitude()))
                    .toList();
            repo.saveAll(entities);
            log.info("Seeded {} monitored cities into MySQL", entities.size());
        }
    }
}
