package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho tạo/cập nhật loại phòng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    @NotNull(message = "Tên loại phòng không được bỏ trống")
    @Size(max = 100, message = "Tên loại phòng tối đa 100 ký tự")
    @JsonProperty("TenLPH")
    private String TenLPH;

    @NotNull(message = "Số giường không được bỏ trống")
    @Positive(message = "Số giường phải lớn hơn 0")
    @JsonProperty("SoGiuong")
    private Integer SoGiuong;

    @NotNull(message = "Số khách tối đa không được bỏ trống")
    @Positive(message = "Số khách tối đa phải lớn hơn 0")
    @JsonProperty("SoNguoiToiDa")
    private Integer SoNguoiToiDa;

    @NotNull(message = "Giá theo ngày không được bỏ trống")
    @Positive(message = "Giá theo ngày phải lớn hơn 0")
    @JsonProperty("GiaNgay")
    private BigDecimal GiaNgay;

    @Positive(message = "Giá theo giờ phải lớn hơn 0")
    @JsonProperty("GiaGio")
    private BigDecimal GiaGio;
}
