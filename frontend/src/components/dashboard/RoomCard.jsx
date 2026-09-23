import React from 'react';
import { cn } from '@/utils/lib/util';

const RoomCard = ({ room, onAction }) => {
  const getStatusConfig = (status) => {
    const configs = {
      available: {
        label: 'Trống/Sẵn sàng',
        color: 'bg-primary/20 text-primary',
        icon: 'check_circle',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary' },
          { id: 'book', label: 'Đặt phòng tức thì', icon: 'add_circle', variant: 'primary' }
        ]
      },
      reserved: {
        label: 'Đã đặt',
        color: 'bg-secondary/20 text-secondary',
        icon: 'event',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary' },
          { id: 'checkin', label: 'Nhận phòng', icon: 'login', variant: 'primary' }
        ]
      },
      occupied: {
        label: 'Đang có khách',
        color: 'bg-tertiary/20 text-tertiary',
        icon: 'person',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary' },
          { id: 'service', label: 'Thêm dịch vụ', icon: 'room_service', variant: 'tertiary' },
          { id: 'checkout', label: 'Trả phòng', icon: 'logout', variant: 'primary' }
        ]
      },
      cleaning: {
        label: 'Đang dọn dẹp',
        color: 'bg-secondary/20 text-secondary',
        icon: 'cleaning_services',
        actions: [
          { id: 'inspect', label: 'Kiểm tra buồng', icon: 'fact_check', variant: 'secondary' },
          { id: 'ready', label: 'Đánh dấu sẵn sàng', icon: 'done_all', variant: 'primary' }
        ]
      },
      maintenance: {
        label: 'Đang bảo trì',
        color: 'bg-error/20 text-error',
        icon: 'engineering',
        actions: [
          { id: 'reason', label: 'Xem lý do', icon: 'info', variant: 'secondary' },
          { id: 'complete', label: 'Hoàn thành bảo trì', icon: 'done', variant: 'primary' }
        ]
      }
    };
    return configs[status] || configs.available;
  };

  const statusConfig = getStatusConfig(room.status);

  const getActionButtonClass = (variant) => {
    const variants = {
      primary: 'bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary',
      secondary: 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface',
      tertiary: 'bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary'
    };
    return variants[variant] || variants.secondary;
  };

  return (
    <div className="p-space-lg rounded-lg bg-surface-container-low hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all border border-surface-container-high">
      {/* Header */}
      <div className="flex items-start justify-between mb-space-md">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">
            {room.name}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {room.roomType}
          </p>
        </div>
        <div className={cn(
          'flex items-center gap-space-xs px-space-md py-space-sm rounded-full',
          statusConfig.color
        )}>
          <span className="material-symbols-outlined text-[16px]">
            {statusConfig.icon}
          </span>
          <span className="font-label-sm text-label-sm font-bold">
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-space-sm mb-space-lg p-space-md rounded-lg bg-surface-container-high">
        <div>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-space-xs">
            Giá/ngày
          </p>
          <p className="font-headline-sm text-headline-sm text-primary font-bold">
            {room.pricePerDay?.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-space-xs">
            Giá/giờ
          </p>
          <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {room.pricePerHour?.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Maintenance Reason (if maintenance) */}
      {room.status === 'maintenance' && room.maintenanceReason && (
        <div className="mb-space-md p-space-md rounded-lg bg-error/10 border border-error/20">
          <p className="font-label-sm text-label-sm text-error uppercase tracking-wider mb-space-xs">
            Lý do bảo trì
          </p>
          <p className="font-body-sm text-body-sm text-on-surface">
            {room.maintenanceReason}
          </p>
        </div>
      )}

      {/* Guest Info (if occupied) */}
      {room.status === 'occupied' && room.guestName && (
        <div className="mb-space-md p-space-md rounded-lg bg-tertiary/10 border border-tertiary/20">
          <p className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-space-xs">
            Khách hiện tại
          </p>
          <p className="font-body-md text-body-md text-on-surface font-semibold">
            {room.guestName}
          </p>
          {room.checkOutTime && (
            <p className="font-body-sm text-body-sm text-outline mt-space-xs">
              Trả phòng: {room.checkOutTime}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-space-sm">
        {statusConfig.actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id, room)}
            className={cn(
              'flex items-center justify-center gap-space-sm px-space-md py-space-sm rounded-lg',
              'font-label-lg text-label-lg font-semibold transition-colors group',
              getActionButtonClass(action.variant)
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomCard;
