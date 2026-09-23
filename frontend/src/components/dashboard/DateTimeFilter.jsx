import React, { useState, useEffect } from 'react';

/**
 * DateTimeFilter - Bộ lọc ngày & giờ cho phòng
 */
const DateTimeFilter = ({ onFilterChange }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [checkOutTime, setCheckOutTime] = useState('12:00');

  // Tự động thông báo khi bất kỳ giá trị ngày giờ nào thay đổi
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        checkIn: { date: checkInDate, time: checkInTime },
        checkOut: { date: checkOutDate, time: checkOutTime }
      });
    }
  }, [checkInDate, checkInTime, checkOutDate, checkOutTime, onFilterChange]);

  return (
    <div className="flex flex-col gap-space-md p-space-lg rounded-lg bg-surface-container-low border border-surface-container-high">
      <div className="flex items-center justify-between mb-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">
            event_available
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Thời gian lọc phòng
          </h3>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Kiểm tra tình trạng phòng theo thời gian thực
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        {/* Check-in */}
        <div className="space-y-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Nhận phòng (Check-in)
          </label>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg">
              <span className="material-symbols-outlined text-outline text-[18px]">
                calendar_today
              </span>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg">
              <span className="material-symbols-outlined text-outline text-[18px]">
                schedule
              </span>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Trả phòng (Check-out)
          </label>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg">
              <span className="material-symbols-outlined text-outline text-[18px]">
                calendar_today
              </span>
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg">
              <span className="material-symbols-outlined text-outline text-[18px]">
                schedule
              </span>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeFilter;
