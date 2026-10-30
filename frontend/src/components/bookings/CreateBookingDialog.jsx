import { useState, useEffect, useMemo } from 'react';
import CustomerSelector from './CustomerSelector';
import RoomSelector from './RoomSelector';
import BookingSummary from './BookingSummary';
import { checkRoomAvailability } from '@/services/mockData';

/**
 * CreateBookingDialog - Hộp thoại tạo phiếu thuê mới
 * Có kiểm tra và tự động ẩn phòng bị xung đột thời gian (vd: P101 từ 14:00 - 02:00)
 */
const CreateBookingDialog = ({
  isOpen,
  onClose,
  onSubmit,
  danhSachKhachHang = [],
  danhSachPhong = [],
  phieuThueList = []
}) => {
  // Hình thức thuê: 'NGAY' | 'GIO'
  const [hinhThucThue, setHinhThucThue] = useState('NGAY');

  // Khách hàng được chọn (KhachHang object)
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);

  // Thời gian
  const todayStr = new Date().toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('12:00');

  // Số người chung cho mỗi phòng
  const [soNguoi, setSoNguoi] = useState(1);

  // Danh sách phòng đã chọn (Phong[])
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Reset form khi dialog mở hoặc đóng
  useEffect(() => {
    if (isOpen) {
      setHinhThucThue('NGAY');
      setSelectedKhachHang(null);
      setCheckInDate(todayStr);
      setCheckInTime('14:00');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckOutDate(tomorrow.toISOString().split('T')[0]);
      setCheckOutTime('12:00');
      setSoNguoi(1);
      setSelectedRooms([]);
    } else {
      setSelectedKhachHang(null);
      setSelectedRooms([]);
    }
  }, [isOpen, todayStr]);

  // Xử lý chuyển đổi hình thức thuê
  const handleSwitchHinhThuc = (type) => {
    setHinhThucThue(type);
    if (type === 'GIO') {
      setCheckInDate(todayStr);
      setCheckInTime('09:00');
      setCheckOutDate(todayStr);
      setCheckOutTime('13:00');
    } else {
      setCheckInDate(todayStr);
      setCheckInTime('14:00');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckOutDate(tomorrow.toISOString().split('T')[0]);
      setCheckOutTime('12:00');
    }
  };

  // Chuỗi ISO của thời gian bắt đầu và kết thúc
  const currentStartStr = useMemo(() => {
    if (!checkInDate || !checkInTime) return null;
    return `${checkInDate}T${checkInTime}:00`;
  }, [checkInDate, checkInTime]);

  const currentEndStr = useMemo(() => {
    if (!checkOutDate || !checkOutTime) return null;
    return `${checkOutDate}T${checkOutTime}:00`;
  }, [checkOutDate, checkOutTime]);

  /**
   * LỌC PHÒNG KHẢ DỤNG - TRÁNH XUNG ĐỘT PHÒNG
   * Ví dụ: P101 đã có lịch đặt từ 14:00 23/09/2026 đến 02:00 24/09/2026
   * Nếu người dùng chọn thời gian giao thoa với khoảng này, P101 sẽ KHÔNG xuất hiện
   */
  const { availableRooms, conflictedRooms } = useMemo(() => {
    if (!currentStartStr || !currentEndStr) {
      return {
        availableRooms: danhSachPhong.filter(p => p.TrangThaiPhong === 0),
        conflictedRooms: []
      };
    }

    const available = [];
    const conflicted = [];

    danhSachPhong.forEach((phong) => {
      // Chỉ kiểm tra các phòng không đang sửa chữa
      if (phong.TrangThaiPhong === 0) {
        const isFree = checkRoomAvailability(phong.IdPH, currentStartStr, currentEndStr, phieuThueList);
        if (isFree) {
          available.push(phong);
        } else {
          conflicted.push(phong);
        }
      }
    });

    return { availableRooms: available, conflictedRooms: conflicted };
  }, [danhSachPhong, currentStartStr, currentEndStr, phieuThueList]);

  // Nếu người dùng đã chọn một phòng mà sau đó đổi giờ dẫn tới bị xung đột, tự động bỏ chọn phòng đó
  useEffect(() => {
    if (selectedRooms.length > 0 && conflictedRooms.length > 0) {
      const conflictedIds = new Set(conflictedRooms.map(r => r.IdPH));
      setSelectedRooms(prev => prev.filter(r => !conflictedIds.has(r.IdPH)));
    }
  }, [conflictedRooms]);

  const handleToggleRoom = (phong) => {
    setSelectedRooms(prev => {
      const exists = prev.some(r => r.IdPH === phong.IdPH);
      if (exists) {
        return prev.filter(r => r.IdPH !== phong.IdPH);
      } else {
        return [...prev, phong];
      }
    });
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

  const isDateTimeValid = () => {
    if (!checkInDate || !checkOutDate || !checkInTime || !checkOutTime) return false;
    const start = new Date(`${checkInDate}T${checkInTime}`);
    const end = new Date(`${checkOutDate}T${checkOutTime}`);
    return end > start;
  };

  const canSubmit = () => {
    return (
      selectedKhachHang &&
      selectedRooms.length > 0 &&
      soNguoi > 0 &&
      isDateTimeValid() &&
      duration > 0
    );
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    // Tạo chi tiết đặt phòng (CTDP) cho từng phòng đã chọn
    const chiTiet = selectedRooms.map((phong) => {
      const loaiPhong = phong.loaiPhong;
      const donGia = hinhThucThue === 'GIO'
        ? (loaiPhong?.GiaGio || Math.round((loaiPhong?.GiaNgay || 0) / 10))
        : (loaiPhong?.GiaNgay || 0);
      const thanhTien = donGia * duration;

      return {
        phong,
        SoNguoi: soNguoi,
        NgayCheckIn: `${checkInDate}T${checkInTime}:00`,
        NgayCheckOut: `${checkOutDate}T${checkOutTime}:00`,
        HinhThucThue: hinhThucThue,
        SoLuongThoiGian: duration,
        DonGia: donGia,
        ThanhTien: thanhTien
      };
    });

    onSubmit({
      khachHang: selectedKhachHang,
      chiTiet
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-lg bg-surface-container-low shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-space-lg border-b border-surface-container-high bg-surface-container-low z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Tạo phiếu thuê mới
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              Lập phiếu thuê phòng (PhieuThue & CTDP) - Tự động tránh trùng lịch đặt phòng
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
        <div className="p-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
            {/* Cột trái — Form */}
            <div className="lg:col-span-2 space-y-space-lg">

              {/* Lựa chọn hình thức thuê */}
              <div className="p-space-md rounded-lg bg-surface-container-high flex items-center gap-space-md">
                <span className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
                  Hình thức đặt:
                </span>
                <div className="flex gap-space-sm">
                  <button
                    type="button"
                    onClick={() => handleSwitchHinhThuc('NGAY')}
                    className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                      hinhThucThue === 'NGAY'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Thuê theo ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchHinhThuc('GIO')}
                    className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                      hinhThucThue === 'GIO'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    Thuê theo giờ
                  </button>
                </div>
              </div>

              {/* Bước 1: Chọn khách hàng (KhachHang) */}
              <CustomerSelector
                selectedKhachHang={selectedKhachHang}
                onSelectKhachHang={setSelectedKhachHang}
                danhSachKhachHang={danhSachKhachHang}
              />

              {/* Bước 2: Thời gian lưu trú (có ngày và giờ) */}
              <div className="p-space-lg rounded-lg bg-surface-container-high">
                <div className="flex items-center justify-between mb-space-md">
                  <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                    Thời gian lưu trú ({hinhThucThue === 'GIO' ? 'Theo giờ' : 'Theo ngày'})
                  </h3>
                  {duration > 0 && isDateTimeValid() && (
                    <span className="font-body-sm text-body-sm text-primary font-bold">
                      ⏱ {duration} {hinhThucThue === 'GIO' ? 'giờ' : 'ngày (đêm)'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {/* Check-in: Ngày & Giờ */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Ngày nhận phòng <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Giờ nhận phòng <span className="text-error">*</span>
                    </label>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Check-out: Ngày & Giờ */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Ngày trả phòng <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate}
                      className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Giờ trả phòng <span className="text-error">*</span>
                    </label>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Số người (SoNguoi trong CTDP) */}
                  <div className="sm:col-span-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Số khách mỗi phòng (SoNguoi) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={soNguoi}
                      onChange={(e) => setSoNguoi(parseInt(e.target.value) || 1)}
                      className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Cảnh báo ngày giờ không hợp lệ */}
                {!isDateTimeValid() && (
                  <div className="mt-space-md p-space-md rounded-lg bg-error/10 border border-error/20 flex items-center gap-space-xs text-error">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span className="font-body-sm text-body-sm">
                      Thời gian trả phòng phải sau thời gian nhận phòng!
                    </span>
                  </div>
                )}
              </div>

              {/* Thông báo tránh xung đột phòng nếu có phòng bị trùng lịch */}
              {conflictedRooms.length > 0 && (
                <div className="p-space-md rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">
                    event_busy
                  </span>
                  <div>
                    <p className="font-label-md text-label-md text-amber-600 dark:text-amber-400 font-bold">
                      Tránh xung đột lịch đặt ({conflictedRooms.length} phòng đã ẩn)
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                      Phòng <span className="font-semibold text-on-surface">{conflictedRooms.map(r => r.MaPH).join(', ')}</span> đã có khách đặt trong khoảng thời gian này nên tự động ẩn khỏi danh sách.
                    </p>
                  </div>
                </div>
              )}

              {/* Bước 3: Chọn phòng (Chỉ hiển thị phòng trống không bị xung đột) */}
              <RoomSelector
                danhSachPhong={availableRooms}
                selectedRooms={selectedRooms}
                onToggleRoom={handleToggleRoom}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                hinhThucThue={hinhThucThue}
              />
            </div>

            {/* Cột phải — Tổng quan */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingSummary
                  khachHang={selectedKhachHang}
                  checkInDate={checkInDate}
                  checkInTime={checkInTime}
                  checkOutDate={checkOutDate}
                  checkOutTime={checkOutTime}
                  selectedRooms={selectedRooms}
                  soNguoi={soNguoi}
                  hinhThucThue={hinhThucThue}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-space-sm p-space-lg border-t border-surface-container-high bg-surface-container-low">
          <button
            type="button"
            onClick={onClose}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={`px-space-lg py-space-md rounded-lg font-label-lg text-label-lg font-semibold transition-colors ${
              canSubmit()
                ? 'bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary shadow-sm'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
          >
            Lập phiếu thuê
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateBookingDialog;
