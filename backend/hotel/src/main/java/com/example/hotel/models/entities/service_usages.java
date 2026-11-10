package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity service_usages - Dịch vụ khách đã sử dụng trong một lượt lưu trú (V5__service_usages_invoices.sql)
 */
@Entity
@Table(name = "service_usages")
@Getter
@Setter
@NoArgsConstructor
public class service_usages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_usage_id")
    private Integer serviceUsageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_detail_id", nullable = false)
    private booking_details bookingDetail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private services service;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /** Đơn giá áp dụng lúc ghi nhận, không đổi khi đơn giá dịch vụ hiện hành đổi */
    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by", nullable = false)
    private employees recordedBy;
}
