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
        Integer roomTypeId = request.getRoomTypeId();
        if (roomTypeId == null) {
            throw new IllegalArgumentException("Room type ID is required");
        }
        room_types roomType = _RoomTypeRepository.findById(roomTypeId)
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
    public RoomResponse UpdateRoom(Integer roomId, RoomRequest request) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID is require");
        }
        rooms existsRoom = _RoomRepository.findById(roomId).orElseThrow(() -> {
            throw new IllegalArgumentException("This room code not exists");
        });
        if (!existsRoom.getRoomCode().equals(request.getRoomCode())
                && _RoomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new RuntimeException("This room code existed");
        }
        Integer roomTypeId = request.getRoomTypeId();
        if (roomTypeId == null) {
            throw new IllegalArgumentException("Room type ID is require");
        }
        room_types existsRoomTypes = _RoomTypeRepository.findById(roomTypeId).orElseThrow(() -> {
            throw new IllegalArgumentException("This room type not exists");
        });
        existsRoom.setRoomTypes(existsRoomTypes);
        existsRoom.setRoomStatus(request.getRoomStatus());
        existsRoom.setNote(request.getNote());
        return _RoomMapper.toRoomResponse(_RoomRepository.save(existsRoom));
    }

    @Override
    public void DeletedRoom(Integer roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID is require");
        }
        rooms existsRoom = _RoomRepository.findById(roomId).orElseThrow(() -> {
            throw new IllegalArgumentException("This room not exists");
        });
        if (existsRoom == null) {
            throw new IllegalArgumentException("This room not exists");
        }
        _RoomRepository.delete(existsRoom);
    }
}
