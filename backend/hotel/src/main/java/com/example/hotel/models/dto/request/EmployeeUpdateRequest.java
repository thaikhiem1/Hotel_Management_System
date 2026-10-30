package com.example.hotel.models.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeUpdateRequest {

    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Họ và tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;

    @Pattern(regexp = "^(ADMIN|MANAGER|RECEPTIONIST)$", message = "Chức vụ phải là Quản trị viên, Quản lý hoặc Lễ tân")
    private String position;

    @DecimalMin(value = "0.0", inclusive = true, message = "Lương không được âm")
    @Digits(integer = 16, fraction = 2, message = "Lương có tối đa hai chữ số thập phân")
    private BigDecimal salary;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    private String phone;

    @Pattern(regexp = "^0\\d{11}$", message = "Số CCCD phải gồm đúng 12 chữ số và bắt đầu bằng số 0")
    private String citizenId;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(Nam|Nữ|Khác)$", message = "Giới tính phải là Nam, Nữ hoặc Khác")
    private String gender;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Pattern(regexp = "^\\S+$", message = "Email không được để trống")
    private String email;

    private Boolean isActive;
}
