import { useEffect, useMemo, useState } from "react";
import { ModalShell, InfoCard } from "@/components/shared";
import { rentalService, RentalError } from "@/services/mockRentalService";
import { BILLING_RULES, BillingError, calculateStay } from "@/utils/billing";
import {
  formatPrice,
  formatDateTime,
  formatReceiptCode,
  RECEIPT_STATUS_LABELS,
  RENTAL_TYPE_LABELS,
} from "@/utils/format";

/**
 * CheckOutModal - Form trả phòng (UC-REN-007)
 * Hiển thị thông tin lưu trú, bảng chi phí và tổng tiền DỰ KIẾN (tính theo thời điểm hiện tại).
 * Khi Xác nhận, hệ thống kiểm tra lại, tính lại theo giờ trả thực tế và tạo hóa đơn UNPAID;
 * sau đó form chuyển sang màn hình thông tin hóa đơn.
 *
 * Props:
 * - isOpen
 * - stay: kết quả rentalService.getCheckOutContext() (kèm danh sách dịch vụ đã dùng)
 * - employeeId: nhân viên đang đăng nhập (người lập hóa đơn)
 * - onClose
 * - onCompleted(result): gọi ngay khi trả phòng thành công (cha làm mới sơ đồ phòng, hiện thông báo)
 * - onRefresh: tải lại dữ liệu khi gặp lỗi trạng thái thay đổi đồng thời (E4)
 */
const REFRESH_ERROR_CODES = ["E3", "E4"];

const SummaryRow = ({ label, value, strong }) => (
  <div className="flex justify-between items-center">
    <span className="font-title-md text-title-md text-on-surface">{label}</span>
    <span
      className={`font-title-lg text-title-lg ${strong ? "font-bold text-primary" : "font-semibold text-on-surface"}`}
    >
      {value}
    </span>
  </div>
);

const CheckOutForm = ({ stay, employeeId, onClose, onCompleted, onRefresh }) => {
  const { customer, room, detail, receipt, services } = stay;
  const [now, setNow] = useState(() => new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Tổng tiền dự kiến dùng thời điểm hiện tại làm giờ trả phòng, cập nhật mỗi 30 giây
  useEffect(() => {
    if (result) return undefined;
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, [result]);

  const actualCheckIn = detail.actualCheckIn ?? detail.expectedCheckIn;

  const estimate = useMemo(() => {
    try {
      return {
        bill: calculateStay({
          rentalType: detail.rentalType,
          unitPrice: detail.unitPrice,
          checkInAt: actualCheckIn,
          checkOutAt: now,
          services,
        }),
      };
    } catch (e) {
      if (e instanceof BillingError) return { error: e.message };
      throw e;
    }
  }, [detail, actualCheckIn, now, services]);

  const handleConfirm = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const data = await rentalService.checkOut({
        detailId: detail.id,
        employeeId,
      });
      setResult(data);
      onCompleted?.(data);
    } catch (e) {
      setError({
        code: e instanceof RentalError ? e.code : "E7",
        // E7: lỗi ngoài dự kiến, không tiết lộ thông tin nội bộ
        message:
          e instanceof RentalError
            ? e.message
            : "Trả phòng thất bại do lỗi hệ thống. Vui lòng thử lại sau.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------- Màn hình hóa đơn sau khi trả phòng
  if (result) {
    const { invoice } = result;
    return (
      <ModalShell
        icon="receipt_long"
        title="Trả phòng thành công"
        subtitle={`Phòng ${room.code} • Hóa đơn #${String(invoice.invoiceId).padStart(6, "0")}`}
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
            Hóa đơn đã được tạo với trạng thái{" "}
            <span className="font-bold">Chưa thanh toán (UNPAID)</span>. Trả phòng
            không đồng nghĩa với thanh toán.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <InfoCard
            icon="receipt_long"
            title="Thông tin hóa đơn"
            rows={[
              {
                label: "Mã hóa đơn",
                value: `#${String(invoice.invoiceId).padStart(6, "0")}`,
              },
              { label: "Khách hàng", value: invoice.customerName },
              { label: "Nhận phòng thực tế", value: formatDateTime(invoice.checkInAt) },
              { label: "Trả phòng thực tế", value: formatDateTime(invoice.checkOutAt) },
            ]}
          />
          <InfoCard
            icon="payments"
            title="Chi phí cuối cùng"
            rows={[
              { label: "Tiền phòng", value: formatPrice(invoice.roomTotal) },
              { label: "Tiền dịch vụ", value: formatPrice(invoice.servicesTotal) },
              {
                label: "Tổng tiền",
                value: formatPrice(invoice.total),
                highlight: true,
              },
            ]}
          />
        </section>

        <ul className="space-y-space-xs text-on-surface-variant font-body-sm list-disc list-inside">
          <li>Phòng {room.code} đã chuyển sang trạng thái "Đang dọn dẹp".</li>
          <li>
            Phiếu thuê hiện ở trạng thái:{" "}
            {RECEIPT_STATUS_LABELS[result.receiptStatus] ?? result.receiptStatus}.
          </li>
        </ul>
      </ModalShell>
    );
  }

  // --------------------------------------------------------------- Form xác nhận trả phòng
  const needsRefresh = error && REFRESH_ERROR_CODES.includes(error.code);
  const { bill } = estimate;

  return (
    <ModalShell
      icon="logout"
      title={`Trả phòng ${room.code}`}
      subtitle={`${room.typeName} • Phiếu thuê ${formatReceiptCode(receipt.id)}`}
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
          {needsRefresh ? (
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
              disabled={isProcessing || !bill}
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
      {(error || estimate.error) && (
        <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-error-container text-on-error-container border border-error/30">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md">{error?.message ?? estimate.error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <InfoCard
          icon="person"
          title="Thông tin khách hàng"
          rows={[
            { label: "Họ và tên", value: customer.name },
            { label: "Số điện thoại", value: customer.phone },
            { label: "CCCD/Passport", value: customer.citizenId },
          ]}
        />
        <InfoCard
          icon="hotel"
          title="Thông tin lưu trú"
          rows={[
            { label: "Phòng", value: `${room.code} - ${room.typeName}` },
            {
              label: "Hình thức thuê",
              value: RENTAL_TYPE_LABELS[detail.rentalType],
            },
            {
              label: "Số khách",
              value: `${detail.actualGuests ?? detail.bookedGuests} người`,
            },
            { label: "Nhận phòng thực tế", value: formatDateTime(actualCheckIn) },
            {
              label: "Trả phòng (dự kiến)",
              value: formatDateTime(now),
              highlight: true,
            },
          ]}
        />
      </section>

      <section className="space-y-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[28px]">
            receipt
          </span>
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
            Bảng chi tiết chi phí
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full">
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
                  Tiền phòng {room.code} ({RENTAL_TYPE_LABELS[detail.rentalType].toLowerCase()})
                </td>
                <td className="px-space-md py-space-md text-right text-on-surface">
                  {formatPrice(detail.unitPrice)}/{bill?.unitLabel}
                </td>
                <td className="px-space-md py-space-md text-center text-on-surface">
                  {bill ? `${bill.units} ${bill.unitLabel}` : "—"}
                </td>
                <td className="px-space-md py-space-md text-right font-semibold text-primary">
                  {bill ? formatPrice(bill.roomTotal) : "—"}
                </td>
              </tr>
              {(bill?.serviceLines ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-space-md py-space-md text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[18px] align-middle mr-space-xs">
                      room_service
                    </span>
                    {s.name}
                  </td>
                  <td className="px-space-md py-space-md text-right text-on-surface">
                    {formatPrice(s.unitPrice)}/{s.unit}
                  </td>
                  <td className="px-space-md py-space-md text-center text-on-surface">
                    {s.quantity} {s.unit}
                  </td>
                  <td className="px-space-md py-space-md text-right font-semibold text-primary">
                    {formatPrice(s.total)}
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-space-md py-space-md text-center text-on-surface-variant"
                  >
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
          <SummaryRow label="Tiền phòng:" value={bill ? formatPrice(bill.roomTotal) : "—"} />
          <SummaryRow label="Tiền dịch vụ:" value={bill ? formatPrice(bill.servicesTotal) : "—"} />
        </div>
        <div className="p-space-xl rounded-lg bg-primary-container border-2 border-primary flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm font-bold text-on-primary-container">
            TỔNG TIỀN DỰ KIẾN:
          </span>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            {bill ? formatPrice(bill.total) : "—"}
          </span>
        </div>
      </section>

      <section className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
        <ul className="space-y-space-xs text-on-surface-variant font-body-sm list-disc list-inside">
          <li>
            Khi xác nhận, hệ thống kiểm tra lại và tính lại tiền phòng theo thời gian trả
            phòng thực tế; số tiền cuối cùng có thể khác số dự kiến.
          </li>
          <li>Hóa đơn được tạo với trạng thái Chưa thanh toán (UNPAID); phòng chuyển sang "Đang dọn dẹp".</li>
          <li>Trả phòng này không tự động trả các phòng khác trong cùng phiếu thuê.</li>
          <li>
            Quy tắc làm tròn thời lượng đang tạm áp dụng:{" "}
            {BILLING_RULES.rounding === "CEIL" ? "làm tròn lên" : "theo cấu hình"}, tối thiểu{" "}
            {BILLING_RULES.minimumUnits} đơn vị (chờ nghiệp vụ chốt).
          </li>
        </ul>
      </section>
    </ModalShell>
  );
};

const CheckOutModal = ({ isOpen, stay, ...props }) => {
  if (!isOpen || !stay) return null;
  return <CheckOutForm key={stay.detail.id} stay={stay} {...props} />;
};

export default CheckOutModal;
