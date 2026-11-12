package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Một bản ghi dịch vụ khách đã sử dụng (đơn giá là giá đã ghi nhận, không đổi khi giá dịch vụ hiện hành đổi).
 */
@Getter
@AllArgsConstructor
public class ServiceUsageItemResponse {
    private Integer serviceUsageId;
    private Integer serviceId;
    private String serviceName;
    private String unit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private LocalDateTime usedAt;
    private String recordedBy;
}
