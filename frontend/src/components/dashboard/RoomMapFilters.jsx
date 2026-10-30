/**
 * RoomMapFilters - Bộ lọc sơ đồ phòng tại trang chủ (UC-ROM-005, UC-ROM-006)
 * Gồm khoảng thời gian cần xem và thông tin đặt phòng (mã phiếu thuê hoặc khách hàng).
 * Trạng thái phòng được lọc bằng các tab ngay bên dưới. Điều kiện chỉ áp dụng khi nhấn "Lọc".
 * Để trống thời gian thì hệ thống dùng mặc định: từ bây giờ đến hết ngày hôm nay.
 *
 * Props:
 * - value: { fromDate, fromTime, toDate, toTime, keyword } (chuỗi yyyy-MM-dd, HH:mm, có thể rỗng)
 * - onChange(patch): gọi với phần giá trị thay đổi
 * - onApply(): xác nhận thực hiện lọc
 * - onClear(): xóa điều kiện lọc, quay về khoảng thời gian mặc định
 * - disabled: đang tải
 * - windowText: khoảng thời gian thực tế đang áp dụng
 */
const RoomMapFilters = ({ value, onChange, onApply, onClear, disabled = false, windowText }) => {
  const field = 'flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg';
  const control = 'bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full';
  const label = 'font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
      className="flex flex-col gap-space-md p-space-lg rounded-lg bg-surface-container-low border border-surface-container-high"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">event_available</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Bộ lọc sơ đồ phòng
          </h3>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Mặc định: từ bây giờ đến hết ngày hôm nay
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="space-y-space-xs">
          <label className={label}>Từ thời điểm</label>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className={field}>
              <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
              <input
                type="date"
                value={value.fromDate}
                onChange={(e) => onChange({ fromDate: e.target.value })}
                className={control}
              />
            </div>
            <div className={field}>
              <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
              <input
                type="time"
                value={value.fromTime}
                onChange={(e) => onChange({ fromTime: e.target.value })}
                className={control}
              />
            </div>
          </div>
        </div>

        <div className="space-y-space-xs">
          <label className={label}>Đến thời điểm</label>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className={field}>
              <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
              <input
                type="date"
                value={value.toDate}
                min={value.fromDate}
                onChange={(e) => onChange({ toDate: e.target.value })}
                className={control}
              />
            </div>
            <div className={field}>
              <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
              <input
                type="time"
                value={value.toTime}
                onChange={(e) => onChange({ toTime: e.target.value })}
                className={control}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={field}>
        <span className="material-symbols-outlined text-outline text-[18px]">search</span>
        <input
          type="text"
          value={value.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="Mã phiếu thuê / tên, SĐT, CCCD khách"
          className={`${control} placeholder:text-outline`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Khoảng thời gian đang áp dụng:{' '}
          <span className="text-primary font-semibold">{windowText || 'Đang xác định...'}</span>
        </p>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="px-space-lg py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Xóa điều kiện lọc
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Lọc
          </button>
        </div>
      </div>
    </form>
  );
};

export default RoomMapFilters;
