package com.bayumandal.aqi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "air_quality_history",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_city_recorded_time",
                        columnNames = {"city_id", "recorded_at"}
                )
        }
)
public class AirQualityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "city_id")
    private Long cityId;

    @ManyToOne
    @JoinColumn(name="city_id", insertable=false, updatable=false)
    private MonitoredLocation city;

    private LocalDateTime recordedAt;


    // Air quality data

    private Double pm25;

    private Double pm10;

    private Double ozone;

    private Double carbonMonoxide;

    private Double nitrogenDioxide;

    private Double sulphurDioxide;


    // Weather data

    private Double temperature;

    private Integer humidity;

    private Double windSpeed;

    private Double precipitation;


    // AQI value

    private Double aqi;



    public AirQualityHistory() {
    }


// Generate getters and setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public Double getPm25() {
        return pm25;
    }

    public void setPm25(Double pm25) {
        this.pm25 = pm25;
    }

    public Double getPm10() {
        return pm10;
    }

    public void setPm10(Double pm10) {
        this.pm10 = pm10;
    }


    public Double getOzone() {
        return ozone;
    }

    public void setOzone(Double ozone) {
        this.ozone = ozone;
    }

    public Double getCarbonMonoxide() {
        return carbonMonoxide;
    }

    public void setCarbonMonoxide(Double carbonMonoxide) {
        this.carbonMonoxide = carbonMonoxide;
    }

    public Double getNitrogenDioxide() {
        return nitrogenDioxide;
    }

    public void setNitrogenDioxide(Double nitrogenDioxide) {
        this.nitrogenDioxide = nitrogenDioxide;
    }

    public Double getSulphurDioxide() {
        return sulphurDioxide;
    }

    public void setSulphurDioxide(Double sulphurDioxide) {
        this.sulphurDioxide = sulphurDioxide;
    }


    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }


    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Double getPrecipitation() {
        return precipitation;
    }

    public void setPrecipitation(Double precipitation) {
        this.precipitation = precipitation;
    }

    public Double getAqi() {
        return aqi;
    }

    public void setAqi(Double aqi) {
        this.aqi = aqi;
    }
}
