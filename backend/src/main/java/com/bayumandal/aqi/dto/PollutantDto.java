package com.bayumandal.aqi.dto;

public record PollutantDto(
        String name,
        Double value,
        String unit,
        String status,
        String color
) {}
