package com.bayumandal.aqi.web;

import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.ForecastLocationRepository;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;
import com.bayumandal.aqi.service.ForecastCityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final MonitoredLocationRepository repository;

    public ForecastController(MonitoredLocationRepository repository) {
        this.repository = repository;
    }


    @GetMapping("/cities")
    public List<MonitoredLocation> getForecastCities() {
        return repository.findByMlForecastEnabledTrue();
    }
}