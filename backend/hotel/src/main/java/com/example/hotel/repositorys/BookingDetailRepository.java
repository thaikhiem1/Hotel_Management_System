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
import java.util.Optional;

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

    /** Có lượt lưu trú (trạng thái cho trước) của phòng này không? Dùng để chặn hai lượt đang lưu trú cùng phòng */
    boolean existsByRoomRoomIdAndBookingStatus(Integer roomId, BookingStatus status);

    /** Phòng đã từng có lượt đặt/lưu trú (kể cả đã hủy hoặc đã trả) chưa? Phòng có lịch sử thì không xóa được */
    boolean existsByRoomRoomId(Integer roomId);

    /** Mã các phòng có ít nhất một lượt ở trạng thái cho trước (dùng gắn cờ cho danh sách quản lý phòng) */
    @Query("select distinct b.room.roomId from booking_details b where b.bookingStatus = :status")
    List<Integer> findRoomIdsByStatus(@Param("status") BookingStatus status);

    /** Mã phòng của chi tiết, để khóa phòng trước khi đọc lại trạng thái chi tiết */
    @Query("select b.room.roomId from booking_details b where b.bookingDetailId = :id")
    Optional<Integer> findRoomIdById(@Param("id") Integer id);

    /** Mã phiếu thuê của chi tiết, để khóa phiếu trước khi cập nhật trạng thái */
    @Query("select b.rentalReceipt.rentalReceiptId from booking_details b where b.bookingDetailId = :id")
    Optional<Integer> findReceiptIdById(@Param("id") Integer id);

    /** Trạng thái của mọi chi tiết thuộc một phiếu thuê, để xác định lại trạng thái phiếu sau khi trả phòng */
    @Query("select b.bookingStatus from booking_details b where b.rentalReceipt.rentalReceiptId = :receiptId")
    List<BookingStatus> findStatusesByReceiptId(@Param("receiptId") Integer receiptId);

    /** Chi tiết kèm phòng, loại phòng, phiếu thuê và khách hàng cho nghiệp vụ nhận phòng/trả phòng */
    @Query("""
            select b from booking_details b
            join fetch b.room r
            join fetch r.roomTypes
            join fetch b.rentalReceipt rr
            join fetch rr.customer
            where b.bookingDetailId = :id
            """)
    Optional<booking_details> findWithStayInfo(@Param("id") Integer id);

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
