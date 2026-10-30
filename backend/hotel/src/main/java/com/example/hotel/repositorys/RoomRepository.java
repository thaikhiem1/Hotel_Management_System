package com.example.hotel.repositorys;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.models.entities.rooms;
import jakarta.persistence.LockModeType;

@Repository
public interface RoomRepository extends JpaRepository<rooms, Integer> {
    boolean existsByRoomCode(String room_code);
    boolean existsByRoomTypesRoomTypeId(Integer room_type_id);

    /**
     * UC-REN-009: phòng sẵn sàng (không bảo trì/dọn dẹp) và không có lượt đặt/lưu trú
     * còn hiệu lực chồng lấn khoảng [start, end).
     */
    @Query("""
            select r from rooms r
            where r.roomStatus = :status
              and not exists (
                  select 1 from booking_details b
                  where b.room = r
                    and b.bookingStatus in :blocking
                    and b.checkInAt < :end
                    and b.checkOutAt > :start)
            order by r.roomCode
            """)
    List<rooms> findAvailable(@Param("status") RoomStatus status,
                              @Param("blocking") Collection<BookingStatus> blocking,
                              @Param("start") LocalDateTime start,
                              @Param("end") LocalDateTime end);

    /**
     * Khóa các phòng (theo thứ tự id để tránh deadlock) trước khi kiểm tra lại lịch khi tạo phiếu,
     * để hai giao dịch cùng đặt một phòng được xử lý lần lượt.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from rooms r where r.roomId in :ids order by r.roomId")
    List<rooms> findAllByIdForUpdate(@Param("ids") Collection<Integer> ids);
}
