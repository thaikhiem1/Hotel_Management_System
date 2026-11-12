package com.example.hotel.repositorys;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;

import com.example.hotel.models.entities.services;

@Repository
public interface ServicesRepository extends JpaRepository<services, Integer> {
    Boolean existsByServiceName(String servicesName);

    boolean existsByServiceNameAndServiceIdNot(String serviceName, Integer serviceId);

    Boolean existsByCategoryServiceCategoriesId(Integer serviceCategoriesId);

    /** Dịch vụ đang được phép cung cấp */
    List<services> findByIsActiveTrue();

    /**
     * Khóa các dịch vụ (theo thứ tự id để tránh deadlock) trước khi kiểm tra lại tồn kho và trừ tồn kho,
     * để hai lần ghi nhận đồng thời trên cùng dịch vụ được xử lý lần lượt (UC-SVC-005 E6).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from services s where s.serviceId in :ids order by s.serviceId")
    List<services> findAllByIdForUpdate(@Param("ids") Collection<Integer> ids);
}
