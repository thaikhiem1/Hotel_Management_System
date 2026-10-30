package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * UC-REN-010: chi phí dự kiến của toàn phiếu thuê
 */
@Getter
@AllArgsConstructor
public class RentalEstimateResponse {
    private List<RentalLineEstimate> lines;
    private BigDecimal totalAmount;
}
