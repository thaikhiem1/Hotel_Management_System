package com.example.hotel.repositorys;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.models.entities.booking_details;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;

@Repository
public interface BookingDetailRepository extends JpaRepository<booking_details, Integer> {

    /**
     * Phòng có lượt đặt/lưu trú còn hiệu lực chồng lấn khoảng [start, end) không?
     * Hai khoảng chồng lấn khi start1 < end2 && start2 < end1; khoảng tiếp giáp không chồng lấn.
     */
    @Query("""
            select count(b) > 0 from booking_details b
            where b.room.roomId = :roomId
              and b.bookingStatus in :statuses
              and b.checkInAt < :end
              and b.checkOutAt > :start
            """)
    boolean existsOverlap(@Param("roomId") Integer roomId,
                          @Param("statuses") Collection<BookingStatus> statuses,
                          @Param("start") LocalDateTime start,
                          @Param("end") LocalDateTime end);
}
