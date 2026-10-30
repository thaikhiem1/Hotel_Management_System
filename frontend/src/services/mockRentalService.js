// Giả lập API nhận phòng / trả phòng trên dữ liệu mock (chưa kết nối backend).
// Hợp đồng trả về dùng camelCase để sau này thay bằng lời gọi API thật mà không phải sửa UI.
// Mỗi hàm kiểm tra điều kiện giống backend (kiểm tra lại khi xác nhận); backend thật cần @Transactional + khóa dòng.
import { mockPhieuThue, mockDichVuSuDung, mockNhanVien } from "./mockData";
import { calculateStay, BillingError } from "@/utils/billing";
import { formatDateTime } from "@/utils/format";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * code: A1 | E1 | E2 | E3 | E4 | E5 | INVALID_TIME | MISSING_DATA
 * (trùng mã luồng ngoại lệ trong UC-REN-004 / UC-REN-007)
 * field: tên trường lỗi nếu lỗi gắn với một ô nhập
 */
export class RentalError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = "RentalError";
    this.code = code;
    this.field = field;
  }
}

const DETAIL_STATUS = { 0: "RESERVED", 1: "CHECKED_IN", 2: "CHECKED_OUT" };
const STATUS_CODE = { RESERVED: 0, CHECKED_IN: 1, CHECKED_OUT: 2 };

// Hóa đơn trả phòng tạo trong phiên (không đụng mockHoaDon để không làm lệch thống kê doanh thu)
const checkoutInvoices = [];
let nextInvoiceId = 1000;

const findDetail = (predicate) => {
  for (const receipt of mockPhieuThue) {
    for (const detail of receipt.chiTiet || []) {
      if (predicate(detail, receipt)) return { receipt, detail };
    }
  }
  return null;
};

const roomOperationalStatus = (room) => {
  if (room.TrangThaiPhong === 1) return "UNDER_MAINTENANCE";
  const cleaning = findDetail(
    (d) => d.IdPH === room.IdPH && d.TrangThaiDatPhong === STATUS_CODE.CHECKED_OUT,
  );
  return cleaning ? "CLEANING" : "AVAILABLE";
};

const toContext = ({ receipt, detail }) => {
  const room = detail.phong;
  const type = room.loaiPhong || {};
  const employee = mockNhanVien.find((nv) => nv.IdNV === receipt.IdNV);
  return {
    receipt: {
      id: receipt.IdPT,
      createdDate: receipt.NgPT,
      status: receipt.TrangThai || "DA_DAT",
      employeeName: employee?.TenNV ?? "N/A",
    },
    detail: {
      id: detail.IdCTDP,
      status: DETAIL_STATUS[detail.TrangThaiDatPhong],
      bookedGuests: detail.SoNguoi,
      rentalType: detail.HinhThucThue,
      unitPrice: detail.DonGia,
      expectedCheckIn: detail.NgayCheckIn,
      expectedCheckOut: detail.NgayCheckOut,
      actualCheckIn: detail.NgayCheckInThucTe ?? null,
      actualGuests: detail.SoNguoiThucTe ?? null,
    },
    customer: {
      name: receipt.khachHang?.TenKH,
      phone: receipt.khachHang?.SDT,
      citizenId: receipt.khachHang?.CCCD_Passport,
      nationality: receipt.khachHang?.QuocTich,
      gender: receipt.khachHang?.GioiTinh,
    },
    room: {
      id: room.IdPH,
      code: room.MaPH,
      typeName: type.TenLPH,
      maxOccupancy: type.SoNguoiToiDa,
      beds: type.SoGiuong,
      note: room.GhiChu,
      status: roomOperationalStatus(room),
    },
  };
};

// Cập nhật trạng thái phiếu thuê theo trạng thái các chi tiết (UC-REN-004 bước 8, UC-REN-007 bước 16)
const syncReceiptStatus = (receipt) => {
  const statuses = receipt.chiTiet.map((d) => d.TrangThaiDatPhong);
  if (statuses.includes(STATUS_CODE.CHECKED_IN)) {
    receipt.TrangThai = "DANG_LUU_TRU";
  } else if (statuses.includes(STATUS_CODE.RESERVED)) {
    // còn chi tiết chưa nhận: không chuyển sang DA_TRA_PHONG, quay về trạng thái đặt phòng
    receipt.TrangThai = "DA_DAT";
  } else {
    receipt.TrangThai = "DA_TRA_PHONG";
  }
  return receipt.TrangThai;
};

const hasInvoice = (detailId) =>
  checkoutInvoices.some((inv) => inv.bookingDetailId === detailId);

// ---------------------------------------------------------------- Nhận phòng

const assertCanCheckIn = ({ receipt, detail }, now) => {
  const ctx = toContext({ receipt, detail });
  if (ctx.room.status === "UNDER_MAINTENANCE" || ctx.room.status === "CLEANING") {
    throw new RentalError(
      "E4",
      ctx.room.status === "CLEANING"
        ? `Phòng ${ctx.room.code} đang dọn dẹp, chưa thể tiếp nhận khách.`
        : `Phòng ${ctx.room.code} đang bảo trì, không thể tiếp nhận khách.`,
    );
  }
  const occupied = findDetail(
    (d) => d.IdPH === detail.IdPH && d.TrangThaiDatPhong === STATUS_CODE.CHECKED_IN,
  );
  if (occupied) {
    throw new RentalError(
      "E4",
      `Phòng ${ctx.room.code} đang có lượt lưu trú khác sử dụng.`,
    );
  }
  if (now < new Date(detail.NgayCheckIn)) {
    throw new RentalError(
      "E2",
      `Chưa đến thời gian nhận phòng. Thời gian nhận dự kiến: ${formatDateTime(detail.NgayCheckIn)}.`,
    );
  }
  return ctx;
};

export const rentalService = {
  /** Bước 2-3 của UC-REN-004: lấy dữ liệu và kiểm tra điều kiện trước khi mở form. */
  async getCheckInContext({ roomId, detailId }, now = new Date()) {
    await delay(300);
    const found = findDetail(
      (d) =>
        d.IdPH === roomId &&
        d.TrangThaiDatPhong === STATUS_CODE.RESERVED &&
        (detailId == null || d.IdCTDP === detailId),
    );
    if (!found) {
      throw new RentalError(
        "E1",
        "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.",
      );
    }
    return assertCanCheckIn(found, now);
  },

  /** Bước 6-9 của UC-REN-004: kiểm tra lại rồi ghi nhận nhận phòng. */
  async checkIn({ detailId, actualGuests }, now = new Date()) {
    await delay(500);
    const found = findDetail((d) => d.IdCTDP === detailId);
    if (!found) {
      throw new RentalError(
        "E1",
        "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.",
      );
    }
    if (found.detail.TrangThaiDatPhong !== STATUS_CODE.RESERVED) {
      throw new RentalError(
        "E5",
        "Chi tiết đặt phòng đã được nhận phòng bởi giao dịch khác. Vui lòng kiểm tra lại thông tin.",
      );
    }
    const ctx = assertCanCheckIn(found, now);

    const max = ctx.room.maxOccupancy;
    if (!Number.isInteger(actualGuests) || actualGuests <= 0 || actualGuests > max) {
      throw new RentalError(
        "E3",
        `Số lượng khách phải từ 1 đến ${max} người (sức chứa tối đa của phòng).`,
        "actualGuests",
      );
    }

    found.detail.TrangThaiDatPhong = STATUS_CODE.CHECKED_IN;
    found.detail.NgayCheckInThucTe = now.toISOString();
    found.detail.SoNguoiThucTe = actualGuests;
    const receiptStatus = syncReceiptStatus(found.receipt);

    return {
      bookingDetailId: detailId,
      roomCode: ctx.room.code,
      customerName: ctx.customer.name,
      actualCheckIn: now.toISOString(),
      actualGuests,
      receiptStatus,
    };
  },

  // ----------------------------------------------------------------- Trả phòng

  /** Bước 2-4 của UC-REN-007: xác định lượt lưu trú CHECKED_IN, dịch vụ đã dùng, kiểm tra hóa đơn. */
  async getCheckOutContext({ roomId, detailId }) {
    await delay(300);
    const found = findDetail(
      (d) =>
        d.IdPH === roomId &&
        d.TrangThaiDatPhong === STATUS_CODE.CHECKED_IN &&
        (detailId == null || d.IdCTDP === detailId),
    );
    if (!found) {
      throw new RentalError("A1", "Phòng không có lượt lưu trú hợp lệ để trả phòng.");
    }
    if (hasInvoice(found.detail.IdCTDP)) {
      throw new RentalError("E3", "Chi tiết lưu trú đã có hóa đơn.");
    }
    return {
      ...toContext(found),
      services: mockDichVuSuDung
        .filter((s) => s.IdCTDP === found.detail.IdCTDP)
        .map((s) => ({
          id: s.IdDV,
          name: s.TenDV,
          unit: s.DonVi,
          unitPrice: s.DonGia,
          quantity: s.SoLuong,
        })),
    };
  },

  /** Bước 10-17 của UC-REN-007: kiểm tra lại, tính lại theo giờ trả thực tế, tạo hóa đơn UNPAID. */
  async checkOut({ detailId, employeeId }, now = new Date()) {
    await delay(600);
    const found = findDetail((d) => d.IdCTDP === detailId);
    if (!found || found.detail.TrangThaiDatPhong !== STATUS_CODE.CHECKED_IN) {
      throw new RentalError(
        "E4",
        "Lượt lưu trú đã được trả phòng hoặc trạng thái đã thay đổi. Vui lòng tải lại dữ liệu trước khi thực hiện lại.",
      );
    }
    if (hasInvoice(detailId)) {
      throw new RentalError("E3", "Chi tiết lưu trú đã có hóa đơn.");
    }

    const { receipt, detail } = found;
    const services = mockDichVuSuDung
      .filter((s) => s.IdCTDP === detailId)
      .map((s) => ({ name: s.TenDV, unitPrice: s.DonGia, quantity: s.SoLuong }));

    let bill;
    try {
      bill = calculateStay({
        rentalType: detail.HinhThucThue,
        unitPrice: detail.DonGia,
        checkInAt: detail.NgayCheckInThucTe ?? detail.NgayCheckIn,
        checkOutAt: now,
        services,
      });
    } catch (e) {
      if (e instanceof BillingError) throw new RentalError(e.code, e.message);
      throw e;
    }

    // Phần ghi dữ liệu: backend thật phải nằm trong một giao dịch (chi tiết + hóa đơn + phòng + phiếu thuê)
    detail.TrangThaiDatPhong = STATUS_CODE.CHECKED_OUT; // phòng chuyển CLEANING
    detail.NgayCheckOutThucTe = now.toISOString();
    const receiptStatus = syncReceiptStatus(receipt);

    const invoice = {
      invoiceId: nextInvoiceId++,
      bookingDetailId: detailId,
      receiptId: receipt.IdPT,
      employeeId: employeeId ?? null,
      status: "UNPAID",
      createdAt: now.toISOString(),
      roomCode: detail.phong.MaPH,
      customerName: receipt.khachHang?.TenKH,
      checkInAt: detail.NgayCheckInThucTe ?? detail.NgayCheckIn,
      checkOutAt: now.toISOString(),
      roomTotal: bill.roomTotal,
      servicesTotal: bill.servicesTotal,
      total: bill.total,
    };
    checkoutInvoices.push(invoice);

    return { invoice, receiptStatus, roomStatus: "CLEANING" };
  },
};
