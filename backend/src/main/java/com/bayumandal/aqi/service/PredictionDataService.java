package com.bayumandal.aqi.service;


import com.bayumandal.aqi.dto.PredictionDataRequest;
import com.bayumandal.aqi.entity.AirQualityHistory;
import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.AirQualityHistoryRepository;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;


@Service
public class PredictionDataService {


    private final AirQualityHistoryRepository historyRepository;
    private final MonitoredLocationRepository locationRepository;


    public PredictionDataService(
            AirQualityHistoryRepository historyRepository,
            MonitoredLocationRepository locationRepository
    ){

        this.historyRepository = historyRepository;
        this.locationRepository = locationRepository;

    }


    public PredictionDataRequest preparePredictionData(
            Long cityId
    ){

        // Fetch city details using database city id
        MonitoredLocation city =
                locationRepository.findById(cityId)
                        .orElseThrow(() ->
                                new RuntimeException("City not found")
                        );


        // Get actual city name for ML mapping
        String cityName = city.getName();



        List<AirQualityHistory> history =
                historyRepository
                        .findTop48ByCityIdOrderByRecordedAtDesc(cityId);



        if(history.size() < 48){

            throw new RuntimeException(
                    "Not enough historical data for prediction. Required 48 hours."
            );

        }



        // Repository returns newest first:
        //
        // 20:00
        // 19:00
        // 18:00
        //
        // ML needs chronological order:
        //
        // 18:00
        // 19:00
        // 20:00

        Collections.reverse(history);



        List<PredictionDataRequest.HistoryPoint> points =
                history.stream()
                        .map(this::convertToPoint)
                        .toList();



        return new PredictionDataRequest(
                cityId,
                cityName,
                points
        );

    }



    private PredictionDataRequest.HistoryPoint convertToPoint(
            AirQualityHistory history
    ){


        System.out.println(
                "DB timestamp: " + history.getRecordedAt()
        );

        return new PredictionDataRequest.HistoryPoint(

                history.getRecordedAt().toString(),

                history.getPm25(),
                history.getPm10(),

                history.getOzone(),
                history.getNitrogenDioxide(),
                history.getSulphurDioxide(),
                history.getCarbonMonoxide(),

                history.getTemperature(),
                history.getHumidity(),

                history.getWindSpeed(),
                history.getPrecipitation(),

                history.getAqi()

        );

    }

}