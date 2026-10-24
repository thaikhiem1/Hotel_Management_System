package com.example.hotel.services;

import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;

import java.util.List;

public interface IServicesService {
    List<ServicesResponse> getAll();

    ServicesResponse getById(Integer serviceId);

    ServicesResponse create(ServicesRequest request);

    ServicesResponse update(Integer serviceId, ServicesRequest request);

    void delete(Integer serviceId);
}
