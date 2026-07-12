package com.bayumandal.aqi.dto;

public record GlobalStatsDto(
        int citiesMonitored,
        int countriesCovered,
        int avgAQI,
        String updatedAt
) {}
