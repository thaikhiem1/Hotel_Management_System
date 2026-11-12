package com.example.hotel.mapper;

import org.springframework.stereotype.Component;

import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;
import com.example.hotel.models.entities.services;

@Component
public class ServicesMapper {
    public ServicesResponse toServicesResponse(services service) {
        return new ServicesResponse(service.getServiceId(),service.getCategory().getServiceCategoriesId(), service.getServiceName(),
                service.getCategory().getServiceCategoriesName(), service.getUnitPrice(),
                service.getUnit(), service.getStockQuantity(), service.getIsActive());
    }

    public services toEntities(ServicesRequest request) {
        services service = new services();
        service.setServiceName(request.getServiceName());
        service.setUnitPrice(request.getUnitPrice());
        service.setUnit(request.getUnit());
        service.setStockQuantity(request.getStockQuantity());
        return service;
    }
}
