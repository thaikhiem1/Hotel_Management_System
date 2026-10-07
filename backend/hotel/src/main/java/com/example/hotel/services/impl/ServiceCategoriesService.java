package com.example.hotel.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.hotel.mapper.ServiceCategoriesMapper;
import com.example.hotel.models.dto.request.ServiceCategoriesRequest;
import com.example.hotel.models.dto.response.ServiceCategoriesResponse;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServicesRepository;
import com.example.hotel.services.IServiceCategoriesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceCategoriesService implements IServiceCategoriesService {
    final ServiceCategoriesRepository _serviceCategoriesRepository;
    final ServiceCategoriesMapper _ServiceCategoriesMapper;
    final ServicesRepository _ServicesRepository;

    @Override
    public List<ServiceCategoriesResponse> getAll() {
        return _serviceCategoriesRepository.findAll().stream().map(_ServiceCategoriesMapper::toCategoriesResponse)
                .toList();
    }

    @Override
    public ServiceCategoriesResponse create(ServiceCategoriesRequest request) {
        if (_serviceCategoriesRepository.existsByServiceCategoriesName(request.getServiceCategoryName())) {
            throw new RuntimeException("Tên loại dịch vụ này đã tồn tại");
        }
        service_categories service_categories = _ServiceCategoriesMapper.toEntity(request);
        if (service_categories == null) {
            return null;
        }
        service_categories service_categoriesSave = _serviceCategoriesRepository.save(service_categories);
        return _ServiceCategoriesMapper.toCategoriesResponse(service_categoriesSave);
    }

    @Override
    public ServiceCategoriesResponse update(Integer Id, ServiceCategoriesRequest request) {
        if (Id == null) {
            return null;
        }
        service_categories existsServiceCategories = _serviceCategoriesRepository.findById(Id).orElseThrow(() -> {
            throw new IllegalArgumentException("Loại dịch vụ này không tồn tại");
        });
        if (!existsServiceCategories.getServiceCategoriesName().equals(request.getServiceCategoryName()) &&
                _serviceCategoriesRepository.existsByServiceCategoriesName(request.getServiceCategoryName())) {
            throw new IllegalArgumentException("Tên dịch vụ này đã tồn tại");
        }
        existsServiceCategories.setServiceCategoriesName(request.getServiceCategoryName());
        service_categories serviceCategoriesSaved = _serviceCategoriesRepository.save(existsServiceCategories);
        return _ServiceCategoriesMapper.toCategoriesResponse(serviceCategoriesSaved);
    }

    @Override
    public void Delete(Integer Id) {
        if (Id == null) {
            throw new IllegalArgumentException("ID loại dịch vụ không được để trống");
        }
        service_categories existsServiceCategories = _serviceCategoriesRepository.findById(Id).orElseThrow(() -> {
            throw new IllegalArgumentException("Loại dịch vụ này không tồn tại");
        });

        if (_ServicesRepository.existsByCategoryServiceCategoriesId(Id)) {
            throw new IllegalArgumentException("Loại dich vụ này đã phát sinh dữ liệu không thể xóa");
        }

        _serviceCategoriesRepository.delete(existsServiceCategories);
    }
}
