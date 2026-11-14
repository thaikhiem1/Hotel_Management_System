package com.example.hotel.controllers;

import com.example.hotel.config.ClockConfig;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.ReportOverviewResponse;
import com.example.hotel.services.IReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;


/**
 * Báo cáo và thống kê. Chỉ ADMIN và MANAGER xem và lọc (xem SecurityConfig).
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IReportService reportService;

    /**
     * GET /api/reports/overview?year=2026&month=11 - báo cáo một tháng (theo ngày);
     * bỏ month để xem cả năm (theo tháng). Bỏ year thì lấy năm hiện tại.
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<ReportOverviewResponse>> getOverview(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int effectiveYear = year != null ? year : LocalDate.now(ClockConfig.HOTEL_ZONE).getYear();
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getOverview(effectiveYear, month), "Lấy báo cáo thống kê thành công"));
    }
}
