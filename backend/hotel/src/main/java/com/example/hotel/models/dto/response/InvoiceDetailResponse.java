package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.PaymentMethod;
import com.example.hotel.Enums.PricingMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Đầy đủ thông tin một hóa đơn để xem chi tiết, thanh toán và in.
 */
@Getter
@AllArgsConstructor
public class InvoiceDetailResponse {
    private Integer invoiceId;
    private String invoiceCode;
    private InvoiceStatus invoiceStatus;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;
    private PaymentMethod paymentMethod;
    private String issuedBy;
    private String paidBy;

    private Integer rentalReceiptId;
    private String receiptCode;
    private String customerName;
    private String customerPhone;
    private String customerCitizenId;
    private String customerNationality;

    private Integer bookingDetailId;
    private String roomCode;
    private String roomTypeName;
    private Integer actualGuests;
    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckOut;

    private PricingMethod pricingMethod;
    private BigDecimal unitPrice;
    private Integer billedUnits;
    private BigDecimal roomAmount;
    private List<ServiceUsageItemResponse> services;
    private BigDecimal serviceAmount;
    private BigDecimal totalAmount;
}
