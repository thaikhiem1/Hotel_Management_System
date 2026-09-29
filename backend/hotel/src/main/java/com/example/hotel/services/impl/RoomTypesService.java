package com.example.hotel.services.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.hotel.mapper.*;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.services.*;

@Service
public class RoomTypesService implements IRoomTypesService {

    private final RoomTypeMapper _roomTypeMapper;
    private final RoomTypeRepository _RoomTypeRepository;
    private final RoomRepository _RoomRepository;

    public RoomTypesService(RoomTypeMapper roomTypeMapper, RoomTypeRepository roomTypeRepository,
            RoomRepository roomRepository) {
        this._roomTypeMapper = roomTypeMapper;
        this._RoomTypeRepository = roomTypeRepository;
        this._RoomRepository = roomRepository;
    }

    @Override
    public RoomTypeResponse CreateRoomType(RoomTypeRequest request) {
        if (_RoomTypeRepository.existsByRoomTypeName(request.getRoomTypeName())) {
            throw new IllegalArgumentException("This room type name existed");
        }
        room_types RoomType = _roomTypeMapper.toEntities(request);
        if (RoomType == null) {
            return null;
        }
        room_types savedRoomType = _RoomTypeRepository.save(RoomType);
        return _roomTypeMapper.toRoomTypeResponse(savedRoomType);
    }

    @Override
    public List<RoomTypeResponse> GetAll() {
        return _RoomTypeRepository.findAllByOrderByRoomTypeIdAsc().stream()
                .map(_roomTypeMapper::toRoomTypeResponse)
                .toList();
    }

    @Override
    public RoomTypeResponse UpdateRoomType(Integer IdLPH, RoomTypeRequest request) {
        if(IdLPH == null){
            throw new IllegalArgumentException("Room type ID is require");
        }
        room_types existsRoom_types = _RoomTypeRepository.findById(IdLPH).orElseThrow(() -> {
            throw new RuntimeException("Room type ID not exists");
        });
        if (!existsRoom_types.getRoomTypeName().equals(request.getRoomTypeName())
                && _RoomTypeRepository.existsByRoomTypeName(request.getRoomTypeName())) {
            throw new IllegalArgumentException("This room type name existed");
        }
        existsRoom_types.setRoomTypeName(request.getRoomTypeName());
        existsRoom_types.setDailyRate(request.getDailyRate());
        existsRoom_types.setHourlyRate(request.getHourlyRate());
        existsRoom_types.setNumberOfBeds(request.getNumberOfBeds());
        existsRoom_types.setMaximumOccupancy(request.getMaximumOccupancy());
        room_types savedRoomType = _RoomTypeRepository.save(existsRoom_types);
        return _roomTypeMapper.toRoomTypeResponse(savedRoomType);
    }

    @Override
    public void DeletedRoomType(Integer idLPH) {
        if(idLPH == null){
            return;
        }
        room_types existsRoom_types = _RoomTypeRepository.findById(idLPH).orElseThrow(() -> {
            throw new IllegalArgumentException("Loại phòng này chưa tồn tại");
        });
        if(existsRoom_types == null){
            throw new IllegalArgumentException("This room type not exists");
        }
        boolean existsRoom = _RoomRepository.existsByRoomTypesRoomTypeId(idLPH);

        if (existsRoom) {
            throw new IllegalArgumentException(
                    "Không thể xóa loại phòng vì đang có phòng sử dụng loại phòng này");
        }

        _RoomTypeRepository.delete(existsRoom_types);
    }
}
