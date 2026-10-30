package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.RentalEstimateRequest;
import com.example.hotel.models.dto.request.RentalReceiptCreateRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.AvailableRoomResponse;
import com.example.hotel.models.dto.response.RentalEstimateResponse;
import com.example.hotel.models.dto.response.RentalReceiptResponse;
import com.example.hotel.services.IRentalReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Lập phiếu thuê: UC-REN-001 (tạo phiếu), UC-REN-009 (phòng khả dụng), UC-REN-010 (tính chi phí).
 * Khách hàng tra cứu ở UC-REN-008 dùng GET /api/customers?search=...
 */
@RestController
@RequestMapping("/api/rental-receipts")
@RequiredArgsConstructor
public class RentalReceiptController {

    private final IRentalReceiptService rentalReceiptService;

    /**
     * UC-REN-009: GET /api/rental-receipts/available-rooms?checkIn=2026-12-20T14:00&checkOut=2026-12-22T12:00
     */
    @GetMapping("/available-rooms")
    public ResponseEntity<ApiResponse<List<AvailableRoomResponse>>> availableRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut) {

        List<AvailableRoomResponse> rooms = rentalReceiptService.findAvailableRooms(checkIn, checkOut);
        String message = rooms.isEmpty()
                ? "Không tìm thấy phòng khả dụng trong khoảng thời gian đã chọn."
                : "Tra cứu phòng khả dụng thành công";
        return ResponseEntity.ok(ApiResponse.success(rooms, message));
    }

    /**
     * UC-REN-010: POST /api/rental-receipts/estimate
     */
    @PostMapping("/estimate")
    public ResponseEntity<ApiResponse<RentalEstimateResponse>> estimate(
            @Valid @RequestBody RentalEstimateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                rentalReceiptService.estimate(request), "Tính chi phí dự kiến thành công"));
    }

    /**
     * UC-REN-001: POST /api/rental-receipts
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RentalReceiptResponse>> create(
            @Valid @RequestBody RentalReceiptCreateRequest request) {
        RentalReceiptResponse response = rentalReceiptService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(HttpStatus.CREATED.value(), response, "Tạo phiếu thuê thành công"));
    }

    /**
     * GET /api/rental-receipts?page=0&size=20 - phiếu thuê mới nhất trước
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RentalReceiptResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(ApiResponse.success(
                rentalReceiptService.getAll(pageable), "Lấy danh sách phiếu thuê thành công"));
    }

    /**
     * GET /api/rental-receipts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalReceiptResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                rentalReceiptService.getById(id), "Lấy thông tin phiếu thuê thành công"));
    }
}
