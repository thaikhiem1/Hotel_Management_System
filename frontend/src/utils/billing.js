// Tính tiền trả phòng (UC-REN-007):
//   T_phòng = N × G (theo ngày hoặc theo giờ), T_dịch vụ = Σ(SL × G), T_cuối = T_phòng + T_dịch vụ
// Đơn giá phòng và dịch vụ là GIÁ ĐÃ CHỐT của lượt lưu trú, không lấy bảng giá hiện hành.

/**
 * QUY TẮC TÍNH SỐ ĐƠN VỊ — thống nhất với UC-REN-010 và backend (RentalPricing.java):
 *  - GIO : tổng thời lượng làm tròn lên theo giờ, tối thiểu 1 giờ
 *  - NGAY: số đêm theo ngày lịch giữa ngày nhận và ngày trả, tối thiểu 1 đêm
 */
export const BILLING_RULES = {
  GIO: "Theo giờ: làm tròn lên theo tổng thời lượng, tối thiểu 1 giờ",
  NGAY: "Theo ngày: tính theo số đêm giữa ngày nhận và ngày trả, tối thiểu 1 đêm",
};

const HOUR_MS = 60 * 60 * 1000;
const UNIT_LABELS = { NGAY: "đêm", GIO: "giờ" };

/** code: INVALID_TIME (thời gian trả phòng không hợp lệ) | MISSING_DATA (thiếu dữ liệu tính tiền) */
export class BillingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

const toUtcDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

const billedUnits = (rentalType, from, to) => {
  if (rentalType === "GIO") {
    return Math.max(1, Math.ceil((to - from) / HOUR_MS));
  }
  const nights = Math.round((toUtcDay(new Date(to)) - toUtcDay(new Date(from))) / (24 * HOUR_MS));
  return Math.max(1, nights);
};

const isMoney = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;

export function calculateStay({
  rentalType,
  unitPrice,
  checkInAt,
  checkOutAt,
  services = [],
}) {
  if (!UNIT_LABELS[rentalType] || !isMoney(unitPrice)) {
    throw new BillingError(
      "MISSING_DATA",
      "Không xác định được hình thức thuê hoặc đơn giá phòng đã chốt.",
    );
  }
  const badService = services.find(
    (s) => !isMoney(s.unitPrice) || !(s.quantity > 0),
  );
  if (badService) {
    throw new BillingError(
      "MISSING_DATA",
      `Dữ liệu dịch vụ "${badService.name ?? ""}" thiếu số lượng hoặc đơn giá đã chốt.`,
    );
  }

  const from = new Date(checkInAt).getTime();
  const to = new Date(checkOutAt).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
    throw new BillingError(
      "INVALID_TIME",
      "Thời gian trả phòng sớm hơn thời gian nhận phòng thực tế hoặc không hợp lệ.",
    );
  }

  const units = billedUnits(rentalType, from, to);
  const roomTotal = Math.round(units * unitPrice);

  const serviceLines = services.map((s) => ({
    ...s,
    total: Math.round(s.quantity * s.unitPrice),
  }));
  const servicesTotal = serviceLines.reduce((sum, s) => sum + s.total, 0);

  return {
    units,
    unitLabel: UNIT_LABELS[rentalType],
    unitPrice,
    roomTotal,
    serviceLines,
    servicesTotal,
    total: roomTotal + servicesTotal,
  };
}
