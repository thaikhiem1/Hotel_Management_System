package com.example.hotel.services.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.hotel.mapper.RoomMapper;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.LoaiPhong;
import com.example.hotel.models.entities.Phong;
import com.example.hotel.repositorys.roomRepository;
import com.example.hotel.repositorys.roomtypeRepositoty;
import com.example.hotel.services.IRoomService;

@Service
public class roomService implements IRoomService {
    private final roomRepository _RoomRepository;
    private final roomtypeRepositoty _RoomtypeRepositoty;
    private final RoomMapper _RoomMapper;

    public roomService(roomRepository _roomRepository, RoomMapper _roomMapper, roomtypeRepositoty _RoomtypeRepositoty) {
        this._RoomRepository = _roomRepository;
        this._RoomMapper = _roomMapper;
        this._RoomtypeRepositoty = _RoomtypeRepositoty;
    }

    public RoomResponse CreateRoom(RoomRequest request) {

        if (_RoomRepository.existsByMaPH(request.getMaPH())) {
            throw new IllegalArgumentException("Room label not exists");
        }

        LoaiPhong roomType = _RoomtypeRepositoty.findById(request.getIdLPH())
                .orElseThrow(() -> new RuntimeException("Room Type not exists"));

        Phong room = _RoomMapper.toEntity(request);
        room.setLoaiPhong(roomType);
        Phong savedRoom = _RoomRepository.save(room);
        return _RoomMapper.toRoomResponse(savedRoom);
    }

    public List<RoomResponse> GetAll() {
        return _RoomRepository.findAllWithLoaiPhong()
                .stream()
                .map(_RoomMapper::toRoomResponse)
                .toList();
    }
}
