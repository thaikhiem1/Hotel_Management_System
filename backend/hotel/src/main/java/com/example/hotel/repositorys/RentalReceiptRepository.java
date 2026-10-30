package com.example.hotel.repositorys;

import com.example.hotel.models.entities.rental_receipts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalReceiptRepository extends JpaRepository<rental_receipts, Integer> {

    // Danh sách phân trang dùng findAll(Pageable) có sẵn; kèm khách hàng và nhân viên để tránh truy vấn lặp
    @Override
    @EntityGraph(attributePaths = {"customer", "employee"})
    Page<rental_receipts> findAll(Pageable pageable);
}
