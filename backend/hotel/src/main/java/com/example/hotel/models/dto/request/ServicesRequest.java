package com.example.hotel.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import jakarta.validation.constraints.Positive;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServicesRequest {
    @NotBlank(message = "Service name is required")
    @Size(max = 100, message = "Service name must not exceed 100 characters")
    private String serviceName;

    @NotBlank(message = "Service category is required")
    private Integer serviceCategoryId;

    @NotNull(message = "unit price is required")
    @Positive(message = "unit price must be greater than 0")
    private BigDecimal unitPrice;

    @Positive(message = "Stock must be a positive number")
    private Integer stockQuantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;
}
