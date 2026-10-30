package com.example.hotel.config;

import com.example.hotel.security.CustomUserDetailsService;
import com.example.hotel.security.JwtAuthenticationFilter;
import com.example.hotel.security.JwtService;
import com.example.hotel.security.RestAuthHandlers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Phân quyền theo vai trò (ADMIN / MANAGER / RECEPTIONIST), xác thực bằng JWT stateless.
 *
 * - Công khai: POST /api/auth/login
 * - ADMIN, MANAGER: quản lý tài khoản, nhân viên; thêm/sửa/xóa phòng, loại phòng, dịch vụ
 * - Mọi tài khoản đã đăng nhập: các API còn lại (xem phòng/dịch vụ, khách hàng, ...)
 *
 * Cần phân quyền chi tiết hơn ở từng method: dùng @PreAuthorize("hasRole('ADMIN')").
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] MANAGEMENT_ROLES = { "ADMIN", "MANAGER" };

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            RestAuthHandlers authHandlers) throws Exception {

        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, userDetailsService);

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // dùng CorsFilter trong CorsConfig
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(authHandlers)
                        .accessDeniedHandler(authHandlers))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        // Ảnh đại diện được tải bằng thẻ img nên không gửi kèm JWT
                        .requestMatchers(HttpMethod.GET, "/uploads/avatars/**").permitAll()

                        .requestMatchers("/api/accounts/**", "/api/employees/**")
                        .hasAnyRole(MANAGEMENT_ROLES)

                        // Lập phiếu thuê: lễ tân là actor chính; quản lý/admin cũng được dùng
                        .requestMatchers("/api/rental-receipts/**")
                        .hasAnyRole("RECEPTIONIST")

                        .requestMatchers(HttpMethod.GET,
                                "/api/rooms/**", "/api/roomTypes/**",
                                "/api/services/**", "/api/service-categories/**")
                        .authenticated()
                        .requestMatchers(
                                "/api/rooms/**", "/api/roomTypes/**",
                                "/api/services/**", "/api/service-categories/**")
                        .hasAnyRole(MANAGEMENT_ROLES)

                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
