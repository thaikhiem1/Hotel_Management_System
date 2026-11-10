package com.example.hotel.services.impl;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.ConcurrentUpdateException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.services.IStayService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * UC-REN-004 (nhận phòng). Điều kiện được kiểm tra khi mở biểu mẫu và kiểm tra lại khi xác nhận;
 * giờ nhận phòng thực tế do máy chủ xác định. Khi xác nhận, khóa phòng rồi phiếu thuê (cùng thứ tự với các
 * thao tác ghi khác) để hai giao dịch trên cùng phòng được xử lý lần lượt (E5).
 */
@Service
@RequiredArgsConstructor
public class StayService implements IStayService {

    private static final String MSG_INVALID_DETAIL = "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.";
    private static final String MSG_TOO_EARLY = "Chưa đến thời gian nhận phòng.";
    private static final String MSG_CONFLICT =
            "Chi tiết đặt phòng hoặc phòng vừa được xử lý bởi thao tác khác. Vui lòng kiểm tra lại thông tin.";

    private final BookingDetailRepository bookingDetailRepository;
    private final RentalReceiptRepository rentalReceiptRepository;
    private final RoomRepository roomRepository;
    private final Clock clock;

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
