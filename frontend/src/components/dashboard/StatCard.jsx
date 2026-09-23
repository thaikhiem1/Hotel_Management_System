import React from 'react';
import { cn } from '@/utils/lib/util';

const StatCard = ({ icon, label, value, subValue, trend, colorClass = 'text-primary' }) => {
  return (
    <div className="p-space-lg rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
      <div className="flex items-start justify-between mb-space-md">
        <div className={cn('p-space-sm rounded-lg bg-surface-container-high', colorClass)}>
          <span className="material-symbols-outlined text-[28px]">
            {icon}
          </span>
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-space-xs px-space-sm py-space-xs rounded-full',
            trend > 0 ? 'bg-primary/20' : 'bg-error/20'
          )}>
            <span className={cn(
              'material-symbols-outlined text-[16px]',
              trend > 0 ? 'text-primary' : 'text-error'
            )}>
              {trend > 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className={cn(
              'font-label-sm text-label-sm font-bold',
              trend > 0 ? 'text-primary' : 'text-error'
            )}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-space-xs">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
          {value}
        </p>
        {subValue && (
          <p className="font-body-sm text-body-sm text-outline">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
