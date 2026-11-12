import { useEffect, useState } from 'react';
import { stayAPI } from '@/services/api';
import { formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/notification';

const vnd = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

/**
 * ServiceUsageSection - Dịch vụ khách đã sử dụng trong lượt lưu trú hiện tại (UC-SVC-005)
 * Tải danh sách thật từ máy chủ; nút "Thêm dịch vụ" hiện cho mọi vai trò, quyền được kiểm tra khi bấm.
 *
 * Props:
 * - bookingDetailId: mã lượt lưu trú (chi tiết đặt phòng)
 * - version: tăng lên sau khi ghi nhận dịch vụ để tải lại danh sách
 * - onAdd: mở hộp thoại thêm dịch vụ
 */
const ServiceUsageSection = ({ bookingDetailId, version = 0, onAdd }) => {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!bookingDetailId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await stayAPI.getServiceUsages(bookingDetailId);
        if (!cancelled) setState({ loading: false, error: null, data: response.data });
      } catch (error) {
        if (!cancelled) {
          setState({ loading: false, error: getErrorMessage(error, 'Không thể tải dịch vụ đã sử dụng.'), data: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingDetailId, version]);

  const { loading, error, data } = state;
  const usages = data?.usages ?? [];

  return (
    <section className="space-y-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[28px]">room_service</span>
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Dịch vụ đã sử dụng</h3>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Thêm dịch vụ</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-space-xl flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
        </div>
      ) : error ? (
        <div className="p-space-lg rounded-lg bg-error-container text-on-error-container border border-error/30">
          {error}
        </div>
      ) : usages.length === 0 ? (
        <div className="p-space-xl rounded-lg bg-surface-container-low border border-outline-variant text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-space-md block">
            receipt_long
          </span>
          <p className="font-body-lg text-on-surface-variant">Chưa có dịch vụ nào được sử dụng</p>
        </div>
      ) : (
        <div className="space-y-space-sm">
          {usages.map((usage) => (
            <div
              key={usage.serviceUsageId}
              className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-space-sm mb-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
                    <h4 className="font-title-md text-title-md font-semibold text-on-surface">{usage.serviceName}</h4>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant ml-7">
                    {formatDateTime(usage.usedAt)} • Ghi nhận bởi {usage.recordedBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xs">
                    {usage.quantity} {usage.unit} × {vnd(usage.unitPrice)}
                  </p>
                  <p className="font-title-lg text-title-lg font-bold text-primary">{vnd(usage.amount)}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="p-space-lg rounded-lg bg-primary-container border-2 border-primary">
            <div className="flex items-center justify-between">
              <span className="font-title-lg text-title-lg font-bold text-on-primary-container">Tổng tiền dịch vụ:</span>
              <span className="font-headline-lg text-headline-lg font-bold text-primary">{vnd(data.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceUsageSection;
