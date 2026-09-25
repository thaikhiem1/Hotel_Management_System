import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * SalaryChart - Biểu đồ lương nhân viên
 * Hỗ trợ dark mode và light mode
 */
const SalaryChart = ({ data, isDarkMode = false }) => {
  const colors = {
    bars: ['#D4AF37', '#B8941E', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
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
            <div key={index}>
              <p className="font-body-sm" style={{ color: entry.color }}>
                Lương: {entry.value.toLocaleString('vi-VN')}đ
              </p>
              {entry.payload.soNhanVien && (
                <p className="font-body-sm text-on-surface-variant">
                  Số NV: {entry.payload.soNhanVien}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          stroke={colors.text}
          style={{ fontSize: '12px', fontWeight: 500 }}
        />
        <YAxis
          stroke={colors.text}
          style={{ fontSize: '12px', fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
        <Bar
          dataKey="tongLuong"
          name="Tổng lương"
          radius={[8, 8, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors.bars[index % colors.bars.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalaryChart;
