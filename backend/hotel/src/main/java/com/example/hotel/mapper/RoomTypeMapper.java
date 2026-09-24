package com.example.hotel.mapper;

import org.springframework.stereotype.Component;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.LoaiPhong; // Changed from RoomType

@Component
public class RoomTypeMapper {
    public LoaiPhong toEntities(RoomTypeRequest request) {
        LoaiPhong roomType = new LoaiPhong();
        roomType.setTenLPH(request.getTenLPH());
        roomType.setSoGiuong(request.getSoGiuong());
        roomType.setSoNguoiToiDa(request.getSoNguoiToiDa());
        roomType.setGiaNgay(request.getGiaNgay());
        roomType.setGiaGio(request.getGiaGio());
        return roomType;
    }

    public RoomTypeResponse toRoomTypeResponse(LoaiPhong roomType) {
        return new RoomTypeResponse(roomType.getIdLPH(), roomType.getTenLPH(), roomType.getSoGiuong(),
                roomType.getSoNguoiToiDa(), roomType.getGiaNgay(), roomType.getGiaGio());
    }
}
