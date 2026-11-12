package com.example.hotel;

import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServiceUsageRepository;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UC-SVC-005: ghi nhận dịch vụ khách sử dụng. Lượt lưu trú được tạo và nhận phòng bằng API thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ServiceUsageIntegrationTest {

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
    @Autowired ServiceUsageRepository serviceUsageRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;
    int customerId;
    long seededUsages;   // dịch vụ mẫu từ migration seed, các test chỉ so sánh phần tăng thêm
    int stayId;          // lượt lưu trú đã nhận phòng
    int reservedId;      // lượt chỉ mới đặt, chưa nhận phòng
    services water;      // có quản lý tồn kho: 10 chai, 20000
    services laundry;    // không quản lý tồn kho: 30000 / kg
    services stopped;    // đã ngừng cung cấp
    rooms room1, room2;

    @BeforeEach
    void setUp() throws Exception {
        seededUsages = serviceUsageRepository.count();
        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);

        employees e = new employees();
        e.setFullName("Le Tan Dich Vu");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0977000001");
        e.setCitizenId("079700000001");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("svc_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        accounts a = new accounts();
        a.setUsername("svc_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        token = login("svc_rt", "Pass@1234");

        room_types type = new room_types();
        type.setRoomTypeName("SV-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("SV101", type);
        room2 = room("SV102", type);

        customers c = new customers();
        c.setFullName("Khach Dich Vu");
        c.setPhone("0987000444");
        c.setCitizenId("SV-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();

        service_categories category = new service_categories();
        category.setServiceCategoriesName("SV-Category");
        category = serviceCategoriesRepository.save(category);
        water = service("SV-Water", "20000", 10, "chai", true, category);
        laundry = service("SV-Laundry", "30000", null, "kg", true, category);
        stopped = service("SV-Stopped", "50000", null, "lượt", false, category);

        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        stayId = createReceipt(room1, now.minusHours(1), now.plusHours(3));
        checkIn(stayId);
        reservedId = createReceipt(room2, now.minusHours(1), now.plusHours(3));
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

    private services service(String name, String price, Integer stock, String unit, boolean active, service_categories category) {
        services s = new services();
        s.setServiceName(name);
        s.setUnitPrice(new BigDecimal(price));
        s.setStockQuantity(stock);
        s.setUnit(unit);
        s.setIsActive(active);
        s.setCategory(category);
        return servicesRepository.save(s);
    }

    private int createReceipt(rooms room, LocalDateTime in, LocalDateTime out) throws Exception {
        Map<String, Object> detail = Map.of("roomId", room.getRoomId(), "numberOfGuests", 1,
                "checkIn", in.toString(), "checkOut", out.toString(), "pricingMethod", "GIO");
        String res = mvc.perform(post("/api/rental-receipts").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("customerId", customerId, "details", List.of(detail)))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data").get("details").get(0).get("bookingDetailId").asInt();
    }

    private void checkIn(int detailId) throws Exception {
        mvc.perform(post("/api/booking-details/" + detailId + "/check-in").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"actualGuests\":1}"))
                .andExpect(status().isOk());
    }

    private Map<String, Object> line(services s, int quantity) {
        return Map.of("serviceId", s.getServiceId(), "quantity", quantity);
    }

    private ResultActions send(MockHttpServletRequestBuilder builder, String bearer, Object body) throws Exception {
        MockHttpServletRequestBuilder b = builder.header("Authorization", "Bearer " + bearer);
        if (body != null) {
            b = b.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        }
        return mvc.perform(b);
    }

    private ResultActions estimate(int id, Object body) throws Exception {
        return send(post("/api/booking-details/" + id + "/services/estimate"), token, body);
    }

    private ResultActions record(int id, Object body) throws Exception {
        return send(post("/api/booking-details/" + id + "/services"), token, body);
    }

    private Map<String, Object> request(Object... lines) {
        return Map.of("lines", List.of(lines));
    }

    // ------------------------------------------------------------------ bảo mật

    @Test
    void security_onlyReceptionistRecords_managementCanView() throws Exception {
        mvc.perform(get("/api/booking-details/" + stayId + "/services")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/booking-details/" + stayId + "/services").contentType(MediaType.APPLICATION_JSON)
                .content("{}")).andExpect(status().isUnauthorized());

        String adminToken = login(adminUser, adminPass);
        send(post("/api/booking-details/" + stayId + "/services"), adminToken, request(line(laundry, 1)))
                .andExpect(status().isForbidden());
        send(post("/api/booking-details/" + stayId + "/services/estimate"), adminToken, request(line(laundry, 1)))
                .andExpect(status().isForbidden());
        send(get("/api/booking-details/" + stayId + "/services"), adminToken, null).andExpect(status().isOk());
    }

    // ------------------------------------------------------------------ luồng chính

    @Test
    void estimate_computesAmountsWithoutSavingAnything() throws Exception {
        estimate(stayId, request(line(water, 3), line(laundry, 2))).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lines[0].serviceName").value("SV-Water"))
                .andExpect(jsonPath("$.data.lines[0].unitPrice").value(20000))
                .andExpect(jsonPath("$.data.lines[0].amount").value(60000))
                .andExpect(jsonPath("$.data.lines[0].availableStock").value(10))
                .andExpect(jsonPath("$.data.lines[1].amount").value(60000))
                .andExpect(jsonPath("$.data.totalAmount").value(120000));

        assertEquals(10, servicesRepository.findById(water.getServiceId()).orElseThrow().getStockQuantity());
        assertEquals(seededUsages, serviceUsageRepository.count());
    }

    @Test
    void record_savesUsageWithAppliedPrice_andDeductsStock() throws Exception {
        JsonNode data = json.readTree(record(stayId, request(line(water, 3), line(laundry, 2)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("data");

        assertEquals(2, data.get("usages").size());
        assertEquals(120000, data.get("totalAmount").asInt());
        assertEquals("Le Tan Dich Vu", data.get("usages").get(0).get("recordedBy").asText());
        assertEquals("SV101", data.get("roomCode").asText());

        // chỉ dịch vụ có quản lý tồn kho bị trừ
        assertEquals(7, servicesRepository.findById(water.getServiceId()).orElseThrow().getStockQuantity());
        assertEquals(null, servicesRepository.findById(laundry.getServiceId()).orElseThrow().getStockQuantity());

        // xem lại danh sách
        mvc.perform(get("/api/booking-details/" + stayId + "/services").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.usages.length()").value(2))
                .andExpect(jsonPath("$.data.totalAmount").value(120000));
    }

    @Test
    void record_keepsAppliedPrice_whenServicePriceChangesLater() throws Exception {
        record(stayId, request(line(laundry, 1))).andExpect(status().isCreated());

        laundry.setUnitPrice(new BigDecimal("99000"));
        servicesRepository.saveAndFlush(laundry);

        mvc.perform(get("/api/booking-details/" + stayId + "/services").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data.usages[0].unitPrice").value(30000))
                .andExpect(jsonPath("$.data.totalAmount").value(30000));
    }

    @Test
    void record_sameServiceTwiceInRequest_isMergedIntoOneUsage() throws Exception {
        record(stayId, request(line(water, 1), line(water, 2))).andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.usages.length()").value(1))
                .andExpect(jsonPath("$.data.usages[0].quantity").value(3));
        assertEquals(7, servicesRepository.findById(water.getServiceId()).orElseThrow().getStockQuantity());
    }

    @Test
    void record_withMatchingExpectedTotal_succeeds_andWithStaleTotal_returns409WithNewEstimate() throws Exception {
        Map<String, Object> stale = Map.of("lines", List.of(line(laundry, 2)), "expectedTotalAmount", 1);
        record(stayId, stale).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Chi phí đã thay đổi. Vui lòng kiểm tra và xác nhận lại chi phí mới."))
                .andExpect(jsonPath("$.data.totalAmount").value(60000));
        assertEquals(seededUsages, serviceUsageRepository.count());

        Map<String, Object> ok = Map.of("lines", List.of(line(laundry, 2)), "expectedTotalAmount", 60000);
        record(stayId, ok).andExpect(status().isCreated());
    }

    // ------------------------------------------------------------------ luồng thay thế và ngoại lệ

    @Test
    void stayNotInProgress_isRejected() throws Exception {
        // A1: lượt chỉ mới đặt, chưa nhận phòng
        record(reservedId, request(line(laundry, 1))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Không thể ghi nhận dịch vụ cho lượt lưu trú này."));
        estimate(reservedId, request(line(laundry, 1))).andExpect(status().isBadRequest());
        // lượt không tồn tại
        record(999999, request(line(laundry, 1))).andExpect(status().isNotFound());
        assertEquals(seededUsages, serviceUsageRepository.count());
    }

    @Test
    void unavailableServices_areRejected_andNothingIsSaved() throws Exception {
        // A2: dịch vụ đã ngừng cung cấp hoặc không tồn tại
        record(stayId, request(line(stopped, 1))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['lines[0].serviceId']").value("Dịch vụ 'SV-Stopped' đã ngừng cung cấp"));
        record(stayId, request(Map.of("serviceId", 999999, "quantity", 1))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['lines[0].serviceId']").exists());
        // một dòng sai thì cả yêu cầu không được lưu
        record(stayId, request(line(water, 1), line(stopped, 1))).andExpect(status().isBadRequest());
        assertEquals(10, servicesRepository.findById(water.getServiceId()).orElseThrow().getStockQuantity());
        assertEquals(seededUsages, serviceUsageRepository.count());
    }

    @Test
    void invalidQuantityOrEmptyLines_areRejected() throws Exception {
        // A3
        record(stayId, request(line(laundry, 0))).andExpect(status().isBadRequest());
        record(stayId, request(line(laundry, -2))).andExpect(status().isBadRequest());
        record(stayId, request(Map.of("serviceId", laundry.getServiceId()))).andExpect(status().isBadRequest());
        record(stayId, Map.of("lines", List.of())).andExpect(status().isBadRequest());
        record(stayId, Map.of()).andExpect(status().isBadRequest());
        assertEquals(seededUsages, serviceUsageRepository.count());
    }

    @Test
    void insufficientStock_isRejected_withAvailableQuantity() throws Exception {
        // A4: còn 10 chai nhưng yêu cầu 11
        record(stayId, request(line(water, 11))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['lines[0].quantity']")
                        .value("Dịch vụ 'SV-Water' không đủ tồn kho, chỉ còn 10 chai"));
        estimate(stayId, request(line(water, 11))).andExpect(status().isBadRequest());
        // đúng bằng tồn kho thì được
        record(stayId, request(line(water, 10))).andExpect(status().isCreated());
        assertEquals(0, servicesRepository.findById(water.getServiceId()).orElseThrow().getStockQuantity());
        // hết hàng
        record(stayId, request(line(water, 1))).andExpect(status().isBadRequest());
        assertEquals(seededUsages + 1, serviceUsageRepository.count());
    }

    // ------------------------------------------------------------------ module dịch vụ

    @Test
    void servicesList_canBeFilteredToActiveOnly() throws Exception {
        String all = mvc.perform(get("/api/services").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String active = mvc.perform(get("/api/services").param("activeOnly", "true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        assertTrue(all.contains("SV-Stopped"));
        assertTrue(!active.contains("SV-Stopped"));
        assertTrue(active.contains("SV-Water"));
        assertTrue(json.readTree(all).get(0).has("isActive"));
    }

    @Test
    void deleteService_withUsageHistory_isRefused_butUnusedServiceCanBeDeleted() throws Exception {
        record(stayId, request(line(laundry, 1))).andExpect(status().isCreated());
        String adminToken = login(adminUser, adminPass);

        send(delete("/api/services/" + laundry.getServiceId()), adminToken, null).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Dịch vụ 'SV-Laundry' đã có lịch sử sử dụng nên không thể xóa. Hãy chuyển sang ngừng cung cấp."));
        send(delete("/api/services/" + stopped.getServiceId()), adminToken, null).andExpect(status().isNoContent());
    }
}
