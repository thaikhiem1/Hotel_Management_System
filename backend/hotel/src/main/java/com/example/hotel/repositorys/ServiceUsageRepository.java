package com.example.hotel.repositorys;

import com.example.hotel.models.entities.service_usages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceUsageRepository extends JpaRepository<service_usages, Integer> {

    /** Dịch vụ đã sử dụng của một lượt lưu trú, theo thứ tự ghi nhận */
    List<service_usages> findByBookingDetailBookingDetailIdOrderByUsedAtAscServiceUsageIdAsc(Integer bookingDetailId);

    /** Như trên, kèm dịch vụ và nhân viên ghi nhận để dựng phản hồi mà không truy vấn lặp */
    @Query("""
            select u from service_usages u
            join fetch u.service
            join fetch u.recordedBy
            where u.bookingDetail.bookingDetailId = :id
            order by u.usedAt, u.serviceUsageId
            """)
    List<service_usages> findDetailedByBookingDetailId(@Param("id") Integer id);

    /** Dịch vụ đã từng được ghi nhận cho khách chưa? (dịch vụ có lịch sử thì không xóa được) */
    boolean existsByServiceServiceId(Integer serviceId);
}
