package com.example.hotel;

import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Báo cáo và thống kê: chỉ ADMIN và MANAGER xem; doanh thu là tiền đã thu theo ngày thanh toán;
 * quỹ lương tính từ nhân viên đang làm việc. Hóa đơn được tạo và thanh toán bằng API thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReportIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired CustomerRepository customerRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String receptionistToken;
    String adminToken;
    String managerToken;
    int customerId;
    rooms room1, room2;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = loginSeeded(adminUser, adminPass);
        managerToken = loginSeeded("manager", "Mgr@12345");
        receptionistToken = loginSeeded("receptionist", "Rec@12345");

        room_types type = new room_types();
        type.setRoomTypeName("RP-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("RP101", type);
        room2 = room("RP102", type);

        customers c = new customers();
        c.setFullName("Khach Bao Cao");
        c.setPhone("0987000888");
        c.setCitizenId("RP-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();
    }

    // ------------------------------------------------------------------ tiện ích

    /** Tài khoản mẫu của migration seed có mật khẩu khác: đặt lại trong giao dịch test (được rollback) rồi đăng nhập */
    private String loginSeeded(String username, String password) throws Exception {
        accounts a = accountRepository.findByUsername(username).orElseThrow();
        a.setPasswordHash(passwordEncoder.encode(password));
        accountRepository.saveAndFlush(a);
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data").get("accessToken").asText();
    }

    private rooms room(String code, room_types type) {
        rooms r = new rooms();
        r.setRoomCode(code);
        r.setRoomStatus(RoomStatus.AVAILABLE);
        r.setRoomTypes(type);
        return roomRepository.save(r);
    }

    private ResultActions send(MockHttpServletRequestBuilder builder, String bearer, Object body) throws Exception {
        MockHttpServletRequestBuilder b = builder.header("Authorization", "Bearer " + bearer);
        if (body != null) {
            b = b.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        }
        return mvc.perform(b);
    }

    /** Đặt phòng, nhận phòng, ghi 2 chai nước, trả phòng rồi thanh toán nếu pay = true; hóa đơn 100000 tiền phòng + dịch vụ */
    private void issueInvoice(rooms room, boolean pay) throws Exception {
        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        Map<String, Object> detail = Map.of("roomId", room.getRoomId(), "numberOfGuests", 1,
                "checkIn", now.minusHours(1).toString(), "checkOut", now.plusHours(3).toString(),
                "pricingMethod", "GIO");
        String res = send(post("/api/rental-receipts"), receptionistToken,
                Map.of("customerId", customerId, "details", List.of(detail)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        int detailId = json.readTree(res).get("data").get("details").get(0).get("bookingDetailId").asInt();
        send(post("/api/booking-details/" + detailId + "/check-in"), receptionistToken, Map.of("actualGuests", 1))
                .andExpect(status().isOk());
        String out = send(post("/api/booking-details/" + detailId + "/check-out"), receptionistToken, Map.of())
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        int invoiceId = json.readTree(out).get("data").get("invoiceId").asInt();
        if (pay) {
            send(post("/api/invoices/" + invoiceId + "/pay"), receptionistToken, Map.of("paymentMethod", "CASH"))
                    .andExpect(status().isOk());
        }
    }

    private JsonNode overview(String bearer, String query) throws Exception {
        String res = send(get("/api/reports/overview" + query), bearer, null).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data");
    }

    private static BigDecimal money(JsonNode node, String field) {
        return node.get(field).decimalValue();
    }

    private static JsonNode point(JsonNode overview, int period) {
        for (JsonNode p : overview.get("revenuePoints")) {
            if (p.get("period").asInt() == period) {
                return p;
            }
        }
        throw new AssertionError("Không có mốc " + period);
    }

    // ------------------------------------------------------------------ phân quyền

    @Test
    void security_onlyAdminAndManagerCanView() throws Exception {
        mvc.perform(get("/api/reports/overview")).andExpect(status().isUnauthorized());
        send(get("/api/reports/overview"), receptionistToken, null).andExpect(status().isForbidden());
        send(get("/api/reports/overview"), adminToken, null).andExpect(status().isOk());
        send(get("/api/reports/overview"), managerToken, null).andExpect(status().isOk());
    }

    // ------------------------------------------------------------------ doanh thu

    @Test
    void monthlyReport_countsOnlyPaidInvoices_byPaymentDay_withEveryDayOfMonth() throws Exception {
        LocalDate today = LocalDate.now(ClockConfig.HOTEL_ZONE);
        String query = "?year=" + today.getYear() + "&month=" + today.getMonthValue();
        JsonNode before = overview(managerToken, query);

        issueInvoice(room1, true);    // 100000 đã thu
        issueInvoice(room2, false);   // chưa thanh toán nên chưa là doanh thu

        JsonNode after = overview(managerToken, query);
        assertEquals("MONTH", after.get("periodType").asText());
        assertEquals(today.lengthOfMonth(), after.get("revenuePoints").size());
        assertEquals(0, new BigDecimal("100000").compareTo(money(after, "totalRevenue").subtract(money(before, "totalRevenue"))));
        assertEquals(before.get("invoiceCount").asLong() + 1, after.get("invoiceCount").asLong());
        assertEquals(0, new BigDecimal("100000").compareTo(
                money(point(after, today.getDayOfMonth()), "revenue").subtract(money(point(before, today.getDayOfMonth()), "revenue"))));
        assertEquals(before.get("revenuePoints").size(), after.get("revenuePoints").size());
        // doanh thu theo ngày cộng lại đúng bằng tổng của tháng
        BigDecimal sum = BigDecimal.ZERO;
        for (JsonNode p : after.get("revenuePoints")) {
            sum = sum.add(p.get("revenue").decimalValue());
        }
        assertEquals(0, sum.compareTo(money(after, "totalRevenue")));
    }

    @Test
    void yearlyReport_hasTwelveMonths_andMatchesMonthlyReport() throws Exception {
        LocalDate today = LocalDate.now(ClockConfig.HOTEL_ZONE);
        issueInvoice(room1, true);

        JsonNode year = overview(adminToken, "?year=" + today.getYear());
        assertEquals("YEAR", year.get("periodType").asText());
        assertEquals(12, year.get("revenuePoints").size());
        assertTrue(year.get("month").isNull());
        JsonNode month = overview(adminToken, "?year=" + today.getYear() + "&month=" + today.getMonthValue());
        assertEquals(0, money(point(year, today.getMonthValue()), "revenue").compareTo(money(month, "totalRevenue")));
        assertEquals(today.getMonthValue(), year.get("payrollMonths").asInt());
    }

    @Test
    void report_withNoRevenueInPeriod_hasZeroTotalsAndNoPercentages() throws Exception {
        JsonNode r = overview(managerToken, "?year=2001&month=1");
        assertEquals(0, BigDecimal.ZERO.compareTo(money(r, "totalRevenue")));
        assertEquals(0, r.get("invoiceCount").asLong());
        assertEquals(0, BigDecimal.ZERO.compareTo(money(r, "averageRevenuePerInvoice")));
        assertTrue(r.get("revenueChangePercent").isNull());
        assertTrue(r.get("profitMargin").isNull());
        assertEquals(31, r.get("revenuePoints").size());
        // năm xa trong quá khứ tính đủ 12 tháng lương, năm tương lai chưa tính tháng nào
        assertEquals(12, overview(managerToken, "?year=2001").get("payrollMonths").asInt());
        assertEquals(0, overview(managerToken, "?year=2099").get("payrollMonths").asInt());
    }

    // ------------------------------------------------------------------ lương

    @Test
    void salary_sumsActiveEmployeesByPosition_andFeedsProfit() throws Exception {
        LocalDate today = LocalDate.now(ClockConfig.HOTEL_ZONE);
        String query = "?year=" + today.getYear() + "&month=" + today.getMonthValue();
        JsonNode before = overview(managerToken, query);

        employee("0977000011", "079700000011", "rp_a@x.vn", "5000000", true);
        employee("0977000012", "079700000012", "rp_b@x.vn", "7000000", true);
        employee("0977000013", "079700000013", "rp_c@x.vn", "9000000", false);   // đã nghỉ việc, không tính

        JsonNode after = overview(managerToken, query);
        assertEquals(before.get("employeeCount").asLong() + 2, after.get("employeeCount").asLong());
        assertEquals(0, new BigDecimal("12000000").compareTo(money(after, "monthlyPayroll").subtract(money(before, "monthlyPayroll"))));
        assertEquals(1, after.get("payrollMonths").asInt());
        assertEquals(0, money(after, "monthlyPayroll").compareTo(money(after, "salaryExpense")));
        assertEquals(0, money(after, "totalRevenue").subtract(money(after, "salaryExpense")).compareTo(money(after, "estimatedProfit")));

        // Từng nhân viên đang làm việc có một dòng với đúng lương; nhân viên đã nghỉ không có
        BigDecimal salaryOfA = null;
        BigDecimal previous = null;
        boolean hasInactive = false;
        for (JsonNode p : after.get("salaryByEmployee")) {
            String name = p.get("fullName").asText();
            if (name.endsWith("0977000011")) {
                salaryOfA = p.get("salary").decimalValue();
                assertEquals("RECEPTIONIST", p.get("position").asText());
            }
            if (name.endsWith("0977000013")) {
                hasInactive = true;
            }
            BigDecimal salary = p.get("salary").decimalValue();
            assertTrue(previous == null || previous.compareTo(salary) >= 0, "Lương phải xếp từ cao xuống thấp");
            previous = salary;
        }
        assertEquals(0, new BigDecimal("5000000").compareTo(salaryOfA));
        assertTrue(!hasInactive);
        assertEquals(after.get("employeeCount").asLong(), after.get("salaryByEmployee").size());
    }

    private void employee(String phone, String citizenId, String email, String salary, boolean active) {
        employees e = new employees();
        e.setFullName("Nhan Vien Bao Cao " + phone);
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(new BigDecimal(salary));
        e.setPhone(phone);
        e.setCitizenId(citizenId);
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail(email);
        e.setIsActive(active);
        employeeRepository.saveAndFlush(e);
    }

    // ------------------------------------------------------------------ kiểm tra tham số

    @Test
    void invalidParameters_areRejected() throws Exception {
        send(get("/api/reports/overview?year=2026&month=13"), managerToken, null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Tháng phải từ 1 đến 12."));
        send(get("/api/reports/overview?year=1999"), managerToken, null).andExpect(status().isBadRequest());
        send(get("/api/reports/overview?year=abc"), managerToken, null).andExpect(status().isBadRequest());
    }
}
