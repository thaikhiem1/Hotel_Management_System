package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Số liệu tổng quan của các hóa đơn trong hệ thống (cho các thẻ thống kê).
 */
@Getter
@AllArgsConstructor
public class InvoiceStatsResponse {
    private long totalInvoices;
    private long paidInvoices;
    private long unpaidInvoices;
    /** Tổng tiền đã thu */
    private BigDecimal paidAmount;
    /** Tổng tiền còn phải thu */
    private BigDecimal unpaidAmount;
    /** Doanh thu hôm nay: tổng tiền các hóa đơn được thanh toán trong ngày (giờ khách sạn) và số hóa đơn đó */
    private BigDecimal paidTodayAmount;
    private long paidTodayInvoices;
}
