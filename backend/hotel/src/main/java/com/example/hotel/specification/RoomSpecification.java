package com.example.hotel.specification;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.RoomDisplayStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.rooms;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Specification cho sơ đồ phòng - UC-ROM-005, UC-ROM-006.
 * Phòng là tập gốc; điều kiện theo đặt phòng/lưu trú dùng EXISTS nên mỗi phòng chỉ xuất hiện một lần
 * dù có nhiều chi tiết đặt phòng.
 */
public class RoomSpecification {

    /**
     * Lọc theo trạng thái hiển thị tổng hợp (UC-ROM-005 quy tắc 5), ưu tiên:
     * bảo trì > dọn dẹp > đang có khách > đã đặt trong khoảng [start, end) > sẵn sàng.
     */
    public static Specification<rooms> hasDisplayStatus(RoomDisplayStatus display, LocalDateTime start, LocalDateTime end) {
        return (root, query, criteriaBuilder) -> {
            if (display == null) {
                return null;
            }
            Predicate operational = criteriaBuilder.equal(root.get("roomStatus"), RoomStatus.AVAILABLE);
            switch (display) {
                case MAINTENANCE:
                    return criteriaBuilder.equal(root.get("roomStatus"), RoomStatus.UNDER_MAINTENANCE);
                case CLEANING:
                    return criteriaBuilder.equal(root.get("roomStatus"), RoomStatus.CLEANING);
                case OCCUPIED:
                    return criteriaBuilder.and(operational, hasDetail(root, query, criteriaBuilder,
                            BookingStatus.CHECKED_IN, null, null));
                case RESERVED:
                    return criteriaBuilder.and(operational,
                            criteriaBuilder.not(hasDetail(root, query, criteriaBuilder, BookingStatus.CHECKED_IN, null, null)),
                            hasDetail(root, query, criteriaBuilder, BookingStatus.RESERVED, start, end));
                default: // AVAILABLE
                    return criteriaBuilder.and(operational,
                            criteriaBuilder.not(hasDetail(root, query, criteriaBuilder, BookingStatus.CHECKED_IN, null, null)),
                            criteriaBuilder.not(hasDetail(root, query, criteriaBuilder, BookingStatus.RESERVED, start, end)));
            }
        };
    }

    /**
     * Lọc theo từ khóa (mã phiếu thuê, họ tên, SĐT, CCCD/hộ chiếu của khách) khớp một chi tiết đặt phòng/lưu trú
     * còn hiệu lực giao với [start, end) (UC-ROM-006). Không có từ khóa thì không lọc.
     */
    public static Specification<rooms> hasBookingKeyword(String keyword, LocalDateTime start, LocalDateTime end) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null) {
                return null;
            }
            Subquery<Integer> subquery = query.subquery(Integer.class);
            Root<booking_details> detail = subquery.from(booking_details.class);

            List<Predicate> conditions = new ArrayList<>();
            conditions.add(criteriaBuilder.equal(detail.get("room").get("roomId"), root.get("roomId")));
            conditions.add(criteriaBuilder.lessThan(detail.<LocalDateTime>get("checkInAt"), end));
            conditions.add(criteriaBuilder.greaterThan(detail.<LocalDateTime>get("checkOutAt"), start));
            // Chỉ xét lượt còn hiệu lực: đã đặt hoặc đang lưu trú
            conditions.add(detail.get("bookingStatus").in(BookingStatus.RESERVED, BookingStatus.CHECKED_IN));

            Join<booking_details, rental_receipts> receipt = detail.join("rentalReceipt");
            Join<rental_receipts, customers> customer = receipt.join("customer");
            String like = "%" + keyword.toLowerCase() + "%";
            conditions.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(receipt.get("receiptCode")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(customer.get("fullName")), like),
                    criteriaBuilder.like(customer.get("phone"), like),
                    criteriaBuilder.like(criteriaBuilder.lower(customer.get("citizenId")), like)));

            subquery.select(detail.<Integer>get("bookingDetailId"))
                    .where(conditions.toArray(new Predicate[0]));
            return criteriaBuilder.exists(subquery);
        };
    }

    /** Phòng có chi tiết ở trạng thái đã cho; start/end null = không giới hạn thời gian */
    private static Predicate hasDetail(Root<rooms> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder,
                                       BookingStatus status, LocalDateTime start, LocalDateTime end) {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<booking_details> detail = subquery.from(booking_details.class);

        List<Predicate> conditions = new ArrayList<>();
        conditions.add(criteriaBuilder.equal(detail.get("room").get("roomId"), root.get("roomId")));
        conditions.add(criteriaBuilder.equal(detail.get("bookingStatus"), status));
        if (start != null && end != null) {
            conditions.add(criteriaBuilder.lessThan(detail.<LocalDateTime>get("checkInAt"), end));
            conditions.add(criteriaBuilder.greaterThan(detail.<LocalDateTime>get("checkOutAt"), start));
        }
        subquery.select(detail.<Integer>get("bookingDetailId"))
                .where(conditions.toArray(new Predicate[0]));
        return criteriaBuilder.exists(subquery);
    }
}
