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
