package com.example.hotel.services;

import com.example.hotel.models.dto.request.LoginRequest;
import com.example.hotel.models.dto.response.AuthUserResponse;
import com.example.hotel.models.dto.response.LoginResponse;

public interface IAuthService {

    /** Xác thực username/password, trả về JWT và thông tin người dùng. */
    LoginResponse login(LoginRequest request);

    /** Thông tin tài khoản + nhân viên của người đang đăng nhập (theo token). */
    AuthUserResponse getCurrentUser();
}
