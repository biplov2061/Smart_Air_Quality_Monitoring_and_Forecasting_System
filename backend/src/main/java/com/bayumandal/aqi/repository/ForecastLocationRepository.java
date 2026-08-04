package com.bayumandal.aqi.repository;


import com.bayumandal.aqi.entity.ForecastLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ForecastLocationRepository
        extends JpaRepository<ForecastLocation,Long>{


    Optional<ForecastLocation> findByMlCityId(Integer mlCityId);

    Optional<ForecastLocation> findByCityName(String cityName);

}