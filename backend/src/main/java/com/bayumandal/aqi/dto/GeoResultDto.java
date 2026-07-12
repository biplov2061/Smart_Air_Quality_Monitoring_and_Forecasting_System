package com.bayumandal.aqi.dto;

public record GeoResultDto(
        String name,
        String country,
        String admin1,
        double latitude,
        double longitude
) {}
