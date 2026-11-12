package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * UC-SVC-005: một dịch vụ khách sử dụng và số lượng. Đơn giá luôn do máy chủ lấy từ dịch vụ.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceUsageLineRequest {

    @NotNull(message = "Vui lòng chọn dịch vụ")
    private Integer serviceId;

    @NotNull(message = "Số lượng sử dụng không được để trống")
    @Min(value = 1, message = "Số lượng sử dụng phải lớn hơn 0")
    private Integer quantity;
}
