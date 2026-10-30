import { useState } from 'react';
import {
  BookingFilters,
  BookingTable,
  BookingDetailDialog,
  CreateBookingDialog
} from '@/components/bookings';
import {
  mockKhachHang,
  mockPhong,
  mockPhieuThue as initialMockPhieuThue
} from '@/services/mockData';

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

// ===================== PAGE COMPONENT =====================

const LapPhieuThuePage = () => {
  const [phieuThueList, setPhieuThueList] = useState(initialMockPhieuThue);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date: ''
  });
  const [isLoading] = useState(false);
  const [selectedPhieuThue, setSelectedPhieuThue] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Lọc danh sách phiếu thuê
  const filteredPhieuThue = phieuThueList.filter((pt) => {
    const chiTiet = pt.chiTiet || [];

    // Tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        `PT${String(pt.IdPT).padStart(3, '0')}`.toLowerCase().includes(searchLower) ||
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

  // Hủy toàn bộ phiếu thuê (xóa luôn phiếu thuê)
  const handleCancel = (phieuThue) => {
    const maPT = `PT${String(phieuThue.IdPT).padStart(3, '0')}`;
    if (window.confirm(`Bạn có chắc muốn hủy và xóa phiếu thuê ${maPT}?`)) {
      setPhieuThueList(prev => prev.filter(pt => pt.IdPT !== phieuThue.IdPT));
      if (selectedPhieuThue && selectedPhieuThue.IdPT === phieuThue.IdPT) {
        setShowDetailDialog(false);
        setSelectedPhieuThue(null);
      }
      alert(`Đã hủy phiếu thuê ${maPT}`);
    }
  };

  // Xóa 1 phòng khỏi phiếu thuê (khi phiếu có từ 2 phòng trở lên) và cập nhật lại tiền
  const handleRemoveRoom = (IdPT, IdCTDP) => {
    setPhieuThueList(prev => {
      return prev
        .map(pt => {
          if (pt.IdPT !== IdPT) return pt;
          const updatedChiTiet = pt.chiTiet.filter(ct => ct.IdCTDP !== IdCTDP);
          return {
            ...pt,
            chiTiet: updatedChiTiet
          };
        })
        .filter(pt => pt.chiTiet.length > 0); // Nếu hết phòng thì xóa luôn phiếu
    });

    // Cập nhật lại đối tượng đang mở trong dialog
    setSelectedPhieuThue(prev => {
      if (!prev || prev.IdPT !== IdPT) return prev;
      const updatedChiTiet = prev.chiTiet.filter(ct => ct.IdCTDP !== IdCTDP);
      if (updatedChiTiet.length === 0) {
        setShowDetailDialog(false);
        return null;
      }
      return {
        ...prev,
        chiTiet: updatedChiTiet
      };
    });
  };

  // Tạo phiếu thuê mới
  const handleCreatePhieuThue = (formData) => {
    const newIdPT = Math.max(...phieuThueList.map(pt => pt.IdPT), 0) + 1;
    const today = new Date().toISOString().split('T')[0];

    const newPhieuThue = {
      IdPT: newIdPT,
      NgPT: today,
      IdKH: formData.khachHang.IdKH || (newIdPT + 100),
      IdNV: 1, // Lễ tân hiện tại
      khachHang: formData.khachHang,
      chiTiet: formData.chiTiet.map((ct, index) => ({
        IdCTDP: newIdPT * 100 + index,
        IdPT: newIdPT,
        IdPH: ct.phong.IdPH,
        SoNguoi: ct.SoNguoi,
        NgayCheckIn: ct.NgayCheckIn,
        NgayCheckOut: ct.NgayCheckOut,
        HinhThucThue: ct.HinhThucThue || 'NGAY',
        TrangThaiDatPhong: 0, // 0: Đã đặt
        DonGia: ct.DonGia,
        ThanhTien: ct.ThanhTien,
        phong: ct.phong
      }))
    };

    setPhieuThueList([newPhieuThue, ...phieuThueList]);
    setShowCreateDialog(false);
    alert(`Tạo phiếu thuê thành công!\nMã phiếu: PT${String(newIdPT).padStart(3, '0')}`);
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
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-lg text-label-lg font-semibold transition-colors shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            add
          </span>
          <span>Tạo phiếu thuê</span>
        </button>
      </div>

      {/* Thông tin kịch bản test tránh xung đột phòng */}
      <div className="p-space-md rounded-lg bg-surface-container-high border border-primary/20 flex items-start gap-space-md">
        <span className="material-symbols-outlined text-primary text-[24px]">
          info
        </span>
        <div className="text-body-sm text-body-sm">
          <p className="font-bold text-on-surface">
            💡 Dữ liệu mẫu kiểm tra tránh xung đột phòng (Database.md):
          </p>
          <p className="text-on-surface-variant mt-0.5">
            Phòng <span className="font-bold text-primary">P101</span> đã có lịch đặt từ <span className="font-semibold text-on-surface">14:00 23/09/2026</span> đến <span className="font-semibold text-on-surface">02:00 24/09/2026</span>.
            Khi bạn nhấn &quot;Tạo phiếu thuê&quot; và chọn thời gian trùng khoảng này, phòng P101 sẽ tự động ẩn đi. Khi chọn ngoài khoảng giờ trên, phòng P101 sẽ xuất hiện trở lại để bạn đặt phòng.
          </p>
        </div>
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
          onCancel={handleCancel}
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
        onCancel={handleCancel}
        onRemoveRoom={handleRemoveRoom}
        tinhTongTien={tinhTongTien}
        layTrangThaiPhieuThue={layTrangThaiPhieuThue}
      />

      {/* Create Dialog - Truyền phieuThueList để kiểm tra xung đột */}
      <CreateBookingDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreatePhieuThue}
        danhSachKhachHang={mockKhachHang}
        danhSachPhong={mockPhong}
        phieuThueList={phieuThueList}
      />
    </div>
  );
};

export default LapPhieuThuePage;
