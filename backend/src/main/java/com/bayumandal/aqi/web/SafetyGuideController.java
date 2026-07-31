package com.bayumandal.aqi.web;

import com.bayumandal.aqi.dto.SafetyGuideDto;
import com.bayumandal.aqi.service.SafetyGuideService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SafetyGuideController {

    private final SafetyGuideService service;

    public SafetyGuideController(SafetyGuideService service) {
        this.service = service;
    }

    @GetMapping("/safety-guides")
    public List<SafetyGuideDto> safetyGuides() {
        return service.getAll();
    }
}
