package com.example.hotel.models.dto.response;
import java.math.BigDecimal;
import com.example.hotel.Enums.RoomStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter 
@NoArgsConstructor
@AllArgsConstructor 
public class RoomResponse {
    @JsonProperty("room_id")
    private Integer roomId;

    @JsonProperty("room_code")
    private String roomCode;

    @JsonProperty("room_type_id")
    private Integer roomTypeId;

    @JsonProperty("room_type_name")
    private String roomTypeName;

    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @JsonProperty("hourly_rate")
    private BigDecimal giaGio;

    @JsonProperty("room_status")
    private RoomStatus roomStatus;

    @JsonProperty("note")
    private String note;
}
