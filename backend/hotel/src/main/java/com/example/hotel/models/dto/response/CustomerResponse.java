package com.example.hotel.models.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomerResponse {
    @JsonProperty("customer_id")
    private Integer customerId;
    @JsonProperty("full_name")
    private String fullName;
    @JsonProperty("phone")
    private String phone;
    @JsonProperty("citizen_id_passport")
    private String citizenId;
    @JsonProperty("nationality")
    private String nationality;
    @JsonProperty("gender")
    private String gender;
}
