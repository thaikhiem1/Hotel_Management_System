package com.example.hotel.mapper;

import org.springframework.stereotype.Component;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.room_types;

@Component
public class RoomTypeMapper {
    public room_types toEntities(RoomTypeRequest request) {
        room_types roomType = new room_types();
        roomType.setRoomTypeName(request.getRoomTypeName());
        roomType.setNumberOfBeds(request.getNumberOfBeds());
        roomType.setMaximumOccupancy(request.getMaximumOccupancy());
        roomType.setDailyRate(request.getDailyRate());
        roomType.setHourlyRate(request.getHourlyRate());
        return roomType;
    }

    public RoomTypeResponse toRoomTypeResponse(room_types roomType) {
        if(roomType == null){
            throw new IllegalArgumentException("Room type not exists");
        }
        return new RoomTypeResponse(roomType.getRoomTypeId(), roomType.getRoomTypeName(),
                roomType.getNumberOfBeds(),
                roomType.getMaximumOccupancy(), roomType.getDailyRate(), roomType.getHourlyRate());
    }
}
