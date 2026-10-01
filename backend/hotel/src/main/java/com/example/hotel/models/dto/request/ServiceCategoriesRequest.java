package com.example.hotel.models.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class ServiceCategoriesRequest {

    @NotBlank (message = "Tên loại dịch vụ không được bỏ trống")
    @Size(max = 100, message = "độ dài không được quá 100 ký tự")
    @JsonProperty("serviceCategoryName")
    private String serviceCategoryName;
}
