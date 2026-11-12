package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * UC-SVC-005 bước 10-11: một dòng dịch vụ sau khi máy chủ xác định đơn giá và thành tiền.
 */
@Getter
@AllArgsConstructor
public class ServiceUsageLineEstimate {
    private Integer serviceId;
    private String serviceName;
    private String unit;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal amount;
    /** Số lượng tồn kho hiện tại; null nếu dịch vụ không quản lý tồn kho */
    private Integer availableStock;
}
