package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.ServiceUsageRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.ServiceUsageEstimateResponse;
import com.example.hotel.models.dto.response.ServiceUsageListResponse;
import com.example.hotel.services.IServiceUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dịch vụ khách sử dụng theo lượt lưu trú (chi tiết đặt phòng): UC-SVC-005.
 * Xem danh sách: lễ tân, quản lý, quản trị viên; kiểm tra chi phí và ghi nhận: chỉ lễ tân.
 */
@RestController
@RequestMapping("/api/booking-details")
@RequiredArgsConstructor
public class ServiceUsageController {

    private final IServiceUsageService serviceUsageService;

    /** GET /api/booking-details/{id}/services - dịch vụ đã sử dụng kèm tổng tiền */
    @GetMapping("/{id}/services")
    public ResponseEntity<ApiResponse<ServiceUsageListResponse>> getUsages(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                serviceUsageService.getUsages(id), "Lấy danh sách dịch vụ đã sử dụng thành công"));
    }

    /** POST /api/booking-details/{id}/services/estimate - body { lines: [{ serviceId, quantity }] } */
    @PostMapping("/{id}/services/estimate")
    public ResponseEntity<ApiResponse<ServiceUsageEstimateResponse>> estimate(
            @PathVariable Integer id, @Valid @RequestBody ServiceUsageRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                serviceUsageService.estimate(id, request), "Tính chi phí dịch vụ thành công"));
    }

    /** POST /api/booking-details/{id}/services - body { lines: [{ serviceId, quantity }], expectedTotalAmount? } */
    @PostMapping("/{id}/services")
    public ResponseEntity<ApiResponse<ServiceUsageListResponse>> record(
            @PathVariable Integer id, @Valid @RequestBody ServiceUsageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(), serviceUsageService.record(id, request), "Ghi nhận dịch vụ thành công"));
    }
}
