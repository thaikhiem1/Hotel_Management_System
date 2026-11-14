package com.example.hotel.models.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Báo cáo và thống kê theo kỳ (một tháng hoặc cả năm).
 *
 * Doanh thu là tiền đã thu: tổng các hóa đơn đã thanh toán, tính theo ngày thanh toán (giờ khách sạn).
 * Chi phí lương của kỳ = quỹ lương hằng tháng của nhân viên đang làm việc x số tháng tính lương của kỳ.
 */
public record ReportOverviewResponse(
        /** "MONTH" hoặc "YEAR" */
        String periodType,
        Integer year,
        /** Có giá trị khi xem theo tháng */
        Integer month,

        BigDecimal totalRevenue,
        Long invoiceCount,
        BigDecimal averageRevenuePerInvoice,

        /** Doanh thu và số hóa đơn của kỳ trước (tháng trước hoặc năm trước) để so sánh */
        BigDecimal previousRevenue,
        Long previousInvoiceCount,
        /** Phần trăm thay đổi so với kỳ trước (1 chữ số thập phân); null khi kỳ trước không có doanh thu */
        BigDecimal revenueChangePercent,

        /** Quỹ lương hằng tháng, số nhân viên đang làm việc và lương trung bình mỗi người */
        BigDecimal monthlyPayroll,
        Long employeeCount,
        BigDecimal averageSalary,
        /** Số tháng tính lương trong kỳ: 1 khi xem tháng; khi xem năm là số tháng đã trôi qua của năm đó */
        Integer payrollMonths,
        BigDecimal salaryExpense,

        BigDecimal estimatedProfit,
        /** Lợi nhuận / doanh thu x 100 (1 chữ số thập phân); null khi chưa có doanh thu */
        BigDecimal profitMargin,

        /** Theo ngày khi xem tháng, theo tháng khi xem năm; đủ mọi mốc trong kỳ, mốc không có doanh thu bằng 0 */
        List<RevenuePointResponse> revenuePoints,
        /** Lương hằng tháng của từng nhân viên đang làm việc, lương cao xếp trước */
        List<SalaryByEmployeeResponse> salaryByEmployee) {
}
