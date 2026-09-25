import React, { useState } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * DateRangeFilter - Component lọc theo thời gian
 * Hỗ trợ lọc theo tháng/năm
 */
const DateRangeFilter = ({ onFilterChange, currentFilter }) => {
  const [filterType, setFilterType] = useState(currentFilter?.type || 'month');
  const [selectedMonth, setSelectedMonth] = useState(currentFilter?.month || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentFilter?.year || new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const handleApplyFilter = () => {
    if (filterType === 'month') {
      onFilterChange({ type: 'month', month: selectedMonth, year: selectedYear });
    } else {
      onFilterChange({ type: 'year', year: selectedYear });
    }
  };

  return (
    <div className="p-space-lg rounded-lg bg-surface border-2 border-outline-variant shadow-lg">
      <h3 className="font-title-lg font-semibold text-on-surface mb-space-md flex items-center gap-space-sm">
        <span className="material-symbols-outlined text-primary">filter_alt</span>
        Lọc theo thời gian
      </h3>

      {/* Filter Type Selection */}
      <div className="flex gap-space-sm mb-space-lg">
        <button
          onClick={() => setFilterType('month')}
          className={cn(
            'flex-1 px-space-lg py-space-md rounded-lg font-label-md font-semibold transition-all',
            filterType === 'month'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          Theo tháng
        </button>
        <button
          onClick={() => setFilterType('year')}
          className={cn(
            'flex-1 px-space-lg py-space-md rounded-lg font-label-md font-semibold transition-all',
            filterType === 'year'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          Theo năm
        </button>
      </div>

      {/* Month Selection */}
      {filterType === 'month' && (
        <div className="mb-space-md">
          <label className="block font-label-md text-on-surface mb-space-sm">
            Chọn tháng
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-space-md py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:outline-none"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Year Selection */}
      <div className="mb-space-lg">
        <label className="block font-label-md text-on-surface mb-space-sm">
          Chọn năm
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full px-space-md py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:outline-none"
        >
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplyFilter}
        className="w-full flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/80 text-on-primary font-label-lg font-semibold transition-colors shadow-md"
      >
        <span className="material-symbols-outlined">check</span>
        <span>Áp dụng</span>
      </button>
    </div>
  );
};

export default DateRangeFilter;
