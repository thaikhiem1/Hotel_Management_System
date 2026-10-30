import { cn } from '@/utils/lib/util';

/**
 * StatusBadge - Hiển thị trạng thái của phiếu thuê / CTDP
 *
 * Dựa theo Database.md:
 *   CTDP.TrangThaiDatPhong:
 *     0 = Đã đặt
 *     1 = Đang thuê
 *     2 = Đang dọn dẹp
 *
 *   Trạng thái UI tổng hợp cho PhieuThue:
 *     'DA_DAT'       → tất cả CTDP có TrangThaiDatPhong = 0
 *     'DANG_THUE'    → có ít nhất 1 CTDP có TrangThaiDatPhong = 1
 *     'DANG_DON_DEP' → có ít nhất 1 CTDP có TrangThaiDatPhong = 2 (và không có phòng đang thuê)
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    // Trạng thái tổng hợp của PhieuThue (UI layer)
    DA_DAT: {
      label: 'Đã đặt',
      className: 'bg-primary/20 text-primary',
      icon: 'event_available'
    },
    DANG_THUE: {
      label: 'Đang thuê',
      className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: 'meeting_room'
    },
    DANG_DON_DEP: {
      label: 'Đang dọn dẹp',
      className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      icon: 'cleaning_services'
    },
    // Trạng thái từng CTDP (số nguyên từ DB)
    0: {
      label: 'Đã đặt',
      className: 'bg-primary/20 text-primary',
      icon: 'event_available'
    },
    1: {
      label: 'Đang thuê',
      className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: 'meeting_room'
    },
    2: {
      label: 'Đang dọn dẹp',
      className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      icon: 'cleaning_services'
    }
  };

  const config = statusConfig[status] || {
    label: 'Không xác định',
    className: 'bg-outline/20 text-outline',
    icon: 'help'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full',
      config.className
    )}>
      <span className="material-symbols-outlined text-[16px]">
        {config.icon}
      </span>
      <span className="font-label-sm text-label-sm font-bold">
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;
