package com.example.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Nguồn thời gian duy nhất của nghiệp vụ lưu trú: giờ nhận phòng và trả phòng thực tế do máy chủ xác định
 * theo múi giờ khách sạn, không nhận từ giao diện. Khai báo thành bean để kiểm thử thay được đồng hồ.
 */
@Configuration
public class ClockConfig {

    public static final ZoneId HOTEL_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Bean
    public Clock hotelClock() {
        return Clock.system(HOTEL_ZONE);
    }
}
