import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/lib/util';
import {
  RevenueChart,
  SalaryChart,
  StatCard,
  DateRangeFilter
} from '@/components/reports';
import { reportAPI } from '@/services/api';
import { positionLabel } from '@/utils/auth';
import { formatPrice } from '@/utils/format';
import { getErrorMessage } from '@/utils/notification';

const toMillions = (amount) => `${(Number(amount || 0) / 1000000).toFixed(1)}tr`;
const toThousands = (amount) => `${Math.round(Number(amount || 0) / 1000).toLocaleString('vi-VN')}k`;

/** Dòng chữ so sánh với kỳ trước từ phần trăm thay đổi do máy chủ tính (null khi kỳ trước chưa có doanh thu) */
const trendText = (percent, periodType) => {
  const previous = periodType === 'MONTH' ? 'tháng trước' : 'năm trước';
  if (percent == null) return { trend: `Chưa có doanh thu ${previous} để so sánh`, trendUp: true };
  const value = Number(percent);
  return { trend: `${value >= 0 ? '+' : ''}${value.toFixed(1)}% so với ${previous}`, trendUp: value >= 0 };
};

/** Tải bảng doanh thu của kỳ đang xem dạng CSV (có BOM để Excel đọc đúng tiếng Việt) */
const exportCsv = (report) => {
  const byMonth = report.periodType === 'MONTH';
  const rows = [
    [byMonth ? `Báo cáo doanh thu tháng ${report.month}/${report.year}` : `Báo cáo doanh thu năm ${report.year}`],
    [],
    [byMonth ? 'Ngày' : 'Tháng', 'Doanh thu (đ)', 'Số hóa đơn'],
    ...report.revenuePoints.map((p) => [p.period, p.revenue, p.invoiceCount]),
    [],
    ['Tổng doanh thu (đ)', report.totalRevenue, report.invoiceCount],
    ['Chi phí lương (đ)', report.salaryExpense],
    ['Lợi nhuận ước tính (đ)', report.estimatedProfit],
    [],
    ['Nhân viên', 'Chức vụ', 'Lương hằng tháng (đ)'],
    ...report.salaryByEmployee.map((s) => [s.fullName, positionLabel(s.position), s.salary]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = byMonth ? `bao-cao-${report.year}-${String(report.month).padStart(2, '0')}.csv` : `bao-cao-${report.year}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * BaoCaoThongKePage - Trang báo cáo & thống kê (chỉ ADMIN và MANAGER)
 * Dữ liệu từ GET /api/reports/overview?year&month: doanh thu là tiền đã thu theo ngày thanh toán,
 * chi phí lương từ nhân viên đang làm việc, lợi nhuận = doanh thu - chi phí lương của kỳ.
 */
const BaoCaoThongKePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [currentFilter, setCurrentFilter] = useState({
    type: 'month',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState({ key: null, report: null, error: null });

  // Theo dõi giao diện sáng/tối để đổi màu biểu đồ
  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const queryKey = JSON.stringify({ ...currentFilter, reloadToken });
  const loading = result.key !== queryKey;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await reportAPI.getOverview({
          year: currentFilter.year,
          month: currentFilter.type === 'month' ? currentFilter.month : undefined
        });
        if (!cancelled) setResult({ key: queryKey, report: response.data, error: null });
      } catch (error) {
        if (!cancelled) {
          setResult({ key: queryKey, report: null, error: getErrorMessage(error, 'Không thể tải báo cáo thống kê.') });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey, currentFilter]);

  const report = result.report;
  const byMonth = report?.periodType === 'MONTH';

  const revenueChartData = useMemo(
    () =>
      (report?.revenuePoints ?? []).map((p) => ({
        name: byMonth ? `${p.period}` : `T${p.period}`,
        doanhThu: Number(p.revenue),
        soHoaDon: p.invoiceCount
      })),
    [report, byMonth]
  );

  const salaryChartData = useMemo(
    () =>
      (report?.salaryByEmployee ?? []).map((s) => ({
        name: s.fullName,
        chucVu: positionLabel(s.position),
        tongLuong: Number(s.salary)
      })),
    [report]
  );

  // Bảng: theo tháng thì mọi tháng của năm; theo ngày thì chỉ các ngày có thanh toán
  const tableRows = useMemo(
    () => (report?.revenuePoints ?? []).filter((p) => !byMonth || p.invoiceCount > 0),
    [report, byMonth]
  );

  const periodLabel = currentFilter.type === 'month' ? ` - Tháng ${currentFilter.month}/${currentFilter.year}` : ` - Năm ${currentFilter.year}`;
  const trend = report ? trendText(report.revenueChangePercent, report.periodType) : null;

  return (
    <div className="w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-xs">
            Báo cáo & Thống kê
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Thống kê doanh thu, lương nhân viên và báo cáo tài chính
          </p>
        </div>

        <div className="flex flex-wrap gap-space-sm">
          <button
            onClick={() => setReloadToken((t) => t + 1)}
            disabled={loading}
            className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span className={cn('material-symbols-outlined text-[24px]', loading && 'animate-spin')}>refresh</span>
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => report && exportCsv(report)}
            disabled={!report}
            className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/80 text-on-primary font-label-lg font-semibold transition-colors shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[24px]">download</span>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {result.error && (
        <div className="p-space-lg rounded-lg bg-error-container text-on-error-container border border-error/30">
          {result.error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        <StatCard
          title="Tổng doanh thu"
          value={report ? toMillions(report.totalRevenue) : '—'}
          subtitle={report ? `${report.invoiceCount} hóa đơn đã thanh toán` : undefined}
          icon="trending_up"
          gradient="from-brand-light to-brand-dark"
          trend={trend?.trend}
          trendUp={trend?.trendUp}
        />

        <StatCard
          title="Chi phí lương"
          value={report ? toMillions(report.salaryExpense) : '—'}
          subtitle={
            report
              ? `${report.employeeCount} nhân viên • ${report.payrollMonths} tháng lương (${toMillions(report.monthlyPayroll)}/tháng)`
              : undefined
          }
          icon="payments"
          gradient="from-blue-500 to-blue-700"
        />

        <StatCard
          title="Lợi nhuận ước tính"
          value={report ? toMillions(report.estimatedProfit) : '—'}
          subtitle={
            report
              ? report.profitMargin != null
                ? `Margin: ${Number(report.profitMargin).toFixed(1)}%`
                : 'Chưa có doanh thu trong kỳ'
              : undefined
          }
          icon="account_balance"
          gradient="from-emerald-500 to-emerald-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Date Range Filter */}
        <div className="lg:col-span-1">
          <DateRangeFilter currentFilter={currentFilter} onFilterChange={setCurrentFilter} />

          {/* Additional Stats */}
          <div className="mt-space-lg p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h3 className="font-title-lg font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">insights</span>
              Thông tin chi tiết
            </h3>

            <div className="space-y-space-md">
              <div className="pb-space-md border-b border-outline-variant">
                <p className="font-label-sm text-on-surface-variant mb-space-xs">Trung bình/hóa đơn</p>
                <p className="font-title-lg font-bold text-on-surface">{report ? toThousands(report.averageRevenuePerInvoice) : '—'}</p>
              </div>

              <div className="pb-space-md border-b border-outline-variant">
                <p className="font-label-sm text-on-surface-variant mb-space-xs">Lương trung bình/NV (tháng)</p>
                <p className="font-title-lg font-bold text-on-surface">{report ? toThousands(report.averageSalary) : '—'}</p>
              </div>

              <div>
                <p className="font-label-sm text-on-surface-variant mb-space-xs">Doanh thu kỳ trước</p>
                <p className="font-title-lg font-bold text-on-surface">
                  {report ? `${formatPrice(report.previousRevenue)} (${report.previousInvoiceCount} hóa đơn)` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-space-lg">
          {/* Revenue Chart */}
          <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-md">
              <h2 className="font-title-xl font-semibold text-on-surface flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary">show_chart</span>
                Biểu đồ doanh thu
                {periodLabel}
              </h2>

              {/* Chart Type Toggle */}
              <div className="flex gap-space-xs bg-surface-container rounded-lg p-space-xs">
                {[['line', 'show_chart'], ['bar', 'bar_chart']].map(([type, icon]) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={cn(
                      'px-space-md py-space-sm rounded-md font-label-sm font-semibold transition-colors',
                      chartType === type ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-space-xl">
                <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
              </div>
            ) : (
              <RevenueChart data={revenueChartData} chartType={chartType} isDarkMode={isDarkMode} />
            )}
          </div>

          {/* Salary Chart */}
          <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h2 className="font-title-xl font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Lương hằng tháng theo nhân viên
            </h2>

            {loading ? (
              <div className="flex justify-center py-space-xl">
                <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
              </div>
            ) : (
              <SalaryChart data={salaryChartData} isDarkMode={isDarkMode} />
            )}
          </div>

          {/* Revenue Table */}
          <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h2 className="font-title-xl font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              {byMonth ? 'Bảng chi tiết doanh thu theo ngày' : 'Bảng chi tiết doanh thu theo tháng'}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-surface-container">
                  <tr>
                    <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">
                      {byMonth ? 'Ngày' : 'Tháng'}
                    </th>
                    <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">Doanh thu</th>
                    <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">Số hóa đơn</th>
                    <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">Trung bình/HĐ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {tableRows.map((item) => (
                    <tr key={item.period} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-space-lg py-space-lg">
                        <p className="font-title-md font-semibold text-on-surface">
                          {byMonth ? `Ngày ${item.period}/${report.month}/${report.year}` : `Tháng ${item.period}/${report.year}`}
                        </p>
                      </td>
                      <td className="px-space-lg py-space-lg text-right">
                        <p className={cn('font-title-md font-bold', item.invoiceCount > 0 ? 'text-primary' : 'text-on-surface-variant')}>
                          {formatPrice(item.revenue)}
                        </p>
                      </td>
                      <td className="px-space-lg py-space-lg text-center">
                        <span className="inline-flex px-space-md py-space-sm rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                          {item.invoiceCount}
                        </span>
                      </td>
                      <td className="px-space-lg py-space-lg text-right">
                        <p className="font-body-md text-on-surface-variant">
                          {item.invoiceCount > 0 ? formatPrice(Number(item.revenue) / item.invoiceCount) : '—'}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {!loading && tableRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-space-lg py-space-xl text-center text-on-surface-variant">
                        Chưa có hóa đơn nào được thanh toán trong kỳ này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaoCaoThongKePage;
