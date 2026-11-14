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
import com.example.hotel.models.entities.rental_receipts;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UC-REN-002: hủy chi tiết đặt phòng. Phiếu thuê và nhận phòng được tạo bằng API thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CancelBookingDetailIntegrationTest {

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

    String token;
    String adminToken;
    int customerId;
    int receptionistEmployeeId;
    rooms room1, room2, room3;

    @BeforeEach
    void setUp() throws Exception {
        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);
        adminToken = login(adminUser, adminPass);

        employees e = new employees();
        e.setFullName("Le Tan Huy Phong");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0977000005");
        e.setCitizenId("079700000005");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("hp_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        receptionistEmployeeId = e.getEmployeeId();
        accounts a = new accounts();
        a.setUsername("hp_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        token = login("hp_rt", "Pass@1234");

        room_types type = new room_types();
        type.setRoomTypeName("HP-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("HP101", type);
        room2 = room("HP102", type);
        room3 = room("HP103", type);

        customers c = new customers();
        c.setFullName("Khach Huy Phong");
        c.setPhone("0987000999");
        c.setCitizenId("HP-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();
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

    /** Phiếu thuê theo giờ (nhận 1 giờ trước, trả 3 giờ sau) cho các phòng; trả về { mã phiếu, mã các chi tiết } */
    private int[] createReceipt(rooms... roomList) throws Exception {
        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        List<Map<String, Object>> details = new ArrayList<>();
        for (rooms r : roomList) {
            details.add(Map.of("roomId", r.getRoomId(), "numberOfGuests", 1,
                    "checkIn", now.minusHours(1).toString(), "checkOut", now.plusHours(3).toString(),
                    "pricingMethod", "GIO"));
        }
        String res = send(post("/api/rental-receipts"), token, Map.of("customerId", customerId, "details", details))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode data = json.readTree(res).get("data");
        int[] ids = new int[roomList.length + 1];
        ids[0] = data.get("rentalReceiptId").asInt();
        for (int i = 0; i < roomList.length; i++) {
            ids[i + 1] = data.get("details").get(i).get("bookingDetailId").asInt();
        }
        return ids;
    }

    private ResultActions cancel(int receiptId, int detailId, String reason) throws Exception {
        return send(post("/api/rental-receipts/" + receiptId + "/details/" + detailId + "/cancel"), token,
                reason == null ? Map.of() : Map.of("reason", reason));
    }

    private booking_details detail(int id) {
        return bookingDetailRepository.findById(id).orElseThrow();
    }

    private rental_receipts receipt(int id) {
        return rentalReceiptRepository.findById(id).orElseThrow();
    }

    // ------------------------------------------------------------------ hủy một trong nhiều phòng

    @Test
    void cancelOneOfTwo_recordsHistory_recalculatesTotal_andKeepsReceiptConfirmed() throws Exception {
        int[] ids = createReceipt(room1, room2);   // mỗi phòng 100000 (1 giờ tối thiểu... 4 giờ x 100000)
        BigDecimal perRoom = detail(ids[1]).getEstimatedAmount();

        cancel(ids[0], ids[1], "  Khách đổi lịch  ").andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hủy phòng thành công"))
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_XAC_NHAN"))
                .andExpect(jsonPath("$.data.details[0].bookingStatus").value("CANCELLED"))
                .andExpect(jsonPath("$.data.details[0].cancelReason").value("Khách đổi lịch"))
                .andExpect(jsonPath("$.data.details[0].cancelledBy").value("Le Tan Huy Phong"))
                .andExpect(jsonPath("$.data.details[0].cancelledAt").exists())
                .andExpect(jsonPath("$.data.details[1].bookingStatus").value("RESERVED"))
                .andExpect(jsonPath("$.data.estimatedTotalAmount").value(perRoom.intValue()));

        booking_details d = detail(ids[1]);
        assertEquals(BookingStatus.CANCELLED, d.getBookingStatus());
        assertNotNull(d.getCancelledAt());
        assertEquals(receptionistEmployeeId, d.getCancelledBy().getEmployeeId());
        assertEquals(ReceiptStatus.DA_XAC_NHAN, receipt(ids[0]).getReceiptStatus());
        assertNull(receipt(ids[0]).getCancelledAt());
        // giá đã chốt của phòng còn lại không đổi
        assertEquals(0, perRoom.compareTo(detail(ids[2]).getEstimatedAmount()));
    }

    @Test
    void cancelledRoom_canBeBookedAgainForTheSamePeriod() throws Exception {
        int[] ids = createReceipt(room1, room2);
        cancel(ids[0], ids[1], "Khách đổi lịch").andExpect(status().isOk());
        createReceipt(room1);   // cùng phòng, cùng khoảng thời gian: giờ đã được giải phóng
    }

    @Test
    void cancelWhileAnotherRoomIsStaying_keepsReceiptInProgress() throws Exception {
        int[] ids = createReceipt(room1, room2);
        send(post("/api/booking-details/" + ids[1] + "/check-in"), token, Map.of("actualGuests", 1)).andExpect(status().isOk());

        cancel(ids[0], ids[2], "Phòng thứ hai không thuê nữa").andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptStatus").value("DANG_LUU_TRU"));
        assertEquals(ReceiptStatus.DANG_LUU_TRU, receipt(ids[0]).getReceiptStatus());
    }

    // ------------------------------------------------------------------ hủy chi tiết cuối cùng

    @Test
    void cancelLastRemainingDetail_cancelsTheWholeReceipt() throws Exception {
        int[] ids = createReceipt(room1, room2);
        cancel(ids[0], ids[1], "Lý do 1").andExpect(status().isOk());
        cancel(ids[0], ids[2], "Lý do cuối").andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Phiếu thuê đã được hủy do không còn phòng nào"))
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_HUY"))
                .andExpect(jsonPath("$.data.cancelReason").value("Lý do cuối"))
                .andExpect(jsonPath("$.data.cancelledAt").exists())
                .andExpect(jsonPath("$.data.estimatedTotalAmount").value(0));

        rental_receipts r = receipt(ids[0]);
        assertEquals(ReceiptStatus.DA_HUY, r.getReceiptStatus());
        assertNotNull(r.getCancelledAt());
        assertEquals(receptionistEmployeeId, r.getCancelledBy().getEmployeeId());
    }

    // ------------------------------------------------------------------ không hợp lệ

    @Test
    void cannotCancelStayingOrAlreadyCancelledDetail() throws Exception {
        int[] ids = createReceipt(room1, room2);
        send(post("/api/booking-details/" + ids[1] + "/check-in"), token, Map.of("actualGuests", 1)).andExpect(status().isOk());

        cancel(ids[0], ids[1], "Đang ở mà hủy").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý."));
        assertEquals(BookingStatus.CHECKED_IN, detail(ids[1]).getBookingStatus());

        cancel(ids[0], ids[2], "Lần một").andExpect(status().isOk());
        cancel(ids[0], ids[2], "Lần hai").andExpect(status().isBadRequest());
        assertEquals("Lần một", detail(ids[2]).getCancelReason());
    }

    @Test
    void reasonIsRequired_andLimitedTo255Characters() throws Exception {
        int[] ids = createReceipt(room1, room2);
        cancel(ids[0], ids[1], null).andExpect(status().isBadRequest());
        cancel(ids[0], ids[1], "   ").andExpect(status().isBadRequest());
        cancel(ids[0], ids[1], "x".repeat(256)).andExpect(status().isBadRequest());
        assertEquals(BookingStatus.RESERVED, detail(ids[1]).getBookingStatus());
        cancel(ids[0], ids[1], "x".repeat(255)).andExpect(status().isOk());
    }

    @Test
    void unknownReceiptOrDetail_orDetailOfAnotherReceipt_isNotFound() throws Exception {
        int[] first = createReceipt(room1);
        int[] second = createReceipt(room2);
        cancel(first[0], 987654, "Lý do").andExpect(status().isNotFound());
        cancel(987654, first[1], "Lý do").andExpect(status().isNotFound());
        cancel(first[0], second[1], "Lý do").andExpect(status().isNotFound());
        assertEquals(BookingStatus.RESERVED, detail(second[1]).getBookingStatus());
    }

    // ------------------------------------------------------------------ UC-REN-003: hủy toàn bộ phiếu

    private ResultActions cancelReceipt(int receiptId, String reason) throws Exception {
        return send(post("/api/rental-receipts/" + receiptId + "/cancel"), token,
                reason == null ? Map.of() : Map.of("reason", reason));
    }

    @Test
    void cancelWholeReceipt_cancelsEveryReservedRoom_zeroesTotal_andReleasesRooms() throws Exception {
        int[] ids = createReceipt(room1, room2);

        cancelReceipt(ids[0], "  Khách hủy chuyến đi  ").andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hủy phiếu thuê thành công"))
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_HUY"))
                .andExpect(jsonPath("$.data.cancelReason").value("Khách hủy chuyến đi"))
                .andExpect(jsonPath("$.data.cancelledAt").exists())
                .andExpect(jsonPath("$.data.estimatedTotalAmount").value(0))
                .andExpect(jsonPath("$.data.details[0].bookingStatus").value("CANCELLED"))
                .andExpect(jsonPath("$.data.details[1].bookingStatus").value("CANCELLED"))
                .andExpect(jsonPath("$.data.details[1].cancelReason").value("Khách hủy chuyến đi"));

        rental_receipts r = receipt(ids[0]);
        assertEquals(ReceiptStatus.DA_HUY, r.getReceiptStatus());
        assertEquals(receptionistEmployeeId, r.getCancelledBy().getEmployeeId());
        assertEquals(BookingStatus.CANCELLED, detail(ids[1]).getBookingStatus());
        assertEquals(BookingStatus.CANCELLED, detail(ids[2]).getBookingStatus());
        createReceipt(room1, room2);   // cả hai phòng đã được giải phóng
    }

    @Test
    void cancelWholeReceipt_keepsEarlierRoomCancellationHistory() throws Exception {
        int[] ids = createReceipt(room1, room2);
        cancel(ids[0], ids[1], "Hủy phòng trước").andExpect(status().isOk());

        cancelReceipt(ids[0], "Hủy cả phiếu").andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_HUY"));
        assertEquals("Hủy phòng trước", detail(ids[1]).getCancelReason());
        assertEquals("Hủy cả phiếu", detail(ids[2]).getCancelReason());
    }

    @Test
    void cancelWholeReceipt_isRejectedOnceAnyRoomHasStarted_andChangesNothing() throws Exception {
        int[] ids = createReceipt(room1, room2);
        send(post("/api/booking-details/" + ids[1] + "/check-in"), token, Map.of("actualGuests", 1)).andExpect(status().isOk());

        cancelReceipt(ids[0], "Không được hủy").andExpect(status().isBadRequest());
        assertEquals(BookingStatus.CHECKED_IN, detail(ids[1]).getBookingStatus());
        assertEquals(BookingStatus.RESERVED, detail(ids[2]).getBookingStatus());
        assertEquals(ReceiptStatus.DANG_LUU_TRU, receipt(ids[0]).getReceiptStatus());
    }

    @Test
    void cancelWholeReceipt_secondTimeAndInvalidInput_areRejected() throws Exception {
        int[] ids = createReceipt(room1);
        cancelReceipt(ids[0], null).andExpect(status().isBadRequest());
        cancelReceipt(ids[0], "   ").andExpect(status().isBadRequest());
        cancelReceipt(ids[0], "x".repeat(256)).andExpect(status().isBadRequest());
        assertEquals(ReceiptStatus.DA_XAC_NHAN, receipt(ids[0]).getReceiptStatus());

        cancelReceipt(ids[0], "Lần một").andExpect(status().isOk());
        cancelReceipt(ids[0], "Lần hai").andExpect(status().isBadRequest());
        assertEquals("Lần một", receipt(ids[0]).getCancelReason());
        cancelReceipt(987654, "Không tồn tại").andExpect(status().isNotFound());
    }

    @Test
    void cancelWholeReceipt_adminForbidden() throws Exception {
        int[] ids = createReceipt(room1);
        send(post("/api/rental-receipts/" + ids[0] + "/cancel"), adminToken, Map.of("reason", "Chỉ được xem")).andExpect(status().isForbidden());
        assertEquals(ReceiptStatus.DA_XAC_NHAN, receipt(ids[0]).getReceiptStatus());
    }

    // ------------------------------------------------------------------ phân quyền

    @Test
    void adminCannotCancel_andNoTokenIsRejected() throws Exception {
        int[] ids = createReceipt(room1, room2);
        String path = "/api/rental-receipts/" + ids[0] + "/details/" + ids[1] + "/cancel";
        mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"x\"}"))
                .andExpect(status().isUnauthorized());
        send(post(path), adminToken, Map.of("reason", "Quản trị viên chỉ được xem")).andExpect(status().isForbidden());
        assertEquals(BookingStatus.RESERVED, detail(ids[1]).getBookingStatus());
    }
}
