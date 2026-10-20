package com.example.hotel.services;

import org.springframework.data.domain.Page;

import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;

public interface ICustomerService {
    
    /**
     * UC-CUS-003: Tra cứu thông tin khách hàng với phân trang và bộ lọc
     * 
     * @param page - Số trang (bắt đầu từ 0)
     * @param size - Số bản ghi mỗi trang
     * @param search - Từ khóa tìm kiếm (họ tên, SĐT, CCCD/Passport)
     * @param gender - Lọc theo giới tính
     * @param nationality - Lọc theo quốc tịch
     * @return Page<CustomerResponse> - Danh sách khách hàng phân trang
     */
    Page<CustomerResponse> GetAllWithPagination(
        int page, 
        int size, 
        String search, 
        String gender, 
        String nationality
    );

    CustomerResponse CreateCustomer(CustomerRequest request);

    CustomerResponse UpdateCustomer(Integer customerId, CustomerRequest request);

    void DeleteCustomerData(Integer customerId);
}
