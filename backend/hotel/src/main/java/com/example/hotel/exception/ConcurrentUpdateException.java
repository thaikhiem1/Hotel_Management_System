package com.example.hotel.exception;

/**
 * Dữ liệu vừa bị một thao tác khác thay đổi (nhận phòng, trả phòng, hủy... xảy ra đồng thời).
 * Returns HTTP 409 Conflict; người dùng cần tải lại dữ liệu rồi thực hiện lại.
 */
public class ConcurrentUpdateException extends RuntimeException {

    public ConcurrentUpdateException(String message) {
        super(message);
    }
}
