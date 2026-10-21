package com.example.hotel.services.impl;

import com.example.hotel.Enums.Role;
import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.AccountMapper;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.AccountCreateRequest;
import com.example.hotel.models.dto.request.AccountUpdateRequest;
import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositories.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.services.IAccountService;
import com.example.hotel.specification.AccountSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation cho quản lý tài khoản
 * Tuân thủ UC-ACC-001
 */
@Service
public class AccountService implements IAccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private EmployeeMapper employeeMapper;

    /**
     * UC-ACC-001: Tạo tài khoản mới
     * 
     * Quy trình:
     * 1. Trim và validate dữ liệu đầu vào
     * 2. Kiểm tra username chưa tồn tại
     * 3. Kiểm tra employee tồn tại và chưa có tài khoản
     * 4. Băm mật khẩu bằng SHA-256
     * 5. Tạo tài khoản với role mặc định RECEPTIONIST và isActive=true
     * 6. Lưu vào database
     * 
     * @param request Thông tin tài khoản cần tạo
     * @return AccountResponse
     * @throws DuplicateResourceException nếu username đã tồn tại hoặc employee đã có tài khoản
     * @throws ResourceNotFoundException nếu employee không tồn tại
     */
    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreateRequest request) {
        // Bước 1: Trim dữ liệu đầu vào
        String username = request.getUsername().trim();
        String password = request.getPassword(); // Không trim password để giữ nguyên
        Integer employeeId = request.getEmployeeId();

        // Bước 2: Kiểm tra username đã tồn tại chưa
        if (accountRepository.existsByUsername(username)) {
            throw new DuplicateResourceException(
                "Tên đăng nhập '" + username + "' đã tồn tại trong hệ thống",
                "username",
                username
            );
        }

        // Bước 3: Kiểm tra employee tồn tại
        employees employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy nhân viên với ID: " + employeeId
            ));

        // Bước 4: Kiểm tra employee chưa có tài khoản
        if (accountRepository.existsByEmployee_EmployeeId(employeeId)) {
            throw new DuplicateResourceException(
                "Nhân viên '" + employee.getFullName() + "' đã có tài khoản trong hệ thống",
                "employeeId",
                employeeId.toString()
            );
        }

        // Bước 5: Băm mật khẩu bằng SHA-256
        String passwordHash = hashPassword(password);

        // Bước 6: Tạo tài khoản mới
        accounts account = new accounts();
        account.setUsername(username);
        account.setPasswordHash(passwordHash);
        account.setRole(Role.RECEPTIONIST); // Vai trò mặc định
        account.setEmployee(employee);
        account.setIsActive(true); // Trạng thái hoạt động mặc định

        // Bước 7: Lưu vào database
        accounts savedAccount = accountRepository.save(account);

        // Bước 8: Chuyển đổi sang DTO và trả về
        return accountMapper.toAccountResponse(savedAccount);
    }

    /**
     * REQ-ACC-004: Lấy danh sách tất cả tài khoản có phân trang và lọc theo trạng thái
     * 
     * @param pageable Thông tin phân trang
     * @param isActive Trạng thái hoạt động:
     *                 - true: Đang hoạt động
     *                 - false: Đã khóa
     *                 - null: Không lọc (lấy tất cả)
     * @return Page<AccountResponse>
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AccountResponse> getAllAccounts(Pageable pageable, Boolean isActive) {
        // Xây dựng Specification với điều kiện lọc
        Specification<accounts> spec = AccountSpecification.withFilters(isActive);
        
        // Truy vấn với Specification và phân trang
        Page<accounts> accountsPage = accountRepository.findAll(spec, pageable);
        
        // Chuyển đổi sang DTO
        return accountsPage.map(accountMapper::toAccountResponse);
    }

    /**
     * Lấy danh sách nhân viên chưa có tài khoản với thông tin đầy đủ
     * 
     * @return List<EmployeeResponse> - Danh sách nhân viên
     */
    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesWithoutAccount() {
        // Lấy tất cả nhân viên đang hoạt động
        List<employees> allActiveEmployees = employeeRepository.findAll()
            .stream()
            .filter(employees::getIsActive)
            .collect(Collectors.toList());

        // Lọc ra những nhân viên chưa có tài khoản và chuyển sang DTO
        return allActiveEmployees.stream()
            .filter(employee -> !accountRepository.existsByEmployee_EmployeeId(employee.getEmployeeId()))
            .map(employeeMapper::toEmployeeResponse)
            .collect(Collectors.toList());
    }

    /**
     * REQ-ACC-002: Cập nhật thông tin tài khoản và vai trò
     * REQ-ACC-003: Khóa/Mở khóa tài khoản
     * 
     * Cho phép cập nhật:
     * - Username (nếu không trùng)
     * - Password (sẽ được băm mới)
     * - Role
     * - isActive (Khóa/Mở khóa)
     * 
     * @param currentUsername Username hiện tại
     * @param request Thông tin cần cập nhật
     * @return AccountResponse
     */
    @Override
    @Transactional
    public AccountResponse updateAccount(String currentUsername, AccountUpdateRequest request) {
        // Bước 1: Tìm tài khoản cần update
        accounts account = accountRepository.findById(currentUsername)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy tài khoản với username: " + currentUsername
            ));

        boolean isUpdated = false;

        // Bước 2: Cập nhật username nếu có và khác với hiện tại
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            
            // Chỉ check duplicate nếu username thay đổi
            if (!newUsername.equals(currentUsername)) {
                if (accountRepository.existsByUsername(newUsername)) {
                    throw new DuplicateResourceException(
                        "Tên đăng nhập '" + newUsername + "' đã tồn tại trong hệ thống",
                        "username",
                        newUsername
                    );
                }
                
                // Note: Vì username là PK, cần xóa và tạo lại entity
                // Hoặc sử dụng cách khác. Ở đây tôi sẽ không cho phép đổi username
                // để tránh phức tạp với JPA @Id
                throw new UnsupportedOperationException(
                    "Hệ thống không hỗ trợ thay đổi tên đăng nhập. Vui lòng tạo tài khoản mới."
                );
            }
        }

        // Bước 3: Cập nhật password nếu có
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            String newPasswordHash = hashPassword(request.getNewPassword());
            account.setPasswordHash(newPasswordHash);
            isUpdated = true;
        }

        // Bước 4: Cập nhật role nếu có
        if (request.getRole() != null) {
            account.setRole(request.getRole());
            isUpdated = true;
        }

        // Bước 5: Cập nhật isActive nếu có (Khóa/Mở khóa)
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
            isUpdated = true;
        }

        // Bước 6: Lưu nếu có thay đổi
        if (isUpdated) {
            account = accountRepository.save(account);
        }

        // Bước 7: Chuyển đổi sang DTO và trả về
        return accountMapper.toAccountResponse(account);
    }

    /**
     * Lấy thông tin tài khoản theo username
     * 
     * @param username Tên đăng nhập
     * @return AccountResponse
     */
    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountByUsername(String username) {
        accounts account = accountRepository.findById(username)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy tài khoản với username: " + username
            ));
        
        return accountMapper.toAccountResponse(account);
    }

    /**
     * Băm mật khẩu bằng SHA-256
     * 
     * @param password Mật khẩu gốc
     * @return Mật khẩu đã băm dạng Base64
     * @throws RuntimeException nếu thuật toán SHA-256 không khả dụng
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi khi băm mật khẩu: Thuật toán SHA-256 không khả dụng", e);
        }
    }
}
