package com.bayumandal.aqi.config;

import com.bayumandal.aqi.entity.ForecastLocation;
import com.bayumandal.aqi.repository.ForecastLocationRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class ForecastLocationSeeder implements CommandLineRunner {


    private final ForecastLocationRepository repository;


    public ForecastLocationSeeder(ForecastLocationRepository repository){
        this.repository = repository;
    }


    @Override
    public void run(String... args) throws Exception {


        if(repository.count() > 0){
            return;
        }


        ObjectMapper mapper = new ObjectMapper();


        InputStream inputStream =
                new ClassPathResource("forecast_cities.json")
                        .getInputStream();


        List<ForecastLocation> locations =
                mapper.readValue(
                        inputStream,
                        new TypeReference<List<ForecastLocation>>() {}
                );


        repository.saveAll(locations);


        System.out.println(
                "Forecast locations seeded: "
                        + locations.size()
        );
    }
}
