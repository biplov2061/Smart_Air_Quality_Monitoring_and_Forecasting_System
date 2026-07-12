package com.bayumandal.aqi.dto;

public record CityAqiDto(
        String id,
        String name,
        String country,
        double lat,
        double lng,
        Integer aqi,
        Double pm25,
        Double pm10,
        Double ozone,
        Double no2,
        Double so2,
        Double co,
        String dominantPollutant,
        String band,
        String color,
        String updatedAt
) {}
