import { formatDateTime } from "@/utils/format";

// Chuyển dữ liệu từ API (camelCase) sang dạng mà các component đặt phòng hiện có đang dùng
// (khóa kiểu Database.md: IdKH, TenKH, IdPH, MaPH, loaiPhong...). Khi các component được
// viết lại theo API, chỉ cần bỏ file này.

/** CustomerResponse -> KhachHang */
export const toKhachHang = (c) => ({
  IdKH: c.customerId,
  TenKH: c.fullName,
  SDT: c.phone,
  CCCD_Passport: c.citizenId,
  QuocTich: c.nationality,
  GioiTinh: c.gender,
});

/** AvailableRoomResponse -> Phong (kèm loaiPhong) */
export const toPhong = (r) => ({
  IdPH: r.roomId,
  MaPH: r.roomCode,
  IdLPH: r.roomTypeId,
  TrangThaiPhong: 0, // phòng khả dụng
  GhiChu: r.note,
  loaiPhong: {
    IdLPH: r.roomTypeId,
    TenLPH: r.roomTypeName,
    SoGiuong: r.numberOfBeds,
    SoNguoiToiDa: r.maximumOccupancy,
    GiaNgay: r.dailyRate,
    GiaGio: r.hourlyRate,
  },
});

// booking_status -> TrangThaiDatPhong (0: Đã đặt, 1: Đang thuê, 2: Đã trả/đang dọn, 3: Đã hủy)
const BOOKING_STATUS_CODE = { RESERVED: 0, CHECKED_IN: 1, CHECKED_OUT: 2, CANCELLED: 3 };

/** RentalReceiptResponse -> PhieuThue (kèm chiTiet) */
export const toPhieuThue = (r) => ({
  IdPT: r.rentalReceiptId,
  receiptCode: r.receiptCode,
  NgPT: r.rentalDate,
  IdKH: r.customer.customerId,
  IdNV: r.employeeId,
  tenNV: r.employeeName,
  TrangThai: r.receiptStatus,
  khachHang: toKhachHang(r.customer),
  chiTiet: r.details.map((d) => ({
    IdCTDP: d.bookingDetailId,
    IdPT: r.rentalReceiptId,
    IdPH: d.roomId,
    SoNguoi: d.numberOfGuests,
    NgayCheckIn: d.checkIn,
    NgayCheckOut: d.checkOut,
    HinhThucThue: d.pricingMethod,
    TrangThaiDatPhong: BOOKING_STATUS_CODE[d.bookingStatus] ?? 0,
    DonGia: d.unitPrice,
    ThanhTien: d.estimatedAmount,
    phong: {
      IdPH: d.roomId,
      MaPH: d.roomCode,
      loaiPhong: { TenLPH: d.roomTypeName },
    },
  })),
});

// ------------------------------------------------------------------ Nhận phòng (UC-REN-004)

/** CheckInContextResponse -> dữ liệu mà CheckInModal hiển thị */
export const toCheckInStay = (ctx) => ({
  customer: {
    id: ctx.customerId,
    name: ctx.customerName,
    phone: ctx.customerPhone,
    citizenId: ctx.customerCitizenId,
    nationality: ctx.customerNationality,
  },
  room: {
    id: ctx.roomId,
    code: ctx.roomCode,
    typeName: ctx.roomTypeName,
    beds: ctx.numberOfBeds,
    maxOccupancy: ctx.maximumOccupancy,
  },
  detail: {
    id: ctx.bookingDetailId,
    expectedCheckIn: ctx.expectedCheckIn,
    expectedCheckOut: ctx.expectedCheckOut,
    rentalType: ctx.pricingMethod,
    bookedGuests: ctx.expectedGuests,
  },
  receipt: { id: ctx.rentalReceiptId, code: ctx.receiptCode },
});

// ------------------------------------------------------------------ Sơ đồ phòng (UC-ROM-005/006)

const DISPLAY_STATUS_UI = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
};

/** Mã trạng thái của tab lọc trên giao diện -> trạng thái hiển thị của API */
export const UI_STATUS_TO_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_STATUS_UI).map(([api, ui]) => [ui, api]),
);

const toBookingInfo = (b) =>
  b && {
    bookingDetailId: b.bookingDetailId,
    receiptCode: b.receiptCode,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    numberOfGuests: b.numberOfGuests,
    checkInTime: formatDateTime(b.checkIn),
    checkOutTime: formatDateTime(b.checkOut),
    bookingStatus: b.bookingStatus,
  };

/** RoomMapItemResponse -> thẻ phòng mà RoomCard / RoomDetailModal đang dùng */
export const toRoomCard = (item) => {
  const booking = toBookingInfo(item.booking);
  return {
    id: item.roomId,
    name: item.roomCode,
    roomType: item.roomTypeName,
    pricePerDay: item.dailyRate,
    // giá giờ chưa có (null/0) thì không tự suy ra từ giá ngày
    pricePerHour: item.hourlyRate > 0 ? item.hourlyRate : null,
    numberOfBeds: item.numberOfBeds,
    maximumOccupancy: item.maximumOccupancy,
    note: item.note,
    status: DISPLAY_STATUS_UI[item.displayStatus],
    guestName: booking?.customerName,
    guestPhone: booking?.customerPhone,
    numberOfGuests: booking?.numberOfGuests,
    receiptCode: booking?.receiptCode,
    checkInTime: booking?.checkInTime,
    checkOutTime: booking?.checkOutTime,
    bookingDetailId: booking?.bookingDetailId,
    maintenanceReason: item.displayStatus === "MAINTENANCE" ? item.note : undefined,
    reservationCount: item.reservationCount,
    canCheckIn: item.canCheckIn,
    matchedBooking: toBookingInfo(item.matchedBooking),
    rawData: item,
  };
};
