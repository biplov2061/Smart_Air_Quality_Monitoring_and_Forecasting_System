package com.bayumandal.aqi.service;

import com.bayumandal.aqi.dto.SafetyGuideDto;
import com.bayumandal.aqi.entity.SafetyGuide;
import com.bayumandal.aqi.repository.SafetyGuideRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class SafetyGuideService {

    private final SafetyGuideRepository repo;

    public SafetyGuideService(SafetyGuideRepository repo) {
        this.repo = repo;
    }

    public List<SafetyGuideDto> getAll() {
        return repo.findAllByOrderBySortOrderAsc().stream().map(this::toDto).toList();
    }

    private SafetyGuideDto toDto(SafetyGuide g) {
        return new SafetyGuideDto(
                g.getGuideKey(),
                g.getIcon(),
                g.getTitle(),
                g.getDescription(),
                g.getSeverity(),
                splitCsv(g.getAqiBands()),
                splitCsv(g.getAgeGroups()),
                splitCsv(g.getSensitivities()),
                splitCsv(g.getDiseases())
        );
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
