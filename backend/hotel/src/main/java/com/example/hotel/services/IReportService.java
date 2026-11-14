package com.example.hotel.services;

import com.example.hotel.models.dto.response.ReportOverviewResponse;

/**
 * Báo cáo và thống kê doanh thu, lương, lợi nhuận ước tính.
 */
public interface IReportService {

    /**
     * Báo cáo của một kỳ: có month thì xem theo tháng (biểu đồ theo ngày), không có month thì xem cả năm
     * (biểu đồ theo tháng). Năm phải từ 2000 đến 2100, tháng từ 1 đến 12.
     */
    ReportOverviewResponse getOverview(int year, Integer month);
}
