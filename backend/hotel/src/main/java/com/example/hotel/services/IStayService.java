package com.example.hotel.services;

import com.example.hotel.models.dto.request.CheckInRequest;
import com.example.hotel.models.dto.request.CheckOutRequest;
import com.example.hotel.models.dto.response.CheckOutContextResponse;
import com.example.hotel.models.dto.response.CheckOutResponse;
import com.example.hotel.models.dto.response.CheckInContextResponse;
import com.example.hotel.models.dto.response.CheckInResponse;

/**
 * Lưu trú theo chi tiết đặt phòng: nhận phòng (UC-REN-004) và trả phòng (UC-REN-007).
 */
public interface IStayService {

    /** UC-REN-004 bước 2-4: kiểm tra sơ bộ và lấy thông tin để mở biểu mẫu Check-in */
    CheckInContextResponse getCheckInContext(Integer bookingDetailId);

    /** UC-REN-004 bước 5-9: kiểm tra lại điều kiện rồi ghi nhận nhận phòng */
    CheckInResponse checkIn(Integer bookingDetailId, CheckInRequest request);

    /** UC-REN-007 bước 2-6: kiểm tra lượt lưu trú và tính chi phí tạm tính đến thời điểm hiện tại */
    CheckOutContextResponse getCheckOutContext(Integer bookingDetailId);

    /** UC-REN-007 bước 7-12: kiểm tra lại, trả phòng, lập hóa đơn và chuyển phòng sang dọn dẹp trong một giao dịch */
    CheckOutResponse checkOut(Integer bookingDetailId, CheckOutRequest request);
}
