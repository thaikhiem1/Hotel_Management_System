package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.ReceiptStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class RentalReceiptResponse {
    private Integer rentalReceiptId;
    private String receiptCode;
    private LocalDateTime rentalDate;
    private ReceiptStatus receiptStatus;
    private CustomerResponse customer;
    private Integer employeeId;
    private String employeeName;
    private BigDecimal estimatedTotalAmount;
    private List<BookingDetailResponse> details;
    /** Lịch sử hủy toàn phiếu (khi mọi chi tiết đều đã hủy): chỉ có khi phiếu đã hủy */
    private LocalDateTime cancelledAt;
    private String cancelReason;
}
