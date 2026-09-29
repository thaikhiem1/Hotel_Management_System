package com.example.hotel.models.dto.request;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomerRequest {
    @NotBlank(message = "Họ và tên khách hàng không được để trống")
    @Length(max = 100, message = "Độ dài tên không quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Length(max = 15, message = "Độ dài số điện thoại không quá 15 ký tự")
    private String phone;

    @NotBlank(message = "Số định danh không được để trống")
    @Length(max = 30, message = "Độ dài số định danh không quá 30 ký tự")
    private String citizenId;

    @NotBlank(message = "Quốc tịch không được để trống")
    @Length(max = 50, message = "Độ dài quốc tịch không quá 50 ký tự")
    private String nationality;

    @NotBlank(message = "Giới tính không được để trống")
    @Length(max = 10, message = "Độ dài không quá 10 ký tự")
    private String gender;
}
