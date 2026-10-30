package com.example.hotel.exception;

import java.util.List;

/**
 * Phòng không còn khả dụng trong khoảng thời gian yêu cầu (đã có người đặt/lưu trú chồng lấn).
 * Returns HTTP 409 Conflict; roomIds cho biết phòng nào cần tra cứu lại.
 */
public class RoomUnavailableException extends RuntimeException {
    private final List<Integer> roomIds;

    public RoomUnavailableException(String message, List<Integer> roomIds) {
        super(message);
        this.roomIds = roomIds;
    }

    public List<Integer> getRoomIds() {
        return roomIds;
    }
}
