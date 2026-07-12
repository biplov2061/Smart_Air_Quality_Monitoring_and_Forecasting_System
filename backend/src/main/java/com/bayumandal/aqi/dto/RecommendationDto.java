package com.bayumandal.aqi.dto;

public record RecommendationDto(
        String severity,
        String icon,
        String title,
        String desc
) {}
