import { cn } from "@/utils/lib/util";
import { formatDate } from "@/utils/format";

/**
 * InvoiceDetailModal - Modal xem chi tiết hóa đơn đã tạo
 * Hiển thị đầy đủ thông tin hóa đơn đã thanh toán
 *
 * Props:
 * - invoice: Thông tin hóa đơn đầy đủ
 * - isOpen: Trạng thái modal
 * - onClose: Callback đóng modal
 * - onPrint: Callback in hóa đơn
 */
const InvoiceDetailModal = ({
  invoice,
  isOpen,
  onClose,
  onPrint,
  onPayment,
  isLoading,
}) => {
  if (!isOpen || !invoice) return null;

  // Format ngày
  // Lấy thông tin từ rental_receipt và booking_details
  const rentalReceipt = invoice.rental_receipt || {};
  const bookingDetails = rentalReceipt.booking_details || [];
  const customer = rentalReceipt.customer || {};
  const employee = invoice.employee || {};

  // Tính toán chi tiết
  const roomTotal = bookingDetails.reduce(
    (sum, bd) => sum + (bd.total_amount || 0),
    0,
  );
  const servicesTotal = invoice.total_amount - roomTotal;

  // Trạng thái thanh toán
  const statusConfig = {
    PAID: {
      label: "Đã thanh toán",
      bgClass: "bg-tertiary",
      textClass: "text-on-tertiary",
      icon: "check_circle",
    },
    UNPAID: {
      label: "Chưa thanh toán",
      bgClass: "bg-error",
      textClass: "text-on-error",
      icon: "pending",
    },
  };

  const status = statusConfig[invoice.payment_status] || statusConfig.UNPAID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-tertiary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[36px]">
              receipt_long
            </span>
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold">
                Chi tiết Hóa đơn #{String(invoice.invoice_id).padStart(6, "0")}
              </h2>
              <div className="flex items-center gap-space-sm mt-space-xs">
                <div
                  className={cn(
                    "flex items-center gap-space-xs px-space-md py-space-xs rounded-full",
                    status.bgClass,
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[16px]",
                      status.textClass,
                    )}
                  >
                    {status.icon}
                  </span>
                  <span
                    className={cn(
                      "font-label-sm text-label-sm font-semibold",
                      status.textClass,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-xl space-y-space-lg">
          {/* Thông tin hóa đơn cơ bản */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Thông tin khách hàng */}
            <div className="p-space-lg rounded-lg bg-primary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  person
                </span>
                <h3 className="font-title-md text-title-md font-bold text-on-primary-container">
                  Khách hàng
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div>
                  <p className="text-body-sm text-on-primary-container/70">
                    Họ và tên:
                  </p>
                  <p className="font-semibold text-on-primary-container">
                    {customer.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-on-primary-container/70">
                    Số điện thoại:
                  </p>
                  <p className="font-semibold text-on-primary-container">
                    {customer.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-on-primary-container/70">
                    CCCD/Passport:
                  </p>
                  <p className="font-semibold text-on-primary-container">
                    {customer.citizen_id_passport || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin nhân viên */}
            <div className="p-space-lg rounded-lg bg-secondary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  badge
                </span>
                <h3 className="font-title-md text-title-md font-bold text-on-secondary-container">
                  Nhân viên
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div>
                  <p className="text-body-sm text-on-secondary-container/70">
                    Họ và tên:
                  </p>
                  <p className="font-semibold text-on-secondary-container">
                    {employee.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-on-secondary-container/70">
                    Chức vụ:
                  </p>
                  <p className="font-semibold text-on-secondary-container">
                    {employee.position || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin phiếu thuê */}
            <div className="p-space-lg rounded-lg bg-tertiary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-tertiary text-[24px]">
                  description
                </span>
                <h3 className="font-title-md text-title-md font-bold text-on-tertiary-container">
                  Phiếu thuê
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div>
                  <p className="text-body-sm text-on-tertiary-container/70">
                    Mã phiếu thuê:
                  </p>
                  <p className="font-semibold text-on-tertiary-container">
                    PT{String(invoice.rental_receipt_id).padStart(6, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-on-tertiary-container/70">
                    Ngày lập:
                  </p>
                  <p className="font-semibold text-on-tertiary-container">
                    {formatDate(rentalReceipt.rental_date)}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-on-tertiary-container/70">
                    Ngày thanh toán:
                  </p>
                  <p className="font-semibold text-on-tertiary-container">
                    {formatDate(invoice.invoice_date)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chi tiết phòng */}
          <section className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">
                hotel
              </span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                Chi tiết phòng đã thuê
              </h3>
            </div>

            {bookingDetails.length === 0 ? (
              <div className="p-space-xl rounded-lg bg-surface-container-low border border-outline-variant text-center">
                <p className="font-body-lg text-on-surface-variant">
                  Không có thông tin phòng
                </p>
              </div>
            ) : (
              <div className="space-y-space-sm">
                {bookingDetails.map((bd, index) => (
                  <div
                    key={bd.booking_detail_id || index}
                    className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="space-y-space-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Mã phòng:
                          </span>
                          <span className="font-semibold text-on-surface">
                            {bd.room?.room_code || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Loại phòng:
                          </span>
                          <span className="font-semibold text-on-surface">
                            {bd.room?.room_type?.room_type_name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Số khách:
                          </span>
                          <span className="font-semibold text-on-surface">
                            {bd.number_of_guests} người
                          </span>
                        </div>
                      </div>
                      <div className="space-y-space-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Check-in:
                          </span>
                          <span className="font-semibold text-on-surface">
                            {formatDate(bd.check_in_date)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Check-out:
                          </span>
                          <span className="font-semibold text-on-surface">
                            {formatDate(bd.check_out_date)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Thành tiền:
                          </span>
                          <span className="font-semibold text-primary">
                            {bd.total_amount?.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tổng kết */}
          <section className="space-y-space-md">
            <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
              <div className="space-y-space-sm">
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-title-md text-on-surface">
                    Tiền phòng:
                  </span>
                  <span className="font-title-lg text-title-lg font-semibold text-on-surface">
                    {roomTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-title-md text-on-surface">
                    Tiền dịch vụ:
                  </span>
                  <span className="font-title-lg text-title-lg font-semibold text-on-surface">
                    {servicesTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="p-space-xl rounded-lg bg-gradient-to-r from-primary to-tertiary border-2 border-primary">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  TỔNG THANH TOÁN:
                </span>
                <span className="font-headline-lg text-headline-lg font-bold text-on-primary">
                  {invoice.total_amount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex flex-wrap gap-space-md justify-end">
          <button
            onClick={onClose}
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Đóng
          </button>

          {invoice.payment_status === "UNPAID" ? (
            <button
              onClick={() => onPayment && onPayment(invoice)}
              disabled={isLoading}
              className="px-space-xl py-space-md rounded-lg bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">payments</span>

              <span>
                {isLoading ? "Đang thanh toán..." : "Xác nhận thanh toán"}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onPrint && onPrint(invoice)}
              className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm"
            >
              <span className="material-symbols-outlined">print</span>

              <span>In hóa đơn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
