package com.example.hotel.models.dto.response;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.Enums.PricingMethod;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UC-REN-007: kết quả trả phòng thành công và hóa đơn vừa lập.
 */
@Getter
@AllArgsConstructor
public class CheckOutResponse {
    private Integer bookingDetailId;
    private BookingStatus bookingStatus;
    private Integer rentalReceiptId;
    private String receiptCode;
    private ReceiptStatus receiptStatus;
    private Integer roomId;
    private String roomCode;
    private RoomStatus roomStatus;
    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckOut;
    private Integer invoiceId;
    private String invoiceCode;
    private InvoiceStatus invoiceStatus;
    private PricingMethod pricingMethod;
    private BigDecimal unitPrice;
    private Integer billedUnits;
    private BigDecimal roomAmount;
    private BigDecimal serviceAmount;
    private BigDecimal totalAmount;
    private LocalDateTime issuedAt;
}
