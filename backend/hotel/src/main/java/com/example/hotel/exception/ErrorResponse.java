package com.example.hotel.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

/**
 * Standard error response structure for API errors
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> fieldErrors;
    /** Dữ liệu kèm theo lỗi, ví dụ chi phí mới khi giá thay đổi hoặc danh sách phòng không khả dụng */
    private Object data;
}
