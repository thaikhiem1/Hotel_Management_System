package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Tài khoản đang đăng nhập kèm đầy đủ thông tin nhân viên liên kết.
 */
@Getter
@AllArgsConstructor
public class AuthUserResponse {
    private Integer accountId;
    private String username;
    private Role role;
    private EmployeeResponse employee;
}
