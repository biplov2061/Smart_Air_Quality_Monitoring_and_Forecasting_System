package com.bayumandal.aqi.web;


import com.bayumandal.aqi.dto.PredictionDataRequest;
import com.bayumandal.aqi.dto.PredictionResponseDTO;
import com.bayumandal.aqi.service.MlPredictionService;
import com.bayumandal.aqi.service.PredictionDataService;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/prediction")
@CrossOrigin(origins = "*")
public class PredictionController {


    private final PredictionDataService predictionDataService;

    private final MlPredictionService mlPredictionService;



    public PredictionController(
            PredictionDataService predictionDataService,
            MlPredictionService mlPredictionService
    ){

        this.predictionDataService = predictionDataService;
        this.mlPredictionService = mlPredictionService;

    }




    @GetMapping("/{cityId}")
    public PredictionResponseDTO  predictAQI(
            @PathVariable Long cityId
    ){


        // Step 1:
        // Fetch latest 48 hours

        PredictionDataRequest request =
                predictionDataService
                        .preparePredictionData(cityId);



        // Step 2:
        // Send data to ML service

        return mlPredictionService.predict(request);

    }

}
