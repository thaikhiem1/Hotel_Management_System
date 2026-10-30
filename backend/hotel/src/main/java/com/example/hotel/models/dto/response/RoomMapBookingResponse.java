package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Thông tin tóm tắt một chi tiết đặt phòng/lưu trú hiển thị trên thẻ phòng
 */
@Getter
@AllArgsConstructor
public class RoomMapBookingResponse {
    private Integer bookingDetailId;
    private Integer rentalReceiptId;
    private String receiptCode;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private Integer numberOfGuests;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private LocalDateTime actualCheckIn;
    private BookingStatus bookingStatus;
}
