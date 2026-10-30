package com.example.hotel.models.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * UC-REN-010: yêu cầu tính chi phí dự kiến
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RentalEstimateRequest {

    @NotEmpty(message = "Vui lòng chọn ít nhất một phòng để tính chi phí")
    @Valid
    private List<RentalDetailRequest> details;
}
