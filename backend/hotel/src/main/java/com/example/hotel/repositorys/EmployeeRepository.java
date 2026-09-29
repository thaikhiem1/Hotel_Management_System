package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.hotel.models.entities.employees;

@Repository
public interface EmployeeRepository extends JpaRepository<employees, Integer>, JpaSpecificationExecutor<employees> {
    Boolean existsByPhone(String phone);

    Boolean existsByCitizenId(String citizenId);

    Boolean existsByEmail(String email);
}
