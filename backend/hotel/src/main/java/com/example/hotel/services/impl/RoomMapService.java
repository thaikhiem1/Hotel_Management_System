package com.example.hotel.services.impl;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.RoomDisplayStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.models.dto.response.RoomMapBookingResponse;
import com.example.hotel.models.dto.response.RoomMapItemResponse;
import com.example.hotel.models.dto.response.RoomMapResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.services.IRoomMapService;
import com.example.hotel.specification.RoomSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * UC-ROM-005 (hiển thị sơ đồ phòng) và UC-ROM-006 (lọc danh sách phòng).
 * Lọc và phân trang theo cơ chế chung của dự án: Specification + findAll(spec, pageable).
 */
@Service
@RequiredArgsConstructor
public class RoomMapService implements IRoomMapService {

    /** Múi giờ dùng để xác định "bây giờ" và "hết ngày hiện tại" (UC-ROM-005 quy tắc 1) */
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final Pattern KEYWORD_PATTERN = Pattern.compile("^[\\p{L}\\p{N}\\s._@+\\-]{1,50}$");

    private static final String MSG_TIME_INVALID =
            "Khoảng thời gian không hợp lệ. Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc.";
    private static final String MSG_STATUS_INVALID = "Trạng thái lọc không hợp lệ.";
    private static final String MSG_KEYWORD_INVALID = "Thông tin đặt phòng không hợp lệ. Vui lòng kiểm tra lại.";

    private final RoomRepository roomRepository;
    private final BookingDetailRepository bookingDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public RoomMapResponse getRoomMap(int page, int size, String from, String to,
                                      String displayStatus, String keyword) {
        // Kiểm tra và chuẩn hóa điều kiện lọc
        RoomDisplayStatus displayStatusFilter = parseEnum(displayStatus, RoomDisplayStatus.class);
        String keywordFilter = parseKeyword(keyword);

        // Khoảng thời gian áp dụng: mặc định từ bây giờ đến hết ngày hiện tại
        LocalDateTime now = LocalDateTime.now(ZONE);
        LocalDateTime start = parseTime(from, now);
        LocalDateTime end = parseTime(to, now.toLocalDate().plusDays(1).atStartOfDay());
        if (!start.isBefore(end)) {
            throw new BusinessValidationException(MSG_TIME_INVALID, Map.of());
        }

        // Lọc + phân trang theo Specification như các danh sách khác
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.ASC, "roomCode");
        Specification<rooms> filters = Specification.where(RoomSpecification.hasBookingKeyword(keywordFilter, start, end));
        Page<rooms> roomPage = roomRepository.findAll(
                filters.and(RoomSpecification.hasDisplayStatus(displayStatusFilter, start, end)), pageable);

        // Chi tiết đặt phòng/lưu trú của các phòng trong trang hiện tại
        List<Integer> roomIds = roomPage.getContent().stream().map(rooms::getRoomId).toList();
        Map<Integer, List<booking_details>> detailsByRoom = roomIds.isEmpty() ? Map.of()
                : bookingDetailRepository.findForRoomMap(roomIds, start, end).stream()
                        .collect(Collectors.groupingBy(d -> d.getRoom().getRoomId()));

        Page<RoomMapItemResponse> items = roomPage.map(room -> toItem(
                room, detailsByRoom.getOrDefault(room.getRoomId(), List.of()),
                start, end, now, keywordFilter));

        // Số phòng theo trạng thái hiển thị, tính trên các điều kiện lọc còn lại
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("ALL", roomRepository.count(filters));
        for (RoomDisplayStatus status : RoomDisplayStatus.values()) {
            counts.put(status.name(), roomRepository.count(filters.and(
                    RoomSpecification.hasDisplayStatus(status, start, end))));
        }

        return new RoomMapResponse(items, start, end, counts);
    }

    // ------------------------------------------------------------------ chuyển một phòng thành thẻ

    private RoomMapItemResponse toItem(rooms room, List<booking_details> details, LocalDateTime start,
                                       LocalDateTime end, LocalDateTime now, String keywordFilter) {
        booking_details occupied = details.stream()
                .filter(d -> d.getBookingStatus() == BookingStatus.CHECKED_IN)
                .findFirst().orElse(null);
        List<booking_details> reserved = details.stream()
                .filter(d -> d.getBookingStatus() == BookingStatus.RESERVED)
                .sorted(Comparator.comparing(booking_details::getCheckInAt))
                .toList();

        // Cùng thứ tự ưu tiên với RoomSpecification.hasDisplayStatus
        RoomDisplayStatus display;
        if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
            display = RoomDisplayStatus.MAINTENANCE;
        } else if (room.getRoomStatus() == RoomStatus.CLEANING) {
            display = RoomDisplayStatus.CLEANING;
        } else if (occupied != null) {
            display = RoomDisplayStatus.OCCUPIED;
        } else if (!reserved.isEmpty()) {
            display = RoomDisplayStatus.RESERVED;
        } else {
            display = RoomDisplayStatus.AVAILABLE;
        }

        // Lượt tóm tắt: đang lưu trú, hoặc lượt đặt gần nhất chưa nhận phòng
        booking_details summary = display == RoomDisplayStatus.OCCUPIED ? occupied
                : display == RoomDisplayStatus.RESERVED ? reserved.get(0) : null;
        boolean canCheckIn = display == RoomDisplayStatus.RESERVED && !summary.getCheckInAt().isAfter(now);

        // Chi tiết khớp thông tin đặt phòng (chỉ khi đang lọc theo từ khóa)
        booking_details matched = null;
        if (keywordFilter != null) {
            matched = details.stream()
                    .filter(d -> d.getCheckInAt().isBefore(end) && d.getCheckOutAt().isAfter(start))
                    .filter(d -> matchesKeyword(d, keywordFilter))
                    .min(Comparator.comparing(booking_details::getCheckInAt))
                    .orElse(null);
        }

        return new RoomMapItemResponse(
                room.getRoomId(),
                room.getRoomCode(),
                room.getRoomTypes().getRoomTypeId(),
                room.getRoomTypes().getRoomTypeName(),
                room.getRoomTypes().getDailyRate(),
                room.getRoomTypes().getHourlyRate(),
                room.getRoomTypes().getNumberOfBeds(),
                room.getRoomTypes().getMaximumOccupancy(),
                room.getNote(),
                room.getRoomStatus(),
                display,
                summary == null ? null : toBooking(summary),
                matched == null ? null : toBooking(matched),
                reserved.size(),
                canCheckIn);
    }

    private boolean matchesKeyword(booking_details d, String keywordLower) {
        customers c = d.getRentalReceipt().getCustomer();
        return Stream.of(d.getRentalReceipt().getReceiptCode(), c.getFullName(), c.getPhone(), c.getCitizenId())
                .anyMatch(v -> v != null && v.toLowerCase(Locale.ROOT).contains(keywordLower));
    }

    private RoomMapBookingResponse toBooking(booking_details d) {
        customers c = d.getRentalReceipt().getCustomer();
        return new RoomMapBookingResponse(
                d.getBookingDetailId(),
                d.getRentalReceipt().getRentalReceiptId(),
                d.getRentalReceipt().getReceiptCode(),
                c.getCustomerId(),
                c.getFullName(),
                c.getPhone(),
                d.getNumberOfGuests(),
                d.getCheckInAt(),
                d.getCheckOutAt(),
                d.getActualCheckInAt(),
                d.getBookingStatus());
    }

    // ------------------------------------------------------------------ phân tích tham số

    private LocalDateTime parseTime(String value, LocalDateTime defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return LocalDateTime.parse(value.trim());
        } catch (DateTimeParseException e) {
            throw new BusinessValidationException(MSG_TIME_INVALID, Map.of());
        }
    }

    private <E extends Enum<E>> E parseEnum(String value, Class<E> type) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BusinessValidationException(MSG_STATUS_INVALID, Map.of());
        }
    }

    /** Trả về từ khóa đã chuẩn hóa chữ thường; rỗng thì không dùng để lọc */
    private String parseKeyword(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (!KEYWORD_PATTERN.matcher(trimmed).matches()) {
            throw new BusinessValidationException(MSG_KEYWORD_INVALID, Map.of());
        }
        return trimmed.toLowerCase(Locale.ROOT);
    }
}
