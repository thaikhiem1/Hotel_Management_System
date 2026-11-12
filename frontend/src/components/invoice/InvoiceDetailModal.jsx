import { useEffect, useRef, useState } from "react";
import { ModalShell, InfoCard } from "@/components/shared";
import { invoiceAPI } from "@/services/api";
import { cn } from "@/utils/lib/util";
import { formatDateTime, formatPrice, PAYMENT_METHOD_LABELS, RENTAL_TYPE_LABELS } from "@/utils/format";
import { getErrorMessage, showError, showSuccess } from "@/utils/notification";
import { usePermission } from "@/utils/usePermission";
import { downloadInvoiceImage, downloadInvoicePdf, invoiceFileName, printInvoice } from "@/utils/invoiceExport";
import InvoicePrintSheet from "./InvoicePrintSheet";
import { InvoiceStatusBadge } from "./InvoiceCard";

const UNIT_LABELS = { NGAY: "đêm", GIO: "giờ" };
const METHOD_ICONS = { CASH: "payments", CARD: "credit_card", TRANSFER: "account_balance" };

/**
 * Nội dung chi tiết một hóa đơn: tải theo mã, thanh toán và xuất (in, ảnh, PDF).
 * Tách riêng để mỗi lần mở có trạng thái riêng (key theo mã hóa đơn).
 */
const InvoiceDetailBody = ({ invoiceId, onClose, onPaid }) => {
  const { check: checkWrite } = usePermission("stays");
  const sheetRef = useRef(null);
  const [state, setState] = useState({ loading: true, error: null, invoice: null });
  const [method, setMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);
  const [exporting, setExporting] = useState(null); // "print" | "png" | "pdf"

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await invoiceAPI.getById(invoiceId);
        if (!cancelled) setState({ loading: false, error: null, invoice: response.data });
      } catch (error) {
        if (!cancelled) {
          setState({ loading: false, error: getErrorMessage(error, "Không thể tải chi tiết hóa đơn."), invoice: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const { loading, error, invoice } = state;

  const handlePay = async () => {
    if (!checkWrite()) return;
    setPaying(true);
    try {
      const response = await invoiceAPI.pay(invoiceId, method);
      setState({ loading: false, error: null, invoice: response.data });
      showSuccess("Thanh toán thành công", `Hóa đơn ${response.data.invoiceCode} - ${formatPrice(response.data.totalAmount)}`);
      onPaid?.(response.data);
    } catch (e) {
      showError("Không thể thanh toán", getErrorMessage(e, "Thanh toán thất bại. Vui lòng thử lại."));
      if (e.response?.status === 409) {
        // Hóa đơn vừa được thanh toán ở nơi khác: tải lại trạng thái mới
        try {
          const response = await invoiceAPI.getById(invoiceId);
          setState({ loading: false, error: null, invoice: response.data });
          onPaid?.(response.data);
        } catch {
          /* giữ nguyên dữ liệu đang hiển thị */
        }
      }
    } finally {
      setPaying(false);
    }
  };

  const runExport = async (kind) => {
    if (!sheetRef.current || exporting) return;
    setExporting(kind);
    try {
      const name = invoiceFileName(invoice.invoiceCode);
      if (kind === "print") await printInvoice(sheetRef.current, name);
      else if (kind === "png") await downloadInvoiceImage(sheetRef.current, name);
      else await downloadInvoicePdf(sheetRef.current, name);
    } catch (e) {
      console.error("Export invoice failed:", e);
      showError("Không thể xuất hóa đơn", "Vui lòng thử lại.");
    } finally {
      setExporting(null);
    }
  };

  const exportButton = (kind, icon, text) => (
    <button
      key={kind}
      onClick={() => runExport(kind)}
      disabled={!invoice || Boolean(exporting)}
      className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
    >
      <span className={cn("material-symbols-outlined text-[20px]", exporting === kind && "animate-spin")}>
        {exporting === kind ? "progress_activity" : icon}
      </span>
      <span>{text}</span>
    </button>
  );

  const unitLabel = invoice ? UNIT_LABELS[invoice.pricingMethod] : "";

  return (
    <ModalShell
      icon="receipt_long"
      title={invoice ? `Hóa đơn ${invoice.invoiceCode}` : "Chi tiết hóa đơn"}
      subtitle={invoice ? `Phiếu thuê ${invoice.receiptCode} • Phòng ${invoice.roomCode}` : undefined}
      maxWidth="max-w-4xl"
      onClose={onClose}
      closeDisabled={paying}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={paying}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          {exportButton("print", "print", "In")}
          {exportButton("png", "image", "Tải ảnh")}
          {exportButton("pdf", "picture_as_pdf", "Tải PDF")}
          {invoice?.invoiceStatus === "UNPAID" && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="px-space-xl py-space-md rounded-lg bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm disabled:opacity-50"
            >
              <span className={cn("material-symbols-outlined", paying && "animate-spin")}>
                {paying ? "progress_activity" : "payments"}
              </span>
              <span>{paying ? "Đang thanh toán..." : "Xác nhận thanh toán"}</span>
            </button>
          )}
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-space-xl">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
        </div>
      ) : error ? (
        <div className="p-space-lg rounded-lg bg-error-container text-on-error-container border border-error/30">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-space-md">
            <InvoiceStatusBadge status={invoice.invoiceStatus} />
            <span className="font-body-md text-body-md text-on-surface-variant">
              Lập lúc {formatDateTime(invoice.issuedAt)} bởi {invoice.issuedBy}
            </span>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <InfoCard
              icon="person"
              title="Thông tin khách hàng"
              rows={[
                { label: "Họ và tên", value: invoice.customerName },
                { label: "Số điện thoại", value: invoice.customerPhone },
                { label: "CCCD/Passport", value: invoice.customerCitizenId },
                { label: "Quốc tịch", value: invoice.customerNationality },
              ]}
            />
            <InfoCard
              icon="hotel"
              title="Thông tin lưu trú"
              rows={[
                { label: "Phòng", value: `${invoice.roomCode} - ${invoice.roomTypeName}` },
                { label: "Hình thức thuê", value: RENTAL_TYPE_LABELS[invoice.pricingMethod] },
                { label: "Số khách", value: `${invoice.actualGuests} người` },
                { label: "Nhận phòng", value: formatDateTime(invoice.actualCheckIn) },
                { label: "Trả phòng", value: formatDateTime(invoice.actualCheckOut) },
              ]}
            />
          </section>

          <section className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">receipt</span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Chi tiết chi phí</h3>
            </div>
            <div className="overflow-x-auto rounded-lg border border-outline-variant">
              <table className="w-full min-w-[520px]">
                <thead className="bg-surface-container-low">
                  <tr className="text-on-surface font-label-md text-label-md">
                    <th className="px-space-md py-space-sm text-left">Khoản mục</th>
                    <th className="px-space-md py-space-sm text-right">Đơn giá</th>
                    <th className="px-space-md py-space-sm text-center">Số lượng</th>
                    <th className="px-space-md py-space-sm text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr>
                    <td className="px-space-md py-space-md font-semibold text-on-surface">Tiền phòng {invoice.roomCode}</td>
                    <td className="px-space-md py-space-md text-right text-on-surface">
                      {formatPrice(invoice.unitPrice)}/{unitLabel}
                    </td>
                    <td className="px-space-md py-space-md text-center text-on-surface">
                      {invoice.billedUnits} {unitLabel}
                    </td>
                    <td className="px-space-md py-space-md text-right font-semibold text-primary">
                      {formatPrice(invoice.roomAmount)}
                    </td>
                  </tr>
                  {invoice.services.map((s) => (
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
                      <td className="px-space-md py-space-md text-right font-semibold text-primary">{formatPrice(s.amount)}</td>
                    </tr>
                  ))}
                  {invoice.services.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-space-md py-space-md text-center text-on-surface-variant">
                        Khách không sử dụng dịch vụ nào (tiền dịch vụ = 0đ)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant space-y-space-sm">
              <div className="flex justify-between">
                <span className="font-title-md text-title-md text-on-surface">Tiền phòng:</span>
                <span className="font-title-lg text-title-lg font-semibold text-on-surface">{formatPrice(invoice.roomAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-title-md text-title-md text-on-surface">Tiền dịch vụ:</span>
                <span className="font-title-lg text-title-lg font-semibold text-on-surface">{formatPrice(invoice.serviceAmount)}</span>
              </div>
            </div>
            <div className="p-space-xl rounded-lg bg-primary-container border-2 border-primary flex flex-wrap items-center justify-between gap-space-sm">
              <span className="font-headline-sm text-headline-sm font-bold text-on-primary-container">TỔNG THANH TOÁN:</span>
              <span className="font-headline-lg text-headline-lg font-bold text-primary">{formatPrice(invoice.totalAmount)}</span>
            </div>
          </section>

          {/* Thanh toán */}
          <section className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">account_balance_wallet</span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Thanh toán</h3>
            </div>
            {invoice.invoiceStatus === "PAID" ? (
              <div className="p-space-lg rounded-lg bg-tertiary-container text-on-tertiary-container space-y-space-xs">
                <p className="font-body-md">
                  Đã thanh toán bằng <span className="font-bold">{PAYMENT_METHOD_LABELS[invoice.paymentMethod]}</span> lúc{" "}
                  {formatDateTime(invoice.paidAt)}.
                </p>
                <p className="font-body-md">Nhân viên thu tiền: {invoice.paidBy}</p>
              </div>
            ) : (
              <div className="space-y-space-sm">
                <p className="font-body-md text-on-surface-variant">
                  Chọn phương thức khách thanh toán rồi bấm "Xác nhận thanh toán". Số tiền thu là tổng đã lập trên hóa đơn.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, text]) => (
                    <label
                      key={value}
                      className={cn(
                        "flex items-center gap-space-sm px-space-md py-space-md rounded-lg border-2 cursor-pointer transition-colors",
                        method === value
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant hover:bg-surface-container-high",
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={method === value}
                        onChange={() => setMethod(value)}
                        disabled={paying}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="material-symbols-outlined text-[22px]">{METHOD_ICONS[value]}</span>
                      <span className="font-label-lg text-label-lg font-semibold">{text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tờ hóa đơn dùng để in, tải ảnh và PDF: dựng sẵn ngoài màn hình */}
          <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
            <InvoicePrintSheet ref={sheetRef} invoice={invoice} />
          </div>
        </>
      )}
    </ModalShell>
  );
};

/**
 * InvoiceDetailModal - Xem chi tiết, thanh toán, in/tải hóa đơn (dữ liệu thật từ GET /api/invoices/{id})
 *
 * Props:
 * - invoiceId: mã hóa đơn cần xem (null thì không hiển thị)
 * - onClose
 * - onPaid(invoice): gọi sau khi thanh toán thành công (cha làm mới danh sách và thống kê)
 */
const InvoiceDetailModal = ({ invoiceId, onClose, onPaid }) => {
  if (!invoiceId) return null;
  return <InvoiceDetailBody key={invoiceId} invoiceId={invoiceId} onClose={onClose} onPaid={onPaid} />;
};

export default InvoiceDetailModal;
