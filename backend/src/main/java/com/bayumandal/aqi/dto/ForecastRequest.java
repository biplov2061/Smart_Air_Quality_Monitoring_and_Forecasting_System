package com.bayumandal.aqi.dto;

public class ForecastRequest {

    private Integer cityId;

    private Double pm2_5;
    private Double pm10;
    private Double ozone;
    private Double carbon_monoxide;
    private Double nitrogen_dioxide;
    private Double sulphur_dioxide;

    private Double temperature_2m;
    private Double relative_humidity_2m;
    private Double wind_speed_km_per_h;
    private Double precipitation_mm;

    private Double current_aqi;

    public ForecastRequest() {
    }

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }

    //using Double instead of double : Double handle null values where double can create issues
    public Double getPm2_5() {
        return pm2_5;
    }

    public void setPm2_5(Double pm2_5) {
        this.pm2_5 = pm2_5;
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

    public Double getCarbon_monoxide() {
        return carbon_monoxide;
    }

    public void setCarbon_monoxide(Double carbon_monoxide) {
        this.carbon_monoxide = carbon_monoxide;
    }

    public Double getNitrogen_dioxide() {
        return nitrogen_dioxide;
    }

    public void setNitrogen_dioxide(Double nitrogen_dioxide) {
        this.nitrogen_dioxide = nitrogen_dioxide;
    }

    public Double getSulphur_dioxide() {
        return sulphur_dioxide;
    }

    public void setSulphur_dioxide(Double sulphur_dioxide) {
        this.sulphur_dioxide = sulphur_dioxide;
    }

    public Double getTemperature_2m() {
        return temperature_2m;
    }

    public void setTemperature_2m(Double temperature_2m) {
        this.temperature_2m = temperature_2m;
    }

    public Double getRelative_humidity_2m() {
        return relative_humidity_2m;
    }

    public void setRelative_humidity_2m(Double relative_humidity_2m) {
        this.relative_humidity_2m = relative_humidity_2m;
    }

    public Double getWind_speed_km_per_h() {
        return wind_speed_km_per_h;
    }

    public void setWind_speed_km_per_h(Double wind_speed_km_per_h) {
        this.wind_speed_km_per_h = wind_speed_km_per_h;
    }

    public Double getPrecipitation_mm() {
        return precipitation_mm;
    }

    public void setPrecipitation_mm(Double precipitation_mm) {
        this.precipitation_mm = precipitation_mm;
    }

    public Double getCurrent_aqi() {
        return current_aqi;
    }

    public void setCurrent_aqi(Double current_aqi) {
        this.current_aqi = current_aqi;
    }
}