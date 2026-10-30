import { formatCurrency } from '@/utils/format';

/**
 * BookingSummary - Tổng quan đặt phòng khi đang tạo phiếu thuê
 *
 * Dựa theo Database.md:
 *   KhachHang { TenKH, SDT, CCCD_Passport }
 *   Phong { MaPH, loaiPhong.TenLPH, loaiPhong.GiaNgay, loaiPhong.GiaGio }
 *   CTDP { SoNguoi, NgayCheckIn, NgayCheckOut, DonGia, ThanhTien }
 *
 * Props:
 *   khachHang: KhachHang | null
 *   checkInDate: string (YYYY-MM-DD)
 *   checkInTime: string (HH:mm)
 *   checkOutDate: string (YYYY-MM-DD)
 *   checkOutTime: string (HH:mm)
 *   selectedRooms: Phong[] — mảng phòng đã chọn
 *   soNguoi: number
 *   hinhThucThue: 'NGAY' | 'GIO'
 */
const BookingSummary = ({
  khachHang,
  checkInDate,
  checkInTime = '14:00',
  checkOutDate,
  checkOutTime = '12:00',
  selectedRooms = [],
  soNguoi = 1,
  hinhThucThue = 'NGAY'
}) => {
  const formatDateTimeDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${timeStr || '12:00'} - ${datePart}`;
  };

  // Tính số lượng thời gian thuê
  const calculateDuration = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(`${checkInDate}T${checkInTime || '00:00'}`);
    const end = new Date(`${checkOutDate}T${checkOutTime || '00:00'}`);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;

    if (hinhThucThue === 'GIO') {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return Math.max(1, diffHours);
    } else {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    }
  };

  const duration = calculateDuration();

  const calculateRoomTotal = (phong) => {
    if (duration <= 0) return 0;
    const loaiPhong = phong.loaiPhong;
    if (hinhThucThue === 'GIO') {
      const donGia = loaiPhong?.GiaGio || (loaiPhong?.GiaNgay ? Math.round(loaiPhong.GiaNgay / 10) : 0);
      return donGia * duration;
    } else {
      const donGia = loaiPhong?.GiaNgay || 0;
      return donGia * duration;
    }
  };

  const calculateTotal = () => {
    return selectedRooms.reduce((sum, phong) => sum + calculateRoomTotal(phong), 0);
  };

  const tongTien = calculateTotal();
  const hasData = khachHang || checkInDate || selectedRooms.length > 0;

  return (
    <div className="p-space-lg rounded-lg bg-surface-container-high border-2 border-primary/20">
      <div className="flex items-center justify-between mb-space-md">
        <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
          Tổng quan phiếu thuê
        </h3>
        <span className="px-space-sm py-space-xs rounded bg-primary/20 text-primary text-[11px] font-semibold">
          {hinhThucThue === 'GIO' ? 'Thuê theo giờ' : 'Thuê theo ngày'}
        </span>
      </div>

      {!hasData && (
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-lg">
          Điền thông tin bên trái để xem tổng quan
        </p>
      )}

      <div className="space-y-space-md">
        {/* Thông tin khách hàng */}
        {khachHang && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-xs">
              Khách hàng
            </p>
            <p className="font-body-md text-body-md text-on-surface font-semibold">
              {khachHang.TenKH}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              SĐT: {khachHang.SDT}
            </p>
            {khachHang.CCCD_Passport && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                CCCD/Passport: {khachHang.CCCD_Passport}
              </p>
            )}
          </div>
        )}

        {/* Thời gian có kèm giờ */}
        {(checkInDate || checkOutDate) && (
          <div className="pb-space-md border-b border-surface-container space-y-space-xs">
            {checkInDate && (
              <div>
                <p className="font-label-sm text-label-sm text-outline">
                  Nhận phòng (Check-in)
                </p>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  {formatDateTimeDisplay(checkInDate, checkInTime)}
                </p>
              </div>
            )}
            {checkOutDate && (
              <div>
                <p className="font-label-sm text-label-sm text-outline">
                  Trả phòng (Check-out)
                </p>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  {formatDateTimeDisplay(checkOutDate, checkOutTime)}
                </p>
              </div>
            )}
            {duration > 0 && (
              <div className="pt-space-xs">
                <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container text-primary font-body-sm text-body-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {duration} {hinhThucThue === 'GIO' ? 'giờ' : 'ngày (đêm)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Số người */}
        {soNguoi > 0 && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-xs">
              Số người (SoNguoi)
            </p>
            <p className="font-body-md text-body-md text-on-surface">
              {soNguoi} khách / phòng
            </p>
          </div>
        )}

        {/* Danh sách phòng đã chọn */}
        {selectedRooms.length > 0 && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-sm">
              Phòng đã chọn ({selectedRooms.length} phòng)
            </p>
            <div className="space-y-space-xs">
              {selectedRooms.map((phong) => {
                const loaiPhong = phong.loaiPhong;
                const donGia = hinhThucThue === 'GIO'
                  ? (loaiPhong?.GiaGio || Math.round((loaiPhong?.GiaNgay || 0) / 10))
                  : (loaiPhong?.GiaNgay || 0);
                const roomTotal = calculateRoomTotal(phong);

                return (
                  <div
                    key={phong.IdPH}
                    className="flex items-center justify-between p-space-sm rounded bg-surface-container"
                  >
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold">
                        {phong.MaPH}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {loaiPhong?.TenLPH}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold">
                        {formatCurrency(roomTotal)}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {formatCurrency(donGia)}/{hinhThucThue === 'GIO' ? 'giờ' : 'ngày'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tổng tiền dự kiến */}
        {tongTien > 0 && (
          <div className="pt-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                Tổng tiền
              </span>
              <span className="font-headline-md text-headline-md text-primary font-bold">
                {formatCurrency(tongTien)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs text-right">
              {duration} {hinhThucThue === 'GIO' ? 'giờ' : 'ngày'} × {selectedRooms.length} phòng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
