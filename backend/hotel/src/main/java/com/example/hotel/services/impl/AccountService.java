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
import com.example.hotel.repositorys.AccountRepository;
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
        String password = request.getPassword().trim();
        Integer employeeId = request.getEmployeeId();

        // Kiểm tra username đã tồn tại chưa
        if (accountRepository.existsByUsername(username)) {
            throw new DuplicateResourceException(
                    "Tên đăng nhập '" + username + "' đã tồn tại trong hệ thống",
                    "username",
                    username);
        }

        // Kiểm tra employee tồn tại
        employees employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với ID: " + employeeId));

        // Kiểm tra employee chưa có tài khoản
        if (accountRepository.existsByEmployee_EmployeeId(employeeId)) {
            throw new DuplicateResourceException(
                    "Nhân viên '" + employee.getFullName() + "' đã có tài khoản trong hệ thống",
                    "employeeId",
                    employeeId.toString());
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

        // Lưu vào database
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
        // Lấy danh sách ID nhân viên đã có tài khoản
        List<Integer> employeeIdsWithAccount = accountRepository.findAllEmployeeIdsWithAccount();

        // Lấy tất cả nhân viên đang hoạt động
        List<employees> allActiveEmployees = employeeRepository.findAll()
                .stream()
                .filter(employees::getIsActive)
                .collect(Collectors.toList());

        // Lọc ra những nhân viên chưa có tài khoản và chuyển sang DTO
        return allActiveEmployees.stream()
                .filter(employee -> !employeeIdsWithAccount.contains(employee.getEmployeeId()))
                .map(employeeMapper::toEmployeeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(
            Integer accountId,
            AccountUpdateRequest request) {

        if(accountId == null){
                throw new IllegalArgumentException(
                        "Tài khoản không tồn tại: " + accountId);
        }
        // Tìm tài khoản cần cập nhật
        accounts account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với ID: " + accountId));

        boolean isUpdated = false;

        // Cập nhật username nếu có yêu cầu
        String newUsername = request.getUsername();
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            newUsername = newUsername.trim();
            
            // Chỉ kiểm tra trùng lặp nếu username mới khác với username hiện tại
            if (!newUsername.equals(account.getUsername())) {
                // Kiểm tra username mới đã tồn tại chưa (ngoại trừ tài khoản hiện tại)
                if (accountRepository.existsByUsernameAndAccountIdNot(newUsername, accountId)) {
                    throw new DuplicateResourceException(
                            "Tên đăng nhập '" + newUsername + "' đã tồn tại trong hệ thống",
                            "username",
                            newUsername);
                }
                account.setUsername(newUsername);
                isUpdated = true;
            }
        }

        // Cập nhật mật khẩu nếu có yêu cầu
        String newPassword = request.getNewPassword();

        if (newPassword != null && !newPassword.isEmpty()) {
            String newPasswordHash = passwordEncoder.encode(newPassword);
            account.setPasswordHash(newPasswordHash);
            isUpdated = true;
        }

        // Cập nhật vai trò nếu có yêu cầu
        Role newRole = request.getRole();

        if (newRole != null) {
            if (newRole != Role.RECEPTIONIST && newRole != Role.MANAGER) {
                throw new IllegalArgumentException(
                        "Role không được phép gán: " + newRole);
            }

            if (account.getRole() != newRole) {
                account.setRole(newRole);
                isUpdated = true;
            }
        }

        // Cập nhật trạng thái tài khoản nếu có yêu cầu
        Boolean newIsActive = request.getIsActive();

        if (newIsActive != null && !newIsActive.equals(account.getIsActive())) {
            account.setIsActive(newIsActive);
            isUpdated = true;
        }

        // Chỉ lưu khi có thay đổi
        if (isUpdated) {
            account = accountRepository.save(account);
        }

        // Trả về thông tin tài khoản
        return accountMapper.toAccountResponse(account);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Integer accountId) {
        accounts account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với ID: " + accountId));

        return accountMapper.toAccountResponse(account);
    }


    /**
     * Verify mật khẩu
     * So sánh plain password với BCrypt hash
     * 
     * @param rawPassword     Mật khẩu plain text
     * @param encodedPassword Mật khẩu đã mã hóa BCrypt
     * @return true nếu khớp, false nếu không
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
