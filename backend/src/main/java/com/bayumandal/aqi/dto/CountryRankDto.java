package com.bayumandal.aqi.dto;

public record CountryRankDto(
        int rank,
        String name,
        Integer aqi,
        String flag,
        String band,
        String color
) {}
