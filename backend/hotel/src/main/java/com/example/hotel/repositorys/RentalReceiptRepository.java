package com.example.hotel.repositorys;

import com.example.hotel.models.entities.rental_receipts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalReceiptRepository extends JpaRepository<rental_receipts, Integer> {

    @EntityGraph(attributePaths = {"customer", "employee"})
    Page<rental_receipts> findAllByOrderByRentalReceiptIdDesc(Pageable pageable);
}
