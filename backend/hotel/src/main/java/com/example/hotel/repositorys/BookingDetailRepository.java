package com.example.hotel.repositorys;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.models.entities.booking_details;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

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

    /**
     * Dữ liệu cho sơ đồ phòng của các phòng trong trang: mọi lượt đang lưu trú (CHECKED_IN) và các lượt
     * đã đặt (RESERVED) giao với khoảng [start, end). Lượt đã hủy/đã trả phòng không được lấy.
     */
    @Query("""
            select b from booking_details b
            join fetch b.room
            join fetch b.rentalReceipt rr
            join fetch rr.customer
            where b.room.roomId in :roomIds
              and (b.bookingStatus = com.example.hotel.Enums.BookingStatus.CHECKED_IN
                   or (b.bookingStatus = com.example.hotel.Enums.BookingStatus.RESERVED
                       and b.checkInAt < :end
                       and b.checkOutAt > :start))
            """)
    List<booking_details> findForRoomMap(@Param("roomIds") Collection<Integer> roomIds,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);
}
