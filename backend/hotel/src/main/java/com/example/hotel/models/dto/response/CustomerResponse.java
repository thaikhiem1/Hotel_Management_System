package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomerResponse {
    private Integer customerId;
    private String fullName;
    private String phone;
    private String citizenId;
    private String nationality;
    private String gender;
}
