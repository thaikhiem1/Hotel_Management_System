package com.example.hotel.services;

import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;

/**
 * Lưu trú theo chi tiết đặt phòng: nhận phòng (UC-REN-004).
 */
public interface IStayService {

    /** UC-REN-004 bước 2-4: kiểm tra sơ bộ và lấy thông tin để mở biểu mẫu Check-in */
    CheckInContextResponse getCheckInContext(Integer bookingDetailId);

    /** UC-REN-004 bước 5-9: kiểm tra lại điều kiện rồi ghi nhận nhận phòng */
    CheckInResponse checkIn(Integer bookingDetailId, CheckInRequest request);
}
