package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.RoomDisplayStatus;
import com.example.hotel.Enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * UC-ROM-005: một thẻ phòng trên sơ đồ (mỗi phòng đúng một thẻ)
 */
@Getter
@AllArgsConstructor
public class RoomMapItemResponse {
    private Integer roomId;
    private String roomCode;
    private Integer roomTypeId;
    private String roomTypeName;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
    private Integer numberOfBeds;
    private Integer maximumOccupancy;
    private String note;
    /** Trạng thái vận hành lưu trong bảng phòng */
    private RoomStatus operationalStatus;
    /** Trạng thái hiển thị tổng hợp (quyết định màu thẻ) */
    private RoomDisplayStatus displayStatus;
    /** Lượt đang lưu trú (khi OCCUPIED) hoặc lượt đặt gần nhất chưa nhận phòng (khi RESERVED) */
    private RoomMapBookingResponse booking;
    /** Chi tiết khớp điều kiện lọc theo trạng thái/thông tin đặt phòng (chỉ có khi đang lọc) */
    private RoomMapBookingResponse matchedBooking;
    /** Số lượt đặt chưa nhận phòng giao với khoảng thời gian đang xem */
    private int reservationCount;
    /** Lượt đặt tóm tắt đã đến giờ nhận phòng nên được phép nhận phòng */
    private boolean canCheckIn;
}
