package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServicesRequest {
    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(min = 1, max = 100, message = "Tên dịch vụ phải có từ 1 đến 100 ký tự")
    private String serviceName;

    @NotNull(message = "Danh mục dịch vụ không được để trống")
    @Positive(message = "Mã danh mục dịch vụ phải là số nguyên dương")
    private Integer serviceCategoryId;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá không được âm")
    @Digits(integer = 16, fraction = 2, message = "Đơn giá có tối đa 16 chữ số phần nguyên và 2 chữ số phần thập phân")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "Số lượng tồn kho không được âm")
    private Integer stockQuantity;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(min = 1, max = 20, message = "Đơn vị tính phải có từ 1 đến 20 ký tự")
    private String unit;

    /** Không gửi thì giữ nguyên (khi cập nhật) hoặc mặc định đang cung cấp (khi tạo mới) */
    private Boolean isActive;
}
