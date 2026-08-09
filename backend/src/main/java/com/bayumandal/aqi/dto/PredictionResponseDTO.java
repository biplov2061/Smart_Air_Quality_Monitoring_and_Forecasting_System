package com.bayumandal.aqi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PredictionResponseDTO(

        //Tells jackson predicted_aqi ---> predictedAqi
        @JsonProperty("predicted_aqi")
        List<Double> predictedAqi

) {}