package com.example.hotel.services;

import com.example.hotel.models.dto.response.RoomMapResponse;

public interface IRoomMapService {

    /**
     * UC-ROM-005/006: sơ đồ phòng có phân trang, lọc theo khoảng thời gian, trạng thái hiển thị
     * và thông tin đặt phòng (mã phiếu, khách hàng).
     * Các tham số lọc là chuỗi thô để máy chủ báo lỗi theo đúng thông báo của use case.
     */
    RoomMapResponse getRoomMap(int page, int size, String from, String to,
                               String displayStatus, String keyword);
}
