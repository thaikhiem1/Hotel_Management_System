```sql
Table NhanVien {
  IdNV int [pk, increment]
  TenNV varchar(100) [not null]
  ChucVu varchar(50)
  Luong decimal(18,2)
  SDT varchar(15)
  CCCD varchar(20) [unique]
  NgaySinh date
  GioiTinh varchar(10)
  DiaChi varchar(255)
  Email varchar(100)
  Avatar varchar(255)
}

Table TaiKhoan {
  TenTK varchar(50) [pk]
  Password_hash varchar(255) [not null]
  Role int [not null] -- 0: Admin, 1: Nhân viên lễ tân, 2: Quản lý
  IdNV int [not null, unique]
}

Table KhachHang {
  IdKH int [pk, increment]
  TenKH varchar(100) [not null]
  SDT varchar(15)
  CCCD_Passport varchar(30)
  QuocTich varchar(50)
  GioiTinh varchar(10)
}

Table LoaiPhong {
  IdLPH int [pk, increment]
  TenLPH varchar(100) [not null]
  SoGiuong int [not null]
  SoNguoiToiDa int [not null]
  GiaNgay decimal(18,2) [not null]
  GiaGio decimal(18,2)
}

Table Phong {
  IdPH int [pk, increment]
  MaPH varchar(20) [not null, unique]
  TrangThaiPhong int [not null] -- 0: Trống ,1: Đang sữa chữa
  IdLPH int [not null]
  GhiChu varchar(255)
}

Table PhieuThue {
  IdPT int [pk, increment]
  NgPT date [not null]
  IdKH int [not null]
  IdNV int [not null]
}

Table CTDP {
  IdCTDP int [pk, increment]
  IdPT int [not null]
  IdPH int [not null]
  SoNguoi int [not null]
  NgayCheckIn date [not null]
  NgayCheckOut date [not null]
  TrangThaiDatPhong int [not null] -- 0: Đã đặt, 1: Đang thuê
  DonGia decimal(18,2) [not null]
  ThanhTien decimal(18,2) [not null]
}

Table LoaiDichVu {
  IdLDV int [pk, increment]
  TenLDV varchar(100) [not null]
}

Table DichVu {
  IdDV int [pk, increment]
  TenDV varchar(100) [not null]
  DonGia decimal(18,2) [not null]
  SLTon int
  IdLDV int [not null]
}

Table CTDV {
  IdCTDP int [not null]
  IdDV int [not null]
  DonGia decimal(18,2) [not null]
  SoLuongDung int [not null]
  ThanhTien decimal(18,2) [not null]
  indexes {
    (IdCTDP, IdDV) [pk]
  }
}

Table HoaDon {
  IdHD int [pk, increment]
  NgHD date [not null]
  TriGia decimal(18,2) [not null]
  IdNV int [not null]
  IdPT int [not null, unique]
  TrangThaiThanhToan int [not null] -- 0: Chưa thanh toán, Đã thanh toán
}
Table ThongKeDoanhThuThang {
  IdTK int [pk, increment]
  Nam int [not null]
  Thang int [not null]
  TongDoanhThu decimal(18,2) [not null]
  SoHoaDon int [not null]
  NgayCapNhat timestamp [not null]
  indexes {
    (Nam, Thang) [unique]
  }
}
// ==================== FOREIGN KEY ====================

Ref: TaiKhoan.IdNV - NhanVien.IdNV

Ref: Phong.IdLPH > LoaiPhong.IdLPH

Ref: PhieuThue.IdKH > KhachHang.IdKH
Ref: PhieuThue.IdNV > NhanVien.IdNV

Ref: CTDP.IdPT > PhieuThue.IdPT
Ref: CTDP.IdPH > Phong.IdPH

Ref: DichVu.IdLDV > LoaiDichVu.IdLDV

Ref: CTDV.IdCTDP > CTDP.IdCTDP
Ref: CTDV.IdDV > DichVu.IdDV

Ref: HoaDon.IdNV > NhanVien.IdNV
Ref: HoaDon.IdPT - PhieuThue.IdPT
```sql