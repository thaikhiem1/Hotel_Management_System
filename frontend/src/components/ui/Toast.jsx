import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * Toast - Component hiển thị thông báo tạm thời
 * @param {string} id - ID duy nhất của toast
 * @param {string} type - Loại toast: 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms), mặc định 5000ms
 * @param {Function} onClose - Callback khi toast đóng
 */
const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation entrance
  useEffect(() => {
    // Delay nhỏ để trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Auto close after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  // Config cho từng loại toast
  const toastConfig = {
    success: {
      bg: 'bg-tertiary-container',
      text: 'text-on-tertiary-container',
      icon: 'check_circle',
      iconColor: 'text-tertiary',
      progressBg: 'bg-tertiary'
    },
    error: {
      bg: 'bg-error-container',
      text: 'text-on-error-container',
      icon: 'error',
      iconColor: 'text-error',
      progressBg: 'bg-error'
    },
    warning: {
      bg: 'bg-primary-container',
      text: 'text-on-primary-container',
      icon: 'warning',
      iconColor: 'text-primary',
      progressBg: 'bg-primary'
    },
    info: {
      bg: 'bg-secondary-container',
      text: 'text-on-secondary-container',
      icon: 'info',
      iconColor: 'text-secondary',
      progressBg: 'bg-secondary'
    }
  };

  const config = toastConfig[type] || toastConfig.info;

  return (
    <div
      className={cn(
        'relative flex items-start gap-space-sm p-space-md rounded-xl shadow-2xl',
        'border-l-4 min-w-[320px] max-w-[420px]',
        config.bg,
        'transition-all duration-300 ease-out',
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      )}
      style={{
        borderLeftColor: config.iconColor.replace('text-', 'var(--color-')
      }}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        'bg-surface-container-high/30'
      )}>
        <span className={cn(
          'material-symbols-outlined text-[24px]',
          config.iconColor
        )}>
          {config.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn(
            'font-label-lg text-label-lg font-semibold mb-space-xs',
            config.text
          )}>
            {title}
          </h4>
        )}
        {message && (
          <p className={cn(
            'font-body-sm text-body-sm',
            config.text,
            'opacity-90'
          )}>
            {message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-space-xs rounded-lg',
          'hover:bg-surface-container-high/30 transition-colors',
          config.text
        )}
      >
        <span className="material-symbols-outlined text-[20px]">
          close
        </span>
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high/30 rounded-b-xl overflow-hidden">
        <div
          className={cn(
            'h-full transition-all ease-linear',
            config.progressBg
          )}
          style={{
            width: isExiting ? '0%' : '100%',
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
};

export default Toast;
