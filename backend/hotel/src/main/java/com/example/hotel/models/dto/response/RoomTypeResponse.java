package com.example.hotel.models.dto.response;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    @JsonProperty("roomTypeId")
    private Integer roomTypeId;

    @JsonProperty("roomTypeName")
    private String roomTypeName;

    @JsonProperty("numberOfBeds")
    private Integer numberOfBeds;

    @JsonProperty("maximumOccupancy")
    private Integer maximumOccupancy;

    @JsonProperty("dailyRate")
    private BigDecimal dailyRate;

    @JsonProperty("hourlyRate")
    private BigDecimal hourlyRate;
}
