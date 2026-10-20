package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s'-]+$", message = "Họ và tên chỉ được chứa chữ cái, khoảng trắng và các dấu phân cách tên hợp lý")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    private String phone;

    @NotBlank(message = "Số giấy tờ tùy thân/hộ chiếu không được để trống")
    @Size(max = 30, message = "Số giấy tờ tùy thân/hộ chiếu không được vượt quá 30 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Số giấy tờ tùy thân/hộ chiếu chỉ chấp nhận chữ, số và dấu gạch nối")
    private String citizenId;

    @NotBlank(message = "Quốc tịch không được để trống")
    @Size(max = 50, message = "Quốc tịch không được vượt quá 50 ký tự")
    private String nationality;

    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "^(Nam|Nữ|Khác)$", message = "Giới tính phải là Nam, Nữ hoặc Khác")
    private String gender;
}
