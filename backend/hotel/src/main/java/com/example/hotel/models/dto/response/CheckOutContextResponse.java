package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.PricingMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * UC-REN-007 bước 2-6: thông tin lượt lưu trú và chi phí tạm tính đến thời điểm hiện tại của máy chủ.
 */
@Getter
@AllArgsConstructor
public class CheckOutContextResponse {
    private Integer bookingDetailId;
    private Integer rentalReceiptId;
    private String receiptCode;
    private String customerName;
    private String customerPhone;
    private Integer roomId;
    private String roomCode;
    private String roomTypeName;
    private Integer actualGuests;
    private PricingMethod pricingMethod;
    private BigDecimal unitPrice;
    private LocalDateTime actualCheckIn;
    private LocalDateTime expectedCheckOut;
    /** Thời điểm trả phòng dùng để tính chi phí (giờ máy chủ) */
    private LocalDateTime checkOutAt;
    private Integer billedUnits;
    private BigDecimal roomAmount;
    private List<ServiceUsageItemResponse> services;
    private BigDecimal serviceAmount;
    private BigDecimal totalAmount;
}
