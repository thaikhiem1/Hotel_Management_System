import { useEffect, useMemo, useRef, useState } from 'react';
import CustomerSelector from './CustomerSelector';
import RoomSelector from './RoomSelector';
import BookingSummary from './BookingSummary';
import { rentalReceiptAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/notification';
import { toPhong } from '@/utils/rentalMappers';

/**
 * CreateBookingDialog - Hộp thoại tạo phiếu thuê (UC-REN-001)
 *
 * Kết nối API thật:
 *   - UC-REN-008: tra cứu / tạo khách hàng (CustomerSelector)
 *   - UC-REN-009: GET  /api/rental-receipts/available-rooms (phòng khả dụng theo khoảng thời gian)
 *   - UC-REN-010: POST /api/rental-receipts/estimate        (chi phí do máy chủ tính)
 *   - UC-REN-001: POST /api/rental-receipts                 (lưu phiếu + chi tiết trong 1 transaction)
 *
 * Đơn giá, thành tiền và nhân viên lập phiếu không do giao diện quyết định; giao diện chỉ gửi
 * tổng tiền người dùng đã xem để máy chủ phát hiện giá thay đổi (UC-REN-010 E6).
 *
 * Props:
 *   isOpen, onClose
 *   onCreated(receipt): gọi sau khi tạo phiếu thành công (receipt là RentalReceiptResponse)
 *   initial: { checkInDate, checkInTime, checkOutDate, checkOutTime, roomCode } - giá trị ban đầu,
 *            dùng khi mở từ nút "Đặt phòng" trên sơ đồ phòng
 */

const localDateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const defaultTimes = (type) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  return type === 'GIO'
    ? { checkInDate: localDateStr(today), checkInTime: '09:00', checkOutDate: localDateStr(today), checkOutTime: '13:00' }
    : { checkInDate: localDateStr(today), checkInTime: '14:00', checkOutDate: localDateStr(tomorrow), checkOutTime: '12:00' };
};

const CreateBookingForm = ({ onClose, onCreated, initial }) => {
  const { user } = useAuth();
  const startDefaults = { ...defaultTimes('NGAY'), ...initial };

  // Hình thức thuê: 'NGAY' | 'GIO'
  const [hinhThucThue, setHinhThucThue] = useState('NGAY');
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);
  const [checkInDate, setCheckInDate] = useState(startDefaults.checkInDate);
  const [checkInTime, setCheckInTime] = useState(startDefaults.checkInTime);
  const [checkOutDate, setCheckOutDate] = useState(startDefaults.checkOutDate);
  const [checkOutTime, setCheckOutTime] = useState(startDefaults.checkOutTime);
  const [soNguoi, setSoNguoi] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Phòng khả dụng (UC-REN-009)
  const [availability, setAvailability] = useState({ rooms: [], loading: false, error: null, message: null });
  const [refreshToken, setRefreshToken] = useState(0);
  // Phòng chọn sẵn từ sơ đồ phòng, chỉ áp dụng một lần khi danh sách khả dụng tải xong
  const preselectRoomCode = useRef(initial?.roomCode ?? null);

  // Chi phí dự kiến (UC-REN-010)
  const [estimate, setEstimate] = useState({ data: null, loading: false, error: null });
  const [priceChanged, setPriceChanged] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const startStr = checkInDate && checkInTime ? `${checkInDate}T${checkInTime}:00` : null;
  const endStr = checkOutDate && checkOutTime ? `${checkOutDate}T${checkOutTime}:00` : null;
  const timeValid = Boolean(startStr && endStr && new Date(endStr) > new Date(startStr));

  const handleSwitchHinhThuc = (type) => {
    const times = defaultTimes(type);
    setHinhThucThue(type);
    setCheckInDate(times.checkInDate);
    setCheckInTime(times.checkInTime);
    setCheckOutDate(times.checkOutDate);
    setCheckOutTime(times.checkOutTime);
  };

  // UC-REN-009: tra cứu phòng khả dụng mỗi khi khoảng thời gian thay đổi
  useEffect(() => {
    if (!timeValid) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setAvailability((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await rentalReceiptAPI.getAvailableRooms({ checkIn: startStr, checkOut: endStr });
        if (cancelled) return;
        const rooms = response.data.map(toPhong);
        setAvailability({ rooms, loading: false, error: null, message: response.message });

        // Bỏ chọn phòng không còn khả dụng; áp dụng phòng chọn sẵn từ sơ đồ phòng
        const preselect = preselectRoomCode.current;
        preselectRoomCode.current = null;
        const ids = new Set(rooms.map((r) => r.IdPH));
        setSelectedRooms((prev) => {
          const kept = prev.filter((r) => ids.has(r.IdPH));
          const match = preselect && rooms.find((r) => r.MaPH === preselect);
          return match && !kept.some((r) => r.IdPH === match.IdPH) ? [...kept, match] : kept;
        });
      } catch (error) {
        if (cancelled) return;
        // Không hiển thị kết quả chưa được xác minh là khả dụng
        setAvailability({
          rooms: [],
          loading: false,
          error: getErrorMessage(error, 'Không thể tra cứu phòng khả dụng. Vui lòng thử lại.'),
          message: null
        });
        setSelectedRooms([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [startStr, endStr, timeValid, refreshToken]);

  // Chi tiết gửi lên máy chủ; không có đơn giá hay thành tiền
  const detailsPayload = useMemo(
    () =>
      selectedRooms.map((phong) => ({
        roomId: phong.IdPH,
        numberOfGuests: soNguoi,
        checkIn: startStr,
        checkOut: endStr,
        pricingMethod: hinhThucThue
      })),
    [selectedRooms, soNguoi, startStr, endStr, hinhThucThue]
  );
  const canEstimate = timeValid && selectedRooms.length > 0 && soNguoi > 0;

  // UC-REN-010: tính lại chi phí khi phòng, thời gian, số khách hoặc phương thức tính giá thay đổi
  useEffect(() => {
    if (!canEstimate) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setEstimate((prev) => ({ ...prev, loading: true }));
      try {
        const response = await rentalReceiptAPI.estimate(detailsPayload);
        if (cancelled) return;
        setEstimate({ data: response.data, loading: false, error: null });
        setPriceChanged(false);
      } catch (error) {
        if (cancelled) return;
        setEstimate({
          data: null,
          loading: false,
          error: getErrorMessage(error, 'Không thể tính chi phí phiếu thuê. Vui lòng thử lại.')
        });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canEstimate, detailsPayload]);

  const availableRooms = timeValid ? availability.rooms : [];
  const estimateData = canEstimate ? estimate.data : null;
  const estimateError = canEstimate ? estimate.error : null;
  const estimateLoading = canEstimate && estimate.loading;
  const maxGuests = selectedRooms.length > 0
    ? Math.min(...selectedRooms.map((r) => r.loaiPhong?.SoNguoiToiDa ?? Infinity))
    : null;
  const guestsExceeded = maxGuests !== null && soNguoi > maxGuests;

  const handleToggleRoom = (phong) => {
    setSubmitError(null);
    setSelectedRooms((prev) =>
      prev.some((r) => r.IdPH === phong.IdPH)
        ? prev.filter((r) => r.IdPH !== phong.IdPH)
        : [...prev, phong]
    );
  };

  const canSubmit =
    Boolean(selectedKhachHang) &&
    selectedRooms.length > 0 &&
    timeValid &&
    !guestsExceeded &&
    Boolean(estimateData) &&
    !estimateLoading &&
    !availability.loading &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await rentalReceiptAPI.create({
        customerId: selectedKhachHang.IdKH,
        details: detailsPayload,
        expectedTotalAmount: estimateData.totalAmount
      });
      onCreated?.(response.data);
    } catch (error) {
      const body = error.response?.data;
      if (error.response?.status === 409 && body?.data?.totalAmount !== undefined) {
        // UC-REN-010 E6: giá đã đổi -> hiển thị chi phí mới, người dùng xác nhận lại
        setEstimate({ data: body.data, loading: false, error: null });
        setPriceChanged(true);
      } else if (error.response?.status === 409 && body?.data?.unavailableRoomIds) {
        // UC-REN-001 A9 / UC-REN-009 E5: phòng vừa bị đặt -> tra cứu lại
        setSubmitError(body.message);
        setRefreshToken((token) => token + 1);
      } else if (error.response?.status === 409) {
        setSubmitError(getErrorMessage(error));
        setRefreshToken((token) => token + 1);
      } else {
        setSubmitError(getErrorMessage(error, 'Không thể tạo phiếu thuê. Vui lòng thử lại.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={submitting ? undefined : onClose} />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1rem)] max-w-6xl max-h-[92vh] overflow-y-auto rounded-lg bg-surface-container-low shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-space-lg border-b border-surface-container-high bg-surface-container-low z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Tạo phiếu thuê mới
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              Chọn khách hàng, khoảng thời gian và phòng khả dụng; chi phí do hệ thống tính
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-space-sm rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
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

              {/* Bước 1: Khách hàng đại diện (UC-REN-008) */}
              <CustomerSelector
                selectedKhachHang={selectedKhachHang}
                onSelectKhachHang={setSelectedKhachHang}
              />

              {/* Bước 2: Thời gian lưu trú */}
              <div className="p-space-lg rounded-lg bg-surface-container-high">
                <div className="flex items-center justify-between mb-space-md">
                  <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                    Thời gian lưu trú ({hinhThucThue === 'GIO' ? 'Theo giờ' : 'Theo ngày'})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
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

                  {/* Số khách mỗi phòng */}
                  <div className="sm:col-span-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                      Số khách mỗi phòng <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={soNguoi}
                      onChange={(e) => setSoNguoi(parseInt(e.target.value) || 1)}
                      className={`w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 ${
                        guestsExceeded ? 'ring-2 ring-error focus:ring-error' : 'focus:ring-primary'
                      }`}
                    />
                    {guestsExceeded && (
                      <p className="mt-space-xs font-body-sm text-body-sm text-error">
                        Các phòng đã chọn chỉ cho phép tối đa {maxGuests} khách mỗi phòng.
                      </p>
                    )}
                  </div>
                </div>

                {/* Cảnh báo ngày giờ không hợp lệ */}
                {!timeValid && (
                  <div className="mt-space-md p-space-md rounded-lg bg-error/10 border border-error/20 flex items-center gap-space-xs text-error">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span className="font-body-sm text-body-sm">
                      {checkInDate && checkOutDate
                        ? 'Thời gian nhận phòng phải trước thời gian trả phòng.'
                        : 'Vui lòng nhập thời gian nhận phòng và trả phòng dự kiến.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Lỗi tra cứu phòng khả dụng */}
              {timeValid && availability.error && (
                <div className="p-space-md rounded-lg bg-error/10 border border-error/20 flex items-center gap-space-sm text-error">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span className="font-body-sm text-body-sm flex-1">{availability.error}</span>
                  <button
                    type="button"
                    onClick={() => setRefreshToken((token) => token + 1)}
                    className="px-space-md py-space-xs rounded-lg bg-error-container text-on-error-container font-label-md text-label-md font-semibold"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Bước 3: Phòng khả dụng (UC-REN-009) */}
              <RoomSelector
                danhSachPhong={availableRooms}
                selectedRooms={selectedRooms}
                onToggleRoom={handleToggleRoom}
                checkInDate={timeValid ? checkInDate : ''}
                checkOutDate={timeValid ? checkOutDate : ''}
                hinhThucThue={hinhThucThue}
                isLoading={timeValid && availability.loading}
                emptyMessage={
                  !timeValid
                    ? 'Nhập khoảng thời gian hợp lệ để tra cứu phòng khả dụng.'
                    : availability.message || 'Không tìm thấy phòng khả dụng trong khoảng thời gian đã chọn.'
                }
              />
            </div>

            {/* Cột phải — Tổng quan */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-space-md">
                {priceChanged && (
                  <div className="p-space-md rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">
                      price_change
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      Chi phí đã thay đổi so với số bạn vừa xem. Hãy kiểm tra chi phí mới bên dưới
                      rồi nhấn xác nhận để lập phiếu.
                    </p>
                  </div>
                )}

                <BookingSummary
                  khachHang={selectedKhachHang}
                  nhanVien={user?.employee?.fullName}
                  checkInDate={checkInDate}
                  checkInTime={checkInTime}
                  checkOutDate={checkOutDate}
                  checkOutTime={checkOutTime}
                  selectedRooms={selectedRooms}
                  soNguoi={soNguoi}
                  hinhThucThue={hinhThucThue}
                  estimate={estimateData}
                  estimateLoading={estimateLoading}
                  estimateError={estimateError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-space-lg border-t border-surface-container-high bg-surface-container-low">
          {submitError && (
            <div className="mb-space-md p-space-md rounded-lg bg-error/10 border border-error/20 flex items-start gap-space-sm text-error">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-body-sm text-body-sm">{submitError}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-space-lg py-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-space-lg py-space-md rounded-lg font-label-lg text-label-lg font-semibold transition-colors ${
                canSubmit
                  ? 'bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary shadow-sm'
                  : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              {submitting
                ? 'Đang lưu phiếu...'
                : priceChanged
                  ? 'Xác nhận chi phí mới và lập phiếu'
                  : 'Lập phiếu thuê'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const CreateBookingDialog = ({ isOpen, onClose, onCreated, initial }) => {
  if (!isOpen) return null;
  // Mount khi mở: mỗi lần mở là một form mới, không cần reset thủ công
  return <CreateBookingForm onClose={onClose} onCreated={onCreated} initial={initial} />;
};

export default CreateBookingDialog;
