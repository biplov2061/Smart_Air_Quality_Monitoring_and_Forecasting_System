package com.bayumandal.aqi.service;

import com.bayumandal.aqi.dto.PredictionDataRequest;
import com.bayumandal.aqi.dto.PredictionRequestDto;
import com.bayumandal.aqi.dto.PredictionResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


@Service
public class MlPredictionService {

    private final WebClient webClient;
    private final String mlServiceUrl;



    public MlPredictionService(
            WebClient webClient,
            @Value("${ml.service.url}") String mlServiceUrl
    ) {
        this.webClient = webClient;
        this.mlServiceUrl = mlServiceUrl;
    }



    public PredictionResponseDTO  predict(
            PredictionDataRequest request
    ){

        return webClient.post()
                .uri(mlServiceUrl + "/predict")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PredictionResponseDTO .class)
                .block();

    }
}