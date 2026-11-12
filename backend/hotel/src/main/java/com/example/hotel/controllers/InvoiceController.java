package com.example.hotel.controllers;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.models.dto.request.PayInvoiceRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.InvoiceDetailResponse;
import com.example.hotel.models.dto.response.InvoiceStatsResponse;
import com.example.hotel.models.dto.response.InvoiceSummaryResponse;
import com.example.hotel.services.IInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Hóa đơn trả phòng. Mọi vai trò xem được; thanh toán chỉ RECEPTIONIST và MANAGER (xem SecurityConfig).
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final IInvoiceService invoiceService;

    /** GET /api/invoices?page&size&status&keyword&fromDate&toDate - hóa đơn mới nhất trước */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceSummaryResponse>>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(ApiResponse.success(
                invoiceService.getInvoices(page, size, status, keyword, fromDate, toDate),
                "Lấy danh sách hóa đơn thành công"));
    }

    /** GET /api/invoices/stats - số liệu tổng quan */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InvoiceStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getStats(), "Lấy thống kê hóa đơn thành công"));
    }

    /** GET /api/invoices/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDetailResponse>> getInvoice(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoice(id), "Lấy chi tiết hóa đơn thành công"));
    }

    /** POST /api/invoices/{id}/pay - body { paymentMethod: CASH | CARD | TRANSFER } */
    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceDetailResponse>> pay(
            @PathVariable Integer id, @Valid @RequestBody PayInvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.pay(id, request), "Thanh toán hóa đơn thành công"));
    }
}
