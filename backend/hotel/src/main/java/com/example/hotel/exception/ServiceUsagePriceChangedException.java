package com.example.hotel.exception;

import com.example.hotel.models.dto.response.ServiceUsageEstimateResponse;

/**
 * Chi phí tính lại ở máy chủ khác số tiền người dùng đã xác nhận khi ghi nhận dịch vụ (giá dịch vụ vừa đổi).
 * Returns HTTP 409 Conflict kèm chi phí mới để người dùng kiểm tra và xác nhận lại.
 */
public class ServiceUsagePriceChangedException extends RuntimeException {
    private final ServiceUsageEstimateResponse newEstimate;

    public ServiceUsagePriceChangedException(String message, ServiceUsageEstimateResponse newEstimate) {
        super(message);
        this.newEstimate = newEstimate;
    }

    public ServiceUsageEstimateResponse getNewEstimate() {
        return newEstimate;
    }
}
