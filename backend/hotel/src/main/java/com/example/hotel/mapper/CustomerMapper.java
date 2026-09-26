package com.example.hotel.mapper;

import org.springframework.stereotype.Component;

import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.models.entities.customers;

@Component
public class CustomerMapper {
    public customers toEntities(CustomerRequest request) {
        customers customer = new customers();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setCitizenId(request.getCitizenId());
        customer.setNationality(request.getNationality());
        customer.setGender(request.getGender());
        return customer;
    }

    public CustomerResponse toCustomerResponse(customers customer) {
        return new CustomerResponse(customer.getCustomerId(), customer.getFullName(),
                customer.getPhone(), customer.getCitizenId(), customer.getNationality(), customer.getGender());
    }
}
