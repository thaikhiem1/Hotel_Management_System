package com.example.hotel.services;

import java.util.List;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;

public interface IRoomService {
    RoomResponse CreateRoom(RoomRequest request);

    List<RoomResponse> GetAll();

    RoomResponse UpdateRoom(Integer id, RoomRequest request);

    void DeletedRoom(Integer id);
}