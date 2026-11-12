package com.example.hotel.services;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.models.dto.request.PayInvoiceRequest;
import com.example.hotel.models.dto.response.InvoiceDetailResponse;
import com.example.hotel.models.dto.response.InvoiceStatsResponse;
import com.example.hotel.models.dto.response.InvoiceSummaryResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

/**
 * Hóa đơn trả phòng: xem danh sách, xem chi tiết, thanh toán.
 */
public interface IInvoiceService {

    /** Danh sách hóa đơn mới nhất trước, lọc theo trạng thái, từ khóa và khoảng ngày lập (cả hai đầu đều bao gồm) */
    Page<InvoiceSummaryResponse> getInvoices(int page, int size, InvoiceStatus status, String keyword,
            LocalDate fromDate, LocalDate toDate);

    /** Số liệu tổng quan của toàn bộ hóa đơn */
    InvoiceStatsResponse getStats();

    InvoiceDetailResponse getInvoice(Integer invoiceId);

    /** Thanh toán một hóa đơn chưa thanh toán; thời điểm thanh toán và nhân viên thu tiền do máy chủ xác định */
    InvoiceDetailResponse pay(Integer invoiceId, PayInvoiceRequest request);
}
