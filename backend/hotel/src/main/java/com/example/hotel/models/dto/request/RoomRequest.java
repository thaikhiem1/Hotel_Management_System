package com.example.hotel.models.dto.request;

import com.example.hotel.Enums.RoomStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class RoomRequest {
    @NotNull(message = "Mã phòng không được bỏ trống")
    @Size(max = 20, message = "Mã phòng tối đa 20 ký tự")
    @JsonProperty("room_code")
    private String roomCode;
    
    @NotNull(message = "Loại phòng không được bỏ trống")
    @Positive(message = "Id loại phòng phải lớn hơn 0")
    @JsonProperty("room_type_id")
    private Integer roomTypeId;

    @JsonProperty("room_status")
    private RoomStatus roomStatus;
    
    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    @JsonProperty("note")
    private String note;
}
