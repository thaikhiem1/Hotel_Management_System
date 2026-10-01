package com.example.hotel.models.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter 
@AllArgsConstructor 
@NoArgsConstructor 
public class ServiceCategoriesResponse {

    @JsonProperty ("serviceCategoryId")
    private Integer serviceCategoryId;
    
    @JsonProperty ("serviceCategoryName")
    private String serviceCategoryName;
}
