import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * RevenueChart - Biểu đồ doanh thu
 * Hỗ trợ dark mode và light mode
 */
const RevenueChart = ({ data, chartType = 'line', isDarkMode = false }) => {
  const colors = {
    primary: '#D4AF37',
    secondary: '#B8941E',
    grid: isDarkMode ? '#3f3f46' : '#e4e4e7',
    text: isDarkMode ? '#e4e4e7' : '#27272a',
    tooltip: isDarkMode ? '#27272a' : '#ffffff',
    tooltipBorder: isDarkMode ? '#52525b' : '#d4d4d8'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg shadow-lg p-space-md border-2"
          style={{
            backgroundColor: colors.tooltip,
            borderColor: colors.tooltipBorder
          }}
        >
          <p className="font-label-md font-semibold text-on-surface mb-space-xs">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="font-body-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toLocaleString('vi-VN')}đ
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  };

  const commonAxisProps = {
    stroke: colors.text,
    style: { fontSize: '12px', fontWeight: 500 }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      {chartType === 'line' ? (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="name" {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
          <Line
            type="monotone"
            dataKey="doanhThu"
            name="Doanh thu"
            stroke={colors.primary}
            strokeWidth={3}
            dot={{ fill: colors.primary, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="soHoaDon"
            name="Số hóa đơn"
            stroke={colors.secondary}
            strokeWidth={2}
            dot={{ fill: colors.secondary, r: 4 }}
            yAxisId={1}
          />
        </LineChart>
      ) : (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="name" {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
          <Bar
            dataKey="doanhThu"
            name="Doanh thu"
            fill={colors.primary}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default RevenueChart;
