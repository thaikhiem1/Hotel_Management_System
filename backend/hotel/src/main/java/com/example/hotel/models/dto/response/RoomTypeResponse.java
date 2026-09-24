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
    private Integer IdLPH;

    @JsonProperty("TenLPH")
    private String TenLPH;

    @JsonProperty("SoGiuong")
    private Integer SoGiuong;

    @JsonProperty("SoNguoiToiDa")
    private Integer SoNguoiToiDa;

    @JsonProperty("GiaNgay")
    private BigDecimal GiaNgay;

    @JsonProperty("GiaGio")
    private BigDecimal GiaGio;
}
