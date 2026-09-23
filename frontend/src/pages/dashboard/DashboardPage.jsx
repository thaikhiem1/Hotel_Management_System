import React, { useState, useEffect } from 'react';
import {
  DateTimeFilter,
  QuickActions,
  StatCard,
  RoomFilterTabs,
  RoomGrid
} from '@/components/dashboard';

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [dateTimeFilter, setDateTimeFilter] = useState(null);

  // Mock data - sẽ thay thế bằng API call
  const [stats] = useState({
    occupancy: { value: '86.4%', trend: 5.2 },
    roomTypes: { value: '12', subValue: 'Loại phòng' },
    revenue: { value: '45.000.000', subValue: 'VNĐ hôm nay', trend: 12.3 },
    staff: { value: '48', subValue: '42 đang làm việc' }
  });

  const [roomCounts] = useState({
    all: 142,
    available: 18,
    occupied: 98,
    cleaning: 15,
    maintenance: 11
  });

  const [rooms] = useState([
    {
      id: 1,
      name: 'P101',
      roomType: 'Deluxe Room',
      pricePerDay: 1500000,
      pricePerHour: 150000,
      status: 'available'
    },
    {
      id: 2,
      name: 'P102',
      roomType: 'Suite Room',
      pricePerDay: 2500000,
      pricePerHour: 250000,
      status: 'occupied',
      guestName: 'Nguyễn Văn A',
      checkOutTime: '14:00 - 25/09/2026'
    },
    {
      id: 3,
      name: 'P103',
      roomType: 'Standard Room',
      pricePerDay: 1000000,
      pricePerHour: 100000,
      status: 'reserved'
    },
    {
      id: 4,
      name: 'P104',
      roomType: 'Deluxe Room',
      pricePerDay: 1500000,
      pricePerHour: 150000,
      status: 'cleaning'
    },
    {
      id: 5,
      name: 'P105',
      roomType: 'Suite Room',
      pricePerDay: 2500000,
      pricePerHour: 250000,
      status: 'maintenance',
      maintenanceReason: 'Sửa chữa hệ thống điều hòa không khí'
    },
    {
      id: 6,
      name: 'P106',
      roomType: 'Standard Room',
      pricePerDay: 1000000,
      pricePerHour: 100000,
      status: 'available'
    },
    {
      id: 7,
      name: 'P107',
      roomType: 'Deluxe Room',
      pricePerDay: 1500000,
      pricePerHour: 150000,
      status: 'occupied',
      guestName: 'Trần Thị B',
      checkOutTime: '12:00 - 24/09/2026'
    },
    {
      id: 8,
      name: 'P108',
      roomType: 'Presidential Suite',
      pricePerDay: 5000000,
      pricePerHour: 500000,
      status: 'available'
    }
  ]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Refreshed data');
    }, 1000);
  };

  const handleFilterAvailableNow = () => {
    setActiveFilter('available');
  };

  const handleRoomAction = (actionId, room) => {
    console.log(`Action: ${actionId} on room:`, room);
    // TODO: Implement action handlers
    switch (actionId) {
      case 'view':
        console.log('View room details');
        break;
      case 'book':
        console.log('Book room immediately');
        break;
      case 'checkin':
        console.log('Check-in guest');
        break;
      case 'checkout':
        console.log('Check-out guest');
        break;
      case 'service':
        console.log('Add service');
        break;
      case 'inspect':
        console.log('Inspect room');
        break;
      case 'ready':
        console.log('Mark as ready');
        break;
      case 'reason':
        console.log('View maintenance reason');
        break;
      case 'complete':
        console.log('Complete maintenance');
        break;
      default:
        break;
    }
  };

  const filteredRooms = activeFilter === 'all' 
    ? rooms 
    : rooms.filter(room => room.status === activeFilter);

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ml-6 text-lg font-body-lg text-body-lg text-on-surface-variant">
            Tổng quan hoạt động và quản lý phòng
          </p>
        </div>
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-low">
          <span className="material-symbols-outlined text-primary text-[20px]">
            schedule
          </span>
          <span className="font-label-lg text-label-lg text-on-surface">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* 20% Top Section: DateTime Filter & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-2">
          <DateTimeFilter onFilterChange={setDateTimeFilter} />
        </div>
        <div>
          <QuickActions
            onRefresh={handleRefresh}
            onFilterAvailableNow={handleFilterAvailableNow}
          />
        </div>
      </div>

      {/* 20% Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <StatCard
          icon="pie_chart"
          label="Công suất phòng"
          value={stats.occupancy.value}
          trend={stats.occupancy.trend}
          colorClass="text-primary"
        />
        <StatCard
          icon="king_bed"
          label="Loại phòng"
          value={stats.roomTypes.value}
          subValue={stats.roomTypes.subValue}
          colorClass="text-secondary"
        />
        <StatCard
          icon="payments"
          label="Doanh thu"
          value={stats.revenue.value}
          subValue={stats.revenue.subValue}
          trend={stats.revenue.trend}
          colorClass="text-tertiary"
        />
        <StatCard
          icon="group"
          label="Nhân sự"
          value={stats.staff.value}
          subValue={stats.staff.subValue}
          colorClass="text-on-surface"
        />
      </div>

      {/* 10% Filter Tabs Section */}
      <div>
        <RoomFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={roomCounts}
        />
      </div>

      {/* 50% Room Grid Section */}
      <div>
        <RoomGrid
          rooms={filteredRooms}
          onRoomAction={handleRoomAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
