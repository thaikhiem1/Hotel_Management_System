package com.example.hotel.models.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * UC-REN-007: xác nhận trả phòng. expectedTotalAmount là tổng chi phí lễ tân đã xem trên biểu mẫu;
 * nếu có và khác số máy chủ tính lại thì không trả phòng mà báo chi phí mới (không bắt buộc).
 */
@Getter
@Setter
@NoArgsConstructor
public class CheckOutRequest {
    private BigDecimal expectedTotalAmount;
}
