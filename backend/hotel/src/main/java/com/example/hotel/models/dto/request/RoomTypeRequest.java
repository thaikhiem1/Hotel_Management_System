package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    @NotBlank (message = "Tên loại phòng không được bỏ trống")
    @Size(max = 100, message = "Tên loại phòng tối đa 100 ký tự")
    @JsonProperty("room_type_name")
    private String roomTypeName;

    @NotNull(message = "Số giường không được bỏ trống")
    @Positive(message = "Số giường phải lớn hơn 0")
    @JsonProperty("number_of_beds")
    private Integer numberOfBeds;

    @NotNull(message = "Số khách tối đa không được bỏ trống")
    @Positive(message = "Số khách tối đa phải lớn hơn 0")
    @JsonProperty("maximum_occupancy")
    private Integer maximumOccupancy;

    @NotNull(message = "Giá theo ngày không được bỏ trống")
    @Positive(message = "Giá theo ngày phải lớn hơn 0")
    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @Positive(message = "Giá theo giờ phải lớn hơn 0")
    @JsonProperty("hourly_rate")
    private BigDecimal hourlyRate;
}
