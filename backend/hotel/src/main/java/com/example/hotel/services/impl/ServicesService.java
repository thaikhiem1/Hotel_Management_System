package com.example.hotel.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
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
    private final ServicesRepository servicesRepository;
    private final ServicesMapper servicesMapper;
    private final ServiceCategoriesRepository categoriesRepository;

    @Override
    public List<ServicesResponse> getAll() {
        return servicesRepository.findAll().stream()
                .map(servicesMapper::toServicesResponse)
                .toList();
    }

    @Override
    public ServicesResponse getById(Integer serviceId) {
        if (serviceId == null || serviceId <= 0) {
            throw new IllegalArgumentException("Mã dịch vụ phải là số nguyên dương");
        }

        Optional<services> serviceResult = servicesRepository.findById(serviceId);
        if (serviceResult.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceId);
        }

        services service = serviceResult.get();
        return servicesMapper.toServicesResponse(service);
    }

    @Override
    @Transactional
    public ServicesResponse create(ServicesRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Thông tin dịch vụ không được để trống");
        }

        String serviceName = request.getServiceName().trim();
        String unit = request.getUnit().trim();
        Integer categoryId = request.getServiceCategoryId();

        if (servicesRepository.existsByServiceName(serviceName)) {
            throw new DuplicateResourceException("Tên dịch vụ", serviceName);
        }

        Optional<service_categories> categoryResult = categoriesRepository.findById(categoryId);
        if (categoryResult.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy danh mục dịch vụ với ID: " + categoryId);
        }

        services service = servicesMapper.toEntities(request);
        service.setServiceName(serviceName);
        service.setUnitPrice(request.getUnitPrice());
        service.setStockQuantity(request.getStockQuantity());
        service.setUnit(unit);
        service.setCategory(categoryResult.get());
        services savedService = servicesRepository.save(service);
        return servicesMapper.toServicesResponse(savedService);
    }

    @Override
    @Transactional
    public ServicesResponse update(Integer serviceId, ServicesRequest request) {
        if (serviceId == null || serviceId <= 0) {
            throw new IllegalArgumentException("Mã dịch vụ phải là số nguyên dương");
        }

        Optional<services> serviceResult = servicesRepository.findById(serviceId);
        if (serviceResult.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceId);
        }
        services service = serviceResult.get();

        if (request == null) {
            throw new IllegalArgumentException("Thông tin dịch vụ không được để trống");
        }

        String serviceName = request.getServiceName().trim();
        String unit = request.getUnit().trim();
        Integer categoryId = request.getServiceCategoryId();

        if (servicesRepository.existsByServiceNameAndServiceIdNot(serviceName, serviceId)) {
            throw new DuplicateResourceException("Tên dịch vụ", serviceName);
        }

        Optional<service_categories> categoryResult = categoriesRepository.findById(categoryId);
        if (categoryResult.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy danh mục dịch vụ với ID: " + categoryId);
        }

        service.setServiceName(serviceName);
        service.setUnitPrice(request.getUnitPrice());
        service.setStockQuantity(request.getStockQuantity());
        service.setUnit(unit);
        service.setCategory(categoryResult.get());
        services savedService = servicesRepository.save(service);
        return servicesMapper.toServicesResponse(savedService);
    }

    @Override
    @Transactional
    public void delete(Integer serviceId) {
        if (serviceId == null || serviceId <= 0) {
            throw new IllegalArgumentException("Mã dịch vụ phải là số nguyên dương");
        }

        Optional<services> serviceResult = servicesRepository.findById(serviceId);
        if (serviceResult.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceId);
        }

        // The current schema has no service-usage history relation, so this service
        // can be physically deleted. A future history relation must prevent deletion.
        servicesRepository.delete(serviceResult.get());
    }
}
