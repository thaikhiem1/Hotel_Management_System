package com.example.hotel;

import com.example.hotel.Enums.Role;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử luồng JWT: đăng nhập, xác định người dùng hiện tại, phân quyền theo vai trò.
 * Dữ liệu tự tạo trong test được rollback; tài khoản ADMIN khởi tạo do AdminBootstrap tạo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    private String login(String username, String password) throws Exception {
        String body = json.writeValueAsString(java.util.Map.of("username", username, "password", password));
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode data = json.readTree(res).get("data");
        assertEquals("Bearer", data.get("tokenType").asText());
        return data.get("accessToken").asText();
    }

    private void createAccount(String username, String phone, String cccd, String email,
            Role role, boolean active) {
        employees e = new employees();
        e.setFullName("Test " + username);
        e.setPosition("Lễ tân");
        e.setSalary(BigDecimal.ZERO);
        e.setPhone(phone);
        e.setCitizenId(cccd);
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail(email);
        e.setIsActive(true);
        e = employeeRepository.save(e);

        accounts a = new accounts();
        a.setUsername(username);
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(role);
        a.setEmployee(e);
        a.setIsActive(active);
        accountRepository.save(a);
    }

    @Test
    void noTokenOrBadToken_returns401() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mvc.perform(get("/api/rooms").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPassword_returns401_withoutLeakingWhichFieldWasWrong() throws Exception {
        String body = json.writeValueAsString(java.util.Map.of("username", adminUser, "password", "wrong"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Tên đăng nhập hoặc mật khẩu không đúng"));

        String unknown = json.writeValueAsString(java.util.Map.of("username", "no_such_user", "password", "x"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(unknown))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Tên đăng nhập hoặc mật khẩu không đúng"));
    }

    @Test
    void blankFields_returns400() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void admin_loginThenMeReturnsAccountAndEmployee() throws Exception {
        String token = login(adminUser, adminPass);

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(adminUser))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.employee.employeeId").isNumber())
                .andExpect(jsonPath("$.data.employee.fullName").isNotEmpty());

        mvc.perform(get("/api/employees").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mvc.perform(get("/api/accounts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void receptionist_isIdentifiedAndRestrictedByRole() throws Exception {
        createAccount("recep_test", "0999999991", "999999999991", "recep.test@hotel.local",
                Role.RECEPTIONIST, true);
        String token = login("recep_test", "Pass@1234");

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("recep_test"))
                .andExpect(jsonPath("$.data.role").value("RECEPTIONIST"))
                .andExpect(jsonPath("$.data.employee.email").value("recep.test@hotel.local"));

        // Không được vào quản lý nhân viên / tài khoản
        mvc.perform(get("/api/employees").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.status").value(403));
        mvc.perform(get("/api/accounts").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        // Được xem nhưng không được sửa danh mục
        mvc.perform(get("/api/rooms").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mvc.perform(post("/api/rooms").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        // Khách hàng: lễ tân được dùng
        mvc.perform(get("/api/customers").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void manager_canManageEmployees() throws Exception {
        createAccount("manager_test", "0999999992", "999999999992", "manager.test@hotel.local",
                Role.MANAGER, true);
        String token = login("manager_test", "Pass@1234");
        mvc.perform(get("/api/employees").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deactivatedAccount_cannotLogin() throws Exception {
        createAccount("locked_test", "0999999993", "999999999993", "locked.test@hotel.local",
                Role.RECEPTIONIST, false);
        String body = json.writeValueAsString(java.util.Map.of("username", "locked_test", "password", "Pass@1234"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenOfDeactivatedAccount_isRejectedImmediately() throws Exception {
        createAccount("soon_locked", "0999999994", "999999999994", "soon.locked@hotel.local",
                Role.RECEPTIONIST, true);
        String token = login("soon_locked", "Pass@1234");

        accounts a = accountRepository.findByUsername("soon_locked").orElseThrow();
        a.setIsActive(false);
        accountRepository.saveAndFlush(a);

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
