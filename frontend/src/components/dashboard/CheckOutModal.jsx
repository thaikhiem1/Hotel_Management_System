import { useEffect, useState } from "react";
import { ModalShell, InfoCard } from "@/components/shared";
import { stayAPI } from "@/services/api";
import { getErrorMessage } from "@/utils/notification";
import {
  formatPrice,
  formatDateTime,
  RECEIPT_STATUS_LABELS,
  RENTAL_TYPE_LABELS,
} from "@/utils/format";

/**
 * CheckOutModal - Form trả phòng (UC-REN-007)
 * Hiển thị thông tin lưu trú, bảng chi phí và tổng tiền TẠM TÍNH do máy chủ tính theo thời điểm hiện tại
 * (tự làm mới mỗi 30 giây). Khi Xác nhận, máy chủ kiểm tra lại, tính lại theo giờ trả thực tế rồi tạo hóa đơn
 * chưa thanh toán; sau đó form chuyển sang màn hình thông tin hóa đơn.
 *
 * Props:
 * - isOpen
 * - stay: kết quả stayAPI.getCheckOutContext() (data)
 * - onClose
 * - onCompleted(result): gọi ngay khi trả phòng thành công (cha làm mới sơ đồ phòng, hiện thông báo)
 * - onRefresh: tải lại sơ đồ phòng khi lượt lưu trú đã bị thao tác khác thay đổi
 */
const UNIT_LABELS = { NGAY: "đêm", GIO: "giờ" };
const BILLING_RULES = {
  GIO: "Theo giờ: làm tròn lên theo tổng thời lượng, tối thiểu 1 giờ",
  NGAY: "Theo ngày: tính theo số đêm giữa ngày nhận và ngày trả, tối thiểu 1 đêm",
};
const REFRESH_INTERVAL_MS = 30000;

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="font-title-md text-title-md text-on-surface">{label}</span>
    <span className="font-title-lg text-title-lg font-semibold text-on-surface">{value}</span>
  </div>
);

const CheckOutForm = ({ stay, onClose, onCompleted, onRefresh }) => {
  const [bill, setBill] = useState(stay);
  const [isProcessing, setIsProcessing] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'error' | 'warning', message, stale? }
  const [result, setResult] = useState(null);

  // Chi phí tạm tính phụ thuộc thời điểm hiện tại nên lấy lại từ máy chủ định kỳ
  useEffect(() => {
    if (result) return undefined;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const response = await stayAPI.getCheckOutContext(stay.bookingDetailId);
        if (!cancelled) setBill(response.data);
      } catch {
        // Bỏ qua: chi phí cuối cùng vẫn do máy chủ tính lại khi xác nhận
      }
    }, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [stay.bookingDetailId, result]);

  const handleConfirm = async () => {
    setBanner(null);
    setIsProcessing(true);
    try {
      const response = await stayAPI.checkOut(bill.bookingDetailId, {
        expectedTotalAmount: bill.totalAmount,
      });
      setResult(response.data);
      onCompleted?.(response.data);
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 409 && data?.data?.totalAmount !== undefined) {
        // Chi phí đã đổi (thời gian trôi qua hoặc có dịch vụ mới): hiện chi phí mới để xác nhận lại
        setBill(data.data);
        setBanner({ type: "warning", message: data.message });
      } else {
        setBanner({
          type: "error",
          // Lượt lưu trú không còn hợp lệ hoặc xung đột đồng thời: cần tải lại dữ liệu
          stale: [400, 404, 409].includes(error.response?.status),
          message: getErrorMessage(error, "Trả phòng thất bại. Vui lòng thử lại sau."),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------- Màn hình hóa đơn sau khi trả phòng
  if (result) {
    return (
      <ModalShell
        icon="receipt_long"
        title="Trả phòng thành công"
        subtitle={`Phòng ${result.roomCode} • Hóa đơn ${result.invoiceCode}`}
        onClose={onClose}
        footer={
          <button
            onClick={onClose}
            className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors"
          >
            Đóng
          </button>
        }
      >
        <div className="flex items-center gap-space-sm p-space-md rounded-lg bg-tertiary-container text-on-tertiary-container">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-body-md">
            Hóa đơn đã được tạo với trạng thái <span className="font-bold">Chưa thanh toán</span>. Trả
            phòng không đồng nghĩa với thanh toán.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <InfoCard
            icon="receipt_long"
            title="Thông tin hóa đơn"
            rows={[
              { label: "Mã hóa đơn", value: result.invoiceCode },
              { label: "Khách hàng", value: bill.customerName },
              { label: "Nhận phòng thực tế", value: formatDateTime(result.actualCheckIn) },
              { label: "Trả phòng thực tế", value: formatDateTime(result.actualCheckOut) },
            ]}
          />
          <InfoCard
            icon="payments"
            title="Chi phí cuối cùng"
            rows={[
              { label: "Tiền phòng", value: formatPrice(result.roomAmount) },
              { label: "Tiền dịch vụ", value: formatPrice(result.serviceAmount) },
              { label: "Tổng tiền", value: formatPrice(result.totalAmount), highlight: true },
            ]}
          />
        </section>

        <ul className="space-y-space-xs text-on-surface-variant font-body-sm list-disc list-inside">
          <li>Phòng {result.roomCode} đã chuyển sang trạng thái "Đang dọn dẹp".</li>
          <li>
            Phiếu thuê {result.receiptCode} hiện ở trạng thái:{" "}
            {RECEIPT_STATUS_LABELS[result.receiptStatus] ?? result.receiptStatus}.
          </li>
        </ul>
      </ModalShell>
    );
  }

  // --------------------------------------------------------------- Form xác nhận trả phòng
  const unitLabel = UNIT_LABELS[bill.pricingMethod];
  const services = bill.services ?? [];

  return (
    <ModalShell
      icon="logout"
      title={`Trả phòng ${bill.roomCode}`}
      subtitle={`${bill.roomTypeName} • Phiếu thuê ${bill.receiptCode}`}
      maxWidth="max-w-4xl"
      onClose={onClose}
      closeDisabled={isProcessing}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          {banner?.stale ? (
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
              className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Xác nhận trả phòng</span>
                </>
              )}
            </button>
          )}
        </>
      }
    >
      {banner && (
        <div
          className={`flex items-start gap-space-sm p-space-md rounded-lg border ${
            banner.type === "warning"
              ? "bg-tertiary-container text-on-tertiary-container border-tertiary/30"
              : "bg-error-container text-on-error-container border-error/30"
          }`}
        >
          <span className="material-symbols-outlined">{banner.type === "warning" ? "warning" : "error"}</span>
          <p className="font-body-md whitespace-pre-line">{banner.message}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <InfoCard
          icon="person"
          title="Thông tin khách hàng"
          rows={[
            { label: "Họ và tên", value: bill.customerName },
            { label: "Số điện thoại", value: bill.customerPhone },
          ]}
        />
        <InfoCard
          icon="hotel"
          title="Thông tin lưu trú"
          rows={[
            { label: "Phòng", value: `${bill.roomCode} - ${bill.roomTypeName}` },
            { label: "Hình thức thuê", value: RENTAL_TYPE_LABELS[bill.pricingMethod] },
            { label: "Số khách", value: `${bill.actualGuests} người` },
            { label: "Nhận phòng thực tế", value: formatDateTime(bill.actualCheckIn) },
            { label: "Trả phòng (tạm tính)", value: formatDateTime(bill.checkOutAt), highlight: true },
          ]}
        />
      </section>

      <section className="space-y-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[28px]">receipt</span>
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Bảng chi tiết chi phí</h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full min-w-[520px]">
            <thead className="bg-surface-container-low">
              <tr className="text-on-surface font-label-md text-label-md">
                <th className="px-space-md py-space-sm text-left">Khoản mục</th>
                <th className="px-space-md py-space-sm text-right">Đơn giá (đã chốt)</th>
                <th className="px-space-md py-space-sm text-center">Số lượng</th>
                <th className="px-space-md py-space-sm text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <tr>
                <td className="px-space-md py-space-md font-semibold text-on-surface">
                  Tiền phòng {bill.roomCode} ({RENTAL_TYPE_LABELS[bill.pricingMethod].toLowerCase()})
                </td>
                <td className="px-space-md py-space-md text-right text-on-surface">
                  {formatPrice(bill.unitPrice)}/{unitLabel}
                </td>
                <td className="px-space-md py-space-md text-center text-on-surface">
                  {bill.billedUnits} {unitLabel}
                </td>
                <td className="px-space-md py-space-md text-right font-semibold text-primary">
                  {formatPrice(bill.roomAmount)}
                </td>
              </tr>
              {services.map((s) => (
                <tr key={s.serviceUsageId}>
                  <td className="px-space-md py-space-md text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[18px] align-middle mr-space-xs">
                      room_service
                    </span>
                    {s.serviceName}
                  </td>
                  <td className="px-space-md py-space-md text-right text-on-surface">
                    {formatPrice(s.unitPrice)}/{s.unit}
                  </td>
                  <td className="px-space-md py-space-md text-center text-on-surface">
                    {s.quantity} {s.unit}
                  </td>
                  <td className="px-space-md py-space-md text-right font-semibold text-primary">
                    {formatPrice(s.amount)}
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-space-md py-space-md text-center text-on-surface-variant">
                    Khách không sử dụng dịch vụ nào (tiền dịch vụ = 0đ)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-space-md">
        <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant space-y-space-sm">
          <SummaryRow label="Tiền phòng:" value={formatPrice(bill.roomAmount)} />
          <SummaryRow label="Tiền dịch vụ:" value={formatPrice(bill.serviceAmount)} />
        </div>
        <div className="p-space-xl rounded-lg bg-primary-container border-2 border-primary flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm font-bold text-on-primary-container">
            TỔNG TIỀN TẠM TÍNH:
          </span>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            {formatPrice(bill.totalAmount)}
          </span>
        </div>
      </section>

      <section className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
        <ul className="space-y-space-xs text-on-surface-variant font-body-sm list-disc list-inside">
          <li>
            Khi xác nhận, hệ thống kiểm tra lại và tính lại tiền phòng theo thời gian trả phòng thực tế; nếu số tiền
            thay đổi, bạn sẽ được xem số mới trước khi trả phòng.
          </li>
          <li>Hóa đơn được tạo với trạng thái Chưa thanh toán; phòng chuyển sang "Đang dọn dẹp".</li>
          <li>Trả phòng này không tự động trả các phòng khác trong cùng phiếu thuê.</li>
          <li>Cách tính thời lượng — {BILLING_RULES[bill.pricingMethod]}.</li>
        </ul>
      </section>
    </ModalShell>
  );
};

const CheckOutModal = ({ isOpen, stay, ...props }) => {
  if (!isOpen || !stay) return null;
  return <CheckOutForm key={stay.bookingDetailId} stay={stay} {...props} />;
};

export default CheckOutModal;
