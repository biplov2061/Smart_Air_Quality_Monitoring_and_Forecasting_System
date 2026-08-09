package com.bayumandal.aqi.web;

import com.bayumandal.aqi.dto.PredictionDataRequest;
import com.bayumandal.aqi.dto.PredictionResponseDTO;
import com.bayumandal.aqi.service.MlPredictionService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml-test")
public class MlTestController {


    private final MlPredictionService mlPredictionService;


    public MlTestController(MlPredictionService mlPredictionService) {
        this.mlPredictionService = mlPredictionService;
    }


    @PostMapping("/predict")
    public PredictionResponseDTO  predict(
            @RequestBody PredictionDataRequest request
    ) {

        return mlPredictionService.predict(request);

    }
}