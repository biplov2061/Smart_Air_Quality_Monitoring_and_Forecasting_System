//This file creates the Webclient bean or object for injection.
//Whenever any class asks for a WebClient object, create and provide this one.

package com.bayumandal.aqi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;


@Configuration
public class WebClientConfig {


    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }

}