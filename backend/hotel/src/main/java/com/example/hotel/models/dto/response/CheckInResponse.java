package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.ReceiptStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * UC-REN-004: kết quả nhận phòng thành công.
 */
@Getter
@AllArgsConstructor
public class CheckInResponse {
    private Integer bookingDetailId;
    private Integer rentalReceiptId;
    private String receiptCode;
    private ReceiptStatus receiptStatus;
    private Integer roomId;
    private String roomCode;
    private BookingStatus bookingStatus;
    private LocalDateTime actualCheckIn;
    private Integer actualGuests;
}
