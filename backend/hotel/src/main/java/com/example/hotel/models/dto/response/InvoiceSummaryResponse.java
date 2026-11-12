package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Một dòng trong danh sách hóa đơn.
 */
@Getter
@AllArgsConstructor
public class InvoiceSummaryResponse {
    private Integer invoiceId;
    private String invoiceCode;
    private InvoiceStatus invoiceStatus;
    private BigDecimal totalAmount;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;
    private String receiptCode;
    private String customerName;
    private String customerPhone;
    private String roomCode;
    private String employeeName;
}
