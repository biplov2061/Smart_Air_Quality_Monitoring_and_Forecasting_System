// This DTO takes weather api response and converts into json format to pass weather data to ML service


package com.bayumandal.aqi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MlWeatherDto(


        //jackson converts dto to json data format with same field name that model uses.
        @JsonProperty("temperature_2m")
        Double temperature2m,

        @JsonProperty("relative_humidity_2m")
        Double relativeHumidity2m,

        @JsonProperty("wind_speed_km_per_h")
        Double windSpeedKmPerHour,

        @JsonProperty("precipitation_mm")
        Double precipitationMm

) {}