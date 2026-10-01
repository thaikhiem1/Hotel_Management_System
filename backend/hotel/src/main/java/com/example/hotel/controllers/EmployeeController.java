package com.example.hotel.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.services.IEmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/employee")
@CrossOrigin(origins = { "http://localhost:5173" })
@RequiredArgsConstructor
public class EmployeeController {
    private final IEmployeeService _EmployeeService;

    @GetMapping
    public Page<EmployeeResponse> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String position) {
        return _EmployeeService.getEmployees(
                page,
                size,
                search,
                isActive,
                position);
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmloyee(
            @RequestBody EmployeeCreateRequest request) {
        EmployeeResponse response = _EmployeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
