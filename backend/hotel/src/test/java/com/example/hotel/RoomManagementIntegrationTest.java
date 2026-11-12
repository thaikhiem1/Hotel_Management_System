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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Quản lý phòng: cập nhật và xóa phòng phải kiểm tra trạng thái hiện tại (đang có khách, có lượt đặt sắp tới,
 * luật chuyển trạng thái). Lượt đặt và nhận phòng được tạo bằng API thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RoomManagementIntegrationTest {

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

    String adminToken;   // token của tài khoản quản lý (manager)
    String receptionistToken;
    int customerId;
    room_types typeA, typeB;

    @BeforeEach
    void setUp() throws Exception {
        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);
        accounts manager = accountRepository.findByUsername("manager").orElseThrow();
        manager.setPasswordHash(passwordEncoder.encode("Mgr@12345"));
        accountRepository.saveAndFlush(manager);
        adminToken = login("manager", "Mgr@12345"); // chỉ quản lý được thêm/sửa/xóa phòng; tên biến giữ nguyên

        employees e = new employees();
        e.setFullName("Le Tan Quan Ly Phong");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0977000003");
        e.setCitizenId("079700000003");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("rm_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        accounts a = new accounts();
        a.setUsername("rm_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        receptionistToken = login("rm_rt", "Pass@1234");

        typeA = type("RM-Type-A", "800000", "100000");
        typeB = type("RM-Type-B", "900000", "120000");

        customers c = new customers();
        c.setFullName("Khach Quan Ly Phong");
        c.setPhone("0987000666");
        c.setCitizenId("RM-CCCD-1");
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

    private room_types type(String name, String daily, String hourly) {
        room_types t = new room_types();
        t.setRoomTypeName(name);
        t.setNumberOfBeds(1);
        t.setMaximumOccupancy(2);
        t.setDailyRate(new BigDecimal(daily));
        t.setHourlyRate(new BigDecimal(hourly));
        return roomTypeRepository.save(t);
    }

    private rooms room(String code, RoomStatus status) {
        rooms r = new rooms();
        r.setRoomCode(code);
        r.setRoomStatus(status);
        r.setRoomTypes(typeA);
        return roomRepository.save(r);
    }

    private ResultActions send(MockHttpServletRequestBuilder builder, String bearer, Object body) throws Exception {
        MockHttpServletRequestBuilder b = builder.header("Authorization", "Bearer " + bearer);
        if (body != null) {
            b = b.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        }
        return mvc.perform(b);
    }

    /** Body cập nhật phòng; status null thì không gửi trường room_status */
    private Map<String, Object> update(rooms room, room_types type, String status, String note) {
        Map<String, Object> body = new HashMap<>();
        body.put("room_code", room.getRoomCode());
        body.put("room_type_id", type.getRoomTypeId());
        if (status != null) {
            body.put("room_status", status);
        }
        body.put("note", note);
        return body;
    }

    private ResultActions updateRoom(rooms room, Object body) throws Exception {
        return send(put("/api/rooms/" + room.getRoomId()), adminToken, body);
    }

    /** Tạo phiếu thuê cho phòng (đã đặt, chưa nhận); trả về mã chi tiết đặt phòng */
    private int reserve(rooms room) throws Exception {
        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        Map<String, Object> detail = Map.of("roomId", room.getRoomId(), "numberOfGuests", 1,
                "checkIn", now.minusHours(1).toString(), "checkOut", now.plusHours(3).toString(),
                "pricingMethod", "GIO");
        String res = send(post("/api/rental-receipts"), receptionistToken,
                Map.of("customerId", customerId, "details", List.of(detail)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data").get("details").get(0).get("bookingDetailId").asInt();
    }

    private void checkIn(int detailId) throws Exception {
        send(post("/api/booking-details/" + detailId + "/check-in"), receptionistToken, Map.of("actualGuests", 1))
                .andExpect(status().isOk());
    }

    // ------------------------------------------------------------------ chuyển trạng thái

    @Test
    void availableAndMaintenance_canSwitchBack_andForth() throws Exception {
        rooms r = room("RM101", RoomStatus.AVAILABLE);
        updateRoom(r, update(r, typeA, "UNDER_MAINTENANCE", "Hỏng điều hòa")).andExpect(status().isOk())
                .andExpect(jsonPath("$.room_status").value("UNDER_MAINTENANCE"))
                .andExpect(jsonPath("$.note").value("Hỏng điều hòa"));
        updateRoom(r, update(r, typeA, "AVAILABLE", null)).andExpect(status().isOk())
                .andExpect(jsonPath("$.room_status").value("AVAILABLE"));
    }

    @Test
    void cleaningRoom_canBecomeAvailable_butCleaningCannotBeSetManually() throws Exception {
        rooms cleaning = room("RM102", RoomStatus.CLEANING);
        updateRoom(cleaning, update(cleaning, typeA, "AVAILABLE", null)).andExpect(status().isOk())
                .andExpect(jsonPath("$.room_status").value("AVAILABLE"));

        rooms available = room("RM103", RoomStatus.AVAILABLE);
        updateRoom(available, update(available, typeA, "CLEANING", null)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Phòng RM103 đang ở trạng thái Trống nên không thể chuyển sang Đang dọn dẹp."));
        assertEquals(RoomStatus.AVAILABLE, roomRepository.findById(available.getRoomId()).orElseThrow().getRoomStatus());
    }

    @Test
    void missingStatus_keepsCurrentStatus() throws Exception {
        rooms r = room("RM104", RoomStatus.CLEANING);
        updateRoom(r, update(r, typeA, null, "Chỉ sửa ghi chú")).andExpect(status().isOk())
                .andExpect(jsonPath("$.room_status").value("CLEANING"))
                .andExpect(jsonPath("$.note").value("Chỉ sửa ghi chú"));
    }

    // ------------------------------------------------------------------ phòng đang có khách

    @Test
    void occupiedRoom_cannotBeUpdatedOrDeleted() throws Exception {
        rooms r = room("RM105", RoomStatus.AVAILABLE);
        checkIn(reserve(r));

        updateRoom(r, update(r, typeA, "UNDER_MAINTENANCE", null)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phòng RM105 đang có khách nên không thể cập nhật."));
        updateRoom(r, update(r, typeB, "AVAILABLE", "đổi loại")).andExpect(status().isBadRequest());
        send(delete("/api/rooms/" + r.getRoomId()), adminToken, null).andExpect(status().isConflict());

        rooms stored = roomRepository.findById(r.getRoomId()).orElseThrow();
        assertEquals(RoomStatus.AVAILABLE, stored.getRoomStatus());
        assertEquals(typeA.getRoomTypeId(), stored.getRoomTypes().getRoomTypeId());
    }

    // ------------------------------------------------------------------ phòng có lượt đặt sắp tới

    @Test
    void reservedRoom_allowsNoteChange_butNotMaintenanceOrTypeChange() throws Exception {
        rooms r = room("RM106", RoomStatus.AVAILABLE);
        reserve(r);

        updateRoom(r, update(r, typeA, "AVAILABLE", "Khách VIP")).andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Khách VIP"))
                .andExpect(jsonPath("$.has_upcoming_booking").value(true));
        updateRoom(r, update(r, typeA, "UNDER_MAINTENANCE", null)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Phòng RM106 đang có lượt đặt sắp tới nên không thể chuyển sang Đang sửa chữa."));
        updateRoom(r, update(r, typeB, "AVAILABLE", null)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Phòng RM106 đang có lượt đặt sắp tới nên không thể đổi loại phòng."));
        assertEquals(typeA.getRoomTypeId(), roomRepository.findById(r.getRoomId()).orElseThrow().getRoomTypes().getRoomTypeId());
    }

    // ------------------------------------------------------------------ cờ trạng thái và xóa phòng

    @Test
    void list_flagsRoomsWithActiveStayOrUpcomingBooking() throws Exception {
        rooms occupied = room("RM107", RoomStatus.AVAILABLE);
        rooms reserved = room("RM108", RoomStatus.AVAILABLE);
        rooms idle = room("RM109", RoomStatus.AVAILABLE);
        checkIn(reserve(occupied));
        reserve(reserved);

        String body = send(get("/api/rooms"), adminToken, null).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        for (com.fasterxml.jackson.databind.JsonNode n : json.readTree(body)) {
            switch (n.get("room_code").asText()) {
                case "RM107" -> {
                    assertEquals(true, n.get("has_active_stay").asBoolean());
                    assertEquals(false, n.get("has_upcoming_booking").asBoolean());
                }
                case "RM108" -> {
                    assertEquals(false, n.get("has_active_stay").asBoolean());
                    assertEquals(true, n.get("has_upcoming_booking").asBoolean());
                }
                case "RM109" -> {
                    assertEquals(false, n.get("has_active_stay").asBoolean());
                    assertEquals(false, n.get("has_upcoming_booking").asBoolean());
                }
                default -> { }
            }
        }
        assertEquals(RoomStatus.AVAILABLE, idle.getRoomStatus());
    }

    @Test
    void delete_roomWithoutHistoryWorks_roomWithHistoryIsRejected() throws Exception {
        rooms clean = room("RM110", RoomStatus.AVAILABLE);
        send(delete("/api/rooms/" + clean.getRoomId()), adminToken, null).andExpect(status().isNoContent());

        rooms used = room("RM111", RoomStatus.AVAILABLE);
        reserve(used);
        send(delete("/api/rooms/" + used.getRoomId()), adminToken, null).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Phòng RM111 đã có lịch sử đặt phòng nên không thể xóa. Hãy chuyển phòng sang đang sửa chữa nếu không còn sử dụng."));

        send(put("/api/rooms/987654"), adminToken, update(used, typeA, "AVAILABLE", null)).andExpect(status().isNotFound());
    }
}
