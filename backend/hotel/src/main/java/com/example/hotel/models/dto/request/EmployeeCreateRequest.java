package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * UC-EMP-001: Request DTO để thêm nhân viên mới
 * Bước 8: Validation các trường thông tin theo REQ-EMP-001
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeCreateRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Họ và tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;

    @NotBlank(message = "Chức vụ không được để trống")
    @Size(max = 50, message = "Chức vụ không được vượt quá 50 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Chức vụ chỉ được chứa chữ cái và khoảng trắng")
    private String position;

    @NotNull(message = "Lương không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Lương không được âm")
    @Digits(integer = 16, fraction = 2, message = "Lương có tối đa hai chữ số thập phân")
    private BigDecimal salary;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    private String phone;

    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "^0\\d{11}$", message = "Số CCCD phải gồm đúng 12 chữ số và bắt đầu bằng số 0")
    private String citizenId;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "^(Nam|Nữ|Khác)$", message = "Giới tính phải là Nam, Nữ hoặc Khác")
    private String gender;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;
}