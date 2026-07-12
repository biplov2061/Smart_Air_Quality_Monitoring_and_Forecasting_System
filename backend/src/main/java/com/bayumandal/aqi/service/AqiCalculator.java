package com.bayumandal.aqi.service;

import com.bayumandal.aqi.dto.AqiSample;
import com.bayumandal.aqi.dto.PollutantDto;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class AqiCalculator {

    private static final String STATUS_NO_DATA = "No data";
    private static final String[] STATUS = {
            "Good", "Moderate", "Unhealthy", "Very Unhealthy", "Hazardous"
    };

    private static final String[] STATUS_COLOR = {
            "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#7e22ce"
    };

    public String color(Integer aqi) {
        if (aqi == null) return "#94a3b8";
        if (aqi <= 50) return "#00e400";
        if (aqi <= 100) return "#ffff00";
        if (aqi <= 150) return "#ff7e00";
        if (aqi <= 200) return "#ff0000";
        if (aqi <= 300) return "#8f3f97";
        return "#7e0023";
    }

    public String band(Integer aqi) {
        if (aqi == null) return STATUS_NO_DATA;
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy (Sensitive)";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    }

    public String severity(Integer aqi) {
        if (aqi == null) return "low";
        if (aqi <= 100) return "low";
        if (aqi <= 150) return "medium";
        return "high";
    }

    public String dominantPollutant(AqiSample s) {
        record Candidate(String label, Double value, double reference) {}
        List<Candidate> candidates = List.of(
                new Candidate("PM2.5", s.pm25(), 35),
                new Candidate("PM10", s.pm10(), 154),
                new Candidate("O₃", s.ozone(), 120),
                new Candidate("NO₂", s.no2(), 90),
                new Candidate("SO₂", s.so2(), 80),
                new Candidate("CO", s.co(), 9000)
        );
        String dominant = null;
        double best = Double.NEGATIVE_INFINITY;
        for (Candidate c : candidates) {
            if (c.value() == null) continue;
            double ratio = c.value() / c.reference();
            if (ratio > best) {
                best = ratio;
                dominant = c.label();
            }
        }
        return dominant;
    }

    public List<PollutantDto> pollutants(AqiSample s) {
        List<PollutantDto> list = new ArrayList<>();
        list.add(build("PM2.5", s.pm25(), "µg/m³", new double[]{12, 35, 55, 150}));
        list.add(build("PM10", s.pm10(), "µg/m³", new double[]{54, 154, 254, 354}));
        list.add(build("O₃", s.ozone(), "µg/m³", new double[]{60, 120, 180, 240}));
        list.add(build("NO₂", s.no2(), "µg/m³", new double[]{40, 90, 120, 230}));
        list.add(build("SO₂", s.so2(), "µg/m³", new double[]{40, 80, 250, 500}));
        list.add(build("CO", s.co(), "µg/m³", new double[]{4000, 9000, 15000, 30000}));
        return list;
    }

    private PollutantDto build(String name, Double value, String unit, double[] bounds) {
        if (value == null) {
            return new PollutantDto(name, null, unit, STATUS_NO_DATA, "#94a3b8");
        }
        int idx = classify(value, bounds);
        double rounded = Math.round(value * 10.0) / 10.0;
        return new PollutantDto(name, rounded, unit, STATUS[idx], STATUS_COLOR[idx]);
    }

    private int classify(double value, double[] bounds) {
        for (int i = 0; i < bounds.length; i++) {
            if (value <= bounds[i]) return i;
        }
        return bounds.length;
    }
}
