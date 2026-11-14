package com.example.hotel.models.dto.response;

import java.math.BigDecimal;

/**
 * Doanh thu một mốc thời gian của biểu đồ: ngày trong tháng (1-31) khi xem theo tháng,
 * hoặc tháng trong năm (1-12) khi xem theo năm.
 */
public record RevenuePointResponse(Integer period, Long invoiceCount, BigDecimal revenue) {
}
