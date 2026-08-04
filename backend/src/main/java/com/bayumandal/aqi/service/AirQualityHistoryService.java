//Fetch only ML-enabled cities.
//Fetch the last 48 hours of pollutant and weather data for each city.


package com.bayumandal.aqi.service;

import com.bayumandal.aqi.dto.*;
import com.bayumandal.aqi.entity.MonitoredLocation;
import com.bayumandal.aqi.repository.AirQualityHistoryRepository;
import com.bayumandal.aqi.repository.MonitoredLocationRepository;
import com.bayumandal.aqi.dto.HistoricalAqiSample;
import com.bayumandal.aqi.entity.AirQualityHistory;


import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import org.springframework.stereotype.Service;
import java.time.ZoneOffset;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AirQualityHistoryService {


    private final AirQualityHistoryRepository historyRepository;
    private final MonitoredLocationRepository locationRepository;
    private final OpenMeteoClient openMeteoClient;


    public AirQualityHistoryService(
            AirQualityHistoryRepository historyRepository,
            MonitoredLocationRepository locationRepository,
            OpenMeteoClient openMeteoClient
    ) {
        this.historyRepository = historyRepository;
        this.locationRepository = locationRepository;
        this.openMeteoClient = openMeteoClient;
    }


    public void testHistoricalFetch(){

        List<HistoricalAqiSample> data =
                openMeteoClient.fetchHistorical(
                        27.7172,
                        85.3240
                );


        System.out.println(
                "Total records: " + data.size()
        );


        if(!data.isEmpty()){

            System.out.println(
                    "First record: "
                            + data.get(0).time()
            );


            System.out.println(
                    "Last record: "
                            + data.get(data.size()-1).time()
            );
        }

    }


    public void populateHistoricalData() {


        List<MonitoredLocation> cities =
                locationRepository.findByMlForecastEnabledTrue();


        System.out.println(
                "ML Forecast enabled cities: " + cities.size()
        );


        for(MonitoredLocation city : cities){


            System.out.println(
                    "Fetching history for: " + city.getName()
            );


            // Fetch AQI + pollutants
            List<HistoricalAqiSample> aqiSamples =
                    openMeteoClient.fetchHistorical(
                            city.getLatitude(),
                            city.getLongitude()
                    );


            // Fetch weather data
            List<WeatherHistorySample> weatherSamples =
                    openMeteoClient.fetchHistoricalWeather(
                            city.getLatitude(),
                            city.getLongitude()
                    );


            // Create weather lookup by timestamp
            Map<LocalDateTime, WeatherHistorySample> weatherMap =
                    weatherSamples.stream()
                            .collect(Collectors.toMap(
                                    WeatherHistorySample::time,
                                    w -> w,
                                    (oldValue, newValue) -> oldValue
                            ));



            List<AirQualityHistory> historyList =
                    new ArrayList<>();


            for(HistoricalAqiSample sample : aqiSamples){


                AirQualityHistory history =
                        new AirQualityHistory();



                history.setCityId(
                        city.getId()
                );


                history.setRecordedAt(
                        sample.time()
                );


                // -----------------------
                // Pollutants
                // -----------------------

                history.setPm25(
                        sample.pm25()
                );

                history.setPm10(
                        sample.pm10()
                );

                history.setOzone(
                        sample.ozone()
                );

                history.setCarbonMonoxide(
                        sample.carbonMonoxide()
                );

                history.setNitrogenDioxide(
                        sample.nitrogenDioxide()
                );

                history.setSulphurDioxide(
                        sample.sulphurDioxide()
                );


                // -----------------------
                // Weather merge
                // -----------------------

                WeatherHistorySample weather =
                        weatherMap.get(sample.time());


                if(weather != null){

                    history.setTemperature(
                            weather.temperature()
                    );


                    history.setHumidity(
                            weather.humidity()
                    );


                    history.setWindSpeed(
                            weather.windSpeed()
                    );


                    history.setPrecipitation(
                            weather.precipitation()
                    );

                }



                // -----------------------
                // AQI
                // -----------------------

                history.setAqi(
                        sample.aqi()
                );


                historyList.add(history);

            }



            historyRepository.saveAll(historyList);


            System.out.println(
                    "Saved "
                            + historyList.size()
                            + " records for "
                            + city.getName()
            );

        }

    }


    //This method only fetch current pollutants + aqi + weather data hourly for every 13 cities.
    public void fetchAndSaveLatestData() {

        // Get only ML-enabled cities
        List<MonitoredLocation> cities =
                locationRepository.findByMlForecastEnabledTrue();

        System.out.println(
                "Fetching latest data for "
                        + cities.size()
                        + " cities..."
        );

        for (MonitoredLocation city : cities) {

            try {

                // Fetch latest AQI + pollutant data
                AqiSample aqiSample =
                        openMeteoClient.fetchCurrentPoint(
                                city.getLatitude(),
                                city.getLongitude()
                        );

                // Fetch latest weather data
                WeatherDto weather =
                        openMeteoClient.fetchWeather(
                                city.getLatitude(),
                                city.getLongitude()
                        );


                System.out.println(
                        "Weather for "
                                + city.getName()
                                + " => precipitation = "
                                + (weather != null ? weather.precipitation() : "weather null")
                );

                // Create new history record
                AirQualityHistory history =
                        new AirQualityHistory();

                history.setCityId(
                        city.getId()
                );

                //sends response on the basis of nepal local time.
                history.setRecordedAt(
                        aqiSample.sourceTime() != null
                                ? LocalDateTime.ofInstant(
                                aqiSample.sourceTime(),
                                ZoneOffset.UTC
                        )
                                : LocalDateTime.now(ZoneOffset.UTC)
                );

                //this logic actually checks for existing row and prevent duplicate row
                boolean exists =
                        historyRepository.existsByCityIdAndRecordedAt(
                                city.getId(),
                                history.getRecordedAt()
                        );


                if(!exists){
                    historyRepository.save(history);
                }
                else{
                    System.out.println(
                            "Duplicate skipped: "
                                    + city.getId()
                                    + " "
                                    + history.getRecordedAt()
                    );
                }

                // Pollutants
                history.setPm25(
                        aqiSample.pm25()
                );

                history.setPm10(
                        aqiSample.pm10()
                );

                history.setOzone(
                        aqiSample.ozone()
                );

                history.setCarbonMonoxide(
                        aqiSample.co()
                );

                history.setNitrogenDioxide(
                        aqiSample.no2()
                );

                history.setSulphurDioxide(
                        aqiSample.so2()
                );

                // AQI
                history.setAqi(
                        aqiSample.aqi() == null
                                ? null
                                : aqiSample.aqi().doubleValue()
                );

                // Weather
                if (weather != null) {

                    history.setTemperature(
                            weather.temperature()
                    );

                    history.setHumidity(
                            weather.humidity()
                    );

                    history.setWindSpeed(
                            weather.windSpeed()
                    );

                    history.setPrecipitation(weather.precipitation());

                }

                // Save record
                historyRepository.save(history);

                System.out.println(
                        "Latest reading saved for "
                                + city.getName()
                );

            } catch (Exception e) {

                System.out.println(
                        "Failed to save latest data for "
                                + city.getName()
                                + " : "
                                + e.getMessage()
                );
            }
        }

        System.out.println(
                "Latest hourly update completed."
        );
    }


}