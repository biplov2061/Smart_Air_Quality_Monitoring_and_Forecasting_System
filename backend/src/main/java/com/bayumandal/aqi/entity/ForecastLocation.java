package com.bayumandal.aqi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "forecast_locations")
public class ForecastLocation {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String cityName;

    private String country;


    private double latitude;

    private double longitude;

    // This MUST match the ML training city_mapping
    @Column(nullable = false, unique = true)
    private Integer mlCityId;


    public ForecastLocation(){}


    public ForecastLocation(
            String cityName,
            String country,
            double latitude,
            double longitude,
            Integer mlCityId
    ){

        this.cityName = cityName;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.mlCityId = mlCityId;
    }


    public Long getId(){
        return id;
    }


    public String getCityName(){
        return cityName;
    }


    public String getCountry(){
        return country;
    }


    public double getLatitude(){
        return latitude;
    }


    public double getLongitude(){
        return longitude;
    }


    public Integer getMlCityId(){
        return mlCityId;
    }
}