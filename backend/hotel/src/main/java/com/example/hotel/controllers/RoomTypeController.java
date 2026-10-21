package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.services.IRoomTypesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý loại phòng
 * Endpoints: /api/roomTypes
 * UC-RTY-001, UC-RTY-002, UC-RTY-003, UC-RTY-004
 */
@RestController
@RequestMapping("/api/roomTypes")
@CrossOrigin(origins = {"http://localhost:5173"})
@RequiredArgsConstructor
public class RoomTypeController {
    
    private final IRoomTypesService roomTypeService;

    /**
     * UC-RTY-001: Thêm loại phòng mới
     * 
     * POST /api/roomTypes
     * 
     * Request Body:
     * {
     *   "roomTypeName": "Phòng Deluxe",
     *   "numberOfBeds": 2,
     *   "maximumOccupancy": 4,
     *   "dailyRate": 500000,
     *   "hourlyRate": 50000
     * }
     * 
     * Success Response (201):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 201,
     *   "message": "Thêm loại phòng thành công",
     *   "data": {...}
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Dữ liệu không hợp lệ
     * - 409 Conflict: Tên loại phòng đã tồn tại
     * - 500 Internal Server Error: Lỗi server
     * 
     * @param request Thông tin loại phòng
     * @return ResponseEntity<ApiResponse<RoomTypeResponse>>
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RoomTypeResponse>> createRoomType(
            @Valid @RequestBody RoomTypeRequest request) {
        
        RoomTypeResponse response = roomTypeService.createRoomType(request);
        
        ApiResponse<RoomTypeResponse> apiResponse = ApiResponse.success(
            201,
            response,
            "Thêm loại phòng thành công"
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * UC-RTY-004: Xem danh sách loại phòng có phân trang
     * 
     * GET /api/roomTypes?page=0&size=16
     * 
     * Query Parameters:
     * - page: Số trang (bắt đầu từ 0), mặc định = 0
     * - size: Số bản ghi mỗi trang, mặc định = 16
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Lấy danh sách loại phòng thành công",
     *   "data": {
     *     "content": [...],
     *     "totalElements": 10,
     *     "totalPages": 1,
     *     "size": 16,
     *     "number": 0
     *   }
     * }
     * 
     * @param page Số trang (mặc định 0)
     * @param size Số bản ghi mỗi trang (mặc định 16)
     * @return ResponseEntity<ApiResponse<Page<RoomTypeResponse>>>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoomTypeResponse>>> getAllRoomTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("roomTypeId").ascending());
        Page<RoomTypeResponse> roomTypesPage = roomTypeService.getAllRoomTypes(pageable);
        
        ApiResponse<Page<RoomTypeResponse>> apiResponse = ApiResponse.success(
            roomTypesPage,
            "Lấy danh sách loại phòng thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Lấy thông tin loại phòng theo ID
     * 
     * GET /api/roomTypes/{id}
     * 
     * @param id ID loại phòng
     * @return ResponseEntity<ApiResponse<RoomTypeResponse>>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> getRoomTypeById(
            @PathVariable Integer id) {
        
        RoomTypeResponse response = roomTypeService.getRoomTypeById(id);
        
        ApiResponse<RoomTypeResponse> apiResponse = ApiResponse.success(
            response,
            "Lấy thông tin loại phòng thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * UC-RTY-002: Cập nhật loại phòng
     * 
     * PUT /api/roomTypes/{id}
     * 
     * Request Body: Giống như POST
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Cập nhật loại phòng thành công",
     *   "data": {...}
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Dữ liệu không hợp lệ
     * - 404 Not Found: Loại phòng không tồn tại
     * - 409 Conflict: Tên trùng với loại phòng khác
     * - 500 Internal Server Error: Lỗi server
     * 
     * @param id ID loại phòng cần cập nhật
     * @param request Thông tin mới
     * @return ResponseEntity<ApiResponse<RoomTypeResponse>>
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> updateRoomType(
            @PathVariable Integer id,
            @Valid @RequestBody RoomTypeRequest request) {
        
        RoomTypeResponse response = roomTypeService.updateRoomType(id, request);
        
        ApiResponse<RoomTypeResponse> apiResponse = ApiResponse.success(
            response,
            "Cập nhật loại phòng thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * UC-RTY-003: Xóa loại phòng
     * 
     * DELETE /api/roomTypes/{id}
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Xóa loại phòng thành công",
     *   "data": null
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Loại phòng đang được sử dụng
     * - 404 Not Found: Loại phòng không tồn tại
     * - 500 Internal Server Error: Lỗi server
     * 
     * @param id ID loại phòng cần xóa
     * @return ResponseEntity<ApiResponse<Void>>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(
            @PathVariable Integer id) {
        
        roomTypeService.deleteRoomType(id);
        
        ApiResponse<Void> apiResponse = ApiResponse.success(
            "Xóa loại phòng thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }
}
