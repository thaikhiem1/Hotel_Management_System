package com.example.hotel;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.invoices;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
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
 * UC-REN-007: trả phòng. Lượt lưu trú được tạo và nhận phòng bằng API thật; giờ trả phòng do máy chủ xác định,
 * nên với cách tính theo giờ và trả phòng ngay sau khi nhận, số giờ tính tiền luôn là tối thiểu 1.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StayCheckOutIntegrationTest {

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
    @Autowired BookingDetailRepository bookingDetailRepository;
    @Autowired RentalReceiptRepository rentalReceiptRepository;
    @Autowired InvoiceRepository invoiceRepository;

    @Value("${app.bootstrap-admin.username}") String adminUser;
    @Value("${app.bootstrap-admin.password}") String adminPass;

    String token;
    int customerId;
    int receptionistEmployeeId;
    services water;      // 20000 / chai
    rooms room1, room2;

    @BeforeEach
    void setUp() throws Exception {
        accounts admin = accountRepository.findByUsername(adminUser).orElseThrow();
        admin.setPasswordHash(passwordEncoder.encode(adminPass));
        accountRepository.saveAndFlush(admin);

        employees e = new employees();
        e.setFullName("Le Tan Tra Phong");
        e.setPosition(Role.RECEPTIONIST.name());
        e.setSalary(BigDecimal.ZERO);
        e.setPhone("0977000002");
        e.setCitizenId("079700000002");
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail("co_rt@x.vn");
        e.setIsActive(true);
        e = employeeRepository.save(e);
        receptionistEmployeeId = e.getEmployeeId();
        accounts a = new accounts();
        a.setUsername("co_rt");
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(Role.RECEPTIONIST);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        token = login("co_rt", "Pass@1234");

        room_types type = new room_types();
        type.setRoomTypeName("CO-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        room1 = room("CO101", type);
        room2 = room("CO102", type);

        customers c = new customers();
        c.setFullName("Khach Tra Phong");
        c.setPhone("0987000555");
        c.setCitizenId("CO-CCCD-1");
        c.setNationality("Viet Nam");
        c.setGender("Nam");
        customerId = customerRepository.save(c).getCustomerId();

        service_categories category = new service_categories();
        category.setServiceCategoriesName("CO-Category");
        category = serviceCategoriesRepository.save(category);
        services s = new services();
        s.setServiceName("CO-Water");
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

    /** Tạo một phiếu thuê cho các phòng (theo giờ, bắt đầu 1 giờ trước) và trả về mã các chi tiết theo thứ tự phòng */
    private int[] createReceipt(String pricing, rooms... roomList) throws Exception {
        LocalDateTime now = LocalDateTime.now(ClockConfig.HOTEL_ZONE).withNano(0);
        List<Map<String, Object>> details = new java.util.ArrayList<>();
        for (rooms r : roomList) {
            details.add(Map.of("roomId", r.getRoomId(), "numberOfGuests", 1,
                    "checkIn", now.minusHours(1).toString(), "checkOut", now.plusHours(3).toString(),
                    "pricingMethod", pricing));
        }
        String res = send(post("/api/rental-receipts"), token,
                Map.of("customerId", customerId, "details", details))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode nodes = json.readTree(res).get("data").get("details");
        int[] ids = new int[roomList.length];
        for (int i = 0; i < ids.length; i++) {
            ids[i] = nodes.get(i).get("bookingDetailId").asInt();
        }
        return ids;
    }

    private void checkIn(int detailId) throws Exception {
        send(post("/api/booking-details/" + detailId + "/check-in"), token, Map.of("actualGuests", 1))
                .andExpect(status().isOk());
    }

    private void recordWater(int detailId, int quantity) throws Exception {
        send(post("/api/booking-details/" + detailId + "/services"), token,
                Map.of("lines", List.of(Map.of("serviceId", water.getServiceId(), "quantity", quantity))))
                .andExpect(status().isCreated());
    }

    private ResultActions context(int id) throws Exception {
        return send(get("/api/booking-details/" + id + "/check-out"), token, null);
    }

    private ResultActions checkOut(int id, Object body) throws Exception {
        return send(post("/api/booking-details/" + id + "/check-out"), token, body);
    }

    private int stay(String pricing) throws Exception {
        int id = createReceipt(pricing, room1)[0];
        checkIn(id);
        return id;
    }

    private booking_details detail(int id) {
        return bookingDetailRepository.findById(id).orElseThrow();
    }

    // ------------------------------------------------------------------ bảo mật

    @Test
    void security_onlyReceptionistCanCheckOut() throws Exception {
        int id = stay("GIO");
        mvc.perform(get("/api/booking-details/" + id + "/check-out")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/booking-details/" + id + "/check-out")).andExpect(status().isUnauthorized());

        String adminToken = login(adminUser, adminPass);
        send(get("/api/booking-details/" + id + "/check-out"), adminToken, null).andExpect(status().isForbidden());
        send(post("/api/booking-details/" + id + "/check-out"), adminToken, Map.of()).andExpect(status().isForbidden());
        assertEquals(BookingStatus.CHECKED_IN, detail(id).getBookingStatus());
    }

    // ------------------------------------------------------------------ mở biểu mẫu

    @Test
    void context_showsEstimateWithServices_andChangesNothing() throws Exception {
        int id = stay("GIO");
        recordWater(id, 2);

        context(id).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roomCode").value("CO101"))
                .andExpect(jsonPath("$.data.customerName").value("Khach Tra Phong"))
                .andExpect(jsonPath("$.data.pricingMethod").value("GIO"))
                .andExpect(jsonPath("$.data.billedUnits").value(1))
                .andExpect(jsonPath("$.data.roomAmount").value(100000))
                .andExpect(jsonPath("$.data.services.length()").value(1))
                .andExpect(jsonPath("$.data.services[0].serviceName").value("CO-Water"))
                .andExpect(jsonPath("$.data.serviceAmount").value(40000))
                .andExpect(jsonPath("$.data.totalAmount").value(140000));

        assertEquals(BookingStatus.CHECKED_IN, detail(id).getBookingStatus());
        assertEquals(0, invoiceRepository.findAll().stream()
                .filter(i -> i.getBookingDetail().getBookingDetailId() == id).count());
    }

    @Test
    void context_ofStayThatIsNotInProgress_isRejected() throws Exception {
        int reserved = createReceipt("GIO", room1)[0];   // mới đặt, chưa nhận phòng
        context(reserved).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Lượt lưu trú không hợp lệ hoặc đã được trả phòng."));
        checkOut(reserved, Map.of()).andExpect(status().isBadRequest());
        context(987654).andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------ trả phòng

    @Test
    void checkOut_createsUnpaidInvoice_marksRoomCleaning_andClosesReceipt() throws Exception {
        int id = stay("GIO");
        recordWater(id, 2);

        checkOut(id, Map.of("expectedTotalAmount", 140000)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingStatus").value("CHECKED_OUT"))
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_TRA_PHONG"))
                .andExpect(jsonPath("$.data.roomStatus").value("CLEANING"))
                .andExpect(jsonPath("$.data.invoiceStatus").value("UNPAID"))
                .andExpect(jsonPath("$.data.billedUnits").value(1))
                .andExpect(jsonPath("$.data.roomAmount").value(100000))
                .andExpect(jsonPath("$.data.serviceAmount").value(40000))
                .andExpect(jsonPath("$.data.totalAmount").value(140000));

        booking_details d = detail(id);
        assertEquals(BookingStatus.CHECKED_OUT, d.getBookingStatus());
        assertNotNull(d.getActualCheckOutAt());
        assertTrue(!d.getActualCheckOutAt().isBefore(d.getActualCheckInAt()));
        assertEquals(RoomStatus.CLEANING, roomRepository.findById(room1.getRoomId()).orElseThrow().getRoomStatus());
        assertEquals(ReceiptStatus.DA_TRA_PHONG,
                rentalReceiptRepository.findById(d.getRentalReceipt().getRentalReceiptId()).orElseThrow().getReceiptStatus());

        invoices invoice = invoiceRepository.findByBookingDetailBookingDetailId(id).orElseThrow();
        assertTrue(invoice.getInvoiceCode().startsWith("HD"));
        assertEquals(InvoiceStatus.UNPAID, invoice.getInvoiceStatus());
        assertEquals(receptionistEmployeeId, invoice.getEmployee().getEmployeeId());
        assertEquals(0, new BigDecimal("140000").compareTo(invoice.getTotalAmount()));
    }

    @Test
    void checkOut_dailyPricing_chargesAtLeastOneNight() throws Exception {
        int id = stay("NGAY");
        checkOut(id, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pricingMethod").value("NGAY"))
                .andExpect(jsonPath("$.data.billedUnits").value(1))
                .andExpect(jsonPath("$.data.roomAmount").value(800000))
                .andExpect(jsonPath("$.data.serviceAmount").value(0))
                .andExpect(jsonPath("$.data.totalAmount").value(800000));
    }

    @Test
    void checkOut_secondTime_isRejected_andKeepsSingleInvoice() throws Exception {
        int id = stay("GIO");
        checkOut(id, Map.of()).andExpect(status().isOk());
        checkOut(id, Map.of()).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Lượt lưu trú không hợp lệ hoặc đã được trả phòng."));
        context(id).andExpect(status().isBadRequest());
        assertEquals(1, invoiceRepository.findAll().stream()
                .filter(i -> i.getBookingDetail().getBookingDetailId() == id).count());
    }

    @Test
    void checkOut_withStaleExpectedTotal_returns409WithNewBill_andChangesNothing() throws Exception {
        int id = stay("GIO");
        recordWater(id, 1);   // tổng thực tế 120000, giao diện đang xem 100000

        checkOut(id, Map.of("expectedTotalAmount", 100000)).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Chi phí đã thay đổi. Vui lòng kiểm tra và xác nhận lại chi phí mới."))
                .andExpect(jsonPath("$.data.totalAmount").value(120000))
                .andExpect(jsonPath("$.data.serviceAmount").value(20000));

        assertEquals(BookingStatus.CHECKED_IN, detail(id).getBookingStatus());
        assertEquals(RoomStatus.AVAILABLE, roomRepository.findById(room1.getRoomId()).orElseThrow().getRoomStatus());
        assertTrue(invoiceRepository.findByBookingDetailBookingDetailId(id).isEmpty());

        checkOut(id, Map.of("expectedTotalAmount", 120000)).andExpect(status().isOk());
    }

    @Test
    void invoice_keepsRecordedPrices_whenServicePriceChangesAfterwards() throws Exception {
        int id = stay("GIO");
        recordWater(id, 2);
        checkOut(id, Map.of()).andExpect(status().isOk());

        water.setUnitPrice(new BigDecimal("99000"));
        servicesRepository.saveAndFlush(water);

        invoices invoice = invoiceRepository.findByBookingDetailBookingDetailId(id).orElseThrow();
        assertEquals(0, new BigDecimal("40000").compareTo(invoice.getServiceAmount()));
        assertEquals(0, new BigDecimal("140000").compareTo(invoice.getTotalAmount()));
    }

    // ------------------------------------------------------------------ trạng thái phiếu thuê nhiều phòng

    @Test
    void receiptStatus_staysInProgressWhileAnotherRoomIsStillOccupied_thenClosed() throws Exception {
        int[] ids = createReceipt("GIO", room1, room2);
        checkIn(ids[0]);
        checkIn(ids[1]);
        int receiptId = detail(ids[0]).getRentalReceipt().getRentalReceiptId();

        checkOut(ids[0], Map.of()).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptStatus").value("DANG_LUU_TRU"));
        assertEquals(ReceiptStatus.DANG_LUU_TRU, rentalReceiptRepository.findById(receiptId).orElseThrow().getReceiptStatus());

        checkOut(ids[1], Map.of()).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_TRA_PHONG"));
    }

    @Test
    void receiptStatus_backToConfirmed_whenOnlyReservedDetailsRemain() throws Exception {
        int[] ids = createReceipt("GIO", room1, room2);
        checkIn(ids[0]);   // phòng còn lại chưa nhận

        checkOut(ids[0], Map.of()).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.receiptStatus").value("DA_XAC_NHAN"));
    }
}
