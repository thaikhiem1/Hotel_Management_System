package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * UC-REN-009: một ô phòng khả dụng
 */
@Getter
@AllArgsConstructor
public class AvailableRoomResponse {
    private Integer roomId;
    private String roomCode;
    private Integer roomTypeId;
    private String roomTypeName;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
    private Integer maximumOccupancy;
    private Integer numberOfBeds;
    private String note;
}
