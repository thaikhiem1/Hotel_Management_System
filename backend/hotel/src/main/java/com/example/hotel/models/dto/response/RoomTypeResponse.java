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
    @JsonProperty("room_type_id")
    private Integer roomTypeId;

    @JsonProperty("room_type_name")
    private String roomTypeName;

    @JsonProperty("number_of_beds")
    private Integer numberOfBeds;

    @JsonProperty("maximum_occupancy")
    private Integer maximumOccupancy;

    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @JsonProperty("hourly_rate")
    private BigDecimal hourlyRate;
}
