package com.example.hotel;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
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
 * UC-REN-004: nhận phòng. Phiếu thuê được tạo bằng API thật (giờ nhận phòng dự kiến trong quá khứ để đủ điều kiện),
 * giờ nhận phòng thực tế do máy chủ xác định.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StayCheckInIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired BookingDetailRepository bookingDetailRepository;
    @Autowired RentalReceiptRepository rentalReceiptRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    static final String INVALID = "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.";

    String token;

    /** Tài khoản admin có thể do migration seed tạo với mật khẩu khác cấu hình: đặt lại trong giao dịch test (được rollback) */
    private void resetAdminPassword() {
        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);
    }
    int customerId;
    LocalDateTime now;
    rooms room1, room2;

    @BeforeEach
    void setUp() throws Exception {
        resetAdminPassword();
        now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);

        employees e = new employees();
        e.setFullName("Le Tan Test");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0944000001");
        e.setCitizenId("079400000001");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("stay_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        accounts a = new accounts();
        a.setUsername("stay_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        token = login("stay_rt", "Pass@1234");

        room_types type = new room_types();
        type.setRoomTypeName("ST-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("ST101", type);
        room2 = room("ST102", type);

        customers c = new customers();
        c.setFullName("Khach Nhan Phong");
        c.setPhone("0987000222");
        c.setCitizenId("ST-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();
    }

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

    /** Tạo phiếu thuê bằng API, trả về { receiptId, detailIds } */
    private JsonNode createReceipt(List<rooms> roomList, LocalDateTime in, LocalDateTime out) throws Exception {
        List<Map<String, Object>> details = roomList.stream().map(r -> Map.<String, Object>of(
                "roomId", r.getRoomId(), "numberOfGuests", 1,
                "checkIn", in.toString(), "checkOut", out.toString(), "pricingMethod", "GIO")).toList();
        String res = mvc.perform(post("/api/rental-receipts").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("customerId", customerId, "details", details))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data");
    }

    private ResultActions context(int detailId) throws Exception {
        return mvc.perform(get("/api/booking-details/" + detailId + "/check-in")
                .header("Authorization", "Bearer " + token));
    }

    private ResultActions checkIn(int detailId, Object guests) throws Exception {
        Map<String, Object> body = guests == null ? Map.of() : Map.of("actualGuests", guests);
        return mvc.perform(post("/api/booking-details/" + detailId + "/check-in")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)));
    }

    private int detailId(JsonNode receipt, int index) {
        return receipt.get("details").get(index).get("bookingDetailId").asInt();
    }

    // ------------------------------------------------------------------ bảo mật

    @Test
    void checkIn_requiresReceptionistLogin() throws Exception {
        JsonNode r = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(3));
        int id = detailId(r, 0);

        mvc.perform(get("/api/booking-details/" + id + "/check-in")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/booking-details/" + id + "/check-in").contentType(MediaType.APPLICATION_JSON)
                .content("{\"actualGuests\":1}")).andExpect(status().isUnauthorized());

        // ADMIN không phải actor của chức năng này
        String adminToken = login(adminUser, adminPass);
        mvc.perform(get("/api/booking-details/" + id + "/check-in").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/booking-details/" + id + "/check-in").header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"actualGuests\":1}"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------ luồng chính

    @Test
    void checkIn_success_recordsActualTimeGuestsAndUpdatesReceipt() throws Exception {
        JsonNode r = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(3));
        int id = detailId(r, 0);

        context(id).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roomCode").value("ST101"))
                .andExpect(jsonPath("$.data.maximumOccupancy").value(2))
                .andExpect(jsonPath("$.data.customerName").value("Khach Nhan Phong"));

        JsonNode d = json.readTree(checkIn(id, 2).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data");
        assertEquals("CHECKED_IN", d.get("bookingStatus").asText());
        assertEquals("DANG_LUU_TRU", d.get("receiptStatus").asText());
        assertEquals(2, d.get("actualGuests").asInt());
        LocalDateTime actual = LocalDateTime.parse(d.get("actualCheckIn").asText());
        assertTrue(!actual.isBefore(now) && !actual.isAfter(now.plusMinutes(5)), "Giờ nhận phòng do máy chủ xác định: " + actual);

        booking_details saved = bookingDetailRepository.findById(id).orElseThrow();
        assertEquals(BookingStatus.CHECKED_IN, saved.getBookingStatus());
        assertEquals(2, saved.getActualNumberOfGuests());
        assertNotNull(saved.getActualCheckInAt());
        assertEquals(ReceiptStatus.DANG_LUU_TRU,
                rentalReceiptRepository.findById(r.get("rentalReceiptId").asInt()).orElseThrow().getReceiptStatus());
    }

    @Test
    void checkIn_oneRoom_leavesTheOtherRoomOfTheReceiptReserved() throws Exception {
        JsonNode r = createReceipt(List.of(room1, room2), now.minusHours(1), now.plusHours(3));

        checkIn(detailId(r, 0), 1).andExpect(status().isOk());

        assertEquals(BookingStatus.RESERVED,
                bookingDetailRepository.findById(detailId(r, 1)).orElseThrow().getBookingStatus());
        assertEquals(ReceiptStatus.DANG_LUU_TRU,
                rentalReceiptRepository.findById(r.get("rentalReceiptId").asInt()).orElseThrow().getReceiptStatus());
    }

    // ------------------------------------------------------------------ luồng ngoại lệ

    @Test
    void checkIn_unknownOrAlreadyCheckedIn_isRejected() throws Exception {
        context(999999).andExpect(status().isNotFound());
        checkIn(999999, 1).andExpect(status().isNotFound());

        JsonNode r = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(3));
        int id = detailId(r, 0);
        checkIn(id, 1).andExpect(status().isOk());

        // E1: đã nhận phòng rồi nên không còn ở trạng thái RESERVED
        checkIn(id, 1).andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value(INVALID));
        context(id).andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value(INVALID));
    }

    @Test
    void checkIn_beforeExpectedTime_isRejected() throws Exception {
        JsonNode r = createReceipt(List.of(room1), now.plusDays(2), now.plusDays(3));
        int id = detailId(r, 0);

        // E2
        context(id).andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Chưa đến thời gian nhận phòng."));
        checkIn(id, 1).andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Chưa đến thời gian nhận phòng."));
        assertEquals(BookingStatus.RESERVED, bookingDetailRepository.findById(id).orElseThrow().getBookingStatus());
    }

    @Test
    void checkIn_invalidGuestCount_isRejected() throws Exception {
        JsonNode r = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(3));
        int id = detailId(r, 0);

        // E3: vượt sức chứa tối đa của phòng (2)
        checkIn(id, 3).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phòng ST101 chỉ cho phép tối đa 2 khách."))
                .andExpect(jsonPath("$.fieldErrors.actualGuests").exists());
        // E3: nhỏ hơn hoặc bằng 0, hoặc không nhập
        checkIn(id, 0).andExpect(status().isBadRequest());
        checkIn(id, -1).andExpect(status().isBadRequest());
        checkIn(id, null).andExpect(status().isBadRequest());

        assertEquals(BookingStatus.RESERVED, bookingDetailRepository.findById(id).orElseThrow().getBookingStatus());
    }

    @Test
    void checkIn_roomNotReady_isRejected() throws Exception {
        JsonNode r = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(3));
        int id = detailId(r, 0);

        // E4: phòng đang dọn dẹp hoặc bảo trì
        room1.setRoomStatus(RoomStatus.CLEANING);
        roomRepository.saveAndFlush(room1);
        checkIn(id, 1).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phòng ST101 đang dọn dẹp nên không thể tiếp nhận khách."));

        room1.setRoomStatus(RoomStatus.UNDER_MAINTENANCE);
        roomRepository.saveAndFlush(room1);
        context(id).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phòng ST101 đang bảo trì nên không thể tiếp nhận khách."));
    }

    @Test
    void checkIn_roomStillOccupiedByAnotherStay_isRejected() throws Exception {
        // Lượt A đã quá giờ trả dự kiến nhưng khách chưa trả phòng, lượt B bắt đầu liền sau đó
        JsonNode a = createReceipt(List.of(room1), now.minusHours(3), now.minusHours(1));
        JsonNode b = createReceipt(List.of(room1), now.minusHours(1), now.plusHours(5));
        checkIn(detailId(a, 0), 1).andExpect(status().isOk());

        // E4: phòng đang có lượt lưu trú khác
        checkIn(detailId(b, 0), 1).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phòng ST101 đang có lượt lưu trú khác."));
        assertEquals(BookingStatus.RESERVED, bookingDetailRepository.findById(detailId(b, 0)).orElseThrow().getBookingStatus());
    }
}
