import StatusBadge from './StatusBadge';
import { formatDateTime, formatDate, formatCurrency, formatReceiptCode } from '@/utils/format';

/**
 * BookingDetailDialog - Hộp thoại xem chi tiết phiếu thuê
 *
 * Dựa theo Database.md:
 *   PhieuThue { IdPT, NgPT, IdKH, IdNV }
 *   CTDP { IdCTDP, IdPT, IdPH, SoNguoi, NgayCheckIn, NgayCheckOut, TrangThaiDatPhong, DonGia, ThanhTien }
 *   KhachHang { IdKH, TenKH, SDT, CCCD_Passport, QuocTich, GioiTinh }
 *   Phong { IdPH, MaPH, TrangThaiPhong, IdLPH, GhiChu }
 *   LoaiPhong { IdLPH, TenLPH, SoGiuong, SoNguoiToiDa, GiaNgay, GiaGio }
 *
 * Tính năng:
 *   - Bỏ thao tác chỉnh sửa
 *   - Hiển thị format ngày kèm giờ
 *   - Khi phiếu có từ 2 phòng trở lên: có nút xóa phòng bất kỳ và tự động cập nhật lại tổng tiền
 *   - Khi phiếu chỉ có 1 phòng: hủy là xóa cả phiếu thuê
 */
const BookingDetailDialog = ({
  phieuThue,
  isOpen,
  onClose,
  onCancel,
  onRemoveRoom,
  tinhTongTien,
  layTrangThaiPhieuThue
}) => {
  if (!isOpen || !phieuThue) return null;

  const calculateDuration = (NgayCheckIn, NgayCheckOut, hinhThuc) => {
    const start = new Date(NgayCheckIn);
    const end = new Date(NgayCheckOut);
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs <= 0) return '1 ngày';

    if (hinhThuc === 'GIO') {
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return `${Math.max(1, hours)} giờ`;
    } else {
      // Theo ngày: số đêm theo ngày lịch giữa ngày nhận và ngày trả, tối thiểu 1 đêm (UC-REN-010)
      const toDay = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      const nights = Math.round((toDay(end) - toDay(start)) / (1000 * 60 * 60 * 24));
      return `${Math.max(1, nights)} đêm`;
    }
  };

  const { khachHang, chiTiet = [] } = phieuThue;
  const trangThai = layTrangThaiPhieuThue ? layTrangThaiPhieuThue(chiTiet) : 'DA_DAT';
  const tongTien = tinhTongTien ? tinhTongTien(chiTiet) : 0;
  const hasMultipleRooms = chiTiet.length >= 2;

  const handleRemoveSingleRoom = (ct) => {
    const maPhong = ct.phong?.MaPH || `ID ${ct.IdPH}`;
    if (onRemoveRoom) {
      onRemoveRoom(phieuThue.IdPT, ct.IdCTDP, maPhong);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1rem)] max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-surface-container-low shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-space-lg border-b border-surface-container-high bg-surface-container-low z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Chi tiết phiếu thuê {(phieuThue.receiptCode || formatReceiptCode(phieuThue.IdPT))}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ngày lập: {formatDate(phieuThue.NgPT)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-space-sm rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg space-y-space-lg">

          {/* Thông tin phiếu thuê */}
          <div className="p-space-lg rounded-lg bg-surface-container-high">
            <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-space-md">
              Thông tin phiếu thuê
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Mã phiếu thuê
                </p>
                <p className="font-body-lg text-body-lg text-primary font-bold">
                  {(phieuThue.receiptCode || formatReceiptCode(phieuThue.IdPT))}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Trạng thái
                </p>
                <StatusBadge status={trangThai} />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Ngày lập phiếu
                </p>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  {formatDate(phieuThue.NgPT)}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Mã nhân viên (IdNV)
                </p>
                <p className="font-body-md text-body-md text-on-surface">
                  NV{String(phieuThue.IdNV).padStart(3, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin khách hàng — KhachHang { TenKH, SDT, CCCD_Passport, QuocTich, GioiTinh } */}
          <div className="p-space-lg rounded-lg bg-surface-container-high">
            <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-space-md">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Họ tên
                </p>
                <p className="font-body-md text-body-md text-on-surface font-bold">
                  {khachHang?.TenKH || 'Khách vãng lai'}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  Số điện thoại
                </p>
                <p className="font-body-md text-body-md text-on-surface">
                  {khachHang?.SDT || '-'}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                  CCCD / Hộ chiếu
                </p>
                <p className="font-body-md text-body-md text-on-surface">
                  {khachHang?.CCCD_Passport || '-'}
                </p>
              </div>
              {khachHang?.QuocTich && (
                <div>
                  <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                    Quốc tịch
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {khachHang.QuocTich}
                  </p>
                </div>
              )}
              {khachHang?.GioiTinh && (
                <div>
                  <p className="font-label-sm text-label-sm text-outline mb-space-xs">
                    Giới tính
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {khachHang.GioiTinh}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chi tiết đặt phòng — CTDP */}
          <div className="p-space-lg rounded-lg bg-surface-container-high">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                  Danh sách phòng ({chiTiet.length} phòng)
                </h3>
                {hasMultipleRooms ? (
                  <p className="font-body-sm text-body-sm text-primary mt-space-xs">
                    Phiếu có {chiTiet.length} phòng: Bạn có thể nhấn nút &quot;Xóa phòng&quot; ở từng phòng để loại bỏ phòng đó và cập nhật lại tiền.
                  </p>
                ) : (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    Phiếu thuê gồm 1 phòng: Để hủy, vui lòng chọn &quot;Hủy phiếu thuê&quot; phía dưới.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-space-md">
              {chiTiet.map((ct) => {
                const loaiPhong = ct.phong?.loaiPhong;
                const durationText = calculateDuration(ct.NgayCheckIn, ct.NgayCheckOut, ct.HinhThucThue);

                return (
                  <div
                    key={ct.IdCTDP}
                    className="p-space-md rounded-lg bg-surface-container border border-surface-container-highest transition-all"
                  >
                    {/* Header từng phòng */}
                    <div className="flex items-start justify-between mb-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">
                          {ct.phong?.MaPH}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                          ({loaiPhong?.TenLPH || 'Phòng'})
                        </span>
                        <StatusBadge status={ct.TrangThaiDatPhong} />
                      </div>

                      {/* Nút xóa phòng riêng lẻ khi phiếu có từ 2 phòng trở lên */}
                      {hasMultipleRooms && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleRoom(ct)}
                          className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-error/10 hover:bg-error/20 text-error font-label-sm text-label-sm font-semibold transition-colors"
                          title={`Xóa phòng ${ct.phong?.MaPH} khỏi phiếu thuê`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                          <span>Xóa phòng</span>
                        </button>
                      )}
                    </div>

                    {/* Chi tiết thời gian có giờ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm py-space-xs text-on-surface">
                      <div>
                        <p className="font-label-sm text-label-sm text-outline">
                          Nhận phòng
                        </p>
                        <p className="font-body-sm text-body-sm font-semibold">
                          {formatDateTime(ct.NgayCheckIn)}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-outline">
                          Trả phòng
                        </p>
                        <p className="font-body-sm text-body-sm font-semibold">
                          {formatDateTime(ct.NgayCheckOut)}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-outline">
                          Thời gian thuê
                        </p>
                        <p className="font-body-sm text-body-sm font-semibold">
                          {durationText}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-outline">
                          Số khách
                        </p>
                        <p className="font-body-sm text-body-sm font-semibold">
                          {ct.SoNguoi} khách
                        </p>
                      </div>
                    </div>

                    {/* Đơn giá & Thành tiền */}
                    <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container-high">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Đơn giá: {formatCurrency(ct.DonGia)}/{ct.HinhThucThue === 'GIO' ? 'giờ' : 'ngày'}
                      </span>
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm text-outline mr-space-xs">
                          Thành tiền:
                        </span>
                        <span className="font-body-lg text-body-lg text-primary font-bold">
                          {formatCurrency(ct.ThanhTien)}
                        </span>
                      </div>
                    </div>

                    {/* Ghi chú phòng nếu có */}
                    {ct.phong?.GhiChu && (
                      <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant italic text-[11px]">
                        Ghi chú: {ct.phong.GhiChu}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tổng tiền phiếu thuê */}
          <div className="p-space-lg rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider block font-bold">
                  Tổng tiền phiếu thuê
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {chiTiet.length} phòng đang được thuê trong phiếu này
                </span>
              </div>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">
                {formatCurrency(tongTien)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: BỎ hoàn toàn nút Chỉnh sửa, chỉ còn Đóng và Hủy phiếu thuê */}
        <div className="sticky bottom-0 flex items-center justify-between p-space-lg border-t border-surface-container-high bg-surface-container-low">
          {/* Nút hủy toàn bộ phiếu thuê */}
          <button
            type="button"
            onClick={() => {
              onCancel(phieuThue);
            }}
            className="flex items-center gap-space-xs px-space-lg py-space-md rounded-lg bg-error-container hover:bg-error text-on-error-container hover:text-on-error font-label-lg text-label-lg font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              delete_forever
            </span>
            <span>Hủy phiếu thuê</span>
          </button>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetailDialog;
