package com.bayumandal.aqi.dto;

public record TrendPointDto(
        String time,
        Integer aqi,
        boolean forecast
) {}
