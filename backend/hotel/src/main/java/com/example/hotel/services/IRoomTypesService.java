package com.example.hotel.services;
import java.util.List;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;

public interface IRoomTypesService {
        RoomTypeResponse CreateRoomType(RoomTypeRequest request);
        List<RoomTypeResponse> GetAll();
        RoomTypeResponse UpdateRoomType(Integer id, RoomTypeRequest request);
        void DeletedRoomType(Integer id);

}