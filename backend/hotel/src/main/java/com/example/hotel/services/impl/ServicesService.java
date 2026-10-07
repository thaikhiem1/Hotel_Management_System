package com.example.hotel.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.hotel.mapper.ServicesMapper;
import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServicesRepository;
import com.example.hotel.services.IServicesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicesService implements IServicesService {
    final ServicesRepository _ServicesRepository;
    final ServicesMapper _ServicesMapper;
    final ServiceCategoriesRepository _CategoriesRepository;

    @Override
    public List<ServicesResponse> getAll() {
        return _ServicesRepository.findAll().stream().map(_ServicesMapper::toServicesResponse).toList();
    }

    @Override
    public ServicesResponse create(ServicesRequest request) {
        if (_ServicesRepository.existsByServiceName(request.getServiceName())) {
            throw new IllegalArgumentException("Tên dịch vụ này đã tồn tại");
        }
        service_categories service_category = _CategoriesRepository.findById(request.getServiceCategoryId())
                .orElseThrow(() -> {
                    throw new IllegalArgumentException("Loại dịch vụ này chưa tồn tại");
                });

        services service = _ServicesMapper.toEntities(request);
        service.setCategory(service_category);

        services serviceSaved = _ServicesRepository.save(service);
        return _ServicesMapper.toServicesResponse(serviceSaved);
    }
}
