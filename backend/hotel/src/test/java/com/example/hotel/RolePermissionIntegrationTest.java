package com.example.hotel;

import com.example.hotel.models.entities.accounts;
import com.example.hotel.repositorys.AccountRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

/**
 * Ma trận phân quyền theo vai trò dùng các tài khoản mẫu admin / manager / receptionist:
 * - ADMIN: chỉ quản lý tài khoản; xem được mọi danh sách nhưng không thêm/sửa/xóa dữ liệu khác.
 * - MANAGER: toàn quyền trừ tài khoản.
 * - RECEPTIONIST: lập phiếu, nhận/trả phòng, ghi nhận dịch vụ, khách hàng; chỉ xem phòng, loại phòng, dịch vụ;
 *   không truy cập nhân viên và tài khoản.
 * Thao tác ghi gửi thân rỗng: được phép thì bị kiểm tra dữ liệu (không phải 401/403), bị cấm thì trả 403.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RolePermissionIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired PasswordEncoder passwordEncoder;

    String admin, manager, receptionist;

    @BeforeEach
    void setUp() throws Exception {
        admin = tokenOf("admin");
        manager = tokenOf("manager");
        receptionist = tokenOf("receptionist");
    }

    private String tokenOf(String username) throws Exception {
        accounts a = accountRepository.findByUsername(username).orElseThrow();
        a.setPasswordHash(passwordEncoder.encode("Role@12345"));
        accountRepository.saveAndFlush(a);
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", username, "password", "Role@12345"))))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data").get("accessToken").asText();
    }

    private int call(MockHttpServletRequestBuilder builder, String token) throws Exception {
        return mvc.perform(builder.header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andReturn().getResponse().getStatus();
    }

    private void forbidden(String token, MockHttpServletRequestBuilder builder) throws Exception {
        assertEquals(403, call(builder, token));
    }

    private void allowed(String token, MockHttpServletRequestBuilder builder) throws Exception {
        int status = call(builder, token);
        assertNotEquals(401, status);
        assertNotEquals(403, status);
    }

    // ------------------------------------------------------------------ ADMIN

    @Test
    void admin_managesAccountsOnly_andViewsEverythingElse() throws Exception {
        allowed(admin, get("/api/accounts"));
        allowed(admin, post("/api/accounts"));
        allowed(admin, put("/api/accounts/1"));

        // xem được toàn bộ dữ liệu
        for (String url : new String[] { "/api/employees", "/api/rooms", "/api/roomTypes", "/api/services",
                "/api/service-categories", "/api/customers", "/api/rental-receipts", "/api/room-map",
                "/api/booking-details/1/services", "/api/profile" }) {
            allowed(admin, get(url));
        }

        // không thêm/sửa/xóa dữ liệu khác
        forbidden(admin, post("/api/employees"));
        forbidden(admin, put("/api/employees/1"));
        forbidden(admin, post("/api/rooms"));
        forbidden(admin, put("/api/rooms/1"));
        forbidden(admin, delete("/api/rooms/1"));
        forbidden(admin, post("/api/roomTypes"));
        forbidden(admin, post("/api/services"));
        forbidden(admin, post("/api/service-categories"));
        forbidden(admin, post("/api/customers"));
        forbidden(admin, post("/api/rental-receipts"));
        forbidden(admin, post("/api/booking-details/1/check-in"));
        forbidden(admin, post("/api/booking-details/1/check-out"));
        forbidden(admin, post("/api/booking-details/1/services"));
    }

    // ------------------------------------------------------------------ MANAGER

    @Test
    void manager_hasFullAccessExceptAccounts() throws Exception {
        forbidden(manager, get("/api/accounts"));
        forbidden(manager, post("/api/accounts"));
        forbidden(manager, put("/api/accounts/1"));

        for (String url : new String[] { "/api/employees", "/api/rooms", "/api/roomTypes", "/api/services",
                "/api/service-categories", "/api/customers", "/api/rental-receipts", "/api/room-map" }) {
            allowed(manager, get(url));
        }
        allowed(manager, post("/api/employees"));
        allowed(manager, put("/api/employees/1"));
        allowed(manager, post("/api/rooms"));
        allowed(manager, delete("/api/rooms/987654"));
        allowed(manager, post("/api/roomTypes"));
        allowed(manager, post("/api/services"));
        allowed(manager, post("/api/service-categories"));
        allowed(manager, post("/api/customers"));
        allowed(manager, post("/api/rental-receipts"));
        allowed(manager, post("/api/booking-details/1/check-in"));
        allowed(manager, post("/api/booking-details/1/check-out"));
        allowed(manager, post("/api/booking-details/1/services"));
    }

    // ------------------------------------------------------------------ RECEPTIONIST

    @Test
    void receptionist_operatesStays_butOnlyViewsCatalogs_andHasNoStaffAccess() throws Exception {
        forbidden(receptionist, get("/api/accounts"));
        forbidden(receptionist, post("/api/accounts"));
        forbidden(receptionist, get("/api/employees"));
        forbidden(receptionist, post("/api/employees"));
        forbidden(receptionist, put("/api/employees/1"));

        for (String url : new String[] { "/api/rooms", "/api/roomTypes", "/api/services",
                "/api/service-categories", "/api/customers", "/api/rental-receipts", "/api/room-map",
                "/api/booking-details/1/services", "/api/profile" }) {
            allowed(receptionist, get(url));
        }

        forbidden(receptionist, post("/api/rooms"));
        forbidden(receptionist, put("/api/rooms/1"));
        forbidden(receptionist, delete("/api/rooms/1"));
        forbidden(receptionist, post("/api/roomTypes"));
        forbidden(receptionist, post("/api/services"));
        forbidden(receptionist, post("/api/service-categories"));

        allowed(receptionist, post("/api/customers"));
        allowed(receptionist, post("/api/rental-receipts"));
        allowed(receptionist, post("/api/booking-details/1/check-in"));
        allowed(receptionist, post("/api/booking-details/1/check-out"));
        allowed(receptionist, post("/api/booking-details/1/services"));
    }
}
