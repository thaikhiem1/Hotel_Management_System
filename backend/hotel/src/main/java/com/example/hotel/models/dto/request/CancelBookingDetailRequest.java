package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * UC-REN-002: yêu cầu hủy một chi tiết đặt phòng. Thời điểm hủy và nhân viên hủy do máy chủ xác định.
 */
@Getter
@Setter
@NoArgsConstructor
public class CancelBookingDetailRequest {

    @NotBlank(message = "Vui lòng nhập lý do hủy")
    @Size(max = 255, message = "Lý do hủy tối đa 255 ký tự")
    private String reason;
}
