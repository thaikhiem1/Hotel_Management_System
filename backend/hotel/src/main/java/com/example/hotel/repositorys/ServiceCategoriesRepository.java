package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotel.models.entities.service_categories;

public interface ServiceCategoriesRepository extends JpaRepository<service_categories, Integer> {
        Boolean existsByServiceCategoriesName(String serviceCategoriesName);
}
