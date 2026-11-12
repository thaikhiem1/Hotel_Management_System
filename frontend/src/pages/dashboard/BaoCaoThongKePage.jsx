import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/utils/lib/util';
import {
  RevenueChart,
  SalaryChart,
  StatCard,
  DateRangeFilter
} from '@/components/reports';

/**
 * BaoCaoThongKePage - Trang báo cáo & thống kê
 * Chuẩn 100% theo Database.md:
 * - Table monthly_revenue_statistics { statistic_id, year, month, total_revenue, invoice_count, last_updated_at }
 * - Table employees { employee_id, full_name, position, salary, ... }
 * - Table invoices { invoice_id, invoice_date, total_amount, payment_status, ... }
 */
const BaoCaoThongKePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [currentFilter, setCurrentFilter] = useState({
    type: 'month',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Detect dark mode from system/theme
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Mock data - monthly_revenue_statistics
  // TODO: API GET /api/revenue-statistics?year=2024&month=1-12
  const mockMonthlyRevenue = [
    { statistic_id: 1, year: 2024, month: 1, total_revenue: 125000000, invoice_count: 45 },
    { statistic_id: 2, year: 2024, month: 2, total_revenue: 138000000, invoice_count: 52 },
    { statistic_id: 3, year: 2024, month: 3, total_revenue: 145000000, invoice_count: 58 },
    { statistic_id: 4, year: 2024, month: 4, total_revenue: 132000000, invoice_count: 48 },
    { statistic_id: 5, year: 2024, month: 5, total_revenue: 158000000, invoice_count: 65 },
    { statistic_id: 6, year: 2024, month: 6, total_revenue: 172000000, invoice_count: 72 },
    { statistic_id: 7, year: 2024, month: 7, total_revenue: 189000000, invoice_count: 78 },
    { statistic_id: 8, year: 2024, month: 8, total_revenue: 165000000, invoice_count: 68 },
    { statistic_id: 9, year: 2024, month: 9, total_revenue: 142000000, invoice_count: 55 },
    { statistic_id: 10, year: 2024, month: 10, total_revenue: 156000000, invoice_count: 62 },
    { statistic_id: 11, year: 2024, month: 11, total_revenue: 168000000, invoice_count: 70 },
    { statistic_id: 12, year: 2024, month: 12, total_revenue: 195000000, invoice_count: 82 }
  ];

  // Mock data - employees salary by position
  // TODO: API GET /api/employees/salary-by-position
  const mockEmployeeSalary = [
    { position: 'Quản lý', tongLuong: 45000000, soNhanVien: 3 },
    { position: 'Lễ tân', tongLuong: 36000000, soNhanVien: 6 },
    { position: 'Kế toán', tongLuong: 28000000, soNhanVien: 4 },
    { position: 'Bảo vệ', tongLuong: 18000000, soNhanVien: 4 },
    { position: 'Tạp vụ', tongLuong: 15000000, soNhanVien: 5 },
    { position: 'Đầu bếp', tongLuong: 24000000, soNhanVien: 3 }
  ];

  // Filter revenue data based on current filter
  const filteredRevenueData = useMemo(() => {
    if (currentFilter.type === 'month') {
      // Get data for selected month across years
      return mockMonthlyRevenue.filter(
        item => item.year === currentFilter.year && item.month === currentFilter.month
      );
    } else {
      // Get all months data for selected year
      return mockMonthlyRevenue.filter(item => item.year === currentFilter.year);
    }
  }, [currentFilter]);

  // Format data for charts
  const revenueChartData = useMemo(() => {
    if (currentFilter.type === 'month') {
      // For single month, show daily breakdown (mock data)
      return Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}`,
        doanhThu: Math.floor(Math.random() * 10000000) + 3000000,
        soHoaDon: Math.floor(Math.random() * 5) + 1
      }));
    } else {
      // For year, show monthly breakdown
      return filteredRevenueData.map(item => ({
        name: `T${item.month}`,
        doanhThu: item.total_revenue,
        soHoaDon: item.invoice_count
      }));
    }
  }, [filteredRevenueData, currentFilter]);

  const salaryChartData = useMemo(() => {
    return mockEmployeeSalary.map(item => ({
      name: item.position,
      tongLuong: item.tongLuong,
      soNhanVien: item.soNhanVien
    }));
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalInvoices = filteredRevenueData.reduce((sum, item) => sum + item.invoice_count, 0);
    const totalSalary = mockEmployeeSalary.reduce((sum, item) => sum + item.tongLuong, 0);
    const totalEmployees = mockEmployeeSalary.reduce((sum, item) => sum + item.soNhanVien, 0);
    const profit = totalRevenue - totalSalary;
    const avgRevenuePerInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalRevenue,
      totalInvoices,
      totalSalary,
      totalEmployees,
      profit,
      avgRevenuePerInvoice
    };
  }, [filteredRevenueData]);

  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter);
  };

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
        
        {/* Export Button */}
        <button className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/80 text-on-primary font-label-lg font-semibold transition-colors shadow-md">
          <span className="material-symbols-outlined text-[24px]">download</span>
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        <StatCard
          title="Tổng doanh thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}tr`}
          subtitle={`${stats.totalInvoices} hóa đơn`}
          icon="trending_up"
          gradient="from-brand-light to-brand-dark"
          trend="+12.5% so với kỳ trước"
          trendUp={true}
        />
        
        <StatCard
          title="Tổng chi phí lương"
          value={`${(stats.totalSalary / 1000000).toFixed(1)}tr`}
          subtitle={`${stats.totalEmployees} nhân viên`}
          icon="payments"
          gradient="from-blue-500 to-blue-700"
          trend="+3.2% so với tháng trước"
          trendUp={true}
        />
        
        <StatCard
          title="Lợi nhuận ước tính"
          value={`${(stats.profit / 1000000).toFixed(1)}tr`}
          subtitle={`Margin: ${((stats.profit / stats.totalRevenue) * 100).toFixed(1)}%`}
          icon="account_balance"
          gradient="from-emerald-500 to-emerald-700"
          trend="+8.3% so với kỳ trước"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Date Range Filter */}
        <div className="lg:col-span-1">
          <DateRangeFilter
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
          
          {/* Additional Stats */}
          <div className="mt-space-lg p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h3 className="font-title-lg font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">insights</span>
              Thông tin chi tiết
            </h3>
            
            <div className="space-y-space-md">
              <div className="pb-space-md border-b border-outline-variant">
                <p className="font-label-sm text-on-surface-variant mb-space-xs">
                  Trung bình/hóa đơn
                </p>
                <p className="font-title-lg font-bold text-on-surface">
                  {(stats.avgRevenuePerInvoice / 1000).toFixed(0)}k
                </p>
              </div>
              
              <div className="pb-space-md border-b border-outline-variant">
                <p className="font-label-sm text-on-surface-variant mb-space-xs">
                  Chi phí trung bình/NV
                </p>
                <p className="font-title-lg font-bold text-on-surface">
                  {(stats.totalSalary / stats.totalEmployees / 1000).toFixed(0)}k
                </p>
              </div>
              
              <div>
                <p className="font-label-sm text-on-surface-variant mb-space-xs">
                  Hiệu suất doanh thu
                </p>
                <p className="font-title-lg font-bold text-emerald-700 dark:text-emerald-400">
                  Tốt
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
                {currentFilter.type === 'month' 
                  ? ` - Tháng ${currentFilter.month}/${currentFilter.year}`
                  : ` - Năm ${currentFilter.year}`
                }
              </h2>
              
              {/* Chart Type Toggle */}
              <div className="flex gap-space-xs bg-surface-container rounded-lg p-space-xs">
                <button
                  onClick={() => setChartType('line')}
                  className={cn(
                    'px-space-md py-space-sm rounded-md font-label-sm font-semibold transition-colors',
                    chartType === 'line'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">show_chart</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={cn(
                    'px-space-md py-space-sm rounded-md font-label-sm font-semibold transition-colors',
                    chartType === 'bar'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                </button>
              </div>
            </div>
            
            <RevenueChart
              data={revenueChartData}
              chartType={chartType}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Salary Chart */}
          <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h2 className="font-title-xl font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Thống kê lương theo vị trí
            </h2>
            
            <SalaryChart
              data={salaryChartData}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Revenue Table */}
          <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
            <h2 className="font-title-xl font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              Bảng chi tiết doanh thu theo tháng
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-surface-container">
                  <tr>
                    <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">
                      Tháng
                    </th>
                    <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">
                      Doanh thu
                    </th>
                    <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">
                      Số hóa đơn
                    </th>
                    <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">
                      Trung bình/HĐ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredRevenueData.map((item) => (
                    <tr key={item.statistic_id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-space-lg py-space-lg">
                        <p className="font-title-md font-semibold text-on-surface">
                          Tháng {item.month}/{item.year}
                        </p>
                      </td>
                      <td className="px-space-lg py-space-lg text-right">
                        <p className="font-title-md font-bold text-primary">
                          {item.total_revenue.toLocaleString('vi-VN')}đ
                        </p>
                      </td>
                      <td className="px-space-lg py-space-lg text-center">
                        <span className="inline-flex px-space-md py-space-sm rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                          {item.invoice_count}
                        </span>
                      </td>
                      <td className="px-space-lg py-space-lg text-right">
                        <p className="font-body-md text-on-surface-variant">
                          {(item.total_revenue / item.invoice_count).toLocaleString('vi-VN')}đ
                        </p>
                      </td>
                    </tr>
                  ))}
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
