//This ForecastResponseDTO is used to send backend response to frontend.
//This adds city name to prediction and pass final response to frontend
//like :
//{
//    "city": "Kathmandu",
//    "Prediction": [
//                12.3,
//                134.2,
//                 ...
//                  ]
//   }



package com.bayumandal.aqi.dto;

import java.util.List;

public class ForecastResponseDTO {

    private String city;

    private List<Double> prediction;


    public String getCity() {
        return city;
    }


    public void setCity(String city) {
        this.city = city;
    }


    public List<Double> getPrediction() {
        return prediction;
    }


    public void setPrediction(List<Double> prediction) {
        this.prediction = prediction;
    }
}