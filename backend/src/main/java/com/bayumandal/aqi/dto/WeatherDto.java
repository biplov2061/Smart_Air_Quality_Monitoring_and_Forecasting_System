package com.bayumandal.aqi.dto;

public record WeatherDto(
        Double temperature,
        Double feelsLike,
        Integer humidity,
        Double windSpeed,
        Double pressure,
        Integer weatherCode,
        String description
) {}