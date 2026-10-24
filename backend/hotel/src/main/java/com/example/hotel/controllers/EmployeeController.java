package com.example.hotel.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.request.EmployeeUpdateRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.services.IEmployeeService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/employees")
@CrossOrigin(origins = { "http://localhost:5173" })
@RequiredArgsConstructor
public class EmployeeController {
    private final IEmployeeService employeeService;

    @GetMapping
    public Page<EmployeeResponse> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String position) {
        return employeeService.getEmployees(
                page,
                size,
                search,
                isActive,
                position);
    }

    /**
     * UC-EMP-001: Thêm nhân viên mới
     * POST /api/employees
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeCreateRequest request) {
        
        EmployeeResponse response = employeeService.createEmployee(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(HttpStatus.CREATED.value(), response, "Thêm nhân viên thành công")
        );
    }

    /**
     * UC-EMP-002: Cập nhật thông tin nhân viên
     * PUT /api/employees/{employeeId}
     */
    @PutMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Integer employeeId,
            @Valid @RequestBody EmployeeUpdateRequest request) {

        EmployeeResponse response = employeeService.updateEmployee(employeeId, request);
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Cập nhật thông tin nhân viên thành công"));
    }
}
