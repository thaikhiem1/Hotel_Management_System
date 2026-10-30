package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    /** Thời gian sống của token, tính bằng giây */
    private long expiresIn;
    private AuthUserResponse user;
}
