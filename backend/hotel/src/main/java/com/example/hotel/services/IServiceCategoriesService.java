package com.example.hotel.services;

import java.util.List;

import com.example.hotel.models.dto.request.ServiceCategoriesRequest;
import com.example.hotel.models.dto.response.ServiceCategoriesResponse;

public interface IServiceCategoriesService {
    ServiceCategoriesResponse create(ServiceCategoriesRequest request);

    List<ServiceCategoriesResponse> getAll();

    ServiceCategoriesResponse update(Integer Id, ServiceCategoriesRequest request);

    void Delete(Integer Id);
}
