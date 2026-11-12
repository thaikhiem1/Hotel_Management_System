package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Danh sách dịch vụ khách đã sử dụng của một lượt lưu trú kèm tổng tiền (xem danh sách hoặc kết quả vừa ghi nhận).
 */
@Getter
@AllArgsConstructor
public class ServiceUsageListResponse {
    private Integer bookingDetailId;
    private String roomCode;
    private List<ServiceUsageItemResponse> usages;
    private BigDecimal totalAmount;
}
