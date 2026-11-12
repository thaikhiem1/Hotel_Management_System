package com.example.hotel.exception;

import com.example.hotel.models.dto.response.CheckOutContextResponse;

/**
 * Chi phí trả phòng tính lại ở máy chủ khác số tiền lễ tân đã xem (thời gian trôi qua làm đổi số đơn vị tính tiền,
 * hoặc có dịch vụ vừa được ghi nhận). Returns HTTP 409 Conflict kèm chi phí mới để kiểm tra và xác nhận lại.
 */
public class CheckOutAmountChangedException extends RuntimeException {
    private final CheckOutContextResponse newEstimate;

    public CheckOutAmountChangedException(String message, CheckOutContextResponse newEstimate) {
        super(message);
        this.newEstimate = newEstimate;
    }

    public CheckOutContextResponse getNewEstimate() {
        return newEstimate;
    }
}
