package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hotel.models.entities.service_categories;

@Repository
public interface ServiceCategoriesRepository extends JpaRepository<service_categories, Integer> {
        Boolean existsByServiceCategoriesName(String serviceCategoriesName);
}
