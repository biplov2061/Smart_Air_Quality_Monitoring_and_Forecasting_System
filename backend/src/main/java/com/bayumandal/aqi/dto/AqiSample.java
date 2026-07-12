package com.bayumandal.aqi.dto;

import java.time.Instant;

public record AqiSample(
        Integer aqi,
        Double pm25,
        Double pm10,
        Double ozone,
        Double no2,
        Double so2,
        Double co,
        Instant sourceTime
) {
    public static final AqiSample EMPTY =
            new AqiSample(null, null, null, null, null, null, null, null);
}
