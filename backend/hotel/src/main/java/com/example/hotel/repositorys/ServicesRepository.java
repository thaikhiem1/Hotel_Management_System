package com.example.hotel.repositorys;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotel.models.entities.services;

@Repository
public interface ServicesRepository extends JpaRepository<services, Integer> {
    Boolean existsByServiceName(String servicesName);

    boolean existsByServiceNameAndServiceIdNot(String serviceName, Integer serviceId);

    Boolean existsByCategoryServiceCategoriesId(Integer serviceCategoriesId);
}
