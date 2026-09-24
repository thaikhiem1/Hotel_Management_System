package com.example.hotel.services;

import java.util.List;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;

public interface IRoomtypeService {
        RoomTypeResponse CreateRoomtype(RoomTypeRequest request);

        RoomTypeResponse UpdateRoomType(Integer IdLPH, RoomTypeRequest request);

        List<RoomTypeResponse> GetAll();

        void DeletedRoomType(Integer IdLPH);
}