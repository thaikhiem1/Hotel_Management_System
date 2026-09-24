package com.example.hotel.models.dto.request;

import com.example.hotel.Enums.RoomStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho tạo phòng mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @NotNull(message = "Mã phòng không được bỏ trống")
    @Size(max = 20, message = "Mã phòng tối đa 20 ký tự")
    @JsonProperty("MaPH")
    private String maPH;

    @NotNull(message = "Loại phòng không được bỏ trống")
    @Positive(message = "Id loại phòng phải lớn hơn 0")
    @JsonProperty("IdLPH")
    private Integer idLPH;

    @JsonProperty("TrangThaiPhong")
    private RoomStatus trangThaiPhong;

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    @JsonProperty("GhiChu")
    private String ghiChu;
}
