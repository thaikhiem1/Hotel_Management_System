package com.example.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Cấu hình CORS - Cho phép frontend giao tiếp với backend
 * Frontend (React) thường chạy trên port 3000 hoặc 5173 (Vite)
 * Backend (Spring Boot) chạy trên port 8080
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Cho phép các origin này gọi API (frontend URLs)
        corsConfiguration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173"));

        // Cho phép tất cả HTTP methods
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Cho phép tất cả headers
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));

        // Cho phép gửi credentials (cookies, authorization headers)
        corsConfiguration.setAllowCredentials(true);

        // Thời gian cache preflight request (OPTIONS)
        corsConfiguration.setMaxAge(3600L);

        // Áp dụng cấu hình cho tất cả endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(source);
    }
}
