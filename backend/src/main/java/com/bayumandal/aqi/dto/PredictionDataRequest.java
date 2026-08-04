package com.bayumandal.aqi.dto;

import java.time.LocalDateTime;
import java.util.List;


public record PredictionDataRequest(

        Long cityId,
        String cityName,
        List<HistoryPoint> history

) {


    public record HistoryPoint(

            String timestamp,

            Double pm25,
            Double pm10,

            Double ozone,
            Double nitrogenDioxide,
            Double sulphurDioxide,
            Double carbonMonoxide,

            Double temperature,
            Integer humidity,

            Double windSpeed,
            Double precipitation,

            Double aqi

    ){}

}