package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO Request - Tạo/Cập nhật loại phòng
 * UC-RTY-001, UC-RTY-002
 */
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    
    @NotBlank(message = "Tên loại phòng không được để trống")
    @Size(max = 100, message = "Tên loại phòng không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Tên loại phòng chỉ được chứa chữ cái và khoảng trắng")
    @JsonProperty("roomTypeName")
    private String roomTypeName;

    @NotNull(message = "Số giường không được để trống")
    @Min(value = 1, message = "Số giường phải thuộc miền [1, 10]")
    @Max(value = 10, message = "Số giường phải thuộc miền [1, 10]")
    @JsonProperty("numberOfBeds")
    private Integer numberOfBeds;

    @NotNull(message = "Sức chứa tối đa không được để trống")
    @Min(value = 2, message = "Sức chứa tối đa phải thuộc miền [2, 20]")
    @Max(value = 20, message = "Sức chứa tối đa phải thuộc miền [2, 20]")
    @JsonProperty("maximumOccupancy")
    private Integer maximumOccupancy;

    @NotNull(message = "Giá thuê theo ngày không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thuê theo ngày không được âm")
    @Digits(integer = 16, fraction = 2, message = "Giá thuê theo ngày có tối đa 2 chữ số thập phân")
    @JsonProperty("dailyRate")
    private BigDecimal dailyRate;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thuê theo giờ không được âm")
    @Digits(integer = 16, fraction = 2, message = "Giá thuê theo giờ có tối đa 2 chữ số thập phân")
    @JsonProperty("hourlyRate")
    private BigDecimal hourlyRate;
}
