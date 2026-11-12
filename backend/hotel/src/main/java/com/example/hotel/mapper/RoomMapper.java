package com.example.hotel.mapper;

import org.springframework.stereotype.Component;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.rooms;

@Component
public class RoomMapper {
    // 1. Nhận request trả về Entities
    public rooms toEntity(RoomRequest request) {
        rooms room = new rooms();
        room.setRoomCode(request.getRoomCode());
        room.setNote(request.getNote());
        room.setRoomStatus(request.getRoomStatus());
        return room;
    }

    // 2. Nhận vào entities trả về response
    public RoomResponse toRoomResponse(rooms room) {
        return toRoomResponse(room, false, false);
    }

    public RoomResponse toRoomResponse(rooms room, boolean hasActiveStay, boolean hasUpcomingBooking) {
        if (room == null) {
            throw new IllegalArgumentException("Phong entity is null");
        }

        return new RoomResponse(
                room.getRoomId(),
                room.getRoomCode(),
                room.getRoomTypes() != null ? room.getRoomTypes().getRoomTypeId() : null,
                room.getRoomTypes() != null ? room.getRoomTypes().getRoomTypeName() : null,
                room.getRoomTypes() != null ? room.getRoomTypes().getDailyRate() : null,
                room.getRoomTypes() != null ? room.getRoomTypes().getHourlyRate() : null,
                room.getRoomStatus(),
                room.getNote(),
                hasActiveStay,
                hasUpcomingBooking);
    }
}
