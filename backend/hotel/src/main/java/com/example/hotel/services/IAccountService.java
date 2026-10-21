package com.example.hotel.services;

import com.example.hotel.models.dto.request.AccountCreateRequest;
import com.example.hotel.models.dto.request.AccountUpdateRequest;
import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.dto.response.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface cho Account Service
 */
public interface IAccountService {
    
    /**
     * Tạo tài khoản mới
     * @param request Thông tin tài khoản cần tạo
     * @return AccountResponse
     */
    AccountResponse createAccount(AccountCreateRequest request);
    
    /**
     * REQ-ACC-004: Lấy danh sách tất cả tài khoản có phân trang và lọc theo trạng thái
     * @param pageable Thông tin phân trang
     * @param isActive Trạng thái hoạt động (true/false/null)
     * @return Page<AccountResponse>
     */
    Page<AccountResponse> getAllAccounts(Pageable pageable, Boolean isActive);
    
    /**
     * REQ-ACC-002: Cập nhật thông tin tài khoản và vai trò
     * REQ-ACC-003: Khóa/Mở khóa tài khoản (thông qua isActive)
     * 
     * @param username Tên đăng nhập của tài khoản cần update
     * @param request Thông tin cần cập nhật
     * @return AccountResponse
     */
    AccountResponse updateAccount(String username, AccountUpdateRequest request);
    
    /**
     * Lấy thông tin tài khoản theo username
     * @param username Tên đăng nhập
     * @return AccountResponse
     */
    AccountResponse getAccountByUsername(String username);

    /**
     * Lấy danh sách nhân viên chưa có tài khoản
     * @return List<EmployeeResponse>
     */
    List<EmployeeResponse> getEmployeesWithoutAccount();
}
