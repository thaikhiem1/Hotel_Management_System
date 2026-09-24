package com.example.hotel.mapper;
import org.springframework.stereotype.Component;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.Phong;

@Component 
public class RoomMapper {
    // 1. Nhận request trả về Entities
    public Phong toEntity(RoomRequest request){
        Phong phong = new Phong();
        phong.setMaPH(request.getMaPH());
        phong.setGhiChu(request.getGhiChu());
        phong.setTrangThaiPhong(request.getTrangThaiPhong());
        return phong;
    }
    // 2. Nhận vào entities trả về response
    public RoomResponse toRoomResponse(Phong phong){
        if (phong == null) {
            throw new IllegalArgumentException("Phong entity is null");
        }
        
        return new RoomResponse(
            phong.getIdPH(),
            phong.getMaPH(),
            phong.getLoaiPhong() != null ? phong.getLoaiPhong().getIdLPH() : null,
            phong.getLoaiPhong() != null ? phong.getLoaiPhong().getTenLPH() : null,
            phong.getLoaiPhong() != null ? phong.getLoaiPhong().getGiaNgay() : null,
            phong.getLoaiPhong() != null ? phong.getLoaiPhong().getGiaGio() : null,
            phong.getTrangThaiPhong(),
            phong.getGhiChu()
        );
    }
}
