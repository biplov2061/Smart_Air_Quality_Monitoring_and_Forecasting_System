package com.bayumandal.aqi.repository;

import com.bayumandal.aqi.entity.AirQualityHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AirQualityHistoryRepository
        extends JpaRepository<AirQualityHistory, Long> {


    List<AirQualityHistory> findByCityIdOrderByRecordedAtDesc(
            Long cityId
    );


    //it prevents adding duplicate row in aqi quality history table
    boolean existsByCityIdAndRecordedAt(
            Long cityId,
            LocalDateTime recordedAt
    );


    List<AirQualityHistory> findTop48ByCityIdOrderByRecordedAtDesc(
            Long cityId
    );


    List<AirQualityHistory> findByCityIdAndRecordedAtAfterOrderByRecordedAtAsc(
            Long cityId,
            LocalDateTime time
    );

}