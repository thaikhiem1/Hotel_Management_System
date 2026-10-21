package com.example.hotel.services;

import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface cho RoomType Service
 * UC-RTY-001, UC-RTY-002, UC-RTY-003, UC-RTY-004
 */
public interface IRoomTypesService {
    
    /**
     * UC-RTY-001: Tạo loại phòng mới
     */
    RoomTypeResponse createRoomType(RoomTypeRequest request);
    
    /**
     * UC-RTY-004: Lấy danh sách loại phòng có phân trang
     */
    Page<RoomTypeResponse> getAllRoomTypes(Pageable pageable);
    
    /**
     * Lấy thông tin loại phòng theo ID
     */
    RoomTypeResponse getRoomTypeById(Integer id);
    
    /**
     * UC-RTY-002: Cập nhật loại phòng
     */
    RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request);
    
    /**
     * UC-RTY-003: Xóa loại phòng
     */
    void deleteRoomType(Integer id);
}
