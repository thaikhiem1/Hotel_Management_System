package com.example.hotel.repositorys;

import com.example.hotel.models.entities.rental_receipts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface RentalReceiptRepository extends JpaRepository<rental_receipts, Integer> {

    // Danh sách phân trang dùng findAll(Pageable) có sẵn; kèm khách hàng và nhân viên để tránh truy vấn lặp
    @Override
    @EntityGraph(attributePaths = {"customer", "employee"})
    Page<rental_receipts> findAll(Pageable pageable);

    /** Khóa phiếu thuê khi cập nhật trạng thái (nhận phòng, trả phòng), sau khi đã khóa phòng */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from rental_receipts r where r.rentalReceiptId = :id")
    Optional<rental_receipts> findByIdForUpdate(@Param("id") Integer id);
}
