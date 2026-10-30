package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.PricingMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BookingDetailResponse {
    private Integer bookingDetailId;
    private Integer roomId;
    private String roomCode;
    private String roomTypeName;
    private Integer numberOfGuests;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private PricingMethod pricingMethod;
    private BigDecimal unitPrice;
    private Integer estimatedUnits;
    private BigDecimal estimatedAmount;
    private BookingStatus bookingStatus;
}
