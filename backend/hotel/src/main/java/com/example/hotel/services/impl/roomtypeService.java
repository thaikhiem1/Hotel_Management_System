package com.example.hotel.services.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.hotel.mapper.RoomTypeMapper;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.LoaiPhong; // Changed from RoomType
import com.example.hotel.repositorys.roomRepository;
import com.example.hotel.repositorys.roomtypeRepositoty;
import com.example.hotel.services.IRoomtypeService;
import java.util.Optional;

@Service
public class roomtypeService implements IRoomtypeService {
    private final RoomTypeMapper _roomTypeMapper;
    private final roomtypeRepositoty _roomtypeRepositoty;
    private final roomRepository _roomRepository;

    public roomtypeService(RoomTypeMapper roomTypeMapper, roomtypeRepositoty roomtypeRepositoty,
            roomRepository roomRepository) {
        this._roomTypeMapper = roomTypeMapper;
        this._roomtypeRepositoty = roomtypeRepositoty;
        this._roomRepository = roomRepository;
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
        return _roomtypeRepositoty.findAllByOrderByIdLPHAsc().stream()
                .map(_roomTypeMapper::toRoomTypeResponse)
                .toList();
    }

    @Override
    public RoomTypeResponse UpdateRoomType(Integer IdLPH, RoomTypeRequest request) {
        LoaiPhong existsLoaiPhong = _roomtypeRepositoty.findById(IdLPH).orElseThrow(() -> {
            throw new RuntimeException("ID loại phòng không tồn tại" + IdLPH);
        });
        if (!existsLoaiPhong.getTenLPH().equals(request.getTenLPH())
                && _roomtypeRepositoty.existsByTenLPH(request.getTenLPH())) {
            throw new IllegalArgumentException("Tên phòng này đã tồn tại");
        }
        existsLoaiPhong.setTenLPH(request.getTenLPH());
        existsLoaiPhong.setGiaNgay(request.getGiaNgay());
        existsLoaiPhong.setGiaGio(request.getGiaGio());
        existsLoaiPhong.setSoGiuong(request.getSoGiuong());
        existsLoaiPhong.setSoNguoiToiDa(request.getSoNguoiToiDa());
        LoaiPhong saveLoaiPhong = _roomtypeRepositoty.save(existsLoaiPhong);
        return _roomTypeMapper.toRoomTypeResponse(saveLoaiPhong);
    }

    @Override
    public void DeletedRoomType(Integer idLPH) {
        LoaiPhong existsLoaiPhong = _roomtypeRepositoty.findById(idLPH).orElseThrow(() -> {
            throw new RuntimeException("Loại phòng này chưa tồn tại");
        });

        boolean existsRoom = _roomRepository.existsByLoaiPhong_IdLPH(idLPH);

        if (existsRoom) {
            throw new RuntimeException(
                    "Không thể xóa loại phòng vì đang có phòng sử dụng loại phòng này");
        }

        _roomtypeRepositoty.delete(existsLoaiPhong);
    }
}
