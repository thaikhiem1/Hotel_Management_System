package com.example.hotel.models.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.*;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class EmployeeResponse {
    @JsonProperty("employeeId")
    private Integer employeeId;
    @JsonProperty("fullName")
    private String fullName;
    @JsonProperty("position")
    private String position;
    @JsonProperty("salary")
    private BigDecimal salary;
    @JsonProperty("phone")
    private String phone;
    @JsonProperty("citizenId")
    private String citizenId;
    @JsonProperty("dateOfBirth")
    private LocalDate dateOfBirth;
    @JsonProperty("gender")
    private String gender;
    @JsonProperty("address")
    private String address;
    @JsonProperty("email")
    private String email;
    @JsonProperty("avatar")
    private String avatar;
    @JsonProperty("isActive")
    private Boolean isActive;
}
