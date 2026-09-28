package com.example.hotel.services.impl;

import javax.swing.text.html.HTMLDocument.HTMLReader.SpecialAction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.hotel.mapper.EmployeeMapper;
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
}
