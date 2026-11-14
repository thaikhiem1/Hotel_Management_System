
/**
 * BookingFilters - Bộ lọc danh sách phiếu thuê
 *
 * Dựa theo Database.md, CTDP.TrangThaiDatPhong:
 *   0 = Đã đặt
 *   1 = Đang thuê
 *   2 = Đang dọn dẹp
 *
 * Status UI tổng hợp:
 *   'DA_DAT'       → PhieuThue có tất cả CTDP đã đặt
 *   'DANG_THUE'    → PhieuThue có ít nhất 1 CTDP đang thuê
 *   'DANG_DON_DEP' → PhieuThue có phòng đang dọn dẹp
 */
const BookingFilters = ({ filters, onFilterChange }) => {
  const statuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'DA_DAT', label: 'Đã đặt' },
    { value: 'DANG_THUE', label: 'Đang thuê' },
    { value: 'DANG_DON_DEP', label: 'Đang dọn dẹp' },
    { value: 'DA_HUY', label: 'Đã hủy' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-space-md">
      {/* Tìm kiếm */}
      <div className="flex-1">
        <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
          <span className="material-symbols-outlined text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm mã phiếu thuê, tên khách hàng, SĐT, mã phòng..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="bg-transparent flex-1 text-on-surface placeholder:text-outline focus:outline-none font-body-md text-body-md"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Lọc trạng thái */}
      <div className="w-full sm:w-56">
        <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
          <span className="material-symbols-outlined text-outline text-[20px]">
            filter_list
          </span>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="bg-transparent flex-1 text-on-surface focus:outline-none font-body-md text-body-md cursor-pointer"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined text-outline text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Lọc theo ngày nhận phòng */}
      <div className="w-full sm:w-56">
        <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
          <span className="material-symbols-outlined text-outline text-[20px]">
            calendar_today
          </span>
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
            className="bg-transparent flex-1 text-on-surface focus:outline-none font-body-md text-body-md"
            title="Lọc theo ngày (trong khoảng CheckIn–CheckOut)"
          />
          {filters.date && (
            <button
              onClick={() => onFilterChange({ ...filters, date: '' })}
              className="text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
