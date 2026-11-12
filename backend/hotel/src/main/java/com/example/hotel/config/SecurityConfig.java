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
 * - Mọi tài khoản đã đăng nhập được XEM danh sách phòng, loại phòng, dịch vụ, nhóm dịch vụ, khách hàng, phiếu thuê,
 *   sơ đồ phòng, hồ sơ cá nhân (lễ tân xem nhân viên/tài khoản bị chặn bên dưới).
 * - ADMIN: chỉ quản lý tài khoản (xem, tạo, sửa); xem được mọi dữ liệu còn lại nhưng không thêm/sửa/xóa.
 * - MANAGER: toàn quyền trừ tài khoản (không xem, không thao tác): nhân viên, phòng, loại phòng, dịch vụ, nhóm dịch vụ,
 *   khách hàng, phiếu thuê, nhận phòng, trả phòng, ghi nhận dịch vụ.
 * - RECEPTIONIST: lập phiếu thuê, nhận phòng, trả phòng, ghi nhận dịch vụ, quản lý khách hàng; chỉ xem phòng,
 *   loại phòng, dịch vụ; không truy cập nhân viên và tài khoản.
 *
 * Cần phân quyền chi tiết hơn ở từng method: dùng @PreAuthorize("hasRole('ADMIN')").
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] MANAGEMENT_ROLES = { "ADMIN", "MANAGER" };
    /** Vai trò thực hiện nghiệp vụ lưu trú: lập phiếu, nhận/trả phòng, ghi nhận dịch vụ, khách hàng */
    private static final String[] OPERATION_ROLES = { "RECEPTIONIST", "MANAGER" };

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

                        // Tài khoản: chỉ ADMIN
                        .requestMatchers("/api/accounts/**").hasRole("ADMIN")

                        // Nhân viên: ADMIN và MANAGER xem, chỉ MANAGER thêm/sửa
                        .requestMatchers(HttpMethod.GET, "/api/employees/**").hasAnyRole(MANAGEMENT_ROLES)
                        .requestMatchers("/api/employees/**").hasRole("MANAGER")

                        // Phòng, loại phòng, dịch vụ, nhóm dịch vụ: mọi vai trò xem, chỉ MANAGER thêm/sửa/xóa
                        .requestMatchers(HttpMethod.GET,
                                "/api/rooms/**", "/api/roomTypes/**",
                                "/api/services/**", "/api/service-categories/**")
                        .authenticated()
                        .requestMatchers(
                                "/api/rooms/**", "/api/roomTypes/**",
                                "/api/services/**", "/api/service-categories/**")
                        .hasRole("MANAGER")

                        // Khách hàng và phiếu thuê: mọi vai trò xem, RECEPTIONIST và MANAGER thêm/sửa/xóa
                        .requestMatchers(HttpMethod.GET, "/api/customers/**", "/api/rental-receipts/**")
                        .authenticated()
                        .requestMatchers("/api/customers/**", "/api/rental-receipts/**")
                        .hasAnyRole(OPERATION_ROLES)

                        // Hóa đơn: mọi vai trò xem, RECEPTIONIST và MANAGER thanh toán
                        .requestMatchers(HttpMethod.GET, "/api/invoices/**").authenticated()
                        .requestMatchers("/api/invoices/**").hasAnyRole(OPERATION_ROLES)

                        // Xem dịch vụ khách đã sử dụng của một lượt lưu trú: mọi vai trò
                        .requestMatchers(HttpMethod.GET, "/api/booking-details/*/services")
                        .authenticated()

                        // Nhận phòng, trả phòng, ghi nhận dịch vụ theo chi tiết đặt phòng
                        .requestMatchers("/api/booking-details/**")
                        .hasAnyRole(OPERATION_ROLES)

                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
