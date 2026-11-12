package com.example.hotel.services;

import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;

import java.util.List;

public interface IServicesService {
    List<ServicesResponse> getAll();

    /** activeOnly = true: chỉ các dịch vụ đang được phép cung cấp (dùng khi ghi nhận dịch vụ khách sử dụng) */
    List<ServicesResponse> getAll(boolean activeOnly);

    ServicesResponse getById(Integer serviceId);

    ServicesResponse create(ServicesRequest request);

    ServicesResponse update(Integer serviceId, ServicesRequest request);

    void delete(Integer serviceId);
}
