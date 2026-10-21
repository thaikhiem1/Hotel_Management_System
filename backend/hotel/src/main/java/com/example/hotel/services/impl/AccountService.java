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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreateRequest request) {
        // Trim dữ liệu đầu vào
        String username = request.getUsername().trim();
        String password = request.getPassword(); // Không trim password để giữ nguyên
        Integer employeeId = request.getEmployeeId();

        // Kiểm tra username đã tồn tại chưa
        if (accountRepository.existsByUsername(username)) {
            throw new DuplicateResourceException(
                "Tên đăng nhập '" + username + "' đã tồn tại trong hệ thống",
                "username",
                username
            );
        }

        // Kiểm tra employee tồn tại
        employees employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy nhân viên với ID: " + employeeId
            ));

        // Kiểm tra employee chưa có tài khoản
        if (accountRepository.existsByEmployee_EmployeeId(employeeId)) {
            throw new DuplicateResourceException(
                "Nhân viên '" + employee.getFullName() + "' đã có tài khoản trong hệ thống",
                "employeeId",
                employeeId.toString()
            );
        }

        // Băm mật khẩu bằng BCrypt
        String passwordHash = passwordEncoder.encode(password);

        // Tạo tài khoản mới
        accounts account = new accounts();
        account.setUsername(username);
        account.setPasswordHash(passwordHash);
        account.setRole(Role.RECEPTIONIST); 
        account.setEmployee(employee);
        account.setIsActive(true); 

        //  Lưu vào database
        accounts savedAccount = accountRepository.save(account);

        // Chuyển đổi sang DTO và trả về
        return accountMapper.toAccountResponse(savedAccount);
    }

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

    @Override
    @Transactional
    public AccountResponse updateAccount(String currentUsername, AccountUpdateRequest request) {
        //Tìm tài khoản cần update
        accounts account = accountRepository.findById(currentUsername)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy tài khoản với username: " + currentUsername
            ));

        boolean isUpdated = false;

        // Cập nhật password nếu có
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            String newPasswordHash = passwordEncoder.encode(request.getNewPassword());
            account.setPasswordHash(newPasswordHash);
            isUpdated = true;
        }

        //  Cập nhật role nếu có
        if (request.getRole() != null) {
            account.setRole(request.getRole());
            isUpdated = true;
        }

        // Cập nhật isActive nếu có (Khóa/Mở khóa)
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
            isUpdated = true;
        }

        // Lưu nếu có thay đổi
        if (isUpdated) {
            account = accountRepository.save(account);
        }

        //  Chuyển đổi sang DTO và trả về
        return accountMapper.toAccountResponse(account);
    }

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
     * Verify mật khẩu
     * So sánh plain password với BCrypt hash
     * 
     * @param rawPassword Mật khẩu plain text
     * @param encodedPassword Mật khẩu đã mã hóa BCrypt
     * @return true nếu khớp, false nếu không
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
