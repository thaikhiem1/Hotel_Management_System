package com.example.hotel.models.entities;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.PricingMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity booking_details - Chi tiết đặt phòng (V2__rental_receipts_booking_details.sql)
 */
@Entity
@Table(name = "booking_details")
@Getter
@Setter
@NoArgsConstructor
public class booking_details {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_detail_id")
    private Integer bookingDetailId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_receipt_id", nullable = false)
    private rental_receipts rentalReceipt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private rooms room;

    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    /** Ghi nhận khi nhận phòng (UC-REN-004) */
    @Column(name = "actual_number_of_guests")
    private Integer actualNumberOfGuests;

    /** Thời gian dự kiến */
    @Column(name = "check_in_at", nullable = false)
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at", nullable = false)
    private LocalDateTime checkOutAt;

    /** Thời gian thực tế */
    @Column(name = "actual_check_in_at")
    private LocalDateTime actualCheckInAt;

    @Column(name = "actual_check_out_at")
    private LocalDateTime actualCheckOutAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 20)
    private BookingStatus bookingStatus = BookingStatus.RESERVED;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_method", nullable = false, length = 10)
    private PricingMethod pricingMethod;

    /** Đơn giá đã chốt cho riêng chi tiết này (BR-REN-001-09) */
    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    /** Số đêm/giờ tính tiền dự kiến */
    @Column(name = "estimated_units", nullable = false)
    private Integer estimatedUnits;

    @Column(name = "estimated_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal estimatedAmount;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private employees cancelledBy;

    @Column(name = "cancel_reason", length = 255)
    private String cancelReason;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version;
}
