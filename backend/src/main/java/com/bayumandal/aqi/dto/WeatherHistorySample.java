package com.bayumandal.aqi.dto;

import java.time.LocalDateTime;

public record WeatherHistorySample(

        LocalDateTime time,

        Double temperature,

        Integer humidity,

        Double windSpeed,

        Double precipitation

) {}