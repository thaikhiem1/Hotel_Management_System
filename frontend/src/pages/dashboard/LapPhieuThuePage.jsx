import { useEffect, useState } from 'react';
import {
  BookingFilters,
  BookingTable,
  BookingDetailDialog,
  CreateBookingDialog
} from '@/components/bookings';
import { rentalReceiptAPI } from '@/services/api';
import { formatCurrency, formatReceiptCode } from '@/utils/format';
import { handleApiError, showSuccess, showWarning } from '@/utils/notification';
import { toPhieuThue } from '@/utils/rentalMappers';
import { usePermission } from '@/utils/usePermission';

// ========== Helpers: chuyển đổi data DB → data UI ==========

/**
 * Tính tổng ThanhTien của tất cả CTDP trong phiếu thuê
 */
const tinhTongTien = (chiTiet = []) => chiTiet.reduce((sum, ct) => sum + (ct.ThanhTien || 0), 0);

/**
 * Lấy trạng thái hiển thị của phiếu thuê dựa trên CTDP
 * Dựa theo Database.md:
 *   TrangThaiDatPhong: 0: Đã đặt, 1: Đang thuê, 2: Đang dọn dẹp
 */
const layTrangThaiPhieuThue = (chiTiet = []) => {
  if (!chiTiet || chiTiet.length === 0) return 'DA_DAT';
  if (chiTiet.some(ct => ct.TrangThaiDatPhong === 1)) return 'DANG_THUE';
  if (chiTiet.some(ct => ct.TrangThaiDatPhong === 2)) return 'DANG_DON_DEP';
  return 'DA_DAT';
};

// Số phiếu thuê tải về mỗi lần (mới nhất trước)
const PAGE_SIZE = 50;

// ===================== PAGE COMPONENT =====================

const LapPhieuThuePage = () => {
  const { check: checkWrite } = usePermission('stays');
  const [phieuThueList, setPhieuThueList] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhieuThue, setSelectedPhieuThue] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Tải danh sách phiếu thuê từ máy chủ khi mở trang
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await rentalReceiptAPI.getAll({ page: 0, size: PAGE_SIZE });
        if (!cancelled) setPhieuThueList(response.data.content.map(toPhieuThue));
      } catch (error) {
        if (!cancelled) handleApiError(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lọc danh sách phiếu thuê
  const filteredPhieuThue = phieuThueList.filter((pt) => {
    const chiTiet = pt.chiTiet || [];

    // Tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        (pt.receiptCode || formatReceiptCode(pt.IdPT)).toLowerCase().includes(searchLower) ||
        pt.khachHang?.TenKH?.toLowerCase().includes(searchLower) ||
        pt.khachHang?.SDT?.includes(searchLower) ||
        chiTiet.some(ct => ct.phong?.MaPH?.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Lọc trạng thái
    if (filters.status !== 'all') {
      const trangThai = layTrangThaiPhieuThue(chiTiet);
      if (trangThai !== filters.status) return false;
    }

    // Lọc ngày
    if (filters.date) {
      const filterDateStr = filters.date;
      const hasMatchingDate = chiTiet.some(ct => {
        const checkInStr = (ct.NgayCheckIn || '').split('T')[0];
        const checkOutStr = (ct.NgayCheckOut || '').split('T')[0];
        return filterDateStr >= checkInStr && filterDateStr <= checkOutStr;
      });
      if (!hasMatchingDate) return false;
    }

    return true;
  });

  const handleViewDetail = (phieuThue) => {
    setSelectedPhieuThue(phieuThue);
    setShowDetailDialog(true);
  };

  // Hủy phiếu / bỏ phòng khỏi phiếu: chưa có API phía máy chủ (UC-REN-002, UC-REN-003)
  const notSupportedYet = () => {
    showWarning(
      'Chưa hỗ trợ',
      'Hủy phiếu thuê và bỏ phòng khỏi phiếu sẽ được bổ sung cùng API tương ứng.'
    );
  };

  // Phiếu thuê vừa được máy chủ lưu thành công (UC-REN-001)
  const handleCreated = (receipt) => {
    setPhieuThueList(prev => [toPhieuThue(receipt), ...prev.filter(pt => pt.IdPT !== receipt.rentalReceiptId)]);
    setShowCreateDialog(false);
    showSuccess(
      'Tạo phiếu thuê thành công',
      `Mã phiếu ${receipt.receiptCode} - chi phí dự kiến ${formatCurrency(receipt.estimatedTotalAmount)}`
    );
  };

  return (
    <div className="w-full space-y-space-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-space-xs font-bold">
            Lập Phiếu Thuê
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Quản lý phiếu thuê phòng, đặt phòng theo ngày/giờ và kiểm tra tránh xung đột phòng
          </p>
        </div>
        <button
          type="button"
          onClick={() => checkWrite() && setShowCreateDialog(true)}
          className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-lg text-label-lg font-semibold transition-colors shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            add
          </span>
          <span>Tạo phiếu thuê</span>
        </button>
      </div>

      {/* Filters */}
      <BookingFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Table */}
      <div>
        <div className="mb-space-md flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Danh sách phiếu thuê
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              Tìm thấy {filteredPhieuThue.length} phiếu thuê
            </p>
          </div>
        </div>

        <BookingTable
          phieuThueList={filteredPhieuThue}
          onViewDetail={handleViewDetail}
          onCancel={notSupportedYet}
          isLoading={isLoading}
          tinhTongTien={tinhTongTien}
          layTrangThaiPhieuThue={layTrangThaiPhieuThue}
        />
      </div>

      {/* Detail Dialog */}
      <BookingDetailDialog
        phieuThue={selectedPhieuThue}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedPhieuThue(null);
        }}
        onCancel={notSupportedYet}
        onRemoveRoom={notSupportedYet}
        tinhTongTien={tinhTongTien}
        layTrangThaiPhieuThue={layTrangThaiPhieuThue}
      />

      {/* Create Dialog - khách hàng, phòng khả dụng và chi phí lấy từ API */}
      <CreateBookingDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default LapPhieuThuePage;
