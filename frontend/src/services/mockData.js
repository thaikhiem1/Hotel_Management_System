/**
 * Mock Data chuẩn hóa 100% theo Database.md
 * Hệ thống Quản lý Khách sạn SE113
 */

// Table NhanVien { IdNV, TenNV, ChucVu, Luong, SDT, CCCD, NgaySinh, GioiTinh, DiaChi, Email, Avatar }
export const mockNhanVien = [
  {
    IdNV: 1,
    TenNV: 'Lê Văn Lễ Tân',
    ChucVu: 'Nhân viên lễ tân',
    Luong: 9000000,
    SDT: '0911222333',
    CCCD: '079090001111',
    NgaySinh: '1998-05-15',
    GioiTinh: 'Nam',
    DiaChi: 'Quận 1, TP. Hồ Chí Minh',
    Email: 'letan1@hotel.com',
    Avatar: ''
  },
  {
    IdNV: 2,
    TenNV: 'Nguyễn Thị Thu Ngân',
    ChucVu: 'Nhân viên lễ tân',
    Luong: 9500000,
    SDT: '0911222444',
    CCCD: '079090002222',
    NgaySinh: '1999-08-20',
    GioiTinh: 'Nữ',
    DiaChi: 'Bình Thạnh, TP. Hồ Chí Minh',
    Email: 'letan2@hotel.com',
    Avatar: ''
  },
  {
    IdNV: 3,
    TenNV: 'Trần Văn Quản Lý',
    ChucVu: 'Quản lý',
    Luong: 20000000,
    SDT: '0909999888',
    CCCD: '079085003333',
    NgaySinh: '1985-03-10',
    GioiTinh: 'Nam',
    DiaChi: 'Quận 3, TP. Hồ Chí Minh',
    Email: 'quanly@hotel.com',
    Avatar: ''
  },
  {
    IdNV: 4,
    TenNV: 'Hoàng Minh Tuấn',
    ChucVu: 'Kỹ thuật bảo trì',
    Luong: 11000000,
    SDT: '0903334455',
    CCCD: '079092004444',
    NgaySinh: '1992-11-25',
    GioiTinh: 'Nam',
    DiaChi: 'Thủ Đức, TP. Hồ Chí Minh',
    Email: 'kythuat@hotel.com',
    Avatar: ''
  }
];

// Table TaiKhoan { TenTK, Password_hash, Role, IdNV }
// Role: 0: Admin, 1: Nhân viên lễ tân, 2: Quản lý
export const mockTaiKhoan = [
  { TenTK: 'admin', Password_hash: 'hash_admin_123', Role: 0, IdNV: 3 },
  { TenTK: 'letan1', Password_hash: 'hash_letan_123', Role: 1, IdNV: 1 },
  { TenTK: 'letan2', Password_hash: 'hash_letan_456', Role: 1, IdNV: 2 },
  { TenTK: 'manager', Password_hash: 'hash_mgr_789', Role: 2, IdNV: 3 }
];

// Table KhachHang { IdKH, TenKH, SDT, CCCD_Passport, QuocTich, GioiTinh }
export const mockKhachHang = [
  {
    IdKH: 1,
    TenKH: 'Nguyễn Văn An',
    SDT: '0901234567',
    CCCD_Passport: '079123456789',
    QuocTich: 'Việt Nam',
    GioiTinh: 'Nam'
  },
  {
    IdKH: 2,
    TenKH: 'Trần Thị Bình',
    SDT: '0907654321',
    CCCD_Passport: '079987654321',
    QuocTich: 'Việt Nam',
    GioiTinh: 'Nữ'
  },
  {
    IdKH: 3,
    TenKH: 'Lê Minh Cường',
    SDT: '0903456789',
    CCCD_Passport: '079345678901',
    QuocTich: 'Việt Nam',
    GioiTinh: 'Nam'
  },
  {
    IdKH: 4,
    TenKH: 'John Smith',
    SDT: '0912345678',
    CCCD_Passport: 'US123456789',
    QuocTich: 'Mỹ',
    GioiTinh: 'Nam'
  },
  {
    IdKH: 5,
    TenKH: 'Phạm Thị Dung',
    SDT: '0987654321',
    CCCD_Passport: '074123456789',
    QuocTich: 'Việt Nam',
    GioiTinh: 'Nữ'
  }
];

// Table LoaiPhong { IdLPH, TenLPH, SoGiuong, SoNguoiToiDa, GiaNgay, GiaGio }
export const mockLoaiPhong = [
  {
    IdLPH: 1,
    TenLPH: 'Phòng Tiêu Chuẩn (Standard)',
    SoGiuong: 1,
    SoNguoiToiDa: 2,
    GiaNgay: 800000,
    GiaGio: 100000
  },
  {
    IdLPH: 2,
    TenLPH: 'Phòng Cao Cấp (Deluxe)',
    SoGiuong: 1,
    SoNguoiToiDa: 2,
    GiaNgay: 1500000,
    GiaGio: 150000
  },
  {
    IdLPH: 3,
    TenLPH: 'Phòng Suite Sang Trọng',
    SoGiuong: 2,
    SoNguoiToiDa: 4,
    GiaNgay: 2500000,
    GiaGio: 250000
  },
  {
    IdLPH: 4,
    TenLPH: 'Phòng Tổng Thống (Presidential)',
    SoGiuong: 2,
    SoNguoiToiDa: 6,
    GiaNgay: 5000000,
    GiaGio: 500000
  }
];

// Table Phong { IdPH, MaPH, TrangThaiPhong (0: Trống, 1: Đang sửa chữa), IdLPH, GhiChu }
export const mockPhong = [
  {
    IdPH: 1,
    MaPH: 'P101',
    TrangThaiPhong: 0,
    IdLPH: 2,
    GhiChu: 'Phòng tầng 1, ban công hướng vườn',
    loaiPhong: mockLoaiPhong[1]
  },
  {
    IdPH: 2,
    MaPH: 'P102',
    TrangThaiPhong: 0,
    IdLPH: 3,
    GhiChu: 'Phòng Suite rộng 60m2',
    loaiPhong: mockLoaiPhong[2]
  },
  {
    IdPH: 3,
    MaPH: 'P103',
    TrangThaiPhong: 0,
    IdLPH: 1,
    GhiChu: 'Phòng gần thang máy',
    loaiPhong: mockLoaiPhong[0]
  },
  {
    IdPH: 4,
    MaPH: 'P104',
    TrangThaiPhong: 0,
    IdLPH: 2,
    GhiChu: 'Phòng yên tĩnh',
    loaiPhong: mockLoaiPhong[1]
  },
  {
    IdPH: 5,
    MaPH: 'P105',
    TrangThaiPhong: 1, // Đang sửa chữa
    IdLPH: 3,
    GhiChu: 'Đang bảo trì điều hòa và hệ thống nước',
    loaiPhong: mockLoaiPhong[2]
  },
  {
    IdPH: 6,
    MaPH: 'P106',
    TrangThaiPhong: 0,
    IdLPH: 1,
    GhiChu: 'Phòng Standard tầng 1',
    loaiPhong: mockLoaiPhong[0]
  },
  {
    IdPH: 7,
    MaPH: 'P107',
    TrangThaiPhong: 0,
    IdLPH: 2,
    GhiChu: 'Phòng Deluxe view hồ bơi',
    loaiPhong: mockLoaiPhong[1]
  },
  {
    IdPH: 8,
    MaPH: 'P108',
    TrangThaiPhong: 0,
    IdLPH: 4,
    GhiChu: 'Phòng Tổng Thống VIP view panorama',
    loaiPhong: mockLoaiPhong[3]
  }
];

// Table PhieuThue { IdPT, NgPT, IdKH, IdNV }
// Table CTDP { IdCTDP, IdPT, IdPH, SoNguoi, NgayCheckIn, NgayCheckOut, TrangThaiDatPhong (0: Đã đặt, 1: Đang thuê, 2: Đang dọn dẹp), DonGia, ThanhTien }
/**
 * MOCK DATA ĐẶC BIỆT ĐỂ TEST TRÁNH XUNG ĐỘT PHÒNG:
 * - Phòng P101 (IdPH: 1): ĐÃ CÓ LỊCH ĐẶT từ 14:00 ngày 23/09/2026 đến 02:00 ngày 24/09/2026.
 *   => Khi người khác chọn khung giờ giao thoa với khoảng này (ví dụ 18:00 - 22:00 hôm nay), P101 sẽ KHÔNG hiển thị vì đang có người đặt.
 *   => Nhưng khi chọn ngoài khung giờ này (ví dụ sau 02:00 ngày 24/09/2026 hoặc trước 14:00 ngày 23/09/2026), P101 sẽ TRỐNG và hiển thị cho phép đặt!
 */
export const mockPhieuThue = [
  {
    IdPT: 1,
    NgPT: '2026-09-23',
    IdKH: 1,
    IdNV: 1,
    khachHang: mockKhachHang[0],
    chiTiet: [
      {
        IdCTDP: 1,
        IdPT: 1,
        IdPH: 1, // P101
        SoNguoi: 2,
        NgayCheckIn: '2026-09-23T14:00:00',
        NgayCheckOut: '2026-09-24T02:00:00', // Đặt từ 14:00 đến 02:00 sáng hôm sau
        HinhThucThue: 'GIO',
        TrangThaiDatPhong: 1, // 1: Đang thuê (hoặc 0: Đã đặt)
        DonGia: 150000,
        ThanhTien: 1800000, // 12 giờ * 150k
        phong: mockPhong[0]
      }
    ]
  },
  {
    IdPT: 2,
    NgPT: '2026-09-22',
    IdKH: 2,
    IdNV: 1,
    khachHang: mockKhachHang[1],
    chiTiet: [
      {
        IdCTDP: 2,
        IdPT: 2,
        IdPH: 2, // P102
        SoNguoi: 2,
        NgayCheckIn: '2026-09-22T14:00:00',
        NgayCheckOut: '2026-09-25T14:00:00',
        HinhThucThue: 'NGAY',
        TrangThaiDatPhong: 1, // 1: Đang thuê
        DonGia: 2500000,
        ThanhTien: 7500000,
        phong: mockPhong[1]
      },
      {
        IdCTDP: 3,
        IdPT: 2,
        IdPH: 7, // P107
        SoNguoi: 2,
        NgayCheckIn: '2026-09-22T14:00:00',
        NgayCheckOut: '2026-09-24T12:00:00',
        HinhThucThue: 'NGAY',
        TrangThaiDatPhong: 1, // 1: Đang thuê
        DonGia: 1500000,
        ThanhTien: 3000000,
        phong: mockPhong[6]
      }
    ]
  },
  {
    IdPT: 3,
    NgPT: '2026-09-23',
    IdKH: 3,
    IdNV: 2,
    khachHang: mockKhachHang[2],
    chiTiet: [
      {
        IdCTDP: 4,
        IdPT: 3,
        IdPH: 4, // P104
        SoNguoi: 1,
        NgayCheckIn: '2026-09-23T08:00:00',
        NgayCheckOut: '2026-09-23T12:00:00',
        HinhThucThue: 'GIO',
        TrangThaiDatPhong: 2, // 2: Đang dọn dẹp
        DonGia: 150000,
        ThanhTien: 600000,
        phong: mockPhong[3]
      }
    ]
  },
  {
    IdPT: 4,
    NgPT: '2026-09-23',
    IdKH: 4,
    IdNV: 1,
    khachHang: mockKhachHang[3],
    chiTiet: [
      {
        IdCTDP: 5,
        IdPT: 4,
        IdPH: 3, // P103
        SoNguoi: 2,
        NgayCheckIn: '2026-09-23T18:00:00',
        NgayCheckOut: '2026-09-24T12:00:00',
        HinhThucThue: 'NGAY',
        TrangThaiDatPhong: 0, // 0: Đã đặt
        DonGia: 800000,
        ThanhTien: 800000,
        phong: mockPhong[2]
      }
    ]
  }
];

// Table HoaDon { IdHD, NgHD, TriGia, IdNV, IdPT, TrangThaiThanhToan }
export const mockHoaDon = [
  {
    IdHD: 1,
    NgHD: '2026-09-23',
    TriGia: 4000000,
    IdNV: 1,
    IdPT: 1,
    TrangThaiThanhToan: 0 // 0: Chưa thanh toán
  },
  {
    IdHD: 2,
    NgHD: '2026-09-23',
    TriGia: 10500000,
    IdNV: 2,
    IdPT: 2,
    TrangThaiThanhToan: 0
  },
  {
    IdHD: 3,
    NgHD: '2026-09-23',
    TriGia: 600000,
    IdNV: 2,
    IdPT: 3,
    TrangThaiThanhToan: 1 // 1: Đã thanh toán
  }
];

// =========================================================================
// CÁC HÀM TIỆN ÍCH KIỂM TRA TRẠNG THÁI VÀ XUNG ĐỘT PHÒNG
// =========================================================================

/**
 * Kiểm tra xem 2 khoảng thời gian [startA, endA] và [startB, endB] có giao thoa/xung đột không.
 * Điều kiện xung đột: startA < endB && endA > startB
 */
export const isTimeOverlap = (startA, endA, startB, endB) => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  if (isNaN(sA) || isNaN(eA) || isNaN(sB) || isNaN(eB)) return false;
  return sA < eB && eA > sB;
};

/**
 * Kiểm tra một phòng có khả dụng (trống) trong khoảng thời gian [checkInStr, checkOutStr] hay không.
 * @param {number} phongId - IdPH
 * @param {string} checkInStr - Chuỗi ISO hoặc YYYY-MM-DDTHH:mm
 * @param {string} checkOutStr - Chuỗi ISO hoặc YYYY-MM-DDTHH:mm
 * @param {Array} phieuThueList - Danh sách phiếu thuê
 * @returns {boolean} true nếu phòng trống, false nếu phòng bận/đang sửa chữa/xung đột
 */
export const checkRoomAvailability = (phongId, checkInStr, checkOutStr, phieuThueList = mockPhieuThue) => {
  // Tìm thông tin phòng
  const phong = mockPhong.find(p => p.IdPH === phongId);
  if (!phong) return false;

  // Nếu phòng đang sửa chữa (TrangThaiPhong === 1) thì luôn không khả dụng
  if (phong.TrangThaiPhong === 1) return false;

  // Nếu chưa chỉ định thời gian đầy đủ, kiểm tra TrangThaiPhong cơ bản
  if (!checkInStr || !checkOutStr) {
    return phong.TrangThaiPhong === 0;
  }

  // Duyệt qua tất cả các chi tiết phiếu thuê để kiểm tra xung đột thời gian
  for (const pt of phieuThueList) {
    for (const ct of (pt.chiTiet || [])) {
      if (ct.IdPH === phongId) {
        // Chỉ xét các đặt phòng đang có hiệu lực (0: Đã đặt, 1: Đang thuê, 2: Đang dọn dẹp)
        if ([0, 1, 2].includes(ct.TrangThaiDatPhong)) {
          if (isTimeOverlap(checkInStr, checkOutStr, ct.NgayCheckIn, ct.NgayCheckOut)) {
            // Có xung đột thời gian!
            return false;
          }
        }
      }
    }
  }

  return true;
};

/**
 * Lấy trạng thái hiển thị của phòng tại một thời điểm hoặc trong một khoảng thời gian
 * Trả về: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance'
 */
export const getRoomStatusAtTime = (phong, startDateTimeStr, endDateTimeStr, phieuThueList = mockPhieuThue) => {
  // 1. Nếu phòng đang sửa chữa
  if (phong.TrangThaiPhong === 1) {
    return {
      status: 'maintenance',
      label: 'Đang bảo trì',
      color: 'bg-error/20 text-error',
      icon: 'engineering',
      maintenanceReason: phong.GhiChu || 'Bảo trì trang thiết bị phòng'
    };
  }

  const checkStart = startDateTimeStr || new Date().toISOString();
  const checkEnd = endDateTimeStr || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  // 2. Tìm chi tiết đặt phòng trùng với khoảng thời gian này
  for (const pt of phieuThueList) {
    for (const ct of (pt.chiTiet || [])) {
      if (ct.IdPH === phong.IdPH && [0, 1, 2].includes(ct.TrangThaiDatPhong)) {
        if (isTimeOverlap(checkStart, checkEnd, ct.NgayCheckIn, ct.NgayCheckOut)) {
          if (ct.TrangThaiDatPhong === 1) {
            return {
              status: 'occupied',
              label: 'Đang có khách',
              color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
              icon: 'person',
              guestName: pt.khachHang?.TenKH || 'Khách thuê',
              checkOutTime: new Date(ct.NgayCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(ct.NgayCheckOut).toLocaleDateString('vi-VN')
            };
          }
          if (ct.TrangThaiDatPhong === 2) {
            return {
              status: 'cleaning',
              label: 'Đang dọn dẹp',
              color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
              icon: 'cleaning_services'
            };
          }
          if (ct.TrangThaiDatPhong === 0) {
            return {
              status: 'reserved',
              label: 'Đã đặt',
              color: 'bg-primary/20 text-primary',
              icon: 'event',
              guestName: pt.khachHang?.TenKH,
              checkInTime: new Date(ct.NgayCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(ct.NgayCheckIn).toLocaleDateString('vi-VN')
            };
          }
        }
      }
    }
  }

  // 3. Mặc định là trống/sẵn sàng
  return {
    status: 'available',
    label: 'Trống/Sẵn sàng',
    color: 'bg-primary/20 text-primary',
    icon: 'check_circle'
  };
};
