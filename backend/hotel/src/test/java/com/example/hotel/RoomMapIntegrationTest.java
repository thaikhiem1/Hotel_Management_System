package com.example.hotel;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.PricingMethod;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.services.impl.RentalPricing;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UC-ROM-005 / UC-ROM-006: sơ đồ phòng có phân trang, trạng thái hiển thị và bộ lọc.
 * Dùng cửa sổ thời gian cố định năm 2030 để kết quả không phụ thuộc giờ chạy test.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RoomMapIntegrationTest {

    // Cửa sổ xem: 10/01/2030 00:00 -> 20/01/2030 00:00
    static final String FROM = "2030-01-10T00:00:00";
    static final String TO = "2030-01-20T00:00:00";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired RentalReceiptRepository rentalReceiptRepository;

    @PersistenceContext EntityManager em;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;
    employees employee;
    room_types type;
    customers alice;
    customers bob;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", adminUser, "password", adminPass))))
                .andExpect(status().isOk()).andReturn();
        JsonNode data = json.readTree(login.getResponse().getContentAsString()).get("data");
        token = data.get("accessToken").asText();
        employee = employeeRepository.findById(data.get("user").get("employee").get("employeeId").asInt()).orElseThrow();

        room_types t = new room_types();
        t.setRoomTypeName("MAP-Type");
        t.setNumberOfBeds(1);
        t.setMaximumOccupancy(2);
        t.setDailyRate(new BigDecimal("800000"));
        t.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(t);

        alice = customer("Alice Nguyen", "0988000001", "MAP-CCCD-1");
        bob = customer("Bob Tran", "0988000002", "MAP-CCCD-2");
    }

    // ------------------------------------------------------------------ dữ liệu

    private customers customer(String name, String phone, String citizenId) {
        customers c = new customers();
        c.setFullName(name);
        c.setPhone(phone);
        c.setCitizenId(citizenId);
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        return customerRepository.save(c);
    }

    private rooms room(String code, RoomStatus status) {
        rooms r = new rooms();
        r.setRoomCode(code);
        r.setRoomStatus(status);
        r.setRoomTypes(type);
        return roomRepository.save(r);
    }

    /** Trigger DB không cho đặt phòng đang bảo trì/dọn dẹp, nên đổi trạng thái phòng SAU khi đã có lượt đặt */
    private rooms setStatus(rooms room, RoomStatus status) {
        room.setRoomStatus(status);
        return roomRepository.saveAndFlush(room);
    }

    /** Mỗi lượt đặt nằm trong một phiếu riêng; CHECKED_IN có đủ thông tin thực tế theo ràng buộc DB */
    private booking_details book(rooms room, customers customer, BookingStatus status,
                                 String checkIn, String checkOut) {
        LocalDateTime in = LocalDateTime.parse(checkIn);
        LocalDateTime out = LocalDateTime.parse(checkOut);
        rental_receipts receipt = new rental_receipts();
        receipt.setCustomer(customer);
        receipt.setEmployee(employee);
        receipt.setRentalDate(LocalDateTime.now());

        booking_details d = new booking_details();
        d.setRoom(room);
        d.setNumberOfGuests(1);
        d.setCheckInAt(in);
        d.setCheckOutAt(out);
        d.setPricingMethod(PricingMethod.NGAY);
        d.setUnitPrice(type.getDailyRate());
        int units = RentalPricing.billedUnits(PricingMethod.NGAY, in, out);
        d.setEstimatedUnits(units);
        d.setEstimatedAmount(RentalPricing.amount(type.getDailyRate(), units));
        d.setBookingStatus(status);
        switch (status) {
            case CHECKED_IN -> {
                d.setActualCheckInAt(in);
                d.setActualNumberOfGuests(1);
            }
            case CHECKED_OUT -> {
                d.setActualCheckInAt(in);
                d.setActualNumberOfGuests(1);
                d.setActualCheckOutAt(out);
            }
            case CANCELLED -> {
                d.setCancelledAt(LocalDateTime.now());
            }
            default -> { }
        }
        receipt.addBookingDetail(d);
        rentalReceiptRepository.saveAndFlush(receipt);
        em.refresh(receipt); // đọc lại mã phiếu do DB sinh
        return d;
    }

    // ------------------------------------------------------------------ gọi API

    private MockHttpServletRequestBuilder map(String... kv) {
        MockHttpServletRequestBuilder b = get("/api/room-map").header("Authorization", "Bearer " + token);
        for (int i = 0; i < kv.length; i += 2) {
            b.param(kv[i], kv[i + 1]);
        }
        return b;
    }

    private JsonNode call(String... kv) throws Exception {
        MvcResult r = mvc.perform(map(kv)).andExpect(status().isOk()).andReturn();
        return json.readTree(r.getResponse().getContentAsString()).get("data");
    }

    private JsonNode item(JsonNode data, String code) {
        for (JsonNode n : data.get("rooms").get("content")) {
            if (code.equals(n.get("roomCode").asText())) {
                return n;
            }
        }
        return null;
    }

    private List<String> codes(JsonNode data, String prefix) {
        List<String> list = new ArrayList<>();
        for (JsonNode n : data.get("rooms").get("content")) {
            String c = n.get("roomCode").asText();
            if (c.startsWith(prefix)) {
                list.add(c);
            }
        }
        return list;
    }

    // ------------------------------------------------------------------ UC-ROM-005

    @Test
    void unauthenticated_returns401WithUseCaseMessage() throws Exception {
        mvc.perform(get("/api/room-map"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."));
    }

    @Test
    void defaultWindow_isFromNowToEndOfTodayAndPagingIsZeroBySixteen() throws Exception {
        for (int i = 1; i <= 18; i++) {
            room(String.format("MP%02d", i), RoomStatus.AVAILABLE);
        }
        JsonNode data = call();
        LocalDateTime from = LocalDateTime.parse(data.get("windowFrom").asText());
        LocalDateTime to = LocalDateTime.parse(data.get("windowTo").asText());
        assertTrue(to.equals(from.toLocalDate().plusDays(1).atStartOfDay()), "kết thúc là hết ngày hiện tại");
        assertEquals(0, data.get("rooms").get("number").asInt());
        assertEquals(16, data.get("rooms").get("size").asInt());
        assertTrue(data.get("rooms").get("content").size() <= 16);
        assertTrue(data.get("rooms").get("totalElements").asInt() >= 18);
        assertTrue(data.get("rooms").get("totalPages").asInt() >= 2);
    }

    @Test
    void paging_secondPageContinuesWithoutRepeatingRooms() throws Exception {
        for (int i = 1; i <= 18; i++) {
            room(String.format("MQ%02d", i), RoomStatus.AVAILABLE);
        }
        List<String> seen = new ArrayList<>();
        int totalPages = call("size", "5").get("rooms").get("totalPages").asInt();
        for (int p = 0; p < totalPages; p++) {
            JsonNode data = call("size", "5", "page", String.valueOf(p));
            for (JsonNode n : data.get("rooms").get("content")) {
                seen.add(n.get("roomCode").asText());
            }
        }
        assertEquals(seen.size(), seen.stream().distinct().count(), "mỗi phòng chỉ xuất hiện một lần");
        assertEquals(call().get("statusCounts").get("ALL").asInt(), seen.size());
        // thứ tự do cơ sở dữ liệu quyết định (collation), chỉ kiểm tra trên các phòng của test này
        List<String> mine = seen.stream().filter(c -> c.startsWith("MQ")).toList();
        List<String> sortedMine = new ArrayList<>(mine);
        sortedMine.sort(String::compareTo);
        assertEquals(sortedMine, mine, "sắp xếp theo mã phòng");
    }

    @Test
    void displayStatus_followsThePriorityOrder() throws Exception {
        rooms maintenance = room("ST-M", RoomStatus.AVAILABLE);
        rooms cleaning = room("ST-C", RoomStatus.AVAILABLE);
        rooms occupied = room("ST-O", RoomStatus.AVAILABLE);
        rooms occupiedWithFuture = room("ST-OF", RoomStatus.AVAILABLE);
        rooms reserved = room("ST-R", RoomStatus.AVAILABLE);
        rooms free = room("ST-A", RoomStatus.AVAILABLE);

        book(maintenance, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        book(cleaning, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        book(occupied, alice, BookingStatus.CHECKED_IN, "2030-01-09T14:00:00", "2030-01-11T12:00:00");
        book(occupiedWithFuture, alice, BookingStatus.CHECKED_IN, "2030-01-09T14:00:00", "2030-01-11T12:00:00");
        book(occupiedWithFuture, bob, BookingStatus.RESERVED, "2030-01-15T14:00:00", "2030-01-16T12:00:00");
        book(reserved, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        setStatus(maintenance, RoomStatus.UNDER_MAINTENANCE);
        setStatus(cleaning, RoomStatus.CLEANING);

        JsonNode data = call("from", FROM, "to", TO, "size", "100");
        assertEquals("MAINTENANCE", item(data, "ST-M").get("displayStatus").asText());
        assertEquals("CLEANING", item(data, "ST-C").get("displayStatus").asText());
        assertEquals("OCCUPIED", item(data, "ST-O").get("displayStatus").asText());
        // đang có khách thì ưu tiên hiển thị đang có khách dù có đặt phòng tương lai
        JsonNode of = item(data, "ST-OF");
        assertEquals("OCCUPIED", of.get("displayStatus").asText());
        assertEquals("CHECKED_IN", of.get("booking").get("bookingStatus").asText());
        assertEquals(1, of.get("reservationCount").asInt());
        assertEquals("RESERVED", item(data, "ST-R").get("displayStatus").asText());
        assertEquals("AVAILABLE", item(data, "ST-A").get("displayStatus").asText());
        assertEquals("UNDER_MAINTENANCE", item(data, "ST-M").get("operationalStatus").asText());
        // phòng bảo trì chỉ hiển thị thông tin phòng, không kèm lượt đặt
        assertTrue(item(data, "ST-M").get("booking").isNull());
    }

    @Test
    void window_onlyIntersectingReservationsCount_adjacentAndCancelledAndCheckedOutDoNot() throws Exception {
        rooms before = room("WN-BEFORE", RoomStatus.AVAILABLE);
        rooms touchingStart = room("WN-TOUCH-START", RoomStatus.AVAILABLE);
        rooms touchingEnd = room("WN-TOUCH-END", RoomStatus.AVAILABLE);
        rooms inside = room("WN-INSIDE", RoomStatus.AVAILABLE);
        rooms cancelled = room("WN-CANCELLED", RoomStatus.AVAILABLE);
        rooms checkedOut = room("WN-CHECKEDOUT", RoomStatus.AVAILABLE);

        book(before, alice, BookingStatus.RESERVED, "2030-01-01T14:00:00", "2030-01-05T12:00:00");
        book(touchingStart, alice, BookingStatus.RESERVED, "2030-01-08T14:00:00", "2030-01-10T00:00:00");
        book(touchingEnd, alice, BookingStatus.RESERVED, "2030-01-20T00:00:00", "2030-01-21T12:00:00");
        book(inside, alice, BookingStatus.RESERVED, "2030-01-19T14:00:00", "2030-01-21T12:00:00");
        book(cancelled, alice, BookingStatus.CANCELLED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        book(checkedOut, alice, BookingStatus.CHECKED_OUT, "2030-01-12T14:00:00", "2030-01-13T12:00:00");

        JsonNode data = call("from", FROM, "to", TO, "size", "100");
        assertEquals("AVAILABLE", item(data, "WN-BEFORE").get("displayStatus").asText());
        assertEquals("AVAILABLE", item(data, "WN-TOUCH-START").get("displayStatus").asText());
        assertEquals("AVAILABLE", item(data, "WN-TOUCH-END").get("displayStatus").asText());
        assertEquals("RESERVED", item(data, "WN-INSIDE").get("displayStatus").asText());
        assertEquals("AVAILABLE", item(data, "WN-CANCELLED").get("displayStatus").asText());
        assertEquals("AVAILABLE", item(data, "WN-CHECKEDOUT").get("displayStatus").asText());
    }

    @Test
    void roomWithSeveralReservations_appearsOnceWithNearestAsSummary() throws Exception {
        rooms r = room("MULTI-1", RoomStatus.AVAILABLE);
        book(r, bob, BookingStatus.RESERVED, "2030-01-16T14:00:00", "2030-01-17T12:00:00");
        book(r, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");

        JsonNode data = call("from", FROM, "to", TO, "size", "100");
        assertEquals(1, codes(data, "MULTI-").size());
        JsonNode it = item(data, "MULTI-1");
        assertEquals(2, it.get("reservationCount").asInt());
        assertEquals("Alice Nguyen", it.get("booking").get("customerName").asText());
        assertTrue(it.get("booking").get("receiptCode").asText().startsWith("PT"));
    }

    @Test
    void canCheckIn_onlyWhenReservationHasReachedItsCheckInTime() throws Exception {
        rooms due = room("CI-DUE", RoomStatus.AVAILABLE);
        rooms later = room("CI-LATER", RoomStatus.AVAILABLE);
        // cửa sổ trong quá khứ xa; lượt đặt đã đến giờ so với "bây giờ"
        book(due, alice, BookingStatus.RESERVED, "2020-03-01T14:00:00", "2020-03-02T12:00:00");
        book(later, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");

        JsonNode pastWindow = call("from", "2020-02-28T00:00:00", "to", "2020-03-05T00:00:00", "size", "100");
        assertTrue(item(pastWindow, "CI-DUE").get("canCheckIn").asBoolean());
        JsonNode futureWindow = call("from", FROM, "to", TO, "size", "100");
        assertFalse(item(futureWindow, "CI-LATER").get("canCheckIn").asBoolean());
    }

    @Test
    void counts_groupRoomsByDisplayStatus() throws Exception {
        room("CT-A", RoomStatus.AVAILABLE);
        room("CT-C", RoomStatus.CLEANING);
        room("CT-M", RoomStatus.UNDER_MAINTENANCE);
        JsonNode before = call("from", FROM, "to", TO, "size", "100");
        long cleaningBefore = before.get("statusCounts").get("CLEANING").asLong();

        room("CT-C2", RoomStatus.CLEANING);
        JsonNode after = call("from", FROM, "to", TO, "size", "100");
        assertEquals(cleaningBefore + 1, after.get("statusCounts").get("CLEANING").asLong());
        long sum = 0;
        for (String k : List.of("AVAILABLE", "RESERVED", "OCCUPIED", "CLEANING", "MAINTENANCE")) {
            sum += after.get("statusCounts").get(k).asLong();
        }
        assertEquals(after.get("statusCounts").get("ALL").asLong(), sum);
    }

    // ------------------------------------------------------------------ UC-ROM-006

    @Test
    void filter_byDisplayStatusCleaning() throws Exception {
        room("OP-A", RoomStatus.AVAILABLE);
        room("OP-C", RoomStatus.CLEANING);
        room("OP-M", RoomStatus.UNDER_MAINTENANCE);

        JsonNode data = call("displayStatus", "CLEANING", "size", "100");
        for (JsonNode n : data.get("rooms").get("content")) {
            assertEquals("CLEANING", n.get("operationalStatus").asText());
        }
        assertNotNull(item(data, "OP-C"));
        assertNull(item(data, "OP-A"));
        assertNull(item(data, "OP-M"));
    }

    @Test
    void filter_byDisplayStatusTab() throws Exception {
        room("DS-A", RoomStatus.AVAILABLE);
        rooms r = room("DS-R", RoomStatus.AVAILABLE);
        book(r, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");

        JsonNode data = call("from", FROM, "to", TO, "displayStatus", "RESERVED", "size", "100");
        assertNotNull(item(data, "DS-R"));
        assertNull(item(data, "DS-A"));
        // số phòng theo tab vẫn tính trên toàn bộ phòng, không bị thu hẹp bởi tab đang chọn
        assertTrue(data.get("statusCounts").get("AVAILABLE").asLong() >= 1);
    }

    @Test
    void filter_byKeyword() throws Exception {
        rooms r1 = room("KW-1", RoomStatus.AVAILABLE);
        rooms r2 = room("KW-2", RoomStatus.AVAILABLE);
        rooms r3 = room("KW-3", RoomStatus.AVAILABLE);
        // KW-1: Alice đang ở (cũ), Bob đã đặt sau đó
        book(r1, alice, BookingStatus.CHECKED_IN, "2030-01-10T00:00:00", "2030-01-11T12:00:00");
        book(r1, bob, BookingStatus.RESERVED, "2030-01-15T14:00:00", "2030-01-16T12:00:00");
        // KW-2: Alice đã đặt
        book(r2, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        // KW-3: Bob đã đặt
        book(r3, bob, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");

        // khách Alice -> KW-1 (đang ở) và KW-2 (đã đặt), không có KW-3 của Bob
        JsonNode both = call("from", FROM, "to", TO, "keyword", "alice", "size", "100");
        assertEquals(List.of("KW-1", "KW-2"), codes(both, "KW-"));
        assertEquals("Alice Nguyen", item(both, "KW-2").get("matchedBooking").get("customerName").asText());

        // chỉ theo khách Bob -> KW-1, KW-3
        JsonNode bobOnly = call("from", FROM, "to", TO, "keyword", "bob", "size", "100");
        assertEquals(List.of("KW-1", "KW-3"), codes(bobOnly, "KW-"));

        // theo mã phiếu thuê
        String receiptCode = item(both, "KW-2").get("matchedBooking").get("receiptCode").asText();
        JsonNode byCode = call("from", FROM, "to", TO, "keyword", receiptCode, "size", "100");
        assertNotNull(item(byCode, "KW-2"));

        // theo số điện thoại
        JsonNode byPhone = call("from", FROM, "to", TO, "keyword", "0988000002", "size", "100");
        assertEquals(List.of("KW-1", "KW-3"), codes(byPhone, "KW-"));
    }

    @Test
    void filter_combinedConditionsAreAnded() throws Exception {
        rooms cleaningWithBooking = room("AND-C", RoomStatus.AVAILABLE);
        rooms availableWithBooking = room("AND-A", RoomStatus.AVAILABLE);
        book(cleaningWithBooking, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        book(availableWithBooking, alice, BookingStatus.RESERVED, "2030-01-12T14:00:00", "2030-01-13T12:00:00");
        setStatus(cleaningWithBooking, RoomStatus.CLEANING);

        JsonNode data = call("from", FROM, "to", TO, "displayStatus", "RESERVED", "keyword", "alice", "size", "100");
        assertNotNull(item(data, "AND-A"));
        assertNull(item(data, "AND-C"));
    }

    @Test
    void filter_onlyStartGiven_endsAtEndOfToday_andOnlyEndGiven_startsNow() throws Exception {
        // chỉ có mốc kết thúc trong quá khứ -> bắt đầu mặc định (bây giờ) không nhỏ hơn kết thúc
        mvc.perform(map("to", "2000-01-01T00:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Khoảng thời gian không hợp lệ. Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc."));
        // chỉ có mốc bắt đầu ở hôm nay lúc 00:00 -> hợp lệ nếu còn trước hết ngày hiện tại
        JsonNode data = call("from", LocalDateTime.now().toLocalDate().atStartOfDay().toString());
        assertEquals(LocalDateTime.parse(data.get("windowFrom").asText()).toLocalDate().plusDays(1).atStartOfDay(),
                LocalDateTime.parse(data.get("windowTo").asText()));
    }

    // ------------------------------------------------------------------ lỗi đầu vào

    @Test
    void invalidInputs_returnUseCaseMessages() throws Exception {
        mvc.perform(map("from", FROM, "to", FROM))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Khoảng thời gian không hợp lệ. Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc."));
        mvc.perform(map("from", "khong-phai-ngay"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Khoảng thời gian không hợp lệ. Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc."));
        mvc.perform(map("displayStatus", "XYZ"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Trạng thái lọc không hợp lệ."));
        mvc.perform(map("keyword", "<script>"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Thông tin đặt phòng không hợp lệ. Vui lòng kiểm tra lại."));
    }

    @Test
    void blankFilters_areIgnored() throws Exception {
        room("BL-1", RoomStatus.AVAILABLE);
        JsonNode data = call("displayStatus", "", "keyword", "  ", "size", "100");
        assertNotNull(item(data, "BL-1"));
    }
}
