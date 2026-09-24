package com.example.hotel.models.dto.response;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    @JsonProperty("IdLPH")
    private Integer idLPH;

    @JsonProperty("TenLPH")
    private String tenLPH;

    @JsonProperty("SoGiuong")
    private Integer soGiuong;

    @JsonProperty("SoNguoiToiDa")
    private Integer soNguoiToiDa;

    @JsonProperty("GiaNgay")
    private BigDecimal giaNgay;

    @JsonProperty("GiaGio")
    private BigDecimal giaGio;
}
