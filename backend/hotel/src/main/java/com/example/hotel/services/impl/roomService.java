package com.example.hotel.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import com.example.hotel.mapper.RoomMapper;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.services.IRoomService;;

@Service
public class RoomService implements IRoomService {
    private final RoomRepository _RoomRepository;
    private final RoomTypeRepository _RoomTypeRepository;
    private final RoomMapper _RoomMapper;

    public RoomService(RoomRepository _roomRepository, RoomMapper _roomMapper, RoomTypeRepository _roomTypeRepository) {
        this._RoomRepository = _roomRepository;
        this._RoomMapper = _roomMapper;
        this._RoomTypeRepository = _roomTypeRepository;
    }

    @Override
    public RoomResponse CreateRoom(RoomRequest request) {

        if (_RoomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new IllegalArgumentException("Room label not exists");
        }

        room_types roomType = _RoomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Room Type not exists"));

        rooms room = _RoomMapper.toEntity(request);
        room.setRoomTypes(roomType);
        rooms savedRoom = _RoomRepository.save(room);
        return _RoomMapper.toRoomResponse(savedRoom);
    }

    @Override
    public List<RoomResponse> GetAll() {
        return _RoomRepository.findAll()
                .stream()
                .map(_RoomMapper::toRoomResponse)
                .toList();
    }

    @Override
    public RoomResponse UpdateRoom(Integer id, RoomRequest request) {
        rooms existsRoom = _RoomRepository.findById(id).orElseThrow(() -> {
            throw new IllegalArgumentException("Phòng này không tồn tại");
        });
        if (!existsRoom.getRoomCode().equals(request.getRoomCode())
                && _RoomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new RuntimeException("Mã phòng này đã tồn tại");
        }
        room_types existsRoomTypes = _RoomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            throw new IllegalArgumentException("Loại phòng này không tồn tại");
        });
        existsRoom.setRoomTypes(existsRoomTypes);
        existsRoom.setRoomStatus(request.getRoomStatus());
        existsRoom.setNote(request.getNote());
        return _RoomMapper.toRoomResponse(_RoomRepository.save(existsRoom));
    }

    @Override
    public void DeletedRoom(Integer id) {
        rooms existsRoom = _RoomRepository.findById(id).orElseThrow(() -> {
            throw new IllegalArgumentException("Phòng này chưa tồn tại");
        });
        _RoomRepository.delete(existsRoom);
    }
}
