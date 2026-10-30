package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.PricingMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UC-REN-010: chi phí dự kiến của một chi tiết đặt phòng
 */
@Getter
@AllArgsConstructor
public class RentalLineEstimate {
    private Integer roomId;
    private String roomCode;
    private String roomTypeName;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private PricingMethod pricingMethod;
    /** Đơn giá áp dụng (giá ngày hoặc giá giờ của loại phòng) */
    private BigDecimal unitPrice;
    /** Số đêm (NGAY) hoặc số giờ (GIO) tính tiền */
    private Integer billedUnits;
    private BigDecimal amount;
}
