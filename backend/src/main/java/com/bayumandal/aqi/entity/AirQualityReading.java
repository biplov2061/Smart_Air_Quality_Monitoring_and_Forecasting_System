package com.bayumandal.aqi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
        name = "air_quality_reading",
        indexes = {
                @Index(name = "idx_reading_fetched_at", columnList = "fetchedAt"),
                @Index(name = "idx_reading_location", columnList = "name, country")
        }
)
public class AirQualityReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String country;
    private double latitude;
    private double longitude;

    private Integer aqi;
    private Double pm25;
    private Double pm10;
    private Double ozone;
    private Double no2;
    private Double so2;
    private Double co;

    private String dominantPollutant;
    private String band;
    private Instant sourceTime;

    @Column(nullable = false)
    private Instant fetchedAt;

    protected AirQualityReading() {
    }

    public AirQualityReading(String name, String country, double latitude, double longitude,
                             Integer aqi, Double pm25, Double pm10, Double ozone, Double no2,
                             Double so2, Double co, String dominantPollutant, String band,
                             Instant sourceTime, Instant fetchedAt) {
        this.name = name;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.aqi = aqi;
        this.pm25 = pm25;
        this.pm10 = pm10;
        this.ozone = ozone;
        this.no2 = no2;
        this.so2 = so2;
        this.co = co;
        this.dominantPollutant = dominantPollutant;
        this.band = band;
        this.sourceTime = sourceTime;
        this.fetchedAt = fetchedAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public Integer getAqi() { return aqi; }
    public Double getPm25() { return pm25; }
    public Double getPm10() { return pm10; }
    public Double getOzone() { return ozone; }
    public Double getNo2() { return no2; }
    public Double getSo2() { return so2; }
    public Double getCo() { return co; }
    public String getDominantPollutant() { return dominantPollutant; }
    public String getBand() { return band; }
    public Instant getSourceTime() { return sourceTime; }
    public Instant getFetchedAt() { return fetchedAt; }
}
