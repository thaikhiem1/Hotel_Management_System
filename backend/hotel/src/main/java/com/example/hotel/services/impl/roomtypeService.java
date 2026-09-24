package com.example.hotel.services.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.hotel.mapper.RoomTypeMapper;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.LoaiPhong; // Changed from RoomType
import com.example.hotel.repositorys.roomtypeRepositoty;
import com.example.hotel.services.IRoomtypeService;

@Service
public class roomtypeService implements IRoomtypeService {
    private final RoomTypeMapper _roomTypeMapper;
    private final roomtypeRepositoty _roomtypeRepositoty;

    public roomtypeService(RoomTypeMapper _roomTypeMapper, roomtypeRepositoty _roomtypeRepositoty) {
        this._roomTypeMapper = _roomTypeMapper;
        this._roomtypeRepositoty = _roomtypeRepositoty;
    }

    @Override
    public RoomTypeResponse CreateRoomtype(RoomTypeRequest request) {
        if (_roomtypeRepositoty.existsByTenLPH(request.getTenLPH())) {
            throw new IllegalArgumentException("Tên loại phòng đã tồn tại");
        }
        LoaiPhong roomType = _roomTypeMapper.toEntities(request);
        LoaiPhong savedroomType = _roomtypeRepositoty.save(roomType);
        return _roomTypeMapper.toRoomTypeResponse(savedroomType);
    }

    @Override
    public List<RoomTypeResponse> GetAll() {
        return _roomtypeRepositoty.findAll().stream()
                .map(_roomTypeMapper::toRoomTypeResponse)
                .toList();
    }
}
