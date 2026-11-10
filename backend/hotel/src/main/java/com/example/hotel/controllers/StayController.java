package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;
import com.example.hotel.services.IStayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lưu trú theo chi tiết đặt phòng. Hiện có nhận phòng (UC-REN-004); chỉ RECEPTIONIST sử dụng.
 */
@RestController
@RequestMapping("/api/booking-details")
@RequiredArgsConstructor
public class StayController {

    private final IStayService stayService;

    /** GET /api/booking-details/{id}/check-in - kiểm tra sơ bộ và lấy thông tin mở biểu mẫu Check-in */
    @GetMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<CheckInContextResponse>> getCheckInContext(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                stayService.getCheckInContext(id), "Lấy thông tin nhận phòng thành công"));
    }

    /** POST /api/booking-details/{id}/check-in - body { actualGuests } */
    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(
            @PathVariable Integer id, @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                stayService.checkIn(id, request), "Nhận phòng thành công"));
    }
}
