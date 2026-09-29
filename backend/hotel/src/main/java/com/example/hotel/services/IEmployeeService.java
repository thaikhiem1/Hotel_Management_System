package com.example.hotel.services;

import org.springframework.data.domain.Page;

import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;

public interface IEmployeeService {
    Page<EmployeeResponse> getEmployees(int page, int size, String search, Boolean isActive, String position);

    EmployeeResponse createEmployee(EmployeeCreateRequest request);
}
