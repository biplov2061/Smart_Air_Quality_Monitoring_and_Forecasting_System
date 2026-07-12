package com.bayumandal.aqi.repository;

import com.bayumandal.aqi.entity.AirQualityReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface AirQualityReadingRepository extends JpaRepository<AirQualityReading, Long> {

    List<AirQualityReading> findByLatitudeBetweenAndLongitudeBetweenAndFetchedAtAfterOrderByFetchedAtAsc(
            double latLo, double latHi, double lngLo, double lngHi, Instant since);
}
