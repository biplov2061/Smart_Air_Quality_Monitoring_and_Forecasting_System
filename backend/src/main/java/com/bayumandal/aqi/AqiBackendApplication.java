package com.bayumandal.aqi;

import java.util.TimeZone;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.bayumandal.aqi.service.AirQualityHistoryService;


@SpringBootApplication
@EnableScheduling
public class AqiBackendApplication {
    public static void main(String[] args) {

        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(AqiBackendApplication.class, args);

    }


    @Bean
    CommandLineRunner testHistory(
            AirQualityHistoryService service
    ) {

        return args -> {

            System.out.println(
                    java.time.ZoneId.systemDefault()
            );


            //this method call adds current aqi data + weather data every hour for all 13 cities
            service.fetchAndSaveLatestData();

        };
    }
}
