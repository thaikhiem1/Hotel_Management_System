package com.example.hotel;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.PaymentMethod;
import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.invoices;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServicesRepository;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Hóa đơn: danh sách (lọc, tìm kiếm, phân trang), thống kê, chi tiết, thanh toán và phân quyền.
 * Hóa đơn được tạo bằng cách trả phòng qua API thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InvoiceIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired ServiceCategoriesRepository serviceCategoriesRepository;
    @Autowired ServicesRepository servicesRepository;
    @Autowired InvoiceRepository invoiceRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;       // lễ tân
    String adminToken;  // chỉ được xem
    int customerId;
    int receptionistEmployeeId;
    services water;
    rooms room1, room2;
    long seededInvoices;

    @BeforeEach
    void setUp() throws Exception {
        seededInvoices = invoiceRepository.count();

        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);
        adminToken = login(adminUser, adminPass);

        employees e = new employees();
        e.setFullName("Le Tan Hoa Don");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0977000004");
        e.setCitizenId("079700000004");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("hd_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        receptionistEmployeeId = e.getEmployeeId();
        accounts a = new accounts();
        a.setUsername("hd_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        token = login("hd_rt", "Pass@1234");

        room_types type = new room_types();
        type.setRoomTypeName("HD-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("HD101", type);
        room2 = room("HD102", type);

        customers c = new customers();
        c.setFullName("Khach Hoa Don Rieng");
        c.setPhone("0987000777");
        c.setCitizenId("HD-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();

        service_categories category = new service_categories();
        category.setServiceCategoriesName("HD-Category");
        category = serviceCategoriesRepository.save(category);
        services s = new services();
        s.setServiceName("HD-Water");
        s.setUnitPrice(new BigDecimal("20000"));
        s.setStockQuantity(10);
        s.setUnit("chai");
        s.setIsActive(true);
        s.setCategory(category);
        water = servicesRepository.save(s);
    }

    // ------------------------------------------------------------------ tiện ích

    private String login(String username, String password) throws Exception {
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

    /** Đặt phòng, nhận phòng, ghi nhận 2 chai nước (nếu có), trả phòng; trả về mã hóa đơn */
    private int issueInvoice(rooms room, boolean withService) throws Exception {
        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        Map<String, Object> detail = Map.of("roomId", room.getRoomId(), "numberOfGuests", 1,
                "checkIn", now.minusHours(1).toString(), "checkOut", now.plusHours(3).toString(),
                "pricingMethod", "GIO");
        String res = send(post("/api/rental-receipts"), token,
                Map.of("customerId", customerId, "details", List.of(detail)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        int detailId = json.readTree(res).get("data").get("details").get(0).get("bookingDetailId").asInt();
        send(post("/api/booking-details/" + detailId + "/check-in"), token, Map.of("actualGuests", 1))
                .andExpect(status().isOk());
        if (withService) {
            send(post("/api/booking-details/" + detailId + "/services"), token,
                    Map.of("lines", List.of(Map.of("serviceId", water.getServiceId(), "quantity", 2))))
                    .andExpect(status().isCreated());
        }
        String out = send(post("/api/booking-details/" + detailId + "/check-out"), token, Map.of())
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(out).get("data").get("invoiceId").asInt();
    }

    private ResultActions list(String bearer, String query) throws Exception {
        return send(get("/api/invoices" + query), bearer, null);
    }

    // ------------------------------------------------------------------ danh sách

    @Test
    void list_showsNewestFirst_withCustomerRoomAndEmployee() throws Exception {
        int first = issueInvoice(room1, false);
        int second = issueInvoice(room2, true);

        list(token, "?keyword=Khach Hoa Don Rieng").andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].invoiceId").value(second))
                .andExpect(jsonPath("$.data.content[1].invoiceId").value(first))
                .andExpect(jsonPath("$.data.content[0].customerName").value("Khach Hoa Don Rieng"))
                .andExpect(jsonPath("$.data.content[0].roomCode").value("HD102"))
                .andExpect(jsonPath("$.data.content[0].employeeName").value("Le Tan Hoa Don"))
                .andExpect(jsonPath("$.data.content[0].invoiceStatus").value("UNPAID"))
                .andExpect(jsonPath("$.data.content[0].totalAmount").value(140000));
    }

    @Test
    void list_filtersByStatusKeywordAndDateRange_andPaginates() throws Exception {
        int paid = issueInvoice(room1, false);
        int unpaid = issueInvoice(room2, false);
        send(post("/api/invoices/" + paid + "/pay"), token, Map.of("paymentMethod", "CARD")).andExpect(status().isOk());

        list(token, "?keyword=HD-CCCD&status=PAID").andExpect(jsonPath("$.data.totalElements").value(0));
        list(token, "?keyword=0987000777&status=PAID").andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].invoiceId").value(paid))
                .andExpect(jsonPath("$.data.content[0].invoiceStatus").value("PAID"));
        list(token, "?keyword=0987000777&status=UNPAID").andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].invoiceId").value(unpaid));
        // tìm theo mã phòng và mã hóa đơn (không phân biệt hoa thường)
        list(token, "?keyword=hd102").andExpect(jsonPath("$.data.totalElements").value(1));
        String code = invoiceRepository.findById(unpaid).orElseThrow().getInvoiceCode().toLowerCase();
        list(token, "?keyword=" + code).andExpect(jsonPath("$.data.content[0].invoiceId").value(unpaid));

        String today = LocalDate.now(ClockConfig.HOTEL_ZONE).toString();
        String tomorrow = LocalDate.now(ClockConfig.HOTEL_ZONE).plusDays(1).toString();
        list(token, "?keyword=0987000777&fromDate=" + today + "&toDate=" + today)
                .andExpect(jsonPath("$.data.totalElements").value(2));
        list(token, "?keyword=0987000777&fromDate=" + tomorrow).andExpect(jsonPath("$.data.totalElements").value(0));

        list(token, "?keyword=0987000777&size=1&page=1").andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.totalPages").value(2));
    }

    // ------------------------------------------------------------------ thống kê và chi tiết

    @Test
    void stats_countAndSumByStatus() throws Exception {
        String before = send(get("/api/invoices/stats"), token, null).andReturn().getResponse().getContentAsString();
        JsonNode b = json.readTree(before).get("data");
        int paid = issueInvoice(room1, false);   // 100000
        issueInvoice(room2, true);               // 140000
        send(post("/api/invoices/" + paid + "/pay"), token, Map.of("paymentMethod", "CASH")).andExpect(status().isOk());

        String after = send(get("/api/invoices/stats"), token, null).andReturn().getResponse().getContentAsString();
        JsonNode a = json.readTree(after).get("data");
        assertEquals(b.get("totalInvoices").asLong() + 2, a.get("totalInvoices").asLong());
        assertEquals(b.get("paidInvoices").asLong() + 1, a.get("paidInvoices").asLong());
        assertEquals(b.get("unpaidInvoices").asLong() + 1, a.get("unpaidInvoices").asLong());
        assertEquals(0, new BigDecimal("100000").compareTo(a.get("paidAmount").decimalValue().subtract(b.get("paidAmount").decimalValue())));
        assertEquals(0, new BigDecimal("140000").compareTo(a.get("unpaidAmount").decimalValue().subtract(b.get("unpaidAmount").decimalValue())));
        // Doanh thu hôm nay chỉ tính hóa đơn đã thanh toán trong ngày: hóa đơn chưa thanh toán không được cộng
        assertEquals(b.get("paidTodayInvoices").asLong() + 1, a.get("paidTodayInvoices").asLong());
        assertEquals(0, new BigDecimal("100000").compareTo(a.get("paidTodayAmount").decimalValue().subtract(b.get("paidTodayAmount").decimalValue())));
    }

    @Test
    void detail_hasCustomerStayServicesAndAmounts() throws Exception {
        int id = issueInvoice(room1, true);
        send(get("/api/invoices/" + id), token, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.invoiceCode").value(invoiceRepository.findById(id).orElseThrow().getInvoiceCode()))
                .andExpect(jsonPath("$.data.invoiceStatus").value("UNPAID"))
                .andExpect(jsonPath("$.data.customerName").value("Khach Hoa Don Rieng"))
                .andExpect(jsonPath("$.data.customerCitizenId").value("HD-CCCD-1"))
                .andExpect(jsonPath("$.data.roomCode").value("HD101"))
                .andExpect(jsonPath("$.data.roomTypeName").value("HD-Type"))
                .andExpect(jsonPath("$.data.pricingMethod").value("GIO"))
                .andExpect(jsonPath("$.data.billedUnits").value(1))
                .andExpect(jsonPath("$.data.roomAmount").value(100000))
                .andExpect(jsonPath("$.data.services.length()").value(1))
                .andExpect(jsonPath("$.data.services[0].serviceName").value("HD-Water"))
                .andExpect(jsonPath("$.data.serviceAmount").value(40000))
                .andExpect(jsonPath("$.data.totalAmount").value(140000))
                .andExpect(jsonPath("$.data.issuedBy").value("Le Tan Hoa Don"))
                .andExpect(jsonPath("$.data.paidBy").doesNotExist());
        send(get("/api/invoices/987654"), token, null).andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------ thanh toán

    @Test
    void pay_marksPaidWithMethodAndCollector_andSecondPaymentIsConflict() throws Exception {
        int id = issueInvoice(room1, true);

        send(post("/api/invoices/" + id + "/pay"), token, Map.of("paymentMethod", "TRANSFER")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.invoiceStatus").value("PAID"))
                .andExpect(jsonPath("$.data.paymentMethod").value("TRANSFER"))
                .andExpect(jsonPath("$.data.paidBy").value("Le Tan Hoa Don"))
                .andExpect(jsonPath("$.data.paidAt").exists())
                .andExpect(jsonPath("$.data.totalAmount").value(140000));

        invoices stored = invoiceRepository.findById(id).orElseThrow();
        assertEquals(InvoiceStatus.PAID, stored.getInvoiceStatus());
        assertEquals(PaymentMethod.TRANSFER, stored.getPaymentMethod());
        assertEquals(receptionistEmployeeId, stored.getPaidBy().getEmployeeId());
        assertNotNull(stored.getPaidAt());
        assertTrue(!stored.getPaidAt().isBefore(stored.getIssuedAt()));

        send(post("/api/invoices/" + id + "/pay"), token, Map.of("paymentMethod", "CASH")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Hóa đơn đã được thanh toán trước đó."));
        assertEquals(PaymentMethod.TRANSFER, invoiceRepository.findById(id).orElseThrow().getPaymentMethod());
    }

    @Test
    void pay_requiresValidMethod_andExistingInvoice() throws Exception {
        int id = issueInvoice(room1, false);
        send(post("/api/invoices/" + id + "/pay"), token, Map.of()).andExpect(status().isBadRequest());
        send(post("/api/invoices/" + id + "/pay"), token, Map.of("paymentMethod", "BITCOIN")).andExpect(status().isBadRequest());
        send(post("/api/invoices/987654/pay"), token, Map.of("paymentMethod", "CASH")).andExpect(status().isNotFound());
        assertEquals(InvoiceStatus.UNPAID, invoiceRepository.findById(id).orElseThrow().getInvoiceStatus());
    }

    // ------------------------------------------------------------------ phân quyền

    @Test
    void security_everyoneViews_onlyReceptionistAndManagerPay() throws Exception {
        int id = issueInvoice(room1, false);
        mvc.perform(get("/api/invoices")).andExpect(status().isUnauthorized());

        list(adminToken, "?keyword=Khach Hoa Don Rieng").andExpect(status().isOk());
        send(get("/api/invoices/stats"), adminToken, null).andExpect(status().isOk());
        send(get("/api/invoices/" + id), adminToken, null).andExpect(status().isOk());
        send(post("/api/invoices/" + id + "/pay"), adminToken, Map.of("paymentMethod", "CASH")).andExpect(status().isForbidden());
        assertEquals(InvoiceStatus.UNPAID, invoiceRepository.findById(id).orElseThrow().getInvoiceStatus());
        assertTrue(invoiceRepository.count() >= seededInvoices + 1);
    }
}
