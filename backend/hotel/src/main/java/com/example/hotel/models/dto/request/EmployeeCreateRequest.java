package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeCreateRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Chức vụ không được để trống")
    @Size(max = 50, message = "Chức vụ không được quá 50 ký tự")
    private String position;

    @NotNull(message = "Lương không được để trống")
    @DecimalMin(value = "0.0", message = "Lương không được nhỏ hơn 0")
    private BigDecimal salary;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 15, message = "Số điện thoại không được quá 15 ký tự")
    private String phone;

    @NotBlank(message = "CCCD không được để trống")
    @Size(max = 20, message = "CCCD không được quá 20 ký tự")
    private String citizenId;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Giới tính không được để trống")
    @Size(max = 10, message = "Giới tính không được quá 10 ký tự")
    private String gender;

    @Size(max = 255, message = "Địa chỉ không được quá 255 ký tự")
    private String address;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;
}