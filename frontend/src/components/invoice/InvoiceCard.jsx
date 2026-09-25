import React from 'react';
import { cn } from '@/utils/lib/util';

/**
 * InvoiceCard - Card hiển thị thông tin hóa đơn
 * Hiển thị tóm tắt thông tin hóa đơn trong danh sách
 * 
 * Props:
 * - invoice: Thông tin hóa đơn (invoices table)
 * - onView: Callback xem chi tiết hóa đơn
 * - onPrint: Callback in hóa đơn
 */
const InvoiceCard = ({ invoice, onView, onPrint }) => {
  if (!invoice) return null;

  // Xác định màu sắc theo trạng thái thanh toán
  const statusConfig = {
    PAID: {
      label: 'Đã thanh toán',
      bgClass: 'bg-tertiary-container',
      textClass: 'text-on-tertiary-container',
      iconClass: 'text-tertiary',
      icon: 'check_circle'
    },
    UNPAID: {
      label: 'Chưa thanh toán',
      bgClass: 'bg-error-container',
      textClass: 'text-on-error-container',
      iconClass: 'text-error',
      icon: 'pending'
    }
  };

  const status = statusConfig[invoice.payment_status] || statusConfig.UNPAID;

  // Format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="group p-space-lg rounded-lg bg-surface-container-low border border-outline-variant hover:shadow-lg hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-space-md">
        <div className="flex-1">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">
              receipt_long
            </span>
            <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
              Hóa đơn #{String(invoice.invoice_id).padStart(6, '0')}
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ngày lập: {formatDate(invoice.invoice_date)}
          </p>
        </div>
        
        {/* Trạng thái thanh toán */}
        <div className={cn(
          'flex items-center gap-space-xs px-space-md py-space-sm rounded-full',
          status.bgClass
        )}>
          <span className={cn('material-symbols-outlined text-[18px]', status.iconClass)}>
            {status.icon}
          </span>
          <span className={cn('font-label-sm text-label-sm font-semibold', status.textClass)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-space-sm mb-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            person
          </span>
          <div className="flex-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Khách hàng
            </p>
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              {invoice.rental_receipt?.customer?.full_name || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            hotel
          </span>
          <div className="flex-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Phiếu thuê
            </p>
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              PT{String(invoice.rental_receipt_id).padStart(6, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            badge
          </span>
          <div className="flex-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Nhân viên
            </p>
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              {invoice.employee?.full_name || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="pt-space-md border-t border-outline-variant">
        <div className="flex items-center justify-between">
          <span className="font-title-md text-title-md text-on-surface">
            Tổng thanh toán:
          </span>
          <span className="font-title-lg text-title-lg font-bold text-primary">
            {invoice.total_amount?.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-space-md flex gap-space-sm">
        <button
          onClick={() => onView && onView(invoice)}
          className="flex-1 flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          <span>Xem chi tiết</span>
        </button>
        <button
          onClick={() => onPrint && onPrint(invoice)}
          className="flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;
