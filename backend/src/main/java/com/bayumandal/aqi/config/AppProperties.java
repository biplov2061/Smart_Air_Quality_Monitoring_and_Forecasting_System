package com.bayumandal.aqi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "aqi")
public class AppProperties {

    private long refreshIntervalMs = 600_000;
    private long pointCacheTtlSeconds = 600;
    private long trendCacheTtlSeconds = 1_800;
    private int batchSize = 100;
    private String[] corsAllowedOrigins = {"http://localhost:5173"};
    private final OpenMeteo openmeteo = new OpenMeteo();
    private String reverseGeocodeUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client";

    public static class OpenMeteo {
        private String airQualityUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";
        private String geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search";
        private String weatherUrl = "https://api.open-meteo.com/v1/forecast";

        public String getAirQualityUrl() { return airQualityUrl; }
        public void setAirQualityUrl(String airQualityUrl) { this.airQualityUrl = airQualityUrl; }
        public String getGeocodingUrl() { return geocodingUrl; }
        public void setGeocodingUrl(String geocodingUrl) { this.geocodingUrl = geocodingUrl; }
        public String getWeatherUrl() { return weatherUrl; }
        public void setWeatherUrl(String weatherUrl) { this.weatherUrl = weatherUrl; }
    }

    public String getReverseGeocodeUrl() { return reverseGeocodeUrl; }
    public void setReverseGeocodeUrl(String reverseGeocodeUrl) { this.reverseGeocodeUrl = reverseGeocodeUrl; }

    public long getRefreshIntervalMs() { return refreshIntervalMs; }
    public void setRefreshIntervalMs(long refreshIntervalMs) { this.refreshIntervalMs = refreshIntervalMs; }
    public long getPointCacheTtlSeconds() { return pointCacheTtlSeconds; }
    public void setPointCacheTtlSeconds(long pointCacheTtlSeconds) { this.pointCacheTtlSeconds = pointCacheTtlSeconds; }
    public long getTrendCacheTtlSeconds() { return trendCacheTtlSeconds; }
    public void setTrendCacheTtlSeconds(long trendCacheTtlSeconds) { this.trendCacheTtlSeconds = trendCacheTtlSeconds; }
    public int getBatchSize() { return batchSize; }
    public void setBatchSize(int batchSize) { this.batchSize = batchSize; }
    public String[] getCorsAllowedOrigins() { return corsAllowedOrigins; }
    public void setCorsAllowedOrigins(String[] corsAllowedOrigins) { this.corsAllowedOrigins = corsAllowedOrigins; }
    public OpenMeteo getOpenmeteo() { return openmeteo; }
}
