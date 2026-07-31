package com.bayumandal.aqi.dto;

import java.util.List;

public record SafetyGuideDto(
        String id,
        String icon,
        String title,
        String desc,
        String severity,
        List<String> aqiBands,
        List<String> ageGroups,
        List<String> sensitivities,
        List<String> diseases
) {}
