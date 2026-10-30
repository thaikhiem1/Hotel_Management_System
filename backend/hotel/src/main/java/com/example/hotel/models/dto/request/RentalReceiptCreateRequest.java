package com.example.hotel.models.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/**
 * UC-REN-001: yêu cầu tạo phiếu thuê.
 * Nhân viên lập phiếu lấy từ tài khoản đăng nhập, không nhận từ client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RentalReceiptCreateRequest {

    @NotNull(message = "Vui lòng chọn khách hàng")
    private Integer customerId;

    @NotEmpty(message = "Phiếu thuê phải có ít nhất một phòng")
    @Valid
    private List<RentalDetailRequest> details;

    /**
     * Tổng chi phí dự kiến mà RECEPTIONIST đã xem và xác nhận (không bắt buộc).
     * Chỉ dùng để phát hiện giá thay đổi: máy chủ luôn tự tính lại và không tin số này.
     */
    @PositiveOrZero(message = "Tổng chi phí xác nhận không hợp lệ")
    private BigDecimal expectedTotalAmount;
}
