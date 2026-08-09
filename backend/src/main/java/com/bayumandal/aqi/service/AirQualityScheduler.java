package com.bayumandal.aqi.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


@Component
public class AirQualityScheduler {


    private final AirQualityHistoryService historyService;


    public AirQualityScheduler(
            AirQualityHistoryService historyService
    ){
        this.historyService = historyService;
    }



    @Scheduled(cron = "0 0 * * * *")
    public void updateHourlyData(){

        System.out.println(
                "Hourly AQI update started..."
        );

        historyService.fetchAndSaveLatestData();

    }

}