package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

/**
 * Hồ sơ cá nhân của người đang đăng nhập (UC-EMP-003).
 * Chỉ gồm thông tin được phép xem; không trả về lương.
 */
@Getter
@AllArgsConstructor
public class ProfileResponse {
    private Integer employeeId;
    private String username;
    private Role role;
    private String fullName;
    private String position;
    private String phone;
    private String citizenId;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String email;
    private String avatar;
}
