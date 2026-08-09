package com.bayumandal.aqi.dto;

import java.time.LocalDateTime;

public record HistoricalAqiSample(

        LocalDateTime time,

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

) {}