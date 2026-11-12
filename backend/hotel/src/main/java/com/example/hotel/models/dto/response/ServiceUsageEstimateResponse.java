package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * UC-SVC-005 bước 11: thông tin dịch vụ, số lượng, đơn giá và thành tiền để lễ tân kiểm tra trước khi xác nhận.
 */
@Getter
@AllArgsConstructor
public class ServiceUsageEstimateResponse {
    private List<ServiceUsageLineEstimate> lines;
    private BigDecimal totalAmount;
}
