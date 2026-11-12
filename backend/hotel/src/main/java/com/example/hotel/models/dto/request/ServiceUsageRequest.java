package com.example.hotel.models.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/**
 * UC-SVC-005: yêu cầu kiểm tra chi phí hoặc ghi nhận các dịch vụ khách đã sử dụng trong một lượt lưu trú.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceUsageRequest {

    @NotEmpty(message = "Vui lòng chọn ít nhất một dịch vụ")
    @Valid
    private List<ServiceUsageLineRequest> lines;

    /** Tổng tiền người dùng đã xem và xác nhận (tùy chọn); khác với số máy chủ tính lại thì trả 409 kèm chi phí mới */
    private BigDecimal expectedTotalAmount;
}
