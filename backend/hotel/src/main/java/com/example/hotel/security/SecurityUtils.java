package com.example.hotel.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Lấy người dùng hiện tại ở bất kỳ đâu (service, controller...):
 * <pre>
 *   CustomUserDetails me = SecurityUtils.requireCurrentUser();
 *   Integer employeeId = me.getEmployeeId();
 * </pre>
 * Trong controller cũng có thể dùng {@code @AuthenticationPrincipal CustomUserDetails me}.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<CustomUserDetails> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static CustomUserDetails requireCurrentUser() {
        return getCurrentUser().orElseThrow(
                () -> new IllegalStateException("Không có người dùng đăng nhập trong ngữ cảnh hiện tại"));
    }
}
