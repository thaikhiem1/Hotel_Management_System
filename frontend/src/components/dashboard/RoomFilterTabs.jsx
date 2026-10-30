import { cn } from '@/utils/lib/util';

const RoomFilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { 
      id: 'all', 
      label: 'Tất cả', 
      icon: 'grid_view',
      count: counts?.all || 0 
    },
    { 
      id: 'available', 
      label: 'Trống/Sẵn sàng', 
      icon: 'check_circle',
      count: counts?.available || 0,
      color: 'text-primary'
    },
    { 
      id: 'reserved', 
      label: 'Đã đặt', 
      icon: 'event',
      count: counts?.reserved || 0,
      color: 'text-secondary'
    },
    { 
      id: 'occupied', 
      label: 'Đang có khách', 
      icon: 'person',
      count: counts?.occupied || 0,
      color: 'text-tertiary'
    },
    { 
      id: 'cleaning', 
      label: 'Đang dọn dẹp', 
      icon: 'cleaning_services',
      count: counts?.cleaning || 0,
      color: 'text-amber-700 dark:text-amber-400'
    },
    { 
      id: 'maintenance', 
      label: 'Đang bảo trì', 
      icon: 'engineering',
      count: counts?.maintenance || 0,
      color: 'text-error'
    }
  ];

  return (
    <div className="flex gap-space-sm overflow-x-auto pb-space-xs scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            'flex items-center gap-space-sm px-space-lg py-space-md rounded-lg',
            'font-label-lg text-label-lg font-semibold transition-all whitespace-nowrap',
            'hover:bg-surface-container-high',
            activeFilter === filter.id
              ? 'bg-primary-container text-on-primary-container shadow-glow'
              : 'bg-surface-container-low text-on-surface-variant'
          )}
        >
          <span className={cn(
            'material-symbols-outlined text-[20px]',
            activeFilter === filter.id ? 'text-on-primary-container' : filter.color
          )}>
            {filter.icon}
          </span>
          <span>{filter.label}</span>
          <span className={cn(
            'px-space-sm py-space-xs rounded-full text-label-sm font-bold',
            activeFilter === filter.id
              ? 'bg-on-primary-container/20 text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface'
          )}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoomFilterTabs;
