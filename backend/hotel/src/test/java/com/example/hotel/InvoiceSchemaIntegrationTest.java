package com.example.hotel;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.PricingMethod;
import com.example.hotel.Enums.Role;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.invoices;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.service_usages;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServiceUsageRepository;
import com.example.hotel.repositorys.ServicesRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * V5: ràng buộc của dịch vụ khách sử dụng và hóa đơn trả phòng (dữ liệu đúng, sai tổng tiền, trùng hóa đơn...).
 * Mỗi test chỉ có tối đa một lệnh bị cơ sở dữ liệu từ chối vì giao dịch của PostgreSQL bị hủy sau lỗi.
 */
@SpringBootTest
@Transactional
class InvoiceSchemaIntegrationTest {

    @Autowired EntityManager em;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired RoomTypeRepository roomTypeRepository;
    @Autowired RoomRepository roomRepository;
    @Autowired RentalReceiptRepository rentalReceiptRepository;
    @Autowired BookingDetailRepository bookingDetailRepository;
    @Autowired ServiceCategoriesRepository serviceCategoriesRepository;
    @Autowired ServicesRepository servicesRepository;
    @Autowired ServiceUsageRepository serviceUsageRepository;
    @Autowired InvoiceRepository invoiceRepository;

    LocalDateTime now;
    employees employee;
    services service;
    rental_receipts receipt;
    booking_details detail;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now().withNano(0);

        employee = new employees();
        employee.setFullName("Nhan Vien Hoa Don");
        employee.setPosition(Role.RECEPTIONIST.name());
        employee.setSalary(BigDecimal.ZERO);
        employee.setPhone("0955000001");
        employee.setCitizenId("079500000001");
        employee.setDateOfBirth(LocalDate.of(2000, 1, 1));
        employee.setGender("Nam");
        employee.setEmail("inv@x.vn");
        employee.setIsActive(true);
        employee = employeeRepository.save(employee);

        customers customer = new customers();
        customer.setFullName("Khach Hoa Don");
        customer.setPhone("0987000333");
        customer.setCitizenId("INV-CCCD-1");
        customer.setNationality("Viet Nam");
        customer.setGender("Nam");
        customer = customerRepository.save(customer);

        room_types type = new room_types();
        type.setRoomTypeName("INV-Type");
        type.setNumberOfBeds(1);
        type.setMaximumOccupancy(2);
        type.setDailyRate(new BigDecimal("800000"));
        type.setHourlyRate(new BigDecimal("100000"));
        type = roomTypeRepository.save(type);
        rooms room = new rooms();
        room.setRoomCode("INV101");
        room.setRoomStatus(RoomStatus.AVAILABLE);
        room.setRoomTypes(type);
        room = roomRepository.save(room);

        service_categories category = new service_categories();
        category.setServiceCategoriesName("INV-Category");
        category = serviceCategoriesRepository.save(category);
        service = new services();
        service.setServiceName("INV-Water");
        service.setUnitPrice(new BigDecimal("30000"));
        service.setUnit("chai");
        service.setCategory(category);
        service = servicesRepository.save(service);

        // Lượt lưu trú đang diễn ra: dự kiến 4 giờ, thực tế nhận phòng cách đây 4 giờ
        receipt = new rental_receipts();
        receipt.setCustomer(customer);
        receipt.setEmployee(employee);
        receipt.setRentalDate(now.minusHours(6));
        detail = new booking_details();
        detail.setRoom(room);
        detail.setNumberOfGuests(1);
        detail.setCheckInAt(now.minusHours(5));
        detail.setCheckOutAt(now.minusHours(1));
        detail.setPricingMethod(PricingMethod.GIO);
        detail.setUnitPrice(new BigDecimal("100000"));
        detail.setEstimatedUnits(4);
        detail.setEstimatedAmount(new BigDecimal("400000.00"));
        detail.setActualCheckInAt(now.minusHours(4));
        detail.setActualNumberOfGuests(1);
        detail.setBookingStatus(BookingStatus.CHECKED_IN);
        receipt.addBookingDetail(detail);
        rentalReceiptRepository.saveAndFlush(receipt);
    }

    private void checkOut() {
        detail.setActualCheckOutAt(now.minusHours(2));
        detail.setBookingStatus(BookingStatus.CHECKED_OUT);
        bookingDetailRepository.saveAndFlush(detail);
    }

    private service_usages usage(int quantity, String unitPrice, String amount) {
        service_usages u = new service_usages();
        u.setBookingDetail(detail);
        u.setService(service);
        u.setQuantity(quantity);
        u.setUnitPrice(new BigDecimal(unitPrice));
        u.setAmount(new BigDecimal(amount));
        u.setUsedAt(now.minusHours(3));
        u.setRecordedBy(employee);
        return u;
    }

    /** Thực tế ở lại 2 giờ: 2 đơn vị x 100000 = 200000 */
    private invoices invoice(int units, String roomAmount, String serviceAmount, String total) {
        invoices i = new invoices();
        i.setBookingDetail(detail);
        i.setRentalReceipt(receipt);
        i.setEmployee(employee);
        i.setPricingMethod(PricingMethod.GIO);
        i.setUnitPrice(new BigDecimal("100000"));
        i.setBilledUnits(units);
        i.setRoomAmount(new BigDecimal(roomAmount));
        i.setServiceAmount(new BigDecimal(serviceAmount));
        i.setTotalAmount(new BigDecimal(total));
        i.setIssuedAt(now);
        return i;
    }

    // ------------------------------------------------------------------ hóa đơn hợp lệ

    @Test
    void invoice_validWithServices_isSavedAsUnpaidWithGeneratedCode() {
        serviceUsageRepository.saveAndFlush(usage(2, "30000", "60000"));
        checkOut();

        invoices saved = invoiceRepository.saveAndFlush(invoice(2, "200000", "60000", "260000"));
        em.refresh(saved);

        assertEquals(InvoiceStatus.UNPAID, saved.getInvoiceStatus());
        assertTrue(saved.getInvoiceCode().startsWith("HD"), saved.getInvoiceCode());
        assertEquals(0, new BigDecimal("260000").compareTo(saved.getTotalAmount()));
    }

    @Test
    void invoice_amountsAreImmutable_butPaymentStatusCanChange() {
        checkOut();
        invoices saved = invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000"));

        saved.setInvoiceStatus(InvoiceStatus.PAID);
        saved.setPaidAt(now);
        saved.setPaymentMethod(com.example.hotel.Enums.PaymentMethod.CASH);
        saved.setPaidBy(employee);
        invoiceRepository.saveAndFlush(saved);
        assertEquals(InvoiceStatus.PAID, invoiceRepository.findById(saved.getInvoiceId()).orElseThrow().getInvoiceStatus());
    }

    @Test
    void invoice_changingAmountAfterIssuing_isRejected() {
        checkOut();
        invoices saved = invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000"));

        saved.setServiceAmount(new BigDecimal("10000"));
        saved.setTotalAmount(new BigDecimal("210000"));
        assertThrows(DataIntegrityViolationException.class, () -> invoiceRepository.saveAndFlush(saved));
    }

    // ------------------------------------------------------------------ hóa đơn không hợp lệ

    @Test
    void invoice_forStayThatIsNotCheckedOut_isRejected() {
        assertThrows(DataIntegrityViolationException.class,
                () -> invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000")));
    }

    @Test
    void invoice_secondInvoiceForSameStay_isRejected() {
        checkOut();
        invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000"));

        assertThrows(DataIntegrityViolationException.class,
                () -> invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000")));
    }

    @Test
    void invoice_totalNotEqualRoomPlusService_isRejected() {
        checkOut();
        assertThrows(DataIntegrityViolationException.class,
                () -> invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "250000")));
    }

    @Test
    void invoice_unitsNotMatchingActualStay_isRejected() {
        checkOut();
        // ở thực tế 2 giờ nhưng ghi 4 giờ (thời gian dự kiến)
        assertThrows(DataIntegrityViolationException.class,
                () -> invoiceRepository.saveAndFlush(invoice(4, "400000", "0", "400000")));
    }

    @Test
    void invoice_serviceAmountNotMatchingRecordedUsages_isRejected() {
        serviceUsageRepository.saveAndFlush(usage(2, "30000", "60000"));
        checkOut();
        assertThrows(DataIntegrityViolationException.class,
                () -> invoiceRepository.saveAndFlush(invoice(2, "200000", "0", "200000")));
    }

    // ------------------------------------------------------------------ dịch vụ sử dụng

    @Test
    void serviceUsage_forStayInProgress_isSaved() {
        service_usages saved = serviceUsageRepository.saveAndFlush(usage(3, "30000", "90000"));
        assertEquals(3, serviceUsageRepository.findById(saved.getServiceUsageId()).orElseThrow().getQuantity());
    }

    @Test
    void serviceUsage_forStayThatEnded_isRejected() {
        checkOut();
        assertThrows(DataIntegrityViolationException.class,
                () -> serviceUsageRepository.saveAndFlush(usage(1, "30000", "30000")));
    }

    @Test
    void serviceUsage_withNonPositiveQuantity_isRejected() {
        assertThrows(DataIntegrityViolationException.class,
                () -> serviceUsageRepository.saveAndFlush(usage(0, "30000", "0")));
    }

    @Test
    void serviceUsage_amountNotEqualQuantityTimesPrice_isRejected() {
        assertThrows(DataIntegrityViolationException.class,
                () -> serviceUsageRepository.saveAndFlush(usage(2, "30000", "50000")));
    }
}
