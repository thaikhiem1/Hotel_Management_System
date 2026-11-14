package com.example.hotel.services.impl;

import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.models.dto.response.ReportOverviewResponse;
import com.example.hotel.models.dto.response.RevenuePointResponse;
import com.example.hotel.models.dto.response.SalaryByEmployeeResponse;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.services.IReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Báo cáo doanh thu: tiền đã thu (hóa đơn đã thanh toán) theo ngày thanh toán, tính theo giờ khách sạn.
 * Mỗi kỳ được so với kỳ liền trước (tháng trước hoặc năm trước).
 */
@Service
@RequiredArgsConstructor
public class ReportService implements IReportService {

    private static final int MIN_YEAR = 2000;
    private static final int MAX_YEAR = 2100;

    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public ReportOverviewResponse getOverview(int year, Integer month) {
        if (year < MIN_YEAR || year > MAX_YEAR) {
            throw new BusinessValidationException("Năm phải từ " + MIN_YEAR + " đến " + MAX_YEAR + ".",
                    Map.of("year", "Năm không hợp lệ"));
        }
        if (month != null && (month < 1 || month > 12)) {
            throw new BusinessValidationException("Tháng phải từ 1 đến 12.", Map.of("month", "Tháng không hợp lệ"));
        }

        boolean byMonth = month != null;
        LocalDateTime from = byMonth ? LocalDate.of(year, month, 1).atStartOfDay() : LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to = byMonth ? from.plusMonths(1) : from.plusYears(1);
        LocalDateTime previousFrom = byMonth ? from.minusMonths(1) : from.minusYears(1);

        BigDecimal revenue = invoiceRepository.sumPaidBetween(from, to);
        long invoiceCount = invoiceRepository.countPaidBetween(from, to);
        BigDecimal previousRevenue = invoiceRepository.sumPaidBetween(previousFrom, from);
        long previousInvoiceCount = invoiceRepository.countPaidBetween(previousFrom, from);

        List<SalaryByEmployeeResponse> salaryByEmployee = employeeRepository.salaryByEmployee();
        BigDecimal monthlyPayroll = salaryByEmployee.stream()
                .map(SalaryByEmployeeResponse::salary).reduce(BigDecimal.ZERO, BigDecimal::add);
        long employeeCount = salaryByEmployee.size();
        int payrollMonths = payrollMonths(year, byMonth);
        BigDecimal salaryExpense = monthlyPayroll.multiply(BigDecimal.valueOf(payrollMonths));
        BigDecimal profit = revenue.subtract(salaryExpense);

        return new ReportOverviewResponse(
                byMonth ? "MONTH" : "YEAR",
                year,
                month,
                revenue,
                invoiceCount,
                divide(revenue, invoiceCount, 0),
                previousRevenue,
                previousInvoiceCount,
                changePercent(revenue, previousRevenue),
                monthlyPayroll,
                employeeCount,
                divide(monthlyPayroll, employeeCount, 0),
                payrollMonths,
                salaryExpense,
                profit,
                revenue.signum() == 0 ? null : profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 1, RoundingMode.HALF_UP),
                revenuePoints(year, month, from, to),
                salaryByEmployee);
    }

    /** Đủ mọi mốc trong kỳ (mốc không phát sinh doanh thu bằng 0) để biểu đồ liên tục */
    private List<RevenuePointResponse> revenuePoints(int year, Integer month, LocalDateTime from, LocalDateTime to) {
        boolean byMonth = month != null;
        List<RevenuePointResponse> rows = byMonth
                ? invoiceRepository.revenueByDay(from, to)
                : invoiceRepository.revenueByMonth(from, to);
        Map<Integer, RevenuePointResponse> byPeriod = new HashMap<>();
        for (RevenuePointResponse row : rows) {
            byPeriod.put(row.period(), row);
        }
        int count = byMonth ? YearMonth.of(year, month).lengthOfMonth() : 12;
        List<RevenuePointResponse> points = new ArrayList<>(count);
        for (int period = 1; period <= count; period++) {
            RevenuePointResponse row = byPeriod.get(period);
            points.add(row != null ? row : new RevenuePointResponse(period, 0L, BigDecimal.ZERO));
        }
        return points;
    }

    /** Một tháng tính 1 tháng lương; một năm tính số tháng đã trôi qua của năm đó (năm tương lai chưa có tháng nào) */
    private int payrollMonths(int year, boolean byMonth) {
        if (byMonth) {
            return 1;
        }
        LocalDate today = LocalDate.now(clock);
        if (year < today.getYear()) {
            return 12;
        }
        return year == today.getYear() ? today.getMonthValue() : 0;
    }

    private BigDecimal divide(BigDecimal total, long count, int scale) {
        return count == 0 ? BigDecimal.ZERO : total.divide(BigDecimal.valueOf(count), scale, RoundingMode.HALF_UP);
    }

    private BigDecimal changePercent(BigDecimal current, BigDecimal previous) {
        if (previous.signum() == 0) {
            return null;
        }
        return current.subtract(previous).multiply(BigDecimal.valueOf(100)).divide(previous, 1, RoundingMode.HALF_UP);
    }
}
