package com.example.hotel.security;

import com.example.hotel.Enums.Role;
import com.example.hotel.models.entities.accounts;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Thông tin người đang đăng nhập (lưu trong SecurityContext).
 * Mang theo accountId và employeeId để các chức năng khác biết "ai đang thao tác".
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final Integer accountId;
    private final Integer employeeId;
    private final String username;
    private final String passwordHash;
    private final Role role;
    private final boolean enabled;

    public CustomUserDetails(accounts account) {
        this.accountId = account.getAccountId();
        this.employeeId = account.getEmployee().getEmployeeId();
        this.username = account.getUsername();
        this.passwordHash = account.getPasswordHash();
        this.role = account.getRole();
        // Tài khoản và nhân viên đều phải còn hoạt động
        this.enabled = Boolean.TRUE.equals(account.getIsActive())
                && Boolean.TRUE.equals(account.getEmployee().getIsActive());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
