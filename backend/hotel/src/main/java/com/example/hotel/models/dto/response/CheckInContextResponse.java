package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.PricingMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * UC-REN-004 bước 2-4: thông tin để mở biểu mẫu Check-in, chỉ trả về khi chi tiết đặt phòng đủ điều kiện nhận phòng.
 */
@Getter
@AllArgsConstructor
public class CheckInContextResponse {
    private Integer bookingDetailId;
    private Integer rentalReceiptId;
    private String receiptCode;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String customerCitizenId;
    private String customerNationality;
    private Integer roomId;
    private String roomCode;
    private String roomTypeName;
    private Integer numberOfBeds;
    private Integer maximumOccupancy;
    private Integer expectedGuests;
    private LocalDateTime expectedCheckIn;
    private LocalDateTime expectedCheckOut;
    private PricingMethod pricingMethod;
}
