package com.example.hotel.repositorys;

import com.example.hotel.models.entities.invoices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<invoices, Integer> {

    /** Chi tiết lưu trú đã có hóa đơn trả phòng chưa? (UC-REN-007 E3) */
    boolean existsByBookingDetailBookingDetailId(Integer bookingDetailId);

    Optional<invoices> findByBookingDetailBookingDetailId(Integer bookingDetailId);
}
