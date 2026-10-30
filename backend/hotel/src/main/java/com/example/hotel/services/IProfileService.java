package com.example.hotel.services;

import com.example.hotel.models.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Hồ sơ cá nhân: người dùng chỉ xem và cập nhật ảnh đại diện của chính mình.
 * Nhân viên được xác định từ tài khoản đang đăng nhập, không nhận mã nhân viên từ client.
 */
public interface IProfileService {

    /** UC-EMP-003: xem hồ sơ cá nhân */
    ProfileResponse getMyProfile();

    /** UC-EMP-006: cập nhật ảnh đại diện của chính mình */
    ProfileResponse updateMyAvatar(MultipartFile file);
}
