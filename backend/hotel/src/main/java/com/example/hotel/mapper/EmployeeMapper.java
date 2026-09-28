package com.example.hotel.mapper;

import org.springframework.stereotype.Component;

import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.employees;

@Component
public class EmployeeMapper {
    public EmployeeResponse toEmployeeResponse(employees employee) {
        if (employee == null) {
            throw new IllegalArgumentException("Employee entity is null");
        }
        return new EmployeeResponse(employee.getEmployeeId(), employee.getFullName(), employee.getPosition(),
                employee.getSalary(),
                employee.getPhone(), employee.getCitizenId(), employee.getDateOfBirth(), employee.getGender(),
                employee.getAddress(),
                employee.getEmail(),
                employee.getAvatar(), employee.getIsActive());
    }
}
