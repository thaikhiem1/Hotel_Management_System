import React from 'react';
import { cn } from '@/utils/lib/util';

const CustomerTable = ({ customers, onEdit, onDelete, isLoading }) => {
  // Icon giới tính
  const getGenderIcon = (gender) => {
    if (gender === 'Nam') return 'male';
    if (gender === 'Nữ') return 'female';
    return 'transgender';
  };
  
  // Badge màu cho quốc tịch
  const getNationalityBadge = (nationality) => {
    if (nationality === 'Việt Nam') {
      return 'bg-tertiary-container text-on-tertiary-container';
    }
    return 'bg-secondary-container text-on-secondary-container';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-surface-container-low rounded-lg">
        <div className="flex flex-col items-center gap-space-md">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-surface-container-low rounded-lg">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-space-md">
          person_search
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
          Chưa có khách hàng nào
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Thêm khách hàng mới để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-low">
      <table className="w-full">
        <thead className="bg-surface-container-high">
          <tr>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              ID
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Tên khách hàng
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Số điện thoại
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              CCCD/Passport
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Quốc tịch
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Giới tính
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {customers.map((customer, index) => (
            <tr
              key={customer.customerId}
              className={cn(
                'transition-colors hover:bg-surface-container-highest',
                index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface'
              )}
            >
              {/* ID */}
              <td className="px-space-md py-space-sm">
                <span className="font-label-md text-label-md text-primary font-semibold">
                  #{customer.customerId}
                </span>
              </td>

              {/* Tên khách hàng */}
              <td className="px-space-md py-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    'bg-primary-container'
                  )}>
                    <span className="material-symbols-outlined text-[20px] text-on-primary-container">
                      person
                    </span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    {customer.fullName}
                  </span>
                </div>
              </td>

              {/* Số điện thoại */}
              <td className="px-space-md py-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    phone
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">
                    {customer.phone || '-'}
                  </span>
                </div>
              </td>

              {/* CCCD/Passport */}
              <td className="px-space-md py-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">
                    badge
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-mono">
                    {customer.citizenId || '-'}
                  </span>
                </div>
              </td>

              {/* Quốc tịch */}
              <td className="px-space-md py-space-sm">
                <span className={cn(
                  'inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full',
                  'font-label-sm text-label-sm font-semibold',
                  getNationalityBadge(customer.nationality)
                )}>
                  <span className="material-symbols-outlined text-[16px]">
                    flag
                  </span>
                  {customer.nationality || '-'}
                </span>
              </td>

              {/* Giới tính */}
              <td className="px-space-md py-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className={cn(
                    'material-symbols-outlined text-[20px]',
                    customer.gender === 'Nam' ? 'text-primary' : 
                    customer.gender === 'Nữ' ? 'text-error' : 
                    'text-on-surface-variant'
                  )}>
                    {getGenderIcon(customer.gender)}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">
                    {customer.gender}
                  </span>
                </div>
              </td>

              {/* Thao tác */}
              <td className="px-space-md py-space-sm">
                <div className="flex items-center justify-center gap-space-xs">
                  {/* Nút sửa */}
                  <button
                    onClick={() => onEdit(customer)}
                    className={cn(
                      'p-space-sm rounded-lg transition-colors',
                      'hover:bg-secondary-container group'
                    )}
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-110 transition-transform">
                      edit
                    </span>
                  </button>

                  {/* Nút xóa */}
                  <button
                    onClick={() => onDelete(customer)}
                    className={cn(
                      'p-space-sm rounded-lg transition-colors',
                      'hover:bg-error-container group'
                    )}
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-[20px] text-error group-hover:scale-110 transition-transform">
                      delete
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
