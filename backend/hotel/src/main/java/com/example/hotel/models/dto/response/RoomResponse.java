package com.example.hotel.models.dto.response;
import java.math.BigDecimal;
import com.example.hotel.Enums.RoomStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor 
public class RoomResponse {
    @JsonProperty("IdPH")
    private Integer idPH;

    @JsonProperty("MaPH")
    private String maPH;

    @JsonProperty("IdLPH")
    private Integer idLPH;

    @JsonProperty("TenLPH")
    private String tenLPH;

    @JsonProperty("GiaNgay")
    private BigDecimal giaNgay;

    @JsonProperty("GiaGio")
    private BigDecimal giaGio;

    @JsonProperty("TrangThaiPhong")
    private RoomStatus trangThaiPhong;

    @JsonProperty("GhiChu")
    private String ghiChu;
}
