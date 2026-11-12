package com.example.hotel.services;

import com.example.hotel.models.dto.request.ServiceUsageRequest;
import com.example.hotel.models.dto.response.ServiceUsageEstimateResponse;
import com.example.hotel.models.dto.response.ServiceUsageListResponse;

/**
 * Ghi nhận dịch vụ khách sử dụng trong lượt lưu trú (UC-SVC-005).
 */
public interface IServiceUsageService {

    /** Danh sách dịch vụ khách đã sử dụng của một lượt lưu trú */
    ServiceUsageListResponse getUsages(Integer bookingDetailId);

    /** UC-SVC-005 bước 6-11: kiểm tra và tính chi phí, chưa lưu gì */
    ServiceUsageEstimateResponse estimate(Integer bookingDetailId, ServiceUsageRequest request);

    /** UC-SVC-005 bước 12-15: kiểm tra lại, lưu thông tin sử dụng và trừ tồn kho trong cùng một transaction */
    ServiceUsageListResponse record(Integer bookingDetailId, ServiceUsageRequest request);
}
