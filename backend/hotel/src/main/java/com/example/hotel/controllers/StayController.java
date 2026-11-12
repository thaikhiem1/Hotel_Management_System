package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.request.CheckOutRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;
import com.example.hotel.models.dto.response.CheckOutContextResponse;
import com.example.hotel.models.dto.response.CheckOutResponse;
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
 * Lưu trú theo chi tiết đặt phòng. Có nhận phòng (UC-REN-004) và trả phòng (UC-REN-007); chỉ RECEPTIONIST sử dụng.
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

    /** GET /api/booking-details/{id}/check-out - kiểm tra lượt lưu trú và lấy chi phí tạm tính để mở biểu mẫu Check-out */
    @GetMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<CheckOutContextResponse>> getCheckOutContext(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                stayService.getCheckOutContext(id), "Lấy thông tin trả phòng thành công"));
    }

    /** POST /api/booking-details/{id}/check-out - body { expectedTotalAmount } (không bắt buộc) */
    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<CheckOutResponse>> checkOut(
            @PathVariable Integer id, @RequestBody(required = false) CheckOutRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                stayService.checkOut(id, request == null ? new CheckOutRequest() : request), "Trả phòng thành công"));
    }
}
