package com.example.hotel.mapper;

import org.springframework.stereotype.Component;

import com.example.hotel.models.dto.request.ServiceCategoriesRequest;
import com.example.hotel.models.dto.response.ServiceCategoriesResponse;
import com.example.hotel.models.entities.service_categories;

@Component 
public class ServiceCategoriesMapper {
    public  ServiceCategoriesResponse toCategoriesResponse(service_categories serviceCategories){
        return new ServiceCategoriesResponse(serviceCategories.getServiceCategoriesId(), serviceCategories.getServiceCategoriesName());
    }
    public service_categories toEntity(ServiceCategoriesRequest request){
        service_categories service_categories = new service_categories();
        service_categories.setServiceCategoriesName(request.getServiceCategoryName());
        return service_categories;
    }
}
