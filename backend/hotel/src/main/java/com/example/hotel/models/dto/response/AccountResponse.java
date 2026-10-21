package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO Response - Thông tin tài khoản
 */
@Getter
@AllArgsConstructor
public class AccountResponse {
    
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("role")
    private Role role;
    
    @JsonProperty("employeeId")
    private Integer employeeId;
    
    @JsonProperty("employeeName")
    private String employeeName;
    
    @JsonProperty("employeePosition")
    private String employeePosition;
    
    @JsonProperty("employeeEmail")
    private String employeeEmail;
    
    @JsonProperty("isActive")
    private Boolean isActive;
}
