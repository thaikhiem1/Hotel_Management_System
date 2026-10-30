package com.example.hotel.Enums;

/**
 * Trạng thái HIỂN THỊ của phòng trên sơ đồ (UC-ROM-005), được tổng hợp từ trạng thái vận hành
 * của phòng và các chi tiết đặt phòng/lưu trú, không phải trạng thái lưu trong bảng phòng.
 * Thứ tự ưu tiên: MAINTENANCE > CLEANING > OCCUPIED > RESERVED > AVAILABLE.
 */
public enum RoomDisplayStatus {
    AVAILABLE,      // Xanh lá: sẵn sàng, không có đặt phòng chặn trong khoảng thời gian xem
    RESERVED,       // Vàng: có đặt phòng chưa nhận giao với khoảng thời gian xem
    OCCUPIED,       // Đỏ: đang có khách lưu trú
    CLEANING,       // Cam: đang dọn dẹp
    MAINTENANCE     // Xám: đang bảo trì
}
