package com.example.hotel.services.impl;

import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.models.dto.response.ProfileResponse;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.services.IProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * UC-EMP-003 (xem hồ sơ cá nhân) và UC-EMP-006 (cập nhật ảnh đại diện cá nhân).
 */
@Service
@RequiredArgsConstructor
public class ProfileService implements IProfileService {

    /** Đường dẫn công khai của ảnh tải lên, được WebConfig ánh xạ tới thư mục lưu ảnh */
    public static final String AVATAR_URL_PREFIX = "/uploads/avatars/";

    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private static final String MSG_FILE_INVALID =
            "Ảnh đại diện không hợp lệ. Chỉ chấp nhận tệp JPG, JPEG, PNG hoặc WEBP, dung lượng tối đa 5 MB.";
    private static final String MSG_NOT_FOUND = "Không tìm thấy hồ sơ nhân viên của tài khoản đang đăng nhập";
    private static final String MSG_SAVE_FAILED = "Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.";

    private final EmployeeRepository employeeRepository;

    @Value("${app.upload.avatar-dir}")
    private String avatarDir;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        CustomUserDetails me = SecurityUtils.requireCurrentUser();
        return toResponse(me, findEmployee(me));
    }

    /**
     * Không đặt @Transactional: ảnh mới được ghi trước, lưu thông tin ảnh (giao dịch riêng của repository),
     * chỉ khi lưu thành công mới xóa ảnh cũ. Nếu lưu thất bại thì xóa ảnh mới và giữ nguyên ảnh hiện tại.
     */
    @Override
    public ProfileResponse updateMyAvatar(MultipartFile file) {
        CustomUserDetails me = SecurityUtils.requireCurrentUser();
        employees employee = findEmployee(me);

        byte[] content = readAndValidate(file);
        String extension = detectExtension(content);
        if (extension == null || !matchesFileName(file.getOriginalFilename(), extension)) {
            throw invalidFile();
        }

        Path directory = directory();
        Path target = directory.resolve(UUID.randomUUID() + "." + extension);
        String oldAvatar = employee.getAvatar();
        try {
            Files.createDirectories(directory);
            Files.write(target, content);
        } catch (IOException e) {
            throw new IllegalStateException(MSG_SAVE_FAILED, e);
        }

        try {
            employee.setAvatar(AVATAR_URL_PREFIX + target.getFileName());
            employeeRepository.save(employee);
        } catch (RuntimeException e) {
            deleteQuietly(target);
            throw e;
        }

        deleteOldAvatar(oldAvatar, directory);
        return toResponse(me, employee);
    }

    // ------------------------------------------------------------------ kiểm tra tệp ảnh

    private byte[] readAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_SIZE) {
            throw invalidFile();
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw invalidFile();
        }
    }

    /** Nhận dạng theo nội dung thực tế của tệp (không tin tên tệp hay Content-Type do client gửi) */
    private String detectExtension(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return isDecodable(b) ? "jpg" : null;
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) {
            return isDecodable(b) ? "png" : null;
        }
        if (b.length >= 12 && "RIFF".equals(new String(b, 0, 4, StandardCharsets.US_ASCII))
                && "WEBP".equals(new String(b, 8, 4, StandardCharsets.US_ASCII))) {
            return "webp";
        }
        return null;
    }

    private boolean isDecodable(byte[] content) {
        try {
            return ImageIO.read(new ByteArrayInputStream(content)) != null;
        } catch (IOException | RuntimeException e) {
            return false;
        }
    }

    /** Phần mở rộng của tên tệp phải thuộc danh sách cho phép và khớp với nội dung thật */
    private boolean matchesFileName(String originalName, String detectedExtension) {
        if (originalName == null || !originalName.contains(".")) {
            return false;
        }
        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return false;
        }
        return ext.equals(detectedExtension) || (ext.equals("jpeg") && detectedExtension.equals("jpg"));
    }

    private BusinessValidationException invalidFile() {
        return new BusinessValidationException(MSG_FILE_INVALID, Map.of("file", MSG_FILE_INVALID));
    }

    // ------------------------------------------------------------------ lưu trữ và chuyển đổi

    private employees findEmployee(CustomUserDetails me) {
        return employeeRepository.findById(me.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(MSG_NOT_FOUND));
    }

    private Path directory() {
        return Paths.get(avatarDir).toAbsolutePath().normalize();
    }

    /** Chỉ xóa ảnh do người dùng tải lên; ảnh mặc định của hệ thống được giữ lại */
    private void deleteOldAvatar(String oldAvatar, Path directory) {
        if (oldAvatar != null && oldAvatar.startsWith(AVATAR_URL_PREFIX)) {
            deleteQuietly(directory.resolve(Paths.get(oldAvatar).getFileName().toString()));
        }
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // không ảnh hưởng kết quả cập nhật
        }
    }

    private ProfileResponse toResponse(CustomUserDetails me, employees e) {
        return new ProfileResponse(
                e.getEmployeeId(), me.getUsername(), me.getRole(),
                e.getFullName(), e.getPosition(), e.getPhone(), e.getCitizenId(),
                e.getDateOfBirth(), e.getGender(), e.getAddress(), e.getEmail(), e.getAvatar());
    }
}
