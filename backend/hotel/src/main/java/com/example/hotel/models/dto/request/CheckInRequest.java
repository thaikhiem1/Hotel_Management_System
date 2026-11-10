package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * UC-REN-004: số khách thực tế khi nhận phòng. Giờ nhận phòng thực tế do máy chủ xác định.
 */
@Getter
@Setter
@NoArgsConstructor
public class CheckInRequest {

    @NotNull(message = "Số lượng khách thực tế không được để trống")
    @Min(value = 1, message = "Số lượng khách thực tế phải lớn hơn 0")
    private Integer actualGuests;
}
