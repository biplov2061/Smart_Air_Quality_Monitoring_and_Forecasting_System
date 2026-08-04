//This DTO combines : Air quality api response + weather api response and pass full features JSON that ML service needs.
//demo JSON request body :
//{
//        "city_id": 6,
//        "pm2_5": 45.2,
//        "pm10": 90.1,
//        "ozone": 30.5,
//        "carbon_monoxide": 250,
//        "nitrogen_dioxide": 20,
//        "sulphur_dioxide": 10,
//        "temperature_2m": 25.4,
//        "relative_humidity_2m": 70,
//        "wind_speed_km_per_h": 12.5,
//        "precipitation_mm": 0.0,
//        "current_aqi": 120
//        }


package com.bayumandal.aqi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PredictionRequestDto(

        @JsonProperty("city_id")
        Long cityId,

        @JsonProperty("pm2_5")
        Double pm25,

        @JsonProperty("pm10")
        Double pm10,

        @JsonProperty("ozone")
        Double ozone,

        @JsonProperty("carbon_monoxide")
        Double carbonMonoxide,

        @JsonProperty("nitrogen_dioxide")
        Double nitrogenDioxide,

        @JsonProperty("sulphur_dioxide")
        Double sulphurDioxide,

        @JsonProperty("temperature_2m")
        Double temperature2m,

        @JsonProperty("relative_humidity_2m")
        Double relativeHumidity2m,

        @JsonProperty("wind_speed_km_per_h")
        Double windSpeedKmPerHour,

        @JsonProperty("precipitation_mm")
        Double precipitationMm,

        @JsonProperty("current_aqi")
        Double currentAqi

) {}
