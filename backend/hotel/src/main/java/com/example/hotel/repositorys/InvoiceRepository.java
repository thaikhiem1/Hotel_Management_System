package com.example.hotel.repositorys;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.models.entities.invoices;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<invoices, Integer>, JpaSpecificationExecutor<invoices> {

    /** Chi tiết lưu trú đã có hóa đơn trả phòng chưa? (UC-REN-007 E3) */
    boolean existsByBookingDetailBookingDetailId(Integer bookingDetailId);

    Optional<invoices> findByBookingDetailBookingDetailId(Integer bookingDetailId);

    /** Danh sách hóa đơn kèm khách hàng, phòng, nhân viên để dựng phản hồi mà không truy vấn lặp */
    @Override
    @EntityGraph(attributePaths = { "rentalReceipt", "rentalReceipt.customer", "bookingDetail", "bookingDetail.room",
            "employee" })
    Page<invoices> findAll(Specification<invoices> spec, Pageable pageable);

    /** Một hóa đơn kèm đầy đủ thông tin để xem chi tiết và in */
    @Query("""
            select i from invoices i
            join fetch i.rentalReceipt rr
            join fetch rr.customer
            join fetch i.bookingDetail bd
            join fetch bd.room r
            join fetch r.roomTypes
            join fetch i.employee
            left join fetch i.paidBy
            where i.invoiceId = :id
            """)
    Optional<invoices> findDetailedById(@Param("id") Integer id);

    /** Khóa hóa đơn khi thanh toán để hai lần thanh toán đồng thời được xử lý lần lượt */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from invoices i where i.invoiceId = :id")
    Optional<invoices> findByIdForUpdate(@Param("id") Integer id);

    long countByInvoiceStatus(InvoiceStatus status);

    /** Tổng tiền các hóa đơn đã thanh toán trong khoảng [from, to) theo thời điểm thanh toán */
    @Query("select coalesce(sum(i.totalAmount), 0) from invoices i " +
            "where i.invoiceStatus = com.example.hotel.Enums.InvoiceStatus.PAID and i.paidAt >= :from and i.paidAt < :to")
    BigDecimal sumPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select count(i) from invoices i " +
            "where i.invoiceStatus = com.example.hotel.Enums.InvoiceStatus.PAID and i.paidAt >= :from and i.paidAt < :to")
    long countPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select coalesce(sum(i.totalAmount), 0) from invoices i where i.invoiceStatus = :status")
    BigDecimal sumTotalByStatus(@Param("status") InvoiceStatus status);
}
