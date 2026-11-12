package com.example.hotel.services.impl;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.CheckOutAmountChangedException;
import com.example.hotel.exception.ConcurrentUpdateException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.request.CheckOutRequest;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;
import com.example.hotel.models.dto.response.CheckOutContextResponse;
import com.example.hotel.models.dto.response.CheckOutResponse;
import com.example.hotel.models.dto.response.ServiceUsageItemResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.invoices;
import com.example.hotel.models.entities.service_usages;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.repositorys.ServiceUsageRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.repositorys.RentalReceiptRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.services.IStayService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * UC-REN-004 (nhận phòng) và UC-REN-007 (trả phòng). Điều kiện được kiểm tra khi mở biểu mẫu và kiểm tra lại khi xác nhận;
 * giờ nhận phòng thực tế do máy chủ xác định. Khi xác nhận, khóa phòng rồi phiếu thuê (cùng thứ tự với các
 * thao tác ghi khác) để hai giao dịch trên cùng phòng được xử lý lần lượt (E5).
 */
@Service
@RequiredArgsConstructor
public class StayService implements IStayService {

    private static final String MSG_INVALID_DETAIL = "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.";
    private static final String MSG_TOO_EARLY = "Chưa đến thời gian nhận phòng.";
    private static final String MSG_CHECKOUT_INVALID = "Lượt lưu trú không hợp lệ hoặc đã được trả phòng.";
    private static final String MSG_CHECKOUT_TIME = "Thời gian trả phòng không hợp lệ.";
    private static final String MSG_AMOUNT_CHANGED =
            "Chi phí đã thay đổi. Vui lòng kiểm tra và xác nhận lại chi phí mới.";
    private static final String MSG_CONFLICT =
            "Chi tiết đặt phòng hoặc phòng vừa được xử lý bởi thao tác khác. Vui lòng kiểm tra lại thông tin.";

    private final BookingDetailRepository bookingDetailRepository;
    private final RentalReceiptRepository rentalReceiptRepository;
    private final RoomRepository roomRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final Clock clock;

    @PersistenceContext
    private EntityManager entityManager;

    // ------------------------------------------------------------------ bước 2-4: mở biểu mẫu

    @Override
    @Transactional(readOnly = true)
    public CheckInContextResponse getCheckInContext(Integer bookingDetailId) {
        booking_details detail = loadDetail(bookingDetailId);
        checkEligibility(detail, detail.getRoom(), LocalDateTime.now(clock));

        rental_receipts receipt = detail.getRentalReceipt();
        customers customer = receipt.getCustomer();
        rooms room = detail.getRoom();
        return new CheckInContextResponse(
                detail.getBookingDetailId(),
                receipt.getRentalReceiptId(),
                receipt.getReceiptCode(),
                customer.getCustomerId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getCitizenId(),
                customer.getNationality(),
                room.getRoomId(),
                room.getRoomCode(),
                room.getRoomTypes().getRoomTypeName(),
                room.getRoomTypes().getNumberOfBeds(),
                room.getRoomTypes().getMaximumOccupancy(),
                detail.getNumberOfGuests(),
                detail.getCheckInAt(),
                detail.getCheckOutAt(),
                detail.getPricingMethod());
    }

    // ------------------------------------------------------------------ bước 5-9: xác nhận

    @Override
    @Transactional
    public CheckInResponse checkIn(Integer bookingDetailId, CheckInRequest request) {
        // Khóa phòng rồi phiếu thuê trước khi đọc lại trạng thái để thao tác trùng phải chờ nhau
        Integer roomId = bookingDetailRepository.findRoomIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_INVALID_DETAIL));
        Integer receiptId = bookingDetailRepository.findReceiptIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_INVALID_DETAIL));
        roomRepository.findAllByIdForUpdate(List.of(roomId));
        rental_receipts receipt = rentalReceiptRepository.findByIdForUpdate(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_INVALID_DETAIL));

        booking_details detail = loadDetail(bookingDetailId);
        rooms room = detail.getRoom();
        LocalDateTime now = LocalDateTime.now(clock);
        checkEligibility(detail, room, now);

        // E3: số khách thực tế không vượt sức chứa tối đa của phòng
        Integer max = room.getRoomTypes().getMaximumOccupancy();
        if (request.getActualGuests() > max) {
            String message = "Phòng " + room.getRoomCode() + " chỉ cho phép tối đa " + max + " khách.";
            throw new BusinessValidationException(message, Map.of("actualGuests", message));
        }

        // Bước 7-8: ghi nhận nhận phòng, phiếu thuê chuyển DANG_LUU_TRU
        detail.setActualCheckInAt(now);
        detail.setActualNumberOfGuests(request.getActualGuests());
        detail.setBookingStatus(BookingStatus.CHECKED_IN);
        receipt.setReceiptStatus(ReceiptStatus.DANG_LUU_TRU);

        // E5, E6: DB là chốt chặn cuối (một phòng một lượt đang lưu trú); lỗi thì cả giao dịch bị hoàn tác
        try {
            bookingDetailRepository.saveAndFlush(detail);
            rentalReceiptRepository.saveAndFlush(receipt);
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }

        return new CheckInResponse(
                detail.getBookingDetailId(),
                receipt.getRentalReceiptId(),
                receipt.getReceiptCode(),
                receipt.getReceiptStatus(),
                room.getRoomId(),
                room.getRoomCode(),
                detail.getBookingStatus(),
                detail.getActualCheckInAt(),
                detail.getActualNumberOfGuests());
    }

    // ------------------------------------------------------------------ UC-REN-007 bước 2-6: mở biểu mẫu trả phòng

    @Override
    @Transactional(readOnly = true)
    public CheckOutContextResponse getCheckOutContext(Integer bookingDetailId) {
        booking_details detail = loadDetail(bookingDetailId);
        checkCheckOutEligibility(detail);
        return buildCheckOutContext(detail, LocalDateTime.now(clock).truncatedTo(ChronoUnit.MICROS));
    }

    // ------------------------------------------------------------------ UC-REN-007 bước 7-12: xác nhận trả phòng

    @Override
    @Transactional
    public CheckOutResponse checkOut(Integer bookingDetailId, CheckOutRequest request) {
        // Khóa phòng rồi phiếu thuê (cùng thứ tự với nhận phòng và ghi nhận dịch vụ): trả phòng phải chờ thao tác ghi
        // dịch vụ đang chạy trên cùng phòng, và hai lần trả phòng của một lượt được xử lý lần lượt (E4)
        Integer roomId = bookingDetailRepository.findRoomIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_CHECKOUT_INVALID));
        Integer receiptId = bookingDetailRepository.findReceiptIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_CHECKOUT_INVALID));
        roomRepository.findAllByIdForUpdate(List.of(roomId));
        rental_receipts receipt = rentalReceiptRepository.findByIdForUpdate(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_CHECKOUT_INVALID));

        booking_details detail = loadDetail(bookingDetailId);
        rooms room = detail.getRoom();
        checkCheckOutEligibility(detail);

        // Giờ trả phòng do máy chủ xác định; chi phí tính lại tại đây, không tin số liệu từ giao diện
        LocalDateTime now = LocalDateTime.now(clock).truncatedTo(ChronoUnit.MICROS);
        CheckOutContextResponse bill = buildCheckOutContext(detail, now);
        BigDecimal expected = request.getExpectedTotalAmount();
        if (expected != null && expected.compareTo(bill.getTotalAmount()) != 0) {
            throw new CheckOutAmountChangedException(MSG_AMOUNT_CHANGED, bill);
        }

        employees employee = resolveCurrentEmployee();

        detail.setActualCheckOutAt(now);
        detail.setBookingStatus(BookingStatus.CHECKED_OUT);
        room.setRoomStatus(RoomStatus.CLEANING);

        invoices invoice = new invoices();
        invoice.setBookingDetail(detail);
        invoice.setRentalReceipt(receipt);
        invoice.setEmployee(employee);
        invoice.setPricingMethod(detail.getPricingMethod());
        invoice.setUnitPrice(detail.getUnitPrice());
        invoice.setBilledUnits(bill.getBilledUnits());
        invoice.setRoomAmount(bill.getRoomAmount());
        invoice.setServiceAmount(bill.getServiceAmount());
        invoice.setTotalAmount(bill.getTotalAmount());
        invoice.setInvoiceStatus(InvoiceStatus.UNPAID);
        invoice.setIssuedAt(now);

        // E5, E6: DB là chốt chặn cuối (một hóa đơn một lượt, tiền khớp dữ liệu); lỗi thì cả giao dịch bị hoàn tác
        try {
            bookingDetailRepository.saveAndFlush(detail);
            roomRepository.saveAndFlush(room);
            // Sau khi chi tiết đã được ghi, trạng thái phiếu thuê suy ra từ trạng thái các chi tiết của nó
            receipt.setReceiptStatus(resolveReceiptStatus(receiptId));
            rentalReceiptRepository.saveAndFlush(receipt);
            invoiceRepository.saveAndFlush(invoice);
            entityManager.refresh(invoice); // đọc lại mã hóa đơn do DB sinh
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }

        return new CheckOutResponse(
                detail.getBookingDetailId(),
                detail.getBookingStatus(),
                receipt.getRentalReceiptId(),
                receipt.getReceiptCode(),
                receipt.getReceiptStatus(),
                room.getRoomId(),
                room.getRoomCode(),
                room.getRoomStatus(),
                detail.getActualCheckInAt(),
                detail.getActualCheckOutAt(),
                invoice.getInvoiceId(),
                invoice.getInvoiceCode(),
                invoice.getInvoiceStatus(),
                invoice.getPricingMethod(),
                invoice.getUnitPrice(),
                invoice.getBilledUnits(),
                invoice.getRoomAmount(),
                invoice.getServiceAmount(),
                invoice.getTotalAmount(),
                invoice.getIssuedAt());
    }

    // ------------------------------------------------------------------ nội bộ

    private booking_details loadDetail(Integer bookingDetailId) {
        return bookingDetailRepository.findWithStayInfo(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_INVALID_DETAIL));
    }

    /** E1, E2, E4: điều kiện nhận phòng dùng chung cho bước kiểm tra sơ bộ và bước xác nhận */
    private void checkEligibility(booking_details detail, rooms room, LocalDateTime now) {
        if (detail.getBookingStatus() != BookingStatus.RESERVED) {
            throw new BusinessValidationException(MSG_INVALID_DETAIL, Map.of());
        }
        if (now.isBefore(detail.getCheckInAt())) {
            throw new BusinessValidationException(MSG_TOO_EARLY, Map.of());
        }
        if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
            throw new BusinessValidationException(
                    "Phòng " + room.getRoomCode() + " đang bảo trì nên không thể tiếp nhận khách.", Map.of());
        }
        if (room.getRoomStatus() == RoomStatus.CLEANING) {
            throw new BusinessValidationException(
                    "Phòng " + room.getRoomCode() + " đang dọn dẹp nên không thể tiếp nhận khách.", Map.of());
        }
        if (bookingDetailRepository.existsByRoomRoomIdAndBookingStatus(room.getRoomId(), BookingStatus.CHECKED_IN)) {
            throw new BusinessValidationException(
                    "Phòng " + room.getRoomCode() + " đang có lượt lưu trú khác.", Map.of());
        }
    }

    /** A1, E3, E4: chỉ trả phòng cho lượt đang lưu trú và chưa có hóa đơn; dùng chung cho kiểm tra sơ bộ và xác nhận */
    private void checkCheckOutEligibility(booking_details detail) {
        if (detail.getBookingStatus() != BookingStatus.CHECKED_IN
                || invoiceRepository.existsByBookingDetailBookingDetailId(detail.getBookingDetailId())) {
            throw new BusinessValidationException(MSG_CHECKOUT_INVALID, Map.of());
        }
    }

    /** Bước 5-6: tiền phòng theo giờ trả phòng và đơn giá đã chốt (cùng quy tắc làm tròn với UC-REN-010) cộng tiền dịch vụ */
    private CheckOutContextResponse buildCheckOutContext(booking_details detail, LocalDateTime checkOutAt) {
        // A2: giờ trả phải sau giờ nhận thực tế
        if (!checkOutAt.isAfter(detail.getActualCheckInAt())) {
            throw new BusinessValidationException(MSG_CHECKOUT_TIME, Map.of());
        }
        int units = RentalPricing.billedUnits(detail.getPricingMethod(), detail.getActualCheckInAt(), checkOutAt);
        BigDecimal roomAmount = RentalPricing.amount(detail.getUnitPrice(), units);

        List<service_usages> usages =
                serviceUsageRepository.findDetailedByBookingDetailId(detail.getBookingDetailId());
        List<ServiceUsageItemResponse> items = usages.stream()
                .map(u -> new ServiceUsageItemResponse(
                        u.getServiceUsageId(),
                        u.getService().getServiceId(),
                        u.getService().getServiceName(),
                        u.getService().getUnit(),
                        u.getQuantity(),
                        u.getUnitPrice(),
                        u.getAmount(),
                        u.getUsedAt(),
                        u.getRecordedBy().getFullName()))
                .toList();
        BigDecimal serviceAmount = usages.stream()
                .map(service_usages::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        rental_receipts receipt = detail.getRentalReceipt();
        customers customer = receipt.getCustomer();
        rooms room = detail.getRoom();
        return new CheckOutContextResponse(
                detail.getBookingDetailId(),
                receipt.getRentalReceiptId(),
                receipt.getReceiptCode(),
                customer.getFullName(),
                customer.getPhone(),
                room.getRoomId(),
                room.getRoomCode(),
                room.getRoomTypes().getRoomTypeName(),
                detail.getActualNumberOfGuests(),
                detail.getPricingMethod(),
                detail.getUnitPrice(),
                detail.getActualCheckInAt(),
                detail.getCheckOutAt(),
                checkOutAt,
                units,
                roomAmount,
                items,
                serviceAmount,
                roomAmount.add(serviceAmount));
    }

    /**
     * Trạng thái phiếu thuê sau khi trả một chi tiết: còn lượt đang lưu trú thì giữ DANG_LUU_TRU; không còn ai ở
     * nhưng còn chi tiết đã đặt thì về DA_XAC_NHAN; mọi chi tiết đã kết thúc thì DA_TRA_PHONG.
     */
    private ReceiptStatus resolveReceiptStatus(Integer receiptId) {
        List<BookingStatus> statuses = bookingDetailRepository.findStatusesByReceiptId(receiptId);
        if (statuses.contains(BookingStatus.CHECKED_IN)) {
            return ReceiptStatus.DANG_LUU_TRU;
        }
        return statuses.contains(BookingStatus.RESERVED) ? ReceiptStatus.DA_XAC_NHAN : ReceiptStatus.DA_TRA_PHONG;
    }

    /** Nhân viên lập hóa đơn lấy từ tài khoản đăng nhập, không nhận từ giao diện */
    private employees resolveCurrentEmployee() {
        CustomUserDetails user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên thực hiện hợp lệ."));
        return employeeRepository.findById(user.getEmployeeId())
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên thực hiện hợp lệ."));
    }

    private RuntimeException translate(DataIntegrityViolationException e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof SQLException sql && sql.getSQLState() != null) {
                switch (sql.getSQLState()) {
                    case "23505": // phòng đã có lượt lưu trú khác (giao dịch khác vừa nhận phòng)
                        return new ConcurrentUpdateException(MSG_CONFLICT);
                    case "23514": // CHECK hoặc trigger nghiệp vụ
                        return new BusinessValidationException(readableDbMessage(sql), Map.of());
                    default:
                        break;
                }
            }
        }
        return e;
    }

    private String readableDbMessage(SQLException sql) {
        String first = sql.getMessage() == null ? "" : sql.getMessage().split("\n", 2)[0];
        if (first.startsWith("ERROR: ")) {
            first = first.substring("ERROR: ".length());
        }
        if (first.isBlank() || first.startsWith("new row for relation")) {
            return MSG_INVALID_DETAIL;
        }
        return first;
    }
}
