package com.example.hotel.exception;

import java.util.Map;

/**
 * Dữ liệu nghiệp vụ không hợp lệ (nhiều lỗi gom theo trường).
 * Returns HTTP 400 Bad Request kèm fieldErrors, ví dụ khóa "details[0].numberOfGuests".
 */
public class BusinessValidationException extends RuntimeException {
    private final Map<String, String> fieldErrors;

    public BusinessValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
