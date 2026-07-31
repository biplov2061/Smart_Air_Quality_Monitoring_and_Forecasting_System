package com.bayumandal.aqi.service;

import com.bayumandal.aqi.entity.SafetyGuide;
import com.bayumandal.aqi.repository.SafetyGuideRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@Order(2)
public class SafetyGuideSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SafetyGuideSeeder.class);

    private final SafetyGuideRepository repo;
    private final ObjectMapper objectMapper;

    public SafetyGuideSeeder(SafetyGuideRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    private record GuideSeed(String id, String icon, String title, String desc, String severity,
                             List<String> aqiBands, List<String> ageGroups,
                             List<String> sensitivities, List<String> diseases, Integer sortOrder) {}

    @Override
    public void run(ApplicationArguments args) throws Exception {
        long existing = repo.count();
        if (existing > 0) {
            log.info("{} safety guides already present, skipping seed", existing);
            return;
        }
        try (InputStream in = new ClassPathResource("safety-guides.json").getInputStream()) {
            List<GuideSeed> seeds = objectMapper.readValue(in, new TypeReference<List<GuideSeed>>() {});
            List<SafetyGuide> entities = seeds.stream()
                    .map(s -> new SafetyGuide(
                            s.id(), s.icon(), s.title(), s.desc(), s.severity(),
                            csv(s.aqiBands()), csv(s.ageGroups()), csv(s.sensitivities()), csv(s.diseases()),
                            s.sortOrder()))
                    .toList();
            repo.saveAll(entities);
            log.info("Seeded {} safety guides into MySQL", entities.size());
        }
    }

    private static String csv(List<String> list) {
        return (list == null || list.isEmpty()) ? "" : String.join(",", list);
    }
}
