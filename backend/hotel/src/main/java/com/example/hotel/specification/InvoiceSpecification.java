package com.example.hotel.specification;

import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.models.entities.invoices;

import jakarta.persistence.criteria.Join;

/**
 * Điều kiện lọc danh sách hóa đơn (dùng với phân trang theo Specification).
 */
public final class InvoiceSpecification {
    private InvoiceSpecification() {
    }

    /** Lọc theo trạng thái thanh toán */
    public static Specification<invoices> hasStatus(InvoiceStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("invoiceStatus"), status);
    }

    /** Lập từ thời điểm (bao gồm) */
    public static Specification<invoices> issuedFrom(LocalDateTime from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("issuedAt"), from);
    }

    /** Lập trước thời điểm (không bao gồm) */
    public static Specification<invoices> issuedBefore(LocalDateTime to) {
        return (root, query, cb) -> to == null ? null : cb.lessThan(root.get("issuedAt"), to);
    }

    /** Tìm theo mã hóa đơn, mã phiếu thuê, tên hoặc số điện thoại khách hàng, mã phòng */
    public static Specification<invoices> search(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String like = "%" + keyword.trim().toLowerCase() + "%";
            Join<Object, Object> receipt = root.join("rentalReceipt");
            Join<Object, Object> customer = receipt.join("customer");
            Join<Object, Object> room = root.join("bookingDetail").join("room");
            return cb.or(
                    cb.like(cb.lower(root.get("invoiceCode")), like),
                    cb.like(cb.lower(receipt.get("receiptCode")), like),
                    cb.like(cb.lower(customer.get("fullName")), like),
                    cb.like(cb.lower(customer.get("phone")), like),
                    cb.like(cb.lower(room.get("roomCode")), like));
        };
    }
}
