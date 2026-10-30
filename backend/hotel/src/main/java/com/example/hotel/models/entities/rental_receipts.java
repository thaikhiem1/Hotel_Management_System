package com.example.hotel.models.entities;

import com.example.hotel.Enums.ReceiptStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity rental_receipts - Phiếu thuê (V2__rental_receipts_booking_details.sql)
 */
@Entity
@Table(name = "rental_receipts")
@Getter
@Setter
@NoArgsConstructor
public class rental_receipts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rental_receipt_id")
    private Integer rentalReceiptId;

    /** Do trigger trong DB sinh (PT001...), chỉ đọc sau khi refresh */
    @Column(name = "receipt_code", insertable = false, updatable = false)
    private String receiptCode;

    @Column(name = "rental_date", nullable = false)
    private LocalDateTime rentalDate;

    /** Khách hàng đại diện */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private customers customer;

    /** Nhân viên lập phiếu (từ tài khoản đang đăng nhập) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private employees employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "receipt_status", nullable = false, length = 20)
    private ReceiptStatus receiptStatus = ReceiptStatus.DA_XAC_NHAN;

    /** Do trigger trong DB tổng hợp từ các chi tiết, không nhận từ giao diện */
    @Column(name = "estimated_total_amount", insertable = false, updatable = false,
            precision = 18, scale = 2)
    private BigDecimal estimatedTotalAmount;

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

    @OneToMany(mappedBy = "rentalReceipt", cascade = CascadeType.ALL)
    @BatchSize(size = 50)
    @OrderBy("bookingDetailId ASC")
    private List<booking_details> bookingDetails = new ArrayList<>();

    public void addBookingDetail(booking_details detail) {
        detail.setRentalReceipt(this);
        bookingDetails.add(detail);
    }
}
