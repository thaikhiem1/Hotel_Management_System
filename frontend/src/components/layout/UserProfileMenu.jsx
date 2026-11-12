import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/lib/util';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_AVATAR } from '@/utils/avatar';

/**
 * UserProfileMenu - Component hiển thị menu dropdown profile user
 * Hiển thị avatar, tên, chức vụ và các options (Profile, Settings, Logout)
 */
const UserProfileMenu = ({ currentUser, onOpenProfile, onBrand = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data - TODO: Replace with actual user data from context/store
  const user = currentUser || {
    idNV: 1,
    tenNV: 'Alexandre de Montes',
    chucVu: 'Tổng Giám Đốc',
    email: 'alexandre@grandpalace.com',
    avatar: DEFAULT_AVATAR
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    if (onOpenProfile) {
      onOpenProfile(user);
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  // Xác định màu sắc theo chức vụ
  const getPositionColor = (chucVu) => {
    const positions = {
      'Tổng Giám Đốc': 'text-primary',
      'Quản Lý': 'text-secondary',
      'Nhân Viên': 'text-tertiary',
    };
    return positions[chucVu] || 'text-on-surface-variant';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-space-sm p-space-xs rounded-lg',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          onBrand
            ? 'hover:bg-white/15 focus:ring-white/60 focus:ring-offset-[#7a5c16]'
            : 'hover:bg-surface-container-high focus:ring-primary',
          isOpen && (onBrand ? 'bg-white/15' : 'bg-surface-container-high')
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar || DEFAULT_AVATAR}
            alt={user.tenNV}
            className={cn('w-10 h-10 rounded-full object-cover ring-2', onBrand ? 'ring-white/70' : 'ring-primary/20')}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary rounded-full border-2 border-[#7a5c16]" />
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden md:flex flex-col items-start min-w-0">
          <span className={cn('font-label-md text-label-md font-semibold truncate max-w-[150px]', onBrand ? 'text-white' : 'text-on-surface')}>
            {user.tenNV}
          </span>
          <span className={cn(
            'font-label-sm text-label-sm uppercase tracking-wide',
            onBrand ? 'text-[#ffe9a8]' : getPositionColor(user.chucVu)
          )}>
            {user.chucVu}
          </span>
        </div>

        {/* Dropdown Icon */}
        <span className={cn(
          'material-symbols-outlined text-[20px] transition-transform',
          onBrand ? 'text-white/80' : 'text-on-surface-variant',
          isOpen && 'rotate-180'
        )}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute top-full right-0 mt-space-xs',
          'w-72 max-w-[calc(100vw-1.5rem)] rounded-xl shadow-2xl',
          'bg-surface-container-low border border-outline-variant',
          'overflow-hidden',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          'z-50'
        )}>
          {/* User Info Section */}
          <div className="p-space-md bg-surface-container-high">
            <div className="flex items-start gap-space-sm">
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={user.tenNV}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                  {user.tenNV}
                </p>
                <p className={cn(
                  'font-label-sm text-label-sm uppercase tracking-wide',
                  getPositionColor(user.chucVu)
                )}>
                  {user.chucVu}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-space-xs">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant" />

          {/* Menu Items */}
          <div className="p-space-xs">
            {/* View Profile */}
            <button
              onClick={handleViewProfile}
              className={cn(
                'w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg',
                'text-on-surface hover:bg-surface-container-highest',
                'transition-colors duration-200',
                'group'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">
                account_circle
              </span>
              <div className="flex-1 text-left">
                <p className="font-label-md text-label-md font-semibold">
                  Xem Profile
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Xem và chỉnh sửa thông tin cá nhân
                </p>
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={handleSettings}
              className={cn(
                'w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg',
                'text-on-surface hover:bg-surface-container-highest',
                'transition-colors duration-200',
                'group'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-110 transition-transform">
                settings
              </span>
              <div className="flex-1 text-left">
                <p className="font-label-md text-label-md font-semibold">
                  Cài đặt
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tùy chỉnh hệ thống
                </p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant" />

          {/* Logout Button */}
          <div className="p-space-xs">
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg',
                'text-error hover:bg-error-container',
                'transition-colors duration-200',
                'group'
              )}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                logout
              </span>
              <div className="flex-1 text-left">
                <p className="font-label-md text-label-md font-semibold">
                  Đăng xuất
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Thoát khỏi hệ thống
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
