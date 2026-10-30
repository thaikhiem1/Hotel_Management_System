package com.example.hotel;

import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.CustomerRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UC-REN-001 / 009 / 010: tạo phiếu thuê, tra cứu phòng khả dụng, tính chi phí.
 * Dữ liệu phòng/khách tự tạo trong test và được rollback.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RentalReceiptIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired CustomerRepository customerRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;
    int adminEmployeeId;
    int customerId;
    rooms standard, suite, maintenance, cleaning;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", adminUser, "password", adminPass))))
                .andExpect(status().isOk()).andReturn();
        JsonNode data = json.readTree(login.getResponse().getContentAsString()).get("data");
        token = data.get("accessToken").asText();
        adminEmployeeId = data.get("user").get("employee").get("employeeId").asInt();

        room_types std = roomType("RT-Standard", 2, new BigDecimal("800000"), new BigDecimal("100000"));
        room_types ste = roomType("RT-Suite", 4, new BigDecimal("2500000"), new BigDecimal("250000"));
        standard = room("RT101", RoomStatus.AVAILABLE, std);
        suite = room("RT102", RoomStatus.AVAILABLE, ste);
        maintenance = room("RT103", RoomStatus.UNDER_MAINTENANCE, std);
        cleaning = room("RT104", RoomStatus.CLEANING, std);

        customers c = new customers();
        c.setFullName("Khach Thu Nghiem");
        c.setPhone("0987000111");
        c.setCitizenId("RT-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();
    }

    private room_types roomType(String name, int max, BigDecimal daily, BigDecimal hourly) {
        room_types t = new room_types();
        t.setRoomTypeName(name);
        t.setNumberOfBeds(max / 2);
        t.setMaximumOccupancy(max);
        t.setDailyRate(daily);
        t.setHourlyRate(hourly);
        return roomTypeRepository.save(t);
    }

    private rooms room(String code, RoomStatus status, room_types type) {
        rooms r = new rooms();
        r.setRoomCode(code);
        r.setRoomStatus(status);
        r.setRoomTypes(type);
        return roomRepository.save(r);
    }

    private Map<String, Object> detail(rooms room, int guests, String in, String out, String method) {
        return Map.of("roomId", room.getRoomId(), "numberOfGuests", guests,
                "checkIn", in, "checkOut", out, "pricingMethod", method);
    }

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder b) {
        return b.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }

    private String body(Object o) throws Exception {
        return json.writeValueAsString(o);
    }

    private Map<String, Object> createBody(List<Map<String, Object>> details) {
        return Map.of("customerId", customerId, "details", details);
    }

    // ------------------------------------------------------------------ bảo mật

    @Test
    void unauthenticated_returns401() throws Exception {
        mvc.perform(post("/api/rental-receipts").contentType(MediaType.APPLICATION_JSON)
                        .content(body(createBody(List.of()))))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/rental-receipts/available-rooms")).andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------ UC-REN-010

    @Test
    void estimate_computesPerLineAndTotal() throws Exception {
        List<Map<String, Object>> details = List.of(
                detail(standard, 2, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"),   // 2 đêm x 800k
                detail(suite, 3, "2026-12-20T10:00:00", "2026-12-20T13:30:00", "GIO"));      // 4 giờ x 250k
        mvc.perform(authed(post("/api/rental-receipts/estimate")).content(body(Map.of("details", details))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lines[0].billedUnits").value(2))
                .andExpect(jsonPath("$.data.lines[0].unitPrice").value(800000.0))
                .andExpect(jsonPath("$.data.lines[0].amount").value(1600000.0))
                .andExpect(jsonPath("$.data.lines[1].billedUnits").value(4))
                .andExpect(jsonPath("$.data.lines[1].amount").value(1000000.0))
                .andExpect(jsonPath("$.data.totalAmount").value(2600000.0));
    }

    @Test
    void estimate_reportsEveryInvalidLine() throws Exception {
        List<Map<String, Object>> details = List.of(
                detail(standard, 5, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"),   // 5 > 2
                detail(standard, 1, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"),   // trùng phòng
                detail(suite, 1, "2026-12-22T12:00:00", "2026-12-20T14:00:00", "NGAY"),      // trả trước nhận
                detail(maintenance, 1, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"),
                detail(cleaning, 1, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"));
        mvc.perform(authed(post("/api/rental-receipts/estimate")).content(body(Map.of("details", details))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['details[0].numberOfGuests']")
                        .value("Phòng RT101 chỉ cho phép tối đa 2 khách"))
                .andExpect(jsonPath("$.fieldErrors['details[1].roomId']")
                        .value("Phòng RT101 đã có trong danh sách đặt phòng"))
                .andExpect(jsonPath("$.fieldErrors['details[2].checkOut']")
                        .value("Thời gian nhận phòng phải trước thời gian trả phòng"))
                .andExpect(jsonPath("$.fieldErrors['details[3].roomId']").value("Phòng RT103 đang bảo trì"))
                .andExpect(jsonPath("$.fieldErrors['details[4].roomId']").value("Phòng RT104 đang dọn dẹp"));
    }

    @Test
    void estimate_requiresAtLeastOneRoom() throws Exception {
        mvc.perform(authed(post("/api/rental-receipts/estimate")).content(body(Map.of("details", List.of()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.details")
                        .value("Vui lòng chọn ít nhất một phòng để tính chi phí"));
    }

    @Test
    void estimate_rejectsUnknownPricingMethod() throws Exception {
        String bad = "{\"details\":[{\"roomId\":" + standard.getRoomId() + ",\"numberOfGuests\":1,"
                + "\"checkIn\":\"2026-12-20T14:00:00\",\"checkOut\":\"2026-12-21T12:00:00\",\"pricingMethod\":\"TUAN\"}]}";
        mvc.perform(authed(post("/api/rental-receipts/estimate")).content(bad))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------ UC-REN-001

    private JsonNode createOk(List<Map<String, Object>> details) throws Exception {
        MvcResult r = mvc.perform(authed(post("/api/rental-receipts")).content(body(createBody(details))))
                .andExpect(status().isCreated()).andReturn();
        return json.readTree(r.getResponse().getContentAsString()).get("data");
    }

    @Test
    void create_savesReceiptWithServerSideStatusEmployeeAndPrice() throws Exception {
        // Cố tình gửi kèm đơn giá/thành tiền giả: máy chủ phải bỏ qua và tự tính
        Map<String, Object> d1 = new java.util.HashMap<>(
                detail(standard, 2, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"));
        d1.put("unitPrice", 1);
        d1.put("estimatedAmount", 1);
        JsonNode created = createOk(List.of(d1,
                detail(suite, 3, "2026-12-20T10:00:00", "2026-12-20T13:30:00", "GIO")));

        assertTrue(created.get("receiptCode").asText().matches("PT\\d{3,}"), "mã phiếu do hệ thống sinh");
        assertEquals("DA_XAC_NHAN", created.get("receiptStatus").asText());
        assertEquals(adminEmployeeId, created.get("employeeId").asInt());
        assertEquals(customerId, created.get("customer").get("customerId").asInt());
        assertEquals(0, new BigDecimal("2600000").compareTo(created.get("estimatedTotalAmount").decimalValue()));
        assertEquals(2, created.get("details").size());
        for (JsonNode d : created.get("details")) {
            assertEquals("RESERVED", d.get("bookingStatus").asText());
        }
        assertEquals(0, new BigDecimal("800000").compareTo(created.get("details").get(0).get("unitPrice").decimalValue()));

        // Xem lại phiếu vừa tạo
        mvc.perform(authed(get("/api/rental-receipts/" + created.get("rentalReceiptId").asInt())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptCode").value(created.get("receiptCode").asText()))
                .andExpect(jsonPath("$.data.details.length()").value(2));
    }

    @Test
    void create_requiresCustomerAndRoom() throws Exception {
        mvc.perform(authed(post("/api/rental-receipts")).content(body(Map.of("details", List.of(
                        detail(standard, 1, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerId").value("Vui lòng chọn khách hàng"));

        mvc.perform(authed(post("/api/rental-receipts")).content(body(createBody(List.of()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.details").value("Phiếu thuê phải có ít nhất một phòng"));
    }

    @Test
    void create_unknownCustomer_returns404() throws Exception {
        mvc.perform(authed(post("/api/rental-receipts")).content(body(Map.of(
                        "customerId", 999999,
                        "details", List.of(detail(standard, 1, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY"))))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Khách hàng không còn hợp lệ. Vui lòng tìm kiếm và chọn khách hàng khác."));
    }

    @Test
    void create_overlappingRoom_returns409AndAdjacentIsAllowed() throws Exception {
        createOk(List.of(detail(standard, 2, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY")));

        // chồng lấn (BR-REN-001-07)
        mvc.perform(authed(post("/api/rental-receipts")).content(body(createBody(List.of(
                        detail(standard, 1, "2026-12-21T10:00:00", "2026-12-23T10:00:00", "NGAY"))))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("RT101")))
                .andExpect(jsonPath("$.data.unavailableRoomIds[0]").value(standard.getRoomId()));

        // tiếp giáp: nhận đúng lúc phòng trước trả (BR-REN-009-04)
        createOk(List.of(detail(standard, 1, "2026-12-22T12:00:00", "2026-12-23T12:00:00", "NGAY")));
    }

    @Test
    void create_priceChanged_returns409WithNewEstimate() throws Exception {
        Map<String, Object> request = new java.util.HashMap<>(createBody(List.of(
                detail(standard, 2, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY"))));
        request.put("expectedTotalAmount", 1000000);   // người dùng đang xem số tiền cũ
        mvc.perform(authed(post("/api/rental-receipts")).content(body(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.data.totalAmount").value(1600000.0));

        request.put("expectedTotalAmount", 1600000);   // xác nhận giá mới
        mvc.perform(authed(post("/api/rental-receipts")).content(body(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void create_rejectsInvalidRooms() throws Exception {
        mvc.perform(authed(post("/api/rental-receipts")).content(body(createBody(List.of(
                        detail(maintenance, 1, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['details[0].roomId']").value("Phòng RT103 đang bảo trì"));

        mvc.perform(authed(post("/api/rental-receipts")).content(body(createBody(List.of(
                        detail(standard, 3, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['details[0].numberOfGuests']")
                        .value("Phòng RT101 chỉ cho phép tối đa 2 khách"));
    }

    // ------------------------------------------------------------------ UC-REN-009

    @Test
    void availableRooms_excludesBlockedRoomsAndOverlaps() throws Exception {
        createOk(List.of(detail(suite, 2, "2026-12-20T14:00:00", "2026-12-22T12:00:00", "NGAY")));

        // 21/12 -> 23/12: suite bị chồng lấn; bảo trì + dọn dẹp bị loại
        MvcResult r = mvc.perform(authed(get("/api/rental-receipts/available-rooms")
                        .param("checkIn", "2026-12-21T14:00:00").param("checkOut", "2026-12-23T12:00:00")))
                .andExpect(status().isOk()).andReturn();
        List<String> codes = codes(r);
        assertTrue(codes.contains("RT101"));
        assertTrue(!codes.contains("RT102") && !codes.contains("RT103") && !codes.contains("RT104"), codes.toString());

        // tiếp giáp (bắt đầu đúng giờ trả của suite): suite lại khả dụng
        codes = codes(mvc.perform(authed(get("/api/rental-receipts/available-rooms")
                        .param("checkIn", "2026-12-22T12:00:00").param("checkOut", "2026-12-23T12:00:00")))
                .andExpect(status().isOk()).andReturn());
        assertTrue(codes.contains("RT102"), codes.toString());

        // thông tin ô phòng (BR-REN-009-06)
        MvcResult tiles = mvc.perform(authed(get("/api/rental-receipts/available-rooms")
                        .param("checkIn", "2026-12-22T12:00:00").param("checkOut", "2026-12-23T12:00:00")))
                .andExpect(status().isOk()).andReturn();
        JsonNode suiteTile = null;
        for (JsonNode n : json.readTree(tiles.getResponse().getContentAsString()).get("data")) {
            if ("RT102".equals(n.get("roomCode").asText())) suiteTile = n;
        }
        assertTrue(suiteTile != null);
        assertEquals("RT-Suite", suiteTile.get("roomTypeName").asText());
        assertEquals(4, suiteTile.get("maximumOccupancy").asInt());
        assertEquals(2, suiteTile.get("numberOfBeds").asInt());
        assertEquals(suite.getRoomTypes().getRoomTypeId(), suiteTile.get("roomTypeId").asInt());
        assertEquals(0, new BigDecimal("2500000").compareTo(suiteTile.get("dailyRate").decimalValue()));
        assertEquals(0, new BigDecimal("250000").compareTo(suiteTile.get("hourlyRate").decimalValue()));
    }

    @Test
    void availableRooms_validatesTimeRange() throws Exception {
        mvc.perform(authed(get("/api/rental-receipts/available-rooms").param("checkIn", "2026-12-21T14:00:00")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vui lòng nhập thời gian nhận phòng và trả phòng dự kiến."));
        mvc.perform(authed(get("/api/rental-receipts/available-rooms")
                        .param("checkIn", "2026-12-21T14:00:00").param("checkOut", "2026-12-21T14:00:00")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Thời gian nhận phòng phải trước thời gian trả phòng."));
        mvc.perform(authed(get("/api/rental-receipts/available-rooms")
                        .param("checkIn", "khong-phai-ngay").param("checkOut", "2026-12-21T14:00:00")))
                .andExpect(status().isBadRequest());
    }

    private List<String> codes(MvcResult r) throws Exception {
        List<String> codes = new java.util.ArrayList<>();
        for (JsonNode n : json.readTree(r.getResponse().getContentAsString()).get("data")) {
            codes.add(n.get("roomCode").asText());
        }
        return codes;
    }

    @Test
    void list_returnsNewestReceiptsFirstWithDetails() throws Exception {
        createOk(List.of(detail(standard, 1, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY")));
        JsonNode second = createOk(List.of(detail(suite, 2, "2026-12-20T14:00:00", "2026-12-21T12:00:00", "NGAY")));

        MvcResult r = mvc.perform(authed(get("/api/rental-receipts").param("page", "0").param("size", "5")))
                .andExpect(status().isOk()).andReturn();
        JsonNode content = json.readTree(r.getResponse().getContentAsString()).get("data").get("content");
        assertEquals(second.get("rentalReceiptId").asInt(), content.get(0).get("rentalReceiptId").asInt());
        assertEquals("RT102", content.get(0).get("details").get(0).get("roomCode").asText());
        assertEquals(customerId, content.get(0).get("customer").get("customerId").asInt());
    }

    // ------------------------------------------------------------------ UC-REN-008

    @Test
    void customerLookup_findsByIdNameOrPhone() throws Exception {
        mvc.perform(authed(get("/api/customers").param("search", String.valueOf(customerId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.customerId==" + customerId + ")]").exists());
        mvc.perform(authed(get("/api/customers").param("search", "0987000111")))
                .andExpect(jsonPath("$.content[0].fullName").value("Khach Thu Nghiem"));
        mvc.perform(authed(get("/api/customers").param("search", "thu nghiem")))
                .andExpect(jsonPath("$.content[0].customerId").value(customerId));
    }
}
