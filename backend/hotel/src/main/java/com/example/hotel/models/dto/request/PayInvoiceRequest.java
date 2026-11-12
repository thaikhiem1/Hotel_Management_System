package com.example.hotel.models.dto.request;

import com.example.hotel.Enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Thanh toán hóa đơn: phương thức do người thu tiền chọn; số tiền luôn là tổng đã lập trên hóa đơn.
 */
@Getter
@Setter
@NoArgsConstructor
public class PayInvoiceRequest {
    @NotNull(message = "Vui lòng chọn phương thức thanh toán")
    private PaymentMethod paymentMethod;
}
