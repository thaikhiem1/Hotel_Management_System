// Định dạng hiển thị dùng chung toàn ứng dụng

const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 1500000 -> "1.500.000 ₫" */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount || 0,
  );

/** 1500000 -> "1.500.000đ" (dạng gọn dùng trong modal) */
export const formatPrice = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")}đ`;

/** "2026-09-24T14:00:00" -> "24/09/2026" ("-" nếu rỗng, giữ nguyên chuỗi nếu không hợp lệ) */
export const formatDate = (value) => {
  if (!value) return "-";
  const date = toValidDate(value);
  if (!date) return value;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** "2026-09-24T14:00:00" -> "14:00 24/09/2026" */
export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = toValidDate(value);
  if (!date) return value;
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${time} ${formatDate(date)}`;
};

/** Mã phiếu thuê: 7 -> "PT007" */
export const formatReceiptCode = (id) => `PT${String(id).padStart(3, "0")}`;

export const RENTAL_TYPE_LABELS = {
  NGAY: "Theo ngày",
  GIO: "Theo giờ",
};

export const RECEIPT_STATUS_LABELS = {
  DA_XAC_NHAN: "Đã xác nhận",
  DANG_LUU_TRU: "Đang lưu trú",
  DA_TRA_PHONG: "Đã trả phòng",
};

export const PAYMENT_METHOD_LABELS = {
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  TRANSFER: "Chuyển khoản",
};
