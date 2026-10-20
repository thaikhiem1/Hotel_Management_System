package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.hotel.models.entities.customers;

@Repository
public interface CustomerRepository extends JpaRepository<customers, Integer>, JpaSpecificationExecutor<customers> {
    boolean existsByPhone(String phone);

    boolean existsByCitizenId(String citizenId);
}
