package com.example.hotel.models.entities;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.PaymentMethod;
import com.example.hotel.Enums.PricingMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity invoices - Hóa đơn trả phòng, mỗi lượt lưu trú tối đa một hóa đơn (V5__service_usages_invoices.sql)
 */
@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class invoices {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    /** Do trigger trong DB sinh từ khóa chính, đọc lại bằng refresh sau khi lưu */
    @Column(name = "invoice_code", nullable = false, length = 20, insertable = false, updatable = false)
    private String invoiceCode;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_detail_id", nullable = false, unique = true)
    private booking_details bookingDetail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_receipt_id", nullable = false)
    private rental_receipts rentalReceipt;

    /** Nhân viên thực hiện trả phòng */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private employees employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_method", nullable = false, length = 10)
    private PricingMethod pricingMethod;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "billed_units", nullable = false)
    private Integer billedUnits;

    @Column(name = "room_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal roomAmount;

    @Column(name = "service_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal serviceAmount;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_status", nullable = false, length = 10)
    private InvoiceStatus invoiceStatus = InvoiceStatus.UNPAID;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** Phương thức và nhân viên thu tiền, chỉ có khi đã thanh toán (V8) */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by")
    private employees paidBy;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version;
}
