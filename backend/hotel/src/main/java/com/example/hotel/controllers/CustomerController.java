package com.example.hotel.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.services.ICustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/customers")
@RequiredArgsConstructor
public class CustomerController {
    @Autowired
    private final ICustomerService customerService;

    /**
     * UC-CUS-003: Tra cứu thông tin khách hàng
     * GET /api/customers?page=0&size=16&search=keyword&gender=Nam&nationality=Việt Nam
     * 
     * @param page - Số trang (mặc định 0)
     * @param size - Số bản ghi mỗi trang (mặc định 16)
     * @param search - Từ khóa tìm kiếm (họ tên, SĐT, CCCD/Passport)
     * @param gender - Lọc theo giới tính (Nam, Nữ, Khác)
     * @param nationality - Lọc theo quốc tịch
     * @return Page<CustomerResponse> - Danh sách khách hàng phân trang
     */
    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> GetAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String nationality) {
        
        Page<CustomerResponse> customers = customerService.GetAllWithPagination(
            page, 
            size, 
            search, 
            gender, 
            nationality
        );
        
        return ResponseEntity.ok(customers);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> CreateCustomer(
            @Valid @RequestBody CustomerRequest request) {

        CustomerResponse response = customerService.CreateCustomer(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(HttpStatus.CREATED.value(), response, "Thêm khách hàng thành công")
        );
    }

    @PutMapping("/{idkh}")
    public ResponseEntity<ApiResponse<CustomerResponse>> UpdateCustomer(
            @PathVariable Integer idkh,
            @Valid @RequestBody CustomerRequest request) {

        CustomerResponse response = customerService.UpdateCustomer(idkh, request);

        return ResponseEntity.ok(
            ApiResponse.success(response, "Cập nhật thông tin khách hàng thành công")
        );
    }

    @DeleteMapping("/{idkh}")
    public ResponseEntity<ApiResponse<Void>> DeleteCustomer(
            @PathVariable Integer idkh) {

        customerService.DeleteCustomerData(idkh);
        
        return ResponseEntity.ok(
            ApiResponse.success("Xóa khách hàng thành công")
        );
    }
}
