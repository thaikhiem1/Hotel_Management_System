package com.example.hotel.config;

import com.example.hotel.Enums.Role;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Tạo tài khoản ADMIN đầu tiên khi hệ thống chưa có ADMIN nào.
 * API tạo tài khoản luôn gán RECEPTIONIST và nay yêu cầu đăng nhập, nên cần một ADMIN khởi tạo.
 * Đổi mật khẩu ngay sau lần đăng nhập đầu tiên (hoặc đặt BOOTSTRAP_ADMIN_PASSWORD trong .env).
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminBootstrap(
            AccountRepository accountRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.username}") String username,
            @Value("${app.bootstrap-admin.password}") String password) {
        this.accountRepository = accountRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (accountRepository.existsByRole(Role.ADMIN) || accountRepository.existsByUsername(username)) {
            return;
        }

        employees employee = new employees();
        employee.setFullName("Quản trị viên");
        employee.setPosition("Quản trị hệ thống");
        employee.setSalary(BigDecimal.ZERO);
        employee.setPhone("0000000000");
        employee.setCitizenId("000000000000");
        employee.setDateOfBirth(LocalDate.of(1990, 1, 1));
        employee.setGender("Khác");
        employee.setEmail("admin@hotel.local");
        employee.setIsActive(true);
        employee = employeeRepository.save(employee);

        accounts admin = new accounts();
        admin.setUsername(username);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setEmployee(employee);
        admin.setIsActive(true);
        accountRepository.save(admin);

        log.warn("Đã tạo tài khoản ADMIN khởi tạo '{}'. Hãy đổi mật khẩu mặc định!", username);
    }
}
