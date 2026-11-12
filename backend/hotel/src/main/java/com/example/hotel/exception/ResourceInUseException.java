package com.example.hotel.exception;

/**
 * Tài nguyên đang được dữ liệu khác sử dụng nên không thao tác được
 * (ví dụ xóa dịch vụ đã có lịch sử sử dụng). Returns HTTP 409 Conflict.
 */
public class ResourceInUseException extends RuntimeException {

    public ResourceInUseException(String message) {
        super(message);
    }
}
