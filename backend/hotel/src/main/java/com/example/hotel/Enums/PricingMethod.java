package com.example.hotel.Enums;

/**
 * Phương thức tính giá của một chi tiết đặt phòng
 */
public enum PricingMethod {
    NGAY,   // Theo đêm: đơn giá = room_types.daily_rate
    GIO     // Theo giờ: đơn giá = room_types.hourly_rate
}
