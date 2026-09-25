import React from 'react';
import { cn } from '@/utils/lib/util';

const RoomCard = ({ room, onAction }) => {
  // TODO: Lấy role từ AuthContext hoặc Redux store
  // Ví dụ: const { user } = useAuth(); const userRole = user?.role;
  // Role: 0 = Admin, 1 = Nhân viên lễ tân, 2 = Quản lý
  const userRole = 0; // Mock data - tạm thời dùng Admin để test đầy đủ chức năng

  const getStatusConfig = (status) => {
    const configs = {
      available: {
        label: 'Trống/Sẵn sàng',
        color: 'bg-primary/20 text-primary',
        icon: 'check_circle',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'book', label: 'Đặt phòng', icon: 'add_circle', variant: 'primary', roles: [0, 1, 2] }
        ]
      },
      reserved: {
        label: 'Đã đặt',
        color: 'bg-secondary/20 text-secondary',
        icon: 'event',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'checkin', label: 'Nhận phòng', icon: 'login', variant: 'primary', roles: [0, 1] },
          { id: 'cancel', label: 'Hủy đặt', icon: 'cancel', variant: 'error', roles: [0, 2] }
        ]
      },
      occupied: {
        label: 'Đang có khách',
        color: 'bg-tertiary/20 text-tertiary',
        icon: 'person',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'service', label: 'Thêm dịch vụ', icon: 'room_service', variant: 'tertiary', roles: [0, 1] },
          { id: 'checkout', label: 'Trả phòng', icon: 'logout', variant: 'primary', roles: [0, 1] }
        ]
      },
      cleaning: {
        label: 'Đang dọn dẹp',
        color: 'bg-amber-500/20 text-amber-600',
        icon: 'cleaning_services',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'ready', label: 'Đánh dấu sẵn sàng', icon: 'done_all', variant: 'primary', roles: [0, 1] }
        ]
      },
      maintenance: {
        label: 'Đang bảo trì',
        color: 'bg-error/20 text-error',
        icon: 'engineering',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'complete', label: 'Hoàn thành bảo trì', icon: 'done', variant: 'primary', roles: [0, 2] }
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
      tertiary: 'bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary',
      error: 'bg-error-container hover:bg-error text-on-error-container hover:text-on-error'
    };
    return variants[variant] || variants.secondary;
  };

  // Lọc actions theo quyền của user
  const getFilteredActions = (actions) => {
    return actions.filter(action => {
      // Nếu action không có roles được định nghĩa, cho phép tất cả roles
      if (!action.roles || action.roles.length === 0) return true;
      // Kiểm tra role hiện tại có trong danh sách roles được phép không
      return action.roles.includes(userRole);
    });
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

      {/* Guest Info (if occupied or reserved) */}
      {(room.status === 'occupied' || room.status === 'reserved') && room.guestName && (
        <div className="mb-space-md p-space-md rounded-lg bg-tertiary/10 border border-tertiary/20">
          <p className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-space-xs">
            {room.status === 'occupied' ? 'Khách hiện tại' : 'Khách đã đặt'}
          </p>
          <p className="font-body-md text-body-md text-on-surface font-semibold">
            {room.guestName}
          </p>
          {room.status === 'occupied' && room.checkOutTime && (
            <p className="font-body-sm text-body-sm text-outline mt-space-xs">
              Trả phòng: {room.checkOutTime}
            </p>
          )}
          {room.status === 'reserved' && room.checkInTime && (
            <p className="font-body-sm text-body-sm text-outline mt-space-xs">
              Nhận phòng: {room.checkInTime}
            </p>
          )}
        </div>
      )}

      {/* Actions - Filtered by user role */}
      <div className="flex flex-col gap-space-sm">
        {getFilteredActions(statusConfig.actions).map((action) => (
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
