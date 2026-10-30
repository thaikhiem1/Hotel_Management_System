package com.example.hotel.controllers;

import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.RoomMapResponse;
import com.example.hotel.services.IRoomMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sơ đồ phòng tại trang chủ: UC-ROM-005 (hiển thị) và UC-ROM-006 (lọc), phân trang mặc định 0/16
 * giống các API danh sách khác (lọc bằng Specification, phân trang ở service).
 */
@RestController
@RequestMapping("/api/room-map")
@RequiredArgsConstructor
public class RoomMapController {

    private final IRoomMapService roomMapService;

    /**
     * GET /api/room-map?page=0&size=16&from=&to=&displayStatus=&keyword=
     *
     * @param from          bắt đầu khoảng xem (ISO yyyy-MM-ddTHH:mm[:ss]); mặc định là bây giờ
     * @param to            kết thúc khoảng xem; mặc định là hết ngày hiện tại (Asia/Ho_Chi_Minh)
     * @param displayStatus AVAILABLE | RESERVED | OCCUPIED | CLEANING | MAINTENANCE
     * @param keyword       mã phiếu thuê hoặc thông tin khách hàng (họ tên, SĐT, CCCD/hộ chiếu)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<RoomMapResponse>> getRoomMap(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String displayStatus,
            @RequestParam(required = false) String keyword) {

        RoomMapResponse response = roomMapService.getRoomMap(
                page, size, from, to, displayStatus, keyword);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy sơ đồ phòng thành công"));
    }
}
