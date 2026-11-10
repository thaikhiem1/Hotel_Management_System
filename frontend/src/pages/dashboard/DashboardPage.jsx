import { useEffect, useState } from 'react';
import {
  CheckInModal,
  QuickActions,
  StatCard,
  RoomFilterTabs,
  RoomGrid,
  RoomDetailModal,
  AddServiceModal,
  RoomMapFilters
} from '@/components/dashboard';
import { CreateBookingDialog } from '@/components/bookings';
import { Pagination } from '@/components/shared';
import { employeeAPI, roomMapAPI, roomTypeAPI, stayAPI } from '@/services/api';
import { formatDateTime } from '@/utils/format';
import { handleApiError, showSuccess, showWarning } from '@/utils/notification';
import { toCheckInStay, toRoomCard, UI_STATUS_TO_DISPLAY } from '@/utils/rentalMappers';
import { mockHoaDon } from '@/services/mockData';

/**
 * Trang chủ - Sơ đồ phòng trực quan (UC-ROM-005) và lọc danh sách phòng (UC-ROM-006)
 *
 * Dữ liệu lấy từ GET /api/room-map: mỗi phòng một thẻ, phân trang theo cấu hình backend (trang 0,
 * 16 phòng/trang). Khoảng thời gian mặc định là từ bây giờ đến hết ngày hiện tại do máy chủ xác định.
 */

const EMPTY_FILTERS = {
  fromDate: '',
  fromTime: '',
  toDate: '',
  toTime: '',
  // Chỉ gửi mốc thời gian lên máy chủ khi người dùng đã tự chỉnh; còn lại dùng mặc định
  // (từ bây giờ đến hết ngày), tránh ghim "bây giờ" của lần tải đầu tiên
  timeEdited: false,
  keyword: ''
};

const toApiTime = (date, time) => (date ? `${date}T${time || '00:00'}:00` : undefined);

/** "2026-10-30T20:15:00" -> { date: "2026-10-30", time: "20:15" } */
const splitDateTime = (iso) => ({ date: iso.slice(0, 10), time: iso.slice(11, 16) });

/** Số loại điều kiện lọc đang áp dụng, dùng chọn thông báo khi không có kết quả */
const activeFilterKinds = (applied, tab) => {
  const kinds = [];
  if (applied.timeEdited) kinds.push('time');
  if (applied.keyword) kinds.push('booking');
  if (tab !== 'all') kinds.push('displayStatus');
  return kinds;
};

const EMPTY_MESSAGES = {
  time: 'Không tìm thấy phòng phù hợp với khoảng thời gian đã chọn.',
  booking: 'Không tìm thấy phòng phù hợp với thông tin đặt phòng đã nhập.',
  displayStatus: 'Không tìm thấy phòng phù hợp với trạng thái đã chọn.'
};

const DashboardPage = () => {
  // Điều kiện đang nhập (chưa áp dụng) và điều kiện đã áp dụng
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [activeFilter, setActiveFilter] = useState('all'); // tab trạng thái hiển thị
  const [page, setPage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [mapState, setMapState] = useState({ loading: true, error: null, data: null });
  const [extraStats, setExtraStats] = useState({ roomTypes: null, staff: null });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null); // phòng đang đặt (UC-REN-001 từ sơ đồ phòng)
  const [checkInStay, setCheckInStay] = useState(null); // dữ liệu biểu mẫu nhận phòng (UC-REN-004)
  const [isOpeningCheckIn, setIsOpeningCheckIn] = useState(false);

  // Tải sơ đồ phòng mỗi khi điều kiện, tab, trang hoặc lệnh làm mới thay đổi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await roomMapAPI.get({
          page,
          from: applied.timeEdited ? toApiTime(applied.fromDate, applied.fromTime) : undefined,
          to: applied.timeEdited ? toApiTime(applied.toDate, applied.toTime) : undefined,
          displayStatus: UI_STATUS_TO_DISPLAY[activeFilter],
          keyword: applied.keyword
        });
        if (cancelled) return;
        const data = response.data;
        setMapState({ loading: false, error: null, data });

        // Hiển thị khoảng thời gian thực tế đang áp dụng ở các ô còn trống (UC-ROM-006 quy tắc 8)
        const from = splitDateTime(data.windowFrom);
        const to = splitDateTime(data.windowTo);
        setDraft((d) => ({
          ...d,
          fromDate: d.fromDate || from.date,
          fromTime: d.fromTime || from.time,
          toDate: d.toDate || to.date,
          toTime: d.toTime || to.time
        }));
      } catch (error) {
        if (cancelled) return;
        setMapState({
          loading: false,
          error: { status: error.response?.status, message: error.response?.data?.message },
          data: null
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applied, activeFilter, page, reloadToken]);

  // Số loại phòng và nhân sự (các thẻ thống kê); lễ tân không có quyền xem nhân viên nên bỏ qua lỗi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [types, staff] = await Promise.allSettled([
        roomTypeAPI.getAll({ page: 0, size: 1 }),
        employeeAPI.getAll({ page: 0, size: 1 })
      ]);
      if (cancelled) return;
      setExtraStats({
        roomTypes: types.status === 'fulfilled' ? types.value.data.totalElements : null,
        staff: staff.status === 'fulfilled' ? staff.value.totalElements : null
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = mapState.data;
  const rooms = data ? data.rooms.content.map(toRoomCard) : [];
  const counts = data
    ? {
        all: data.statusCounts.ALL,
        available: data.statusCounts.AVAILABLE,
        reserved: data.statusCounts.RESERVED,
        occupied: data.statusCounts.OCCUPIED,
        cleaning: data.statusCounts.CLEANING,
        maintenance: data.statusCounts.MAINTENANCE
      }
    : undefined;
  const windowText = data
    ? `${formatDateTime(data.windowFrom)} → ${formatDateTime(data.windowTo)}`
    : '';
  const filterKinds = activeFilterKinds(applied, activeFilter);
  const hasFilters = filterKinds.length > 0;

  // ---- Thao tác thay đổi điều kiện (đặt trạng thái đang tải rồi đổi tham số tải)
  const startLoading = () => setMapState((s) => ({ ...s, loading: true, error: null }));

  const handleApplyFilters = () => {
    startLoading();
    setApplied(draft);
    setPage(0);
    // nhấn Lọc lại với cùng điều kiện vẫn tải lại, tránh vòng xoay không dừng
    setReloadToken((t) => t + 1);
  };

  // UC-ROM-006 A7: xóa điều kiện và quay về khoảng thời gian mặc định.
  // Luôn tải lại để hiển thị lại khoảng thời gian mặc định kể cả khi chưa có điều kiện nào đang áp dụng
  // (khi đó trạng thái không đổi nên nếu không tải lại, các ô thời gian sẽ bị để trống).
  const handleClearFilters = () => {
    startLoading();
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setActiveFilter('all');
    setPage(0);
    setReloadToken((t) => t + 1);
  };

  const handleTabChange = (tab) => {
    // đang ở tab này rồi thì không cần tải lại (nếu không, trạng thái không đổi và vòng xoay không dừng)
    if (tab === activeFilter && page === 0) return;
    startLoading();
    setActiveFilter(tab);
    setPage(0);
  };

  const handlePageChange = (next) => {
    startLoading();
    setPage(next);
  };

  const handleRefresh = () => {
    startLoading();
    setReloadToken((t) => t + 1);
  };

  // ---- Thống kê
  const stats = (() => {
    const c = counts;
    const usable = c ? c.all - c.maintenance : 0;
    const occupancy = c && usable > 0 ? ((c.occupied / usable) * 100).toFixed(1) : '0.0';
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenue = mockHoaDon
      .filter((hd) => hd.NgHD === todayStr)
      .reduce((sum, hd) => sum + (hd.TriGia || 0), 0);
    return {
      occupancy: `${occupancy}%`,
      roomTypes: extraStats.roomTypes != null ? String(extraStats.roomTypes) : '—',
      revenue: `${(todayRevenue / 1000000).toFixed(1)} tr`,
      staff: extraStats.staff != null ? String(extraStats.staff) : '—'
    };
  })();

  // UC-REN-004 bước 2-4: kiểm tra sơ bộ ở máy chủ rồi mới mở biểu mẫu Check-in
  const openCheckIn = async (room) => {
    if (isOpeningCheckIn) return;
    setIsOpeningCheckIn(true);
    try {
      const response = await stayAPI.getCheckInContext(room.bookingDetailId);
      setCheckInStay(toCheckInStay(response.data));
    } catch (error) {
      handleApiError(error);
      handleRefresh(); // dữ liệu trên sơ đồ có thể đã cũ
    } finally {
      setIsOpeningCheckIn(false);
    }
  };

  const handleCheckInSuccess = (result) => {
    setCheckInStay(null);
    showSuccess('Nhận phòng thành công', `Phòng ${result.roomCode} - phiếu ${result.receiptCode}`);
    handleRefresh();
  };

  // ---- Thao tác trên thẻ phòng
  const handleRoomAction = (actionId, room) => {
    switch (actionId) {
      case 'view':
        setSelectedRoom(room);
        setIsDetailModalOpen(true);
        break;

      case 'book':
        // UC-ROM-005 A3: mở lập phiếu thuê với phòng và khoảng thời gian đang xem
        setBookingRoom(room);
        break;

      case 'service':
        setSelectedRoom(room);
        setIsAddServiceModalOpen(true);
        break;

      case 'checkin':
        openCheckIn(room);
        break;

      case 'checkout':
      case 'cancel':
      case 'ready':
      case 'complete':
        // Các thao tác này cần API phía máy chủ (UC-REN-007, UC-ROM-005 A1/A2) chưa có
        showWarning('Chưa hỗ trợ', 'Thao tác này sẽ được nối với máy chủ ở bước tiếp theo.');
        break;

      default:
        break;
    }
  };

  const handleAddService = (room, services) => {
    // TODO: API thêm dịch vụ cho phòng (UC-SVC-005)
    const totalAmount = services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    alert(`Đã thêm ${services.length} dịch vụ cho phòng ${room.name}\nTổng: ${totalAmount.toLocaleString('vi-VN')}đ`);
  };

  const handleBookingCreated = (receipt) => {
    setBookingRoom(null);
    showSuccess(
      'Tạo phiếu thuê thành công',
      `Mã phiếu ${receipt.receiptCode} - ${receipt.details.length} phòng`
    );
    handleRefresh();
  };

  // ---- Thông báo
  const emptyMessage = !hasFilters
    ? 'Hiện chưa có phòng nào để hiển thị.'
    : filterKinds.length > 1
      ? 'Không tìm thấy phòng phù hợp với các điều kiện đã chọn.'
      : EMPTY_MESSAGES[filterKinds[0]];

  const error = mapState.error;
  const errorMessage = error
    ? (error.status >= 400 && error.status < 500 && error.message)
      || (hasFilters
        ? 'Không thể lọc danh sách phòng. Vui lòng thử lại.'
        : 'Không thể tải sơ đồ phòng. Vui lòng thử lại.')
    : null;

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ml-6 text-lg font-body-lg text-body-lg text-on-surface-variant font-medium">
            Tổng quan hoạt động và tình trạng phòng khách sạn
          </p>
        </div>
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-low">
          <span className="material-symbols-outlined text-primary text-[20px]">
            schedule
          </span>
          <span className="font-label-lg text-label-lg text-on-surface">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Bộ lọc thời gian, bộ lọc trạng thái và thao tác nhanh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-2">
          <RoomMapFilters
            value={draft}
            onChange={(patch) => setDraft((d) => ({
              ...d,
              ...patch,
              // chỉ việc chỉnh các ô thời gian mới ghim khoảng thời gian gửi lên máy chủ
              timeEdited: d.timeEdited || !('keyword' in patch)
            }))}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            disabled={mapState.loading}
            windowText={windowText}
          />
        </div>
        <div>
          <QuickActions
            onRefresh={handleRefresh}
            onFilterAvailableNow={() => handleTabChange('available')}
          />
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <StatCard
          icon="pie_chart"
          label="Công suất phòng"
          value={stats.occupancy}
          subValue="Phòng đang có khách / phòng sử dụng được"
          colorClass="text-primary"
        />
        <StatCard
          icon="king_bed"
          label="Loại phòng"
          value={stats.roomTypes}
          subValue="Loại phòng chuẩn"
          colorClass="text-secondary"
        />
        <StatCard
          icon="payments"
          label="Doanh thu"
          value={stats.revenue}
          subValue="VNĐ hôm nay (dữ liệu mẫu)"
          colorClass="text-tertiary"
        />
        <StatCard
          icon="group"
          label="Nhân sự"
          value={stats.staff}
          subValue="Nhân viên trong hệ thống"
          colorClass="text-on-surface"
        />
      </div>

      {/* Tab trạng thái hiển thị */}
      <div>
        <RoomFilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleTabChange}
          counts={counts}
        />
      </div>

      {/* Sơ đồ phòng */}
      <div className="space-y-space-md">
        {data && !error && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Hiển thị {rooms.length} / {data.rooms.totalElements} phòng trong khoảng thời gian:{' '}
            <span className="text-primary font-semibold">{windowText}</span>
          </p>
        )}

        {error ? (
          <div className="flex flex-col items-center gap-space-md p-space-xl rounded-lg bg-error/10 border border-error/20 text-center">
            <span className="material-symbols-outlined text-[48px] text-error">error</span>
            <p className="font-body-lg text-body-lg text-error">{errorMessage}</p>
            <button
              onClick={handleRefresh}
              className="px-space-lg py-space-md rounded-lg bg-error-container hover:bg-error text-on-error-container hover:text-on-error font-label-lg text-label-lg font-semibold transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <RoomGrid
            rooms={rooms}
            onRoomAction={handleRoomAction}
            isLoading={mapState.loading}
            emptyMessage={emptyMessage}
          />
        )}

        {data && !error && (
          <Pagination
            page={data.rooms.number}
            totalPages={data.rooms.totalPages}
            totalElements={data.rooms.totalElements}
            pageSize={data.rooms.size}
            onPageChange={handlePageChange}
            disabled={mapState.loading}
          />
        )}
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRoom(null);
        }}
        onOpenAddService={(room) => {
          setSelectedRoom(room);
          setIsAddServiceModalOpen(true);
        }}
      />

      {/* Add Service Modal (dữ liệu mẫu, chưa nối API dịch vụ) */}
      <AddServiceModal
        room={selectedRoom}
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
        }}
        onSubmit={handleAddService}
      />

      {/* Nhận phòng - UC-REN-004 */}
      <CheckInModal
        isOpen={Boolean(checkInStay)}
        stay={checkInStay}
        onClose={() => setCheckInStay(null)}
        onSuccess={handleCheckInSuccess}
        onRefresh={handleRefresh}
      />

      {/* Đặt phòng - UC-REN-001: phòng chọn sẵn + khoảng thời gian đang xem */}
      <CreateBookingDialog
        isOpen={Boolean(bookingRoom)}
        onClose={() => setBookingRoom(null)}
        onCreated={handleBookingCreated}
        initial={bookingRoom && data && {
          roomCode: bookingRoom.name,
          checkInDate: splitDateTime(data.windowFrom).date,
          checkInTime: splitDateTime(data.windowFrom).time,
          checkOutDate: splitDateTime(data.windowTo).date,
          checkOutTime: splitDateTime(data.windowTo).time
        }}
      />
    </div>
  );
};

export default DashboardPage;
