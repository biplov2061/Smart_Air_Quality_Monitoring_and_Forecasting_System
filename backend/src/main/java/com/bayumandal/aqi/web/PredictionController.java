package com.bayumandal.aqi.web;

import com.bayumandal.aqi.service.PredictionService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/predict")
    public JsonNode predict(@RequestParam String country,
                            @RequestParam(required = false) String city) {
        return predictionService.predict(country, city);
    }
}
