package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.AccountCreateRequest;
import com.example.hotel.models.dto.request.AccountUpdateRequest;
import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.services.IAccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private IAccountService accountService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {

        AccountResponse response = accountService.createAccount(request);

        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
                201,
                response,
                "Tạo tài khoản thành công");

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AccountResponse>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) Boolean isActive) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("accountId").ascending());
        Page<AccountResponse> accountsPage = accountService.getAllAccounts(pageable, isActive);

        ApiResponse<Page<AccountResponse>> apiResponse = ApiResponse.success(
                accountsPage,
                "Lấy danh sách tài khoản thành công");

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/available-employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAvailableEmployees() {

        List<EmployeeResponse> employees = accountService.getEmployeesWithoutAccount();

        ApiResponse<List<EmployeeResponse>> apiResponse = ApiResponse.success(
                employees,
                "Lấy danh sách nhân viên chưa có tài khoản thành công");

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Integer id) {

        AccountResponse account = accountService.getAccountById(id);

        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
                account,
                "Lấy thông tin tài khoản thành công");

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Integer id,
            @Valid @RequestBody AccountUpdateRequest request) {

        AccountResponse response = accountService.updateAccount(id, request);

        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
                response,
                "Cập nhật tài khoản thành công");

        return ResponseEntity.ok(apiResponse);
    }

}
