package com.example.hotel.services.impl;

import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.LoginRequest;
import com.example.hotel.models.dto.response.AuthUserResponse;
import com.example.hotel.models.dto.response.LoginResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.JwtService;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.services.IAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private static final String INVALID_CREDENTIALS = "Tên đăng nhập hoặc mật khẩu không đúng";

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmployeeMapper employeeMapper;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        accounts account = accountRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException(INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }

        // Chỉ báo "bị khóa" sau khi đã đúng mật khẩu để không lộ tài khoản tồn tại
        CustomUserDetails user = new CustomUserDetails(account);
        if (!user.isEnabled()) {
            throw new DisabledException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên");
        }

        return new LoginResponse(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationMs() / 1000,
                toAuthUser(account));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUserResponse getCurrentUser() {
        Integer accountId = SecurityUtils.requireCurrentUser().getAccountId();
        accounts account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));
        return toAuthUser(account);
    }

    private AuthUserResponse toAuthUser(accounts account) {
        return new AuthUserResponse(
                account.getAccountId(),
                account.getUsername(),
                account.getRole(),
                employeeMapper.toEmployeeResponse(account.getEmployee()));
    }
}
