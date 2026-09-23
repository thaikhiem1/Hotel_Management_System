import React, { useState } from 'react';

const DateTimeFilter = ({ onFilterChange }) => {
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutTime, setCheckOutTime] = useState('12:00');

  const handleChange = () => {
    if (onFilterChange) {
      onFilterChange({
        checkIn: { date: checkInDate, time: checkInTime },
        checkOut: { date: checkOutDate, time: checkOutTime }
      });
    }
  };

  return (
    <div className="flex flex-col gap-space-md p-space-lg rounded-lg bg-surface-container-low">
      <div className="flex items-center gap-space-sm mb-space-sm">
        <span className="material-symbols-outlined text-primary text-[24px]">
          event_available
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Thời gian lọc phòng
        </h3>
      </div>

      {/* Check-in */}
      <div className="space-y-space-sm">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          Check-in
        </label>
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px]">
              calendar_today
            </span>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                handleChange();
              }}
              className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px]">
              schedule
            </span>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => {
                setCheckInTime(e.target.value);
                handleChange();
              }}
              className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Check-out */}
      <div className="space-y-space-sm">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          Check-out
        </label>
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px]">
              calendar_today
            </span>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => {
                setCheckOutDate(e.target.value);
                handleChange();
              }}
              className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px]">
              schedule
            </span>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => {
                setCheckOutTime(e.target.value);
                handleChange();
              }}
              className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeFilter;
