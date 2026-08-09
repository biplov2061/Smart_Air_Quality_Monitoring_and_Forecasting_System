package com.bayumandal.aqi.service;

import com.bayumandal.aqi.dto.ForecastCityResponse;
import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ForecastCityService {

    private final MonitoredLocationRepository repository;

    public ForecastCityService(MonitoredLocationRepository repository) {
        this.repository = repository;
    }

    public List<ForecastCityResponse> getForecastCities() {

        return repository.findByMlForecastEnabledTrue()
                .stream()
                .map(city -> new ForecastCityResponse(
                        city.getId(),
                        city.getName(),
                        city.getCountry()
                ))
                .toList();
    }
}