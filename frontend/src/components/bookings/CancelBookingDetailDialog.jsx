import { useState } from 'react';
import { ModalShell, InfoCard } from '@/components/shared';
import { rentalReceiptAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/notification';
import { formatCurrency } from '@/utils/format';

const MAX_REASON_LENGTH = 255;

/**
 * Nội dung form hủy chi tiết đặt phòng (UC-REN-002). Tách riêng để mỗi lần mở có trạng thái riêng (key theo chi tiết).
 */
const CancelForm = ({ target, onClose, onCancelled, onRefresh }) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState(null); // { message, stale }

  const trimmed = reason.trim();
  const reasonError =
    trimmed === ''
      ? 'Vui lòng nhập lý do hủy.'
      : reason.length > MAX_REASON_LENGTH
        ? `Lý do hủy tối đa ${MAX_REASON_LENGTH} ký tự.`
        : null;

  const handleConfirm = async () => {
    setTouched(true);
    setServerError(null);
    if (reasonError) return;

    setIsProcessing(true);
    try {
      const response = await rentalReceiptAPI.cancelDetail(target.receiptId, target.detailId, trimmed);
      onCancelled?.(response);
    } catch (error) {
      const status = error.response?.status;
      setServerError({
        message: getErrorMessage(error, 'Hủy phòng thất bại do lỗi hệ thống. Vui lòng thử lại sau.'),
        // Phòng đã được xử lý ở nơi khác (nhận phòng, hủy phiếu...): cần tải lại dữ liệu
        stale: status === 400 || status === 404 || status === 409,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fieldError = touched ? reasonError : null;

  return (
    <ModalShell
      icon="event_busy"
      title={`Hủy phòng ${target.roomCode}`}
      subtitle={`Phiếu thuê ${target.receiptCode}`}
      maxWidth="max-w-2xl"
      onClose={onClose}
      closeDisabled={isProcessing}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          {serverError?.stale ? (
            <button
              onClick={() => {
                onRefresh?.();
                onClose();
              }}
              className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>Tải lại dữ liệu</span>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-space-xl py-space-md rounded-lg bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg disabled:opacity-50"
            >
              <span className={`material-symbols-outlined ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'progress_activity' : 'event_busy'}
              </span>
              <span>{isProcessing ? 'Đang hủy...' : 'Xác nhận hủy phòng'}</span>
            </button>
          )}
        </>
      }
    >
      {serverError && (
        <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-error-container text-on-error-container border border-error/30">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md whitespace-pre-line">{serverError.message}</p>
        </div>
      )}

      <InfoCard
        icon="hotel"
        title="Phòng sẽ bị hủy"
        rows={[
          { label: 'Phòng', value: target.roomCode },
          { label: 'Khách hàng', value: target.customerName },
          { label: 'Nhận phòng dự kiến', value: target.checkIn },
          { label: 'Trả phòng dự kiến', value: target.checkOut },
          ...(target.amount != null
            ? [{ label: 'Thành tiền sẽ loại khỏi phiếu', value: formatCurrency(target.amount), highlight: true }]
            : []),
        ]}
      />

      <div className="space-y-space-xs">
        <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span>Lý do hủy</span>
          <span className="text-error">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={isProcessing}
          rows={3}
          placeholder="Ví dụ: Khách đổi lịch trình, không thuê phòng này nữa..."
          className={`w-full px-space-md py-space-sm rounded-lg border bg-surface-container font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
            fieldError ? 'border-error' : 'border-outline-variant'
          }`}
        />
        <div className="flex items-start justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-error min-h-[1.25rem]">{fieldError}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
            {reason.length}/{MAX_REASON_LENGTH}
          </p>
        </div>
      </div>

      <ul className="space-y-space-xs text-on-surface-variant font-body-sm list-disc list-inside">
        <li>Việc hủy không thể hoàn tác; muốn thuê lại phải lập phiếu thuê mới.</li>
        <li>Phòng được giải phóng cho khoảng thời gian này, các phòng còn lại của phiếu không bị ảnh hưởng.</li>
        <li>Nếu đây là phòng cuối cùng còn hiệu lực, phiếu thuê cũng sẽ chuyển sang "Đã hủy".</li>
      </ul>
    </ModalShell>
  );
};

/**
 * CancelBookingDetailDialog - Hủy một chi tiết đặt phòng chưa nhận phòng (UC-REN-002)
 *
 * Props:
 * - target: { receiptId, detailId, receiptCode, roomCode, customerName, checkIn, checkOut, amount? } (null thì không hiển thị)
 * - onClose
 * - onCancelled(response): gọi sau khi hủy thành công, response là phiếu thuê sau khi cập nhật (ApiResponse)
 * - onRefresh: tải lại dữ liệu khi phòng đã được xử lý ở nơi khác
 */
const CancelBookingDetailDialog = ({ target, onClose, onCancelled, onRefresh }) => {
  if (!target) return null;
  return (
    <CancelForm
      key={target.detailId}
      target={target}
      onClose={onClose}
      onCancelled={onCancelled}
      onRefresh={onRefresh}
    />
  );
};

export default CancelBookingDetailDialog;
