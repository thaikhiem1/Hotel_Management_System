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

/**
 * Controller quản lý tài khoản
 * Endpoints: /api/accounts
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private IAccountService accountService;

    /**
     * UC-ACC-001: Tạo tài khoản mới
     * 
     * POST /api/accounts
     * 
     * Request Body:
     * {
     *   "username": "john_doe",
     *   "password": "password123",
     *   "employeeId": 5
     * }
     * 
     * Success Response (201):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 201,
     *   "message": "Tạo tài khoản thành công",
     *   "data": {
     *     "username": "john_doe",
     *     "role": "RECEPTIONIST",
     *     "employeeId": 5,
     *     "employeeName": "John Doe",
     *     "employeePosition": "Nhân Viên Lễ Tân",
     *     "employeeEmail": "john@example.com",
     *     "isActive": true
     *   }
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Dữ liệu không hợp lệ (validation error)
     * - 404 Not Found: Nhân viên không tồn tại
     * - 409 Conflict: Username đã tồn tại hoặc nhân viên đã có tài khoản
     * - 500 Internal Server Error: Lỗi server
     * 
     * @param request Thông tin tài khoản cần tạo
     * @return ResponseEntity<ApiResponse<AccountResponse>>
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        
        AccountResponse response = accountService.createAccount(request);
        
        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
            201,
            response,
            "Tạo tài khoản thành công"
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * REQ-ACC-004: Lấy danh sách tất cả tài khoản có phân trang và lọc theo trạng thái
     * 
     * GET /api/accounts?page=0&size=16&isActive=true
     * 
     * Query Parameters:
     * - page: Số trang (bắt đầu từ 0), mặc định = 0
     * - size: Số bản ghi mỗi trang, mặc định = 16
     * - isActive: Lọc theo trạng thái
     *   + true: Chỉ lấy tài khoản đang hoạt động
     *   + false: Chỉ lấy tài khoản đã khóa
     *   + null/không truyền: Lấy tất cả
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Lấy danh sách tài khoản thành công",
     *   "data": {
     *     "content": [...],
     *     "totalElements": 50,
     *     "totalPages": 4,
     *     "size": 16,
     *     "number": 0
     *   }
     * }
     * 
     * Business Rules:
     * - Chỉ ADMIN được phép xem danh sách tài khoản
     * - Không hiển thị mật khẩu hoặc hash trong response
     * - Phân trang theo quy tắc chung: 16 bản ghi/trang
     * 
     * @param page Số trang (mặc định 0)
     * @param size Số bản ghi mỗi trang (mặc định 16)
     * @param isActive Lọc theo trạng thái (true/false/null)
     * @return ResponseEntity<ApiResponse<Page<AccountResponse>>>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AccountResponse>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) Boolean isActive) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("username").ascending());
        Page<AccountResponse> accountsPage = accountService.getAllAccounts(pageable, isActive);
        
        ApiResponse<Page<AccountResponse>> apiResponse = ApiResponse.success(
            accountsPage,
            "Lấy danh sách tài khoản thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Lấy danh sách nhân viên chưa có tài khoản
     * 
     * GET /api/accounts/available-employees
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Lấy danh sách nhân viên chưa có tài khoản thành công",
     *   "data": [
     *     {
     *       "employeeId": 1,
     *       "fullName": "Nguyễn Văn A",
     *       "position": "Nhân Viên Lễ Tân",
     *       ...
     *     }
     *   ]
     * }
     * 
     * @return ResponseEntity<ApiResponse<List<EmployeeResponse>>>
     */
    @GetMapping("/available-employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAvailableEmployees() {
        
        List<EmployeeResponse> employees = accountService.getEmployeesWithoutAccount();
        
        ApiResponse<List<EmployeeResponse>> apiResponse = ApiResponse.success(
            employees,
            "Lấy danh sách nhân viên chưa có tài khoản thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Lấy thông tin tài khoản theo username
     * 
     * GET /api/accounts/{username}
     * 
     * @param username Tên đăng nhập
     * @return ResponseEntity<ApiResponse<AccountResponse>>
     */
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountByUsername(
            @PathVariable String username) {
        
        AccountResponse account = accountService.getAccountByUsername(username);
        
        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
            account,
            "Lấy thông tin tài khoản thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * REQ-ACC-002: Cập nhật thông tin tài khoản và vai trò
     * REQ-ACC-003: Khóa/Mở khóa tài khoản
     * 
     * PUT /api/accounts/{username}
     * 
     * Request Body (tất cả optional):
     * {
     *   "newPassword": "newPassword123",  // Mật khẩu mới (sẽ được băm)
     *   "role": "MANAGER",                // Vai trò mới (ADMIN/MANAGER/RECEPTIONIST)
     *   "isActive": false                 // Trạng thái (true=Mở, false=Khóa)
     * }
     * 
     * Success Response (200):
     * {
     *   "timestamp": "2024-01-01T10:00:00",
     *   "status": 200,
     *   "message": "Cập nhật tài khoản thành công",
     *   "data": {
     *     "username": "john_doe",
     *     "role": "MANAGER",
     *     "employeeId": 5,
     *     "employeeName": "John Doe",
     *     "employeePosition": "Nhân Viên Lễ Tân",
     *     "employeeEmail": "john@example.com",
     *     "isActive": false
     *   }
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Dữ liệu không hợp lệ
     * - 404 Not Found: Tài khoản không tồn tại
     * - 409 Conflict: Username mới đã tồn tại
     * - 500 Internal Server Error: Lỗi server
     * 
     * Business Rules:
     * - Chỉ ADMIN được phép thực hiện
     * - Username không thể thay đổi (để đơn giản hóa)
     * - Mật khẩu mới sẽ được băm SHA-256 trước khi lưu
     * - isActive: false = Khóa tài khoản, true = Mở khóa
     * 
     * @param username Tên đăng nhập hiện tại
     * @param request Thông tin cần cập nhật
     * @return ResponseEntity<ApiResponse<AccountResponse>>
     */
    @PutMapping("/{username}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable String username,
            @Valid @RequestBody AccountUpdateRequest request) {
        
        AccountResponse response = accountService.updateAccount(username, request);
        
        ApiResponse<AccountResponse> apiResponse = ApiResponse.success(
            response,
            "Cập nhật tài khoản thành công"
        );
        
        return ResponseEntity.ok(apiResponse);
    }

}
