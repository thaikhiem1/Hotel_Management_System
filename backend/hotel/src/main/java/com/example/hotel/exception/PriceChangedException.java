package com.example.hotel.exception;

import com.example.hotel.models.dto.response.RentalEstimateResponse;

/**
 * Chi phí tính lại ở máy chủ khác với số tiền người dùng đã xác nhận (UC-REN-010 E6).
 * Returns HTTP 409 Conflict kèm chi phí mới để RECEPTIONIST kiểm tra và xác nhận lại.
 */
public class PriceChangedException extends RuntimeException {
    private final RentalEstimateResponse newEstimate;

    public PriceChangedException(String message, RentalEstimateResponse newEstimate) {
        super(message);
        this.newEstimate = newEstimate;
    }

    public RentalEstimateResponse getNewEstimate() {
        return newEstimate;
    }
}
