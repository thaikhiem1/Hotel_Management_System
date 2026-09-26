package com.example.hotel.services;

import java.util.List;

import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;

public interface ICustomerService {
    List<CustomerResponse> GetAll();

    CustomerResponse CreateCustomer(CustomerRequest request);

    CustomerResponse UpdateCustomer(Integer idkh, CustomerRequest request);

    void DeleteCustomData(Integer idkh);
}
