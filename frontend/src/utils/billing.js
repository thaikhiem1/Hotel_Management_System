// Tính tiền trả phòng (UC-REN-007):
//   T_phòng = N × G (theo ngày hoặc theo giờ), T_dịch vụ = Σ(SL × G), T_cuối = T_phòng + T_dịch vụ
// Đơn giá phòng và dịch vụ là GIÁ ĐÃ CHỐT của lượt lưu trú, không lấy bảng giá hiện hành.

/**
 * QUY TẮC LÀM TRÒN THỜI LƯỢNG — CHƯA CÓ QUY ĐỊNH NGHIỆP VỤ.
 * UC yêu cầu không tự mặc định; giá trị dưới đây chỉ là tạm cho bản mock và
 * được gom về một chỗ để đổi khi nghiệp vụ chốt (đồng bộ với backend).
 */
export const BILLING_RULES = {
  rounding: "CEIL", // CEIL: làm tròn lên | FLOOR: làm tròn xuống | EXACT: giữ số lẻ
  minimumUnits: 1, // thuê tối thiểu 1 ngày / 1 giờ
};

const HOUR_MS = 60 * 60 * 1000;
const UNIT_MS = { NGAY: 24 * HOUR_MS, GIO: HOUR_MS };
const UNIT_LABELS = { NGAY: "ngày", GIO: "giờ" };

/** code: INVALID_TIME (thời gian trả phòng không hợp lệ) | MISSING_DATA (thiếu dữ liệu tính tiền) */
export class BillingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

const roundUnits = (raw) => {
  const rounded =
    BILLING_RULES.rounding === "CEIL"
      ? Math.ceil(raw)
      : BILLING_RULES.rounding === "FLOOR"
        ? Math.floor(raw)
        : raw;
  return Math.max(BILLING_RULES.minimumUnits, rounded);
};

const isMoney = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;

export function calculateStay({
  rentalType,
  unitPrice,
  checkInAt,
  checkOutAt,
  services = [],
}) {
  if (!UNIT_MS[rentalType] || !isMoney(unitPrice)) {
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

  const units = roundUnits((to - from) / UNIT_MS[rentalType]);
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
