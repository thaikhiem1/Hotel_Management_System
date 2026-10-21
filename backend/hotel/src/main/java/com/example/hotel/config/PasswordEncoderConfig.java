package com.example.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration cho Password Encoder
 * Sử dụng BCrypt để mã hóa mật khẩu an toàn
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * Bean BCryptPasswordEncoder
     * BCrypt sử dụng salt ngẫu nhiên và adaptive hashing
     * - Strength mặc định: 10 (2^10 = 1024 rounds)
     * - Mỗi lần encode tạo ra hash khác nhau (do salt ngẫu nhiên)
     * - Verify bằng matches() method
     * 
     * @return PasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
