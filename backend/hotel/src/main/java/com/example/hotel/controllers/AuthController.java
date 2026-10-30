package com.example.hotel.controllers;

import com.example.hotel.models.dto.request.LoginRequest;
import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.AuthUserResponse;
import com.example.hotel.models.dto.response.LoginResponse;
import com.example.hotel.services.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    /**
     * POST /api/auth/login - Đăng nhập, trả về JWT
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Đăng nhập thành công"));
    }

    /**
     * GET /api/auth/me - Tài khoản + nhân viên của người đang đăng nhập
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(), "Lấy thông tin người dùng thành công"));
    }
}
