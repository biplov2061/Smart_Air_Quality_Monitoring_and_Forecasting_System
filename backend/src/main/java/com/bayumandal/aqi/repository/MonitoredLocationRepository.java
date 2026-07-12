package com.bayumandal.aqi.repository;

import com.bayumandal.aqi.entity.MonitoredLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoredLocationRepository extends JpaRepository<MonitoredLocation, Long> {
    boolean existsByNameAndCountry(String name, String country);
}
