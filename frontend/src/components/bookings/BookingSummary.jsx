import { formatCurrency } from '@/utils/format';

/**
 * BookingSummary - Tổng quan đặt phòng khi đang tạo phiếu thuê (UC-REN-001 bước 9)
 *
 * Mọi con số tiền đều do máy chủ tính (UC-REN-010) và truyền vào qua `estimate`;
 * component này không tự tính giá.
 *
 * Props:
 *   khachHang: KhachHang | null
 *   nhanVien: tên nhân viên lập phiếu (tài khoản đang đăng nhập)
 *   checkInDate, checkInTime, checkOutDate, checkOutTime
 *   selectedRooms: Phong[]
 *   soNguoi: number
 *   hinhThucThue: 'NGAY' | 'GIO'
 *   estimate: { lines, totalAmount } | null — kết quả POST /api/rental-receipts/estimate
 *   estimateLoading: boolean
 *   estimateError: string | null
 */
const BookingSummary = ({
  khachHang,
  nhanVien,
  checkInDate,
  checkInTime = '14:00',
  checkOutDate,
  checkOutTime = '12:00',
  selectedRooms = [],
  soNguoi = 1,
  hinhThucThue = 'NGAY',
  estimate = null,
  estimateLoading = false,
  estimateError = null
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

  const unitLabel = hinhThucThue === 'GIO' ? 'giờ' : 'đêm';
  const linesByRoom = new Map((estimate?.lines ?? []).map((line) => [line.roomId, line]));
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
        {/* Khách hàng đại diện */}
        {khachHang && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-xs">
              Khách hàng đại diện
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

        {/* Nhân viên lập phiếu */}
        {nhanVien && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-xs">
              Nhân viên lập phiếu
            </p>
            <p className="font-body-md text-body-md text-on-surface font-semibold">
              {nhanVien}
            </p>
          </div>
        )}

        {/* Thời gian dự kiến */}
        {(checkInDate || checkOutDate) && (
          <div className="pb-space-md border-b border-surface-container space-y-space-xs">
            {checkInDate && (
              <div>
                <p className="font-label-sm text-label-sm text-outline">
                  Nhận phòng dự kiến
                </p>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  {formatDateTimeDisplay(checkInDate, checkInTime)}
                </p>
              </div>
            )}
            {checkOutDate && (
              <div>
                <p className="font-label-sm text-label-sm text-outline">
                  Trả phòng dự kiến
                </p>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  {formatDateTimeDisplay(checkOutDate, checkOutTime)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Số khách */}
        {soNguoi > 0 && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-xs">
              Số khách
            </p>
            <p className="font-body-md text-body-md text-on-surface">
              {soNguoi} khách / phòng
            </p>
          </div>
        )}

        {/* Phòng đã chọn và thành tiền từng phòng */}
        {selectedRooms.length > 0 && (
          <div className="pb-space-md border-b border-surface-container">
            <p className="font-label-sm text-label-sm text-outline mb-space-sm">
              Phòng đã chọn ({selectedRooms.length} phòng)
            </p>
            <div className="space-y-space-xs">
              {selectedRooms.map((phong) => {
                const line = linesByRoom.get(phong.IdPH);
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
                        {phong.loaiPhong?.TenLPH}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold">
                        {line ? formatCurrency(line.amount) : '—'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {line
                          ? `${line.billedUnits} ${unitLabel} × ${formatCurrency(line.unitPrice)}`
                          : estimateLoading ? 'Đang tính...' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lỗi khi tính chi phí */}
        {estimateError && (
          <div className="p-space-sm rounded bg-error/10 border border-error/20 text-error font-body-sm text-body-sm">
            {estimateError}
          </div>
        )}

        {/* Tổng chi phí dự kiến */}
        {estimate && !estimateError && (
          <div className="pt-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
                Chi phí dự kiến
              </span>
              <span className="font-headline-md text-headline-md text-primary font-bold">
                {formatCurrency(estimate.totalAmount)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs text-right">
              Chưa gồm dịch vụ; số tiền thanh toán cuối cùng tính khi trả phòng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
