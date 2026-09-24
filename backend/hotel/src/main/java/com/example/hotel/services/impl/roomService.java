package com.example.hotel.services.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.mapper.RoomMapper;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.LoaiPhong;
import com.example.hotel.models.entities.Phong;
import com.example.hotel.repositorys.roomRepository;
import com.example.hotel.repositorys.roomtypeRepositoty;
import com.example.hotel.services.IRoomService;
import jakarta.transaction.Transactional;

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

    @Override
    public RoomResponse CreateRoom(RoomRequest request) {
        // Kiểm tra mã phòng đã tồn tại chưa
        if (_RoomRepository.existsByMaPH(request.getMaPH())) {
            throw new IllegalArgumentException("Mã phòng đã tồn tại: " + request.getMaPH());
        }

        // Kiểm tra loại phòng có tồn tại không
        LoaiPhong roomType = _RoomtypeRepositoty.findById(request.getIdLPH())
                .orElseThrow(() -> new RuntimeException("Loại phòng không tồn tại với ID: " + request.getIdLPH()));

        Phong room = _RoomMapper.toEntity(request);
        room.setLoaiPhong(roomType);
        // Nếu client không truyền trangThaiPhong, mặc định là TRONG
        if (room.getTrangThaiPhong() == null) {
            room.setTrangThaiPhong(RoomStatus.TRONG);
        }
        Phong savedRoom = _RoomRepository.save(room);
        return _RoomMapper.toRoomResponse(savedRoom);
    }

    @Override
    public List<RoomResponse> GetAll() {
        return _RoomRepository.findAllWithLoaiPhong()
                .stream()
                .map(_RoomMapper::toRoomResponse)
                .toList();
    }

    @Transactional
    @Override
    public RoomResponse UpdateRoom(Integer idPH, RoomRequest request) {

        Phong existingRoom = _RoomRepository.findById(idPH)
                .orElseThrow(() -> new RuntimeException(
                        "Phòng không tồn tại với ID: " + idPH));

        if (!existingRoom.getMaPH().equals(request.getMaPH())
                && _RoomRepository.existsByMaPH(request.getMaPH())) {

            throw new IllegalArgumentException(
                    "Mã phòng đã tồn tại: " + request.getMaPH());
        }

        LoaiPhong roomType = _RoomtypeRepositoty.findById(request.getIdLPH())
                .orElseThrow(() -> new RuntimeException(
                        "Loại phòng không tồn tại với ID: "
                                + request.getIdLPH()));

        existingRoom.setMaPH(request.getMaPH());
        existingRoom.setLoaiPhong(roomType);
        existingRoom.setTrangThaiPhong(request.getTrangThaiPhong());
        existingRoom.setGhiChu(request.getGhiChu());

        Phong updatedRoom = _RoomRepository.save(existingRoom);

        return _RoomMapper.toRoomResponse(updatedRoom);
    }

    @Override
    public void DeleteRoom(Integer idPH) {
        // Kiểm tra phòng có tồn tại không
        Phong room = _RoomRepository.findById(idPH)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại với ID: " + idPH));

        // Xóa phòng
        _RoomRepository.delete(room);
    }
}
