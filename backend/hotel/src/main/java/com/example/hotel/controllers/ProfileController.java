package com.example.hotel.controllers;

import com.example.hotel.models.dto.response.ApiResponse;
import com.example.hotel.models.dto.response.ProfileResponse;
import com.example.hotel.services.IProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Hồ sơ cá nhân của người đang đăng nhập (mọi vai trò): UC-EMP-003, UC-EMP-006.
 * Không nhận mã nhân viên từ client; nhân viên lấy từ tài khoản trong JWT.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final IProfileService profileService;

    /** GET /api/profile - xem hồ sơ cá nhân */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(profileService.getMyProfile(), "Lấy hồ sơ cá nhân thành công"));
    }

    /** PUT /api/profile/avatar - multipart, trường "file": JPG/JPEG/PNG/WEBP, tối đa 5 MB */
    @PutMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileResponse>> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateMyAvatar(file), "Cập nhật ảnh đại diện thành công"));
    }
}
