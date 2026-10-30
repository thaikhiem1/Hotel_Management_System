package com.example.hotel.services.impl;

import com.example.hotel.Enums.PricingMethod;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Quy tắc tính giá phiếu thuê (UC-REN-010). Phải khớp ràng buộc
 * chk_booking_estimated_units_rule trong V2__rental_receipts_booking_details.sql.
 *
 *  - GIO : số giờ = tổng thời lượng làm tròn lên, tối thiểu 1 giờ        (BR-REN-010-09)
 *  - NGAY: số đêm = số ngày lịch giữa ngày nhận và ngày trả, tối thiểu 1 (BR-REN-010-10)
 *  - Thành tiền = số đơn vị x đơn giá, làm tròn 2 chữ số thập phân
 */
public final class RentalPricing {

    private static final long HOUR_MILLIS = Duration.ofHours(1).toMillis();

    private RentalPricing() {
    }

    public static int billedUnits(PricingMethod method, LocalDateTime checkIn, LocalDateTime checkOut) {
        if (!checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("Thời gian nhận phòng phải trước thời gian trả phòng");
        }
        long units = switch (method) {
            case GIO -> {
                long millis = Duration.between(checkIn, checkOut).toMillis();
                yield (millis + HOUR_MILLIS - 1) / HOUR_MILLIS;
            }
            case NGAY -> ChronoUnit.DAYS.between(checkIn.toLocalDate(), checkOut.toLocalDate());
        };
        return (int) Math.max(1, units);
    }

    public static BigDecimal amount(BigDecimal unitPrice, int units) {
        return unitPrice.multiply(BigDecimal.valueOf(units)).setScale(2, RoundingMode.HALF_UP);
    }
}
