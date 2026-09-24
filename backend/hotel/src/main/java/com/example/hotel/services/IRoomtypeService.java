package com.example.hotel.services;

import java.util.List;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;

public interface IRoomtypeService {
        RoomTypeResponse CreateRoomtype(RoomTypeRequest request);

        List<RoomTypeResponse> GetAll();
}