package com.bayumandal.aqi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DataRefreshScheduler {

    private static final Logger log = LoggerFactory.getLogger(DataRefreshScheduler.class);
    private final AqiService aqiService;

    public DataRefreshScheduler(AqiService aqiService) {
        this.aqiService = aqiService;
    }

    @Scheduled(fixedDelayString = "${aqi.refresh-interval-ms}", initialDelayString = "${aqi.refresh-interval-ms}")
    public void refresh() {
        try {
            aqiService.refreshAll();
        } catch (Exception e) {
            log.warn("Scheduled refresh failed: {}", e.getMessage());
        }
    }
}
