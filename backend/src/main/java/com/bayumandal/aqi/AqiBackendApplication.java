package com.bayumandal.aqi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AqiBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(AqiBackendApplication.class, args);
    }
}
