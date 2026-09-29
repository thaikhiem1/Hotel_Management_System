package com.example.hotel.services.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.services.IEmployeeService;
import com.example.hotel.specification.EmployeeSpecification;

@Service
public class EmployeeService implements IEmployeeService {
    private final EmployeeRepository _EmployeeRepository;
    private final EmployeeMapper _EmployeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this._EmployeeRepository = employeeRepository;
        this._EmployeeMapper = employeeMapper;
    }

    @Override
    public Page<EmployeeResponse> getEmployees(int page, int size, String search, Boolean isActive, String position) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.ASC, "employeeId");
        Specification<employees> specification = Specification.where(EmployeeSpecification.hasWorkingStatus(isActive))
                .and(EmployeeSpecification.fillterPosition(position))
                .and(EmployeeSpecification.search(search));
        Page<employees> employee = _EmployeeRepository.findAll(specification, pageable);
        return employee.map(_EmployeeMapper::toEmployeeResponse);
    }

    @Override
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        // Kiểm tra số điện thoại
        if (_EmployeeRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        // Kiểm tra CCCD
        if (_EmployeeRepository.existsByCitizenId(request.getCitizenId())) {
            throw new RuntimeException("CCCD đã tồn tại");
        }

        // Kiểm tra email
        if (_EmployeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        employees employee = new employees();

        employee.setFullName(request.getFullName());
        employee.setPosition(request.getPosition());
        employee.setSalary(request.getSalary());
        employee.setPhone(request.getPhone());
        employee.setCitizenId(request.getCitizenId());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setAddress(request.getAddress());
        employee.setEmail(request.getEmail());

        employees savedEmployee = _EmployeeRepository.save(employee);

        return _EmployeeMapper.toEmployeeResponse(savedEmployee);
    }
}
