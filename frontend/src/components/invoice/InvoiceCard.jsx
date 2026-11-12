import { cn } from '@/utils/lib/util';
import { formatDateTime, formatPrice } from '@/utils/format';

const STATUS_CONFIG = {
  PAID: {
    label: 'Đã thanh toán',
    bgClass: 'bg-tertiary-container',
    textClass: 'text-on-tertiary-container',
    iconClass: 'text-tertiary',
    icon: 'check_circle',
  },
  UNPAID: {
    label: 'Chưa thanh toán',
    bgClass: 'bg-error-container',
    textClass: 'text-on-error-container',
    iconClass: 'text-error',
    icon: 'pending',
  },
};

export const InvoiceStatusBadge = ({ status, className }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNPAID;
  return (
    <div className={cn('flex items-center gap-space-xs px-space-md py-space-sm rounded-full shrink-0', config.bgClass, className)}>
      <span className={cn('material-symbols-outlined text-[18px]', config.iconClass)}>{config.icon}</span>
      <span className={cn('font-label-sm text-label-sm font-semibold', config.textClass)}>{config.label}</span>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
      <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

/**
 * InvoiceCard - Thẻ tóm tắt một hóa đơn trong danh sách (dữ liệu từ GET /api/invoices)
 *
 * Props:
 * - invoice: InvoiceSummaryResponse
 * - onView: mở chi tiết hóa đơn (xem, thanh toán, in/tải ảnh/PDF)
 */
const InvoiceCard = ({ invoice, onView }) => {
  if (!invoice) return null;

  return (
    <div className="group p-space-lg rounded-lg bg-surface-container-low border border-outline-variant hover:shadow-lg hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-space-sm mb-space-md">
        <div className="min-w-0">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
            <h3 className="font-title-lg text-title-lg font-bold text-on-surface">{invoice.invoiceCode}</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ngày lập: {formatDateTime(invoice.issuedAt)}
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.invoiceStatus} />
      </div>

      <div className="space-y-space-sm mb-space-md">
        <InfoRow icon="person" label="Khách hàng" value={invoice.customerName} />
        <InfoRow icon="hotel" label="Phiếu thuê / Phòng" value={`${invoice.receiptCode} · ${invoice.roomCode}`} />
        <InfoRow icon="badge" label="Nhân viên lập" value={invoice.employeeName} />
      </div>

      <div className="pt-space-md border-t border-outline-variant">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-title-md text-title-md text-on-surface">Tổng thanh toán:</span>
          <span className="font-title-lg text-title-lg font-bold text-primary">{formatPrice(invoice.totalAmount)}</span>
        </div>
        {invoice.paidAt && (
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            Thanh toán lúc {formatDateTime(invoice.paidAt)}
          </p>
        )}
      </div>

      <div className="mt-space-md flex gap-space-sm">
        <button
          onClick={() => onView?.(invoice)}
          className="flex-1 flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          <span>Xem chi tiết</span>
        </button>
        <button
          onClick={() => onView?.(invoice)}
          title="In hoặc tải hóa đơn"
          aria-label="In hoặc tải hóa đơn"
          className="flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;
