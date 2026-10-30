package com.example.hotel.models.dto.request;

import com.example.hotel.Enums.PricingMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Một dòng chi tiết đặt phòng trong yêu cầu tính chi phí / tạo phiếu thuê.
 * Không có đơn giá hay thành tiền: máy chủ tự xác định (BR-REN-010-07).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RentalDetailRequest {

    @NotNull(message = "Vui lòng chọn phòng")
    private Integer roomId;

    @NotNull(message = "Vui lòng nhập số lượng khách")
    @Positive(message = "Số lượng khách phải lớn hơn 0")
    private Integer numberOfGuests;

    @NotNull(message = "Vui lòng nhập thời gian nhận phòng dự kiến")
    private LocalDateTime checkIn;

    @NotNull(message = "Vui lòng nhập thời gian trả phòng dự kiến")
    private LocalDateTime checkOut;

    @NotNull(message = "Vui lòng chọn phương thức tính giá cho phòng")
    private PricingMethod pricingMethod;

}
