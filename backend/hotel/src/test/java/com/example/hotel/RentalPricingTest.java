package com.example.hotel;

import com.example.hotel.Enums.PricingMethod;
import com.example.hotel.services.impl.RentalPricing;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Quy tắc tính giá UC-REN-010 (BR-REN-010-09, BR-REN-010-10) */
class RentalPricingTest {

    private static LocalDateTime t(String iso) {
        return LocalDateTime.parse(iso);
    }

    @Test
    void hourly_roundsUpTotalDuration() {
        assertEquals(4, RentalPricing.billedUnits(PricingMethod.GIO, t("2026-12-20T10:00"), t("2026-12-20T13:30")));
        assertEquals(3, RentalPricing.billedUnits(PricingMethod.GIO, t("2026-12-20T10:00"), t("2026-12-20T13:00")));
        assertEquals(4, RentalPricing.billedUnits(PricingMethod.GIO, t("2026-12-20T10:00"), t("2026-12-20T13:00:01")));
    }

    @Test
    void hourly_positiveDurationUnderOneHourIsOneHour() {
        assertEquals(1, RentalPricing.billedUnits(PricingMethod.GIO, t("2026-12-20T10:00"), t("2026-12-20T10:01")));
    }

    @Test
    void daily_countsCalendarNights() {
        assertEquals(2, RentalPricing.billedUnits(PricingMethod.NGAY, t("2026-12-20T14:00"), t("2026-12-22T12:00")));
        // nhận 23:00, trả 01:00 hôm sau: 1 đêm
        assertEquals(1, RentalPricing.billedUnits(PricingMethod.NGAY, t("2026-12-20T23:00"), t("2026-12-21T01:00")));
        // trả muộn giờ trong ngày thứ 3 vẫn tính theo ngày lịch
        assertEquals(2, RentalPricing.billedUnits(PricingMethod.NGAY, t("2026-12-20T14:00"), t("2026-12-22T23:59")));
    }

    @Test
    void daily_sameDayStayIsMinimumOneNight() {
        assertEquals(1, RentalPricing.billedUnits(PricingMethod.NGAY, t("2026-12-20T09:00"), t("2026-12-20T20:00")));
    }

    @Test
    void checkOutNotAfterCheckIn_isRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> RentalPricing.billedUnits(PricingMethod.GIO, t("2026-12-20T10:00"), t("2026-12-20T10:00")));
        assertThrows(IllegalArgumentException.class,
                () -> RentalPricing.billedUnits(PricingMethod.NGAY, t("2026-12-21T10:00"), t("2026-12-20T10:00")));
    }

    @Test
    void amount_isUnitsTimesPriceWithTwoDecimals() {
        assertEquals(new BigDecimal("1600000.00"), RentalPricing.amount(new BigDecimal("800000"), 2));
        assertEquals(new BigDecimal("333.33"), RentalPricing.amount(new BigDecimal("333.333"), 1));
    }
}
