import StatusBadge from './StatusBadge';
import { formatDateTime, formatDate, formatCurrency, formatReceiptCode } from '@/utils/format';

/**
 * BookingTable - Bảng danh sách phiếu thuê
 *
 * Dựa theo Database.md:
 *   PhieuThue { IdPT, NgPT, IdKH, IdNV }
 *   CTDP { IdCTDP, IdPT, IdPH, SoNguoi, NgayCheckIn, NgayCheckOut, TrangThaiDatPhong, DonGia, ThanhTien }
 *   KhachHang { IdKH, TenKH, SDT, CCCD_Passport, QuocTich, GioiTinh }
 *   Phong { IdPH, MaPH, TrangThaiPhong, IdLPH, GhiChu }
 *   LoaiPhong { IdLPH, TenLPH, SoGiuong, SoNguoiToiDa, GiaNgay, GiaGio }
 *
 * Thao tác chỉ còn:
 *   - Xem chi tiết (onViewDetail)
 *   - Hủy phiếu thuê (onCancel) - Nếu 1 phòng xóa luôn phiếu thuê
 */
const BookingTable = ({
  phieuThueList = [],
  onViewDetail,
  onCancel,
  isLoading,
  tinhTongTien,
  layTrangThaiPhieuThue
}) => {

  // Lấy ngày CheckIn sớm nhất và CheckOut muộn nhất trong PhieuThue
  const getDateRange = (chiTiet = []) => {
    if (!chiTiet || chiTiet.length === 0) return { checkIn: '-', checkOut: '-' };
    const sortedIn = [...chiTiet].sort((a, b) => new Date(a.NgayCheckIn) - new Date(b.NgayCheckIn));
    const sortedOut = [...chiTiet].sort((a, b) => new Date(b.NgayCheckOut) - new Date(a.NgayCheckOut));
    return {
      checkIn: formatDateTime(sortedIn[0].NgayCheckIn),
      checkOut: formatDateTime(sortedOut[0].NgayCheckOut)
    };
  };

  const getTotalSoNguoi = (chiTiet = []) =>
    chiTiet.reduce((sum, ct) => sum + (ct.SoNguoi || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-margin-lg">
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Đang tải danh sách phiếu thuê...
          </p>
        </div>
      </div>
    );
  }

  if (!phieuThueList || phieuThueList.length === 0) {
    return (
      <div className="flex items-center justify-center py-margin-lg">
        <div className="flex flex-col items-center gap-space-md text-center">
          <span className="material-symbols-outlined text-[64px] text-outline">
            event_busy
          </span>
          <div>
            <p className="font-headline-md text-headline-md text-on-surface mb-space-xs">
              Chưa có phiếu thuê
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Hiện tại chưa có dữ liệu. Nhấn &quot;Tạo phiếu thuê&quot; để bắt đầu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-surface-container-low">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-surface-container-high">
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Mã phiếu
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Ngày lập
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Khách hàng
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Phòng ({phieuThueList.reduce((s, p) => s + (p.chiTiet?.length || 0), 0)} phòng)
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Ngày & Giờ nhận
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Ngày & Giờ trả
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Số khách
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Tổng tiền
            </th>
            <th className="px-space-lg py-space-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-space-lg py-space-md text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {phieuThueList.map((pt) => {
            const chiTiet = pt.chiTiet || [];
            const trangThai = layTrangThaiPhieuThue ? layTrangThaiPhieuThue(chiTiet) : 'DA_DAT';
            const tongTien = tinhTongTien ? tinhTongTien(chiTiet) : 0;
            const { checkIn, checkOut } = getDateRange(chiTiet);
            const tongSoNguoi = getTotalSoNguoi(chiTiet);

            return (
              <tr
                key={pt.IdPT}
                className="border-b border-surface-container-high hover:bg-surface-container transition-colors"
              >
                {/* Mã phiếu */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-label-lg text-label-lg text-primary font-bold">
                    {pt.receiptCode || formatReceiptCode(pt.IdPT)}
                  </span>
                </td>

                {/* Ngày lập phiếu */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatDate(pt.NgPT)}
                  </span>
                </td>

                {/* Khách hàng */}
                <td className="px-space-lg py-space-lg">
                  <div>
                    <p className="font-body-md text-body-md text-on-surface font-semibold">
                      {pt.khachHang?.TenKH || 'Khách vãng lai'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {pt.khachHang?.SDT}
                    </p>
                  </div>
                </td>

                {/* Danh sách phòng */}
                <td className="px-space-lg py-space-lg">
                  <div className="flex flex-wrap gap-space-xs">
                    {chiTiet.map((ct) => (
                      <span
                        key={ct.IdCTDP}
                        className="px-space-sm py-space-xs rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold"
                        title={`${ct.phong?.loaiPhong?.TenLPH || ''}`}
                      >
                        {ct.phong?.MaPH}
                      </span>
                    ))}
                    <span className="text-[11px] text-on-surface-variant self-center">
                      ({chiTiet.length} phòng)
                    </span>
                  </div>
                </td>

                {/* Ngày nhận có giờ */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    {checkIn}
                  </span>
                </td>

                {/* Ngày trả có giờ */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    {checkOut}
                  </span>
                </td>

                {/* Số khách */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-body-md text-body-md text-on-surface">
                    {tongSoNguoi} khách
                  </span>
                </td>

                {/* Tổng tiền */}
                <td className="px-space-lg py-space-lg">
                  <span className="font-body-md text-body-md text-primary font-bold">
                    {formatCurrency(tongTien)}
                  </span>
                </td>

                {/* Trạng thái */}
                <td className="px-space-lg py-space-lg">
                  <StatusBadge status={trangThai} />
                </td>

                {/* Thao tác: Chỉ có Xem chi tiết và Hủy phiếu thuê */}
                <td className="px-space-lg py-space-lg text-center relative">
                  <div className="flex items-center justify-center gap-space-xs">
                    {/* Nút Xem chi tiết nhanh */}
                    <button
                      type="button"
                      onClick={() => onViewDetail(pt)}
                      className="p-space-sm rounded-lg hover:bg-surface-container-highest text-on-surface transition-colors"
                      title="Xem chi tiết phiếu thuê"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>

                    {/* Nút Hủy phiếu thuê nhanh */}
                    <button
                      type="button"
                      onClick={() => onCancel(pt)}
                      className="p-space-sm rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hủy phiếu thuê"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
