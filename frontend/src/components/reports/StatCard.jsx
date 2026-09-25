import React from 'react';
import { cn } from '@/utils/lib/util';

/**
 * StatCard - Card thống kê tái sử dụng
 * Hỗ trợ gradient và icon
 */
const StatCard = ({
  title,
  value,
  icon,
  gradient = 'from-[#D4AF37] to-[#B8941E]',
  subtitle,
  trend,
  trendUp = true
}) => {
  return (
    <div className={cn(
      'p-space-lg rounded-lg shadow-lg bg-gradient-to-br',
      gradient
    )}>
      <div className="flex items-start justify-between mb-space-md">
        <div className="flex-1">
          <p className="font-label-sm text-white/80 uppercase tracking-wide mb-space-xs">
            {title}
          </p>
          <p className="font-headline-lg font-bold text-white break-all">
            {value}
          </p>
          {subtitle && (
            <p className="font-body-sm text-white/70 mt-space-xs">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <span className="material-symbols-outlined text-white text-[32px] opacity-80">
            {icon}
          </span>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center gap-space-xs mt-space-sm pt-space-sm border-t border-white/20">
          <span className={cn(
            'material-symbols-outlined text-[20px]',
            trendUp ? 'text-emerald-300' : 'text-red-300'
          )}>
            {trendUp ? 'trending_up' : 'trending_down'}
          </span>
          <span className="font-label-sm text-white/90">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
