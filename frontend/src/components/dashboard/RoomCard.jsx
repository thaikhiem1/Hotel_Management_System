import { cn } from '@/utils/lib/util';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/format';

// Vai trò đăng nhập -> mã vai trò dùng trong cấu hình nút bên dưới (0: Admin, 1: Lễ tân, 2: Quản lý)
const ROLE_CODE = { ADMIN: 0, RECEPTIONIST: 1, MANAGER: 2 };

/**
 * RoomCard - Thẻ phòng trên sơ đồ phòng (UC-ROM-005)
 * Màu theo trạng thái hiển thị: xanh lá (sẵn sàng), vàng (đã đặt), đỏ (đang có khách),
 * cam (đang dọn dẹp), xám (đang bảo trì).
 */
const RoomCard = ({ room, onAction }) => {
  const { user } = useAuth();
  const userRole = ROLE_CODE[user?.role];

  const getStatusConfig = (status) => {
    const configs = {
      available: {
        label: 'Trống/Sẵn sàng',
        color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        icon: 'check_circle',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'book', label: 'Đặt phòng ngay', icon: 'add_circle', variant: 'primary', roles: [0, 1, 2] }
        ]
      },
      reserved: {
        label: 'Đã đặt',
        color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
        icon: 'event',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          // Chỉ hiện khi lượt đặt tóm tắt đã đến giờ nhận phòng
          { id: 'checkin', label: 'Nhận phòng', icon: 'login', variant: 'primary', roles: [0, 1], when: (r) => r.canCheckIn !== false },
          { id: 'cancel', label: 'Hủy đặt', icon: 'cancel', variant: 'error', roles: [0, 2] }
        ]
      },
      occupied: {
        label: 'Đang có khách',
        color: 'bg-error/20 text-error',
        icon: 'person',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'service', label: 'Thêm dịch vụ', icon: 'room_service', variant: 'tertiary', roles: [0, 1] },
          { id: 'checkout', label: 'Trả phòng', icon: 'logout', variant: 'primary', roles: [0, 1] }
        ]
      },
      cleaning: {
        label: 'Đang dọn dẹp',
        color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
        icon: 'cleaning_services',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'ready', label: 'Đã vệ sinh xong', icon: 'done_all', variant: 'primary', roles: [0, 1] }
        ]
      },
      maintenance: {
        label: 'Đang bảo trì',
        color: 'bg-outline/20 text-on-surface-variant',
        icon: 'engineering',
        actions: [
          { id: 'view', label: 'Xem chi tiết', icon: 'visibility', variant: 'secondary', roles: [0, 1, 2] },
          { id: 'complete', label: 'Đã sửa chữa xong', icon: 'done', variant: 'primary', roles: [0, 2] }
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

  // Lọc nút theo quyền của người dùng và điều kiện hiển thị của từng nút
  const getFilteredActions = (actions) => {
    return actions.filter(action => {
      if (action.when && !action.when(room)) return false;
      if (!action.roles || action.roles.length === 0) return true;
      return action.roles.includes(userRole);
    });
  };

  const matched = room.matchedBooking;
  const showMatched = matched && matched.bookingDetailId !== room.bookingDetailId;

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
            {formatPrice(room.pricePerDay)}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-space-xs">
            Giá/giờ
          </p>
          <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {room.pricePerHour != null ? formatPrice(room.pricePerHour) : 'Chưa có giá'}
          </p>
        </div>
      </div>

      {/* Maintenance Reason (if maintenance) */}
      {room.status === 'maintenance' && room.maintenanceReason && (
        <div className="mb-space-md p-space-md rounded-lg bg-error/10 border border-error/20">
          <p className="font-label-sm text-label-sm text-error uppercase tracking-wider mb-space-xs">
            Ghi chú bảo trì
          </p>
          <p className="font-body-sm text-body-sm text-on-surface">
            {room.maintenanceReason}
          </p>
        </div>
      )}

      {/* Guest Info (if occupied or reserved) */}
      {(room.status === 'occupied' || room.status === 'reserved') && room.guestName && (
        <div className="mb-space-md p-space-md rounded-lg bg-surface-container-high border border-outline-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-space-xs">
            {room.status === 'occupied' ? 'Khách hiện tại' : 'Khách đã đặt'}
            {room.receiptCode ? ` • ${room.receiptCode}` : ''}
          </p>
          <p className="font-body-md text-body-md text-on-surface font-semibold">
            {room.guestName}
          </p>
          {room.status === 'occupied' && room.checkOutTime && (
            <p className="font-body-sm text-body-sm text-outline mt-space-xs">
              Trả phòng dự kiến: {room.checkOutTime}
            </p>
          )}
          {room.status === 'reserved' && room.checkInTime && (
            <p className="font-body-sm text-body-sm text-outline mt-space-xs">
              Nhận phòng: {room.checkInTime}
            </p>
          )}
          {room.reservationCount > (room.status === 'reserved' ? 1 : 0) && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              +{room.reservationCount - (room.status === 'reserved' ? 1 : 0)} lượt đặt khác trong khoảng thời gian đang xem
            </p>
          )}
        </div>
      )}

      {/* Chi tiết khớp điều kiện lọc (khi khác với lượt đang hiển thị) */}
      {showMatched && (
        <div className="mb-space-md p-space-md rounded-lg bg-primary/10 border border-primary/20">
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-space-xs">
            Khớp bộ lọc • {matched.receiptCode}
          </p>
          <p className="font-body-md text-body-md text-on-surface font-semibold">{matched.customerName}</p>
          <p className="font-body-sm text-body-sm text-outline mt-space-xs">
            {matched.checkInTime} → {matched.checkOutTime}
          </p>
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
