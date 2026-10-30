package com.example.hotel;

import com.example.hotel.Enums.Role;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Chức vụ của nhân viên chính là vai trò tài khoản (ADMIN, MANAGER, RECEPTIONIST):
 * thêm mới, cập nhật nhân viên và đồng bộ với tài khoản liên kết.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeePositionIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;

    @BeforeEach
    void loginAsAdmin() throws Exception {
        String body = json.writeValueAsString(Map.of("username", adminUser, "password", adminPass));
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = json.readTree(res).get("data").get("accessToken").asText();
    }

    private ResultActions send(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder,
                               Object body) throws Exception {
        return mvc.perform(builder.header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)));
    }

    private Map<String, Object> newEmployee(String position, String phone, String cccd, String email) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("fullName", "Nhan Vien Moi");
        m.put("position", position);
        m.put("salary", 1000000);
        m.put("phone", phone);
        m.put("citizenId", cccd);
        m.put("dateOfBirth", "1995-01-01");
        m.put("gender", "Nam");
        m.put("email", email);
        return m;
    }

    private employees employee(String position, String phone, String cccd, String email) {
        employees e = new employees();
        e.setFullName("Nhan Vien Cu");
        e.setPosition(position);
        e.setSalary(BigDecimal.ZERO);
        e.setPhone(phone);
        e.setCitizenId(cccd);
        e.setDateOfBirth(LocalDate.of(1995, 1, 1));
        e.setGender("Nam");
        e.setEmail(email);
        e.setIsActive(true);
        return employeeRepository.save(e);
    }

    private accounts account(String username, employees e, Role role) {
        accounts a = new accounts();
        a.setUsername(username);
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(role);
        a.setEmployee(e);
        a.setIsActive(true);
        return accountRepository.save(a);
    }

    // ------------------------------------------------------------------ thêm mới

    @Test
    void create_acceptsOnlyManagerOrReceptionist() throws Exception {
        send(post("/api/employees"), newEmployee("MANAGER", "0933000001", "079300000001", "p1@x.vn"))
                .andExpect(status().isCreated());
        send(post("/api/employees"), newEmployee("RECEPTIONIST", "0933000002", "079300000002", "p2@x.vn"))
                .andExpect(status().isCreated());

        // chức vụ tự do cũ, quản trị viên hoặc để trống đều bị từ chối
        for (String bad : new String[] { "Lễ tân", "Nhân Viên Bếp", "ADMIN", "manager", "" }) {
            send(post("/api/employees"), newEmployee(bad, "0933000003", "079300000003", "p3@x.vn"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ------------------------------------------------------------------ cập nhật

    @Test
    void update_changesPositionAndSyncsLinkedAccountRole() throws Exception {
        employees e = employee("RECEPTIONIST", "0933000011", "079300000011", "p11@x.vn");
        accounts a = account("pos_sync", e, Role.RECEPTIONIST);

        send(put("/api/employees/" + e.getEmployeeId()), Map.of("position", "MANAGER")).andExpect(status().isOk());

        assertEquals("MANAGER", employeeRepository.findById(e.getEmployeeId()).orElseThrow().getPosition());
        assertEquals(Role.MANAGER, accountRepository.findById(a.getAccountId()).orElseThrow().getRole());
    }

    @Test
    void update_withoutAccount_onlyChangesPosition_andLegacyValueCanBeReplaced() throws Exception {
        employees e = employee("Nhân Viên Bếp", "0933000012", "079300000012", "p12@x.vn");

        send(put("/api/employees/" + e.getEmployeeId()), Map.of("position", "RECEPTIONIST")).andExpect(status().isOk());

        assertEquals("RECEPTIONIST", employeeRepository.findById(e.getEmployeeId()).orElseThrow().getPosition());
    }

    @Test
    void update_rejectsInvalidPosition_andAdminChanges() throws Exception {
        employees e = employee("RECEPTIONIST", "0933000013", "079300000013", "p13@x.vn");
        employees admin = employee("ADMIN", "0933000014", "079300000014", "p14@x.vn");
        account("pos_admin", admin, Role.ADMIN);

        // giá trị không thuộc danh sách
        send(put("/api/employees/" + e.getEmployeeId()), Map.of("position", "Lễ tân")).andExpect(status().isBadRequest());
        // không gán chức vụ quản trị viên cho người khác
        send(put("/api/employees/" + e.getEmployeeId()), Map.of("position", "ADMIN")).andExpect(status().isBadRequest());
        // không hạ chức vụ của quản trị viên
        send(put("/api/employees/" + admin.getEmployeeId()), Map.of("position", "MANAGER")).andExpect(status().isBadRequest());
        // gửi lại đúng ADMIN cho quản trị viên (biểu mẫu luôn gửi chức vụ) vẫn hợp lệ
        send(put("/api/employees/" + admin.getEmployeeId()), Map.of("position", "ADMIN")).andExpect(status().isOk());

        assertEquals("RECEPTIONIST", employeeRepository.findById(e.getEmployeeId()).orElseThrow().getPosition());
        assertEquals("ADMIN", employeeRepository.findById(admin.getEmployeeId()).orElseThrow().getPosition());
    }

    // ------------------------------------------------------------------ đồng bộ từ tài khoản

    @Test
    void newAccount_takesRoleFromEmployeePosition_andRoleChangeUpdatesPosition() throws Exception {
        employees manager = employee("MANAGER", "0933000015", "079300000015", "p15@x.vn");

        String res = send(post("/api/accounts"),
                Map.of("username", "pos_new", "password", "Pass@1234", "employeeId", manager.getEmployeeId()))
                .andExpect(status().is2xxSuccessful()).andReturn().getResponse().getContentAsString();
        JsonNode created = json.readTree(res).get("data");
        assertEquals("MANAGER", created.get("role").asText());

        send(put("/api/accounts/" + created.get("accountId").asInt()), Map.of("role", "RECEPTIONIST"))
                .andExpect(status().isOk());
        assertEquals("RECEPTIONIST", employeeRepository.findById(manager.getEmployeeId()).orElseThrow().getPosition());
    }
}
