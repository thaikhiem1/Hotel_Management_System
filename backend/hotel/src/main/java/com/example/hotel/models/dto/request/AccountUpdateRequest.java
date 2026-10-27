package com.example.hotel.models.dto.request;

import com.example.hotel.Enums.Role;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {

    @Size(max = 50, message = "Tên đăng nhập không được vượt quá 50 ký tự")
    private String username;
    
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String newPassword; 
    
    private Role role;
    
    private Boolean isActive;
}
