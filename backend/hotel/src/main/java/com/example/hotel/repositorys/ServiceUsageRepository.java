package com.example.hotel.repositorys;

import com.example.hotel.models.entities.service_usages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceUsageRepository extends JpaRepository<service_usages, Integer> {

    /** Dịch vụ đã sử dụng của một lượt lưu trú, theo thứ tự ghi nhận */
    List<service_usages> findByBookingDetailBookingDetailIdOrderByUsedAtAscServiceUsageIdAsc(Integer bookingDetailId);
}
