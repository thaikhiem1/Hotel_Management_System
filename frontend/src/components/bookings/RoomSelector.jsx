import React, { useState } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * RoomSelector - Chọn phòng cho phiếu thuê
 *
 * Dựa theo Database.md:
 *   Phong { IdPH, MaPH, TrangThaiPhong (0:Trống, 1:Đang sửa), IdLPH, GhiChu }
 *   LoaiPhong { IdLPH, TenLPH, SoGiuong, SoNguoiToiDa, GiaNgay, GiaGio }
 *
 * Props:
 *   danhSachPhong: Phong[] — kèm trường loaiPhong (join)
 *   selectedRooms: (Phong | { phong: Phong })[] — danh sách phòng đã chọn
 *   onToggleRoom(phong): toggle chọn/bỏ chọn phòng
 *   checkInDate, checkOutDate: ngày nhận/trả
 *   hinhThucThue: 'NGAY' | 'GIO'
 */
const RoomSelector = ({
  danhSachPhong = [],
  selectedRooms = [],
  onToggleRoom,
  checkInDate,
  checkOutDate,
  hinhThucThue = 'NGAY'
}) => {
  const [filterLoaiPhong, setFilterLoaiPhong] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Hỗ trợ cả trường hợp selectedRooms là Phong[] hoặc { phong: Phong }[]
  const isRoomSelected = (IdPH) => {
    return selectedRooms.some(r => {
      const currentId = r?.phong ? r.phong.IdPH : r?.IdPH;
      return currentId === IdPH;
    });
  };

  // Lấy danh sách loại phòng duy nhất để lọc
  const loaiPhongList = [
    { IdLPH: 'all', TenLPH: 'Tất cả loại phòng' },
    ...Array.from(
      new Map(
        danhSachPhong
          .filter(p => p.loaiPhong)
          .map(p => [p.IdLPH, p.loaiPhong])
      ).values()
    )
  ];

  // Lọc phòng theo loại
  const filteredPhong = danhSachPhong.filter(p =>
    filterLoaiPhong === 'all' || p.IdLPH === Number(filterLoaiPhong)
  );

  return (
    <div className="p-space-lg rounded-lg bg-surface-container-high">
      {/* Header */}
      <div className="flex items-center justify-between mb-space-md">
        <div>
          <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
            Chọn phòng
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Nhấn vào phòng để chọn hoặc bỏ chọn
          </p>
        </div>
        <span className="px-space-md py-space-xs rounded-full bg-primary/20 text-primary font-label-md text-label-md font-semibold">
          Đã chọn: {selectedRooms.length} phòng
        </span>
      </div>

      {/* Thông báo nếu chưa chọn thời gian */}
      {(!checkInDate || !checkOutDate) && (
        <div className="mb-space-md p-space-md rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            info
          </span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Bạn có thể chọn phòng trước, hãy hoàn tất ngày và giờ lưu trú để tính giá chính xác.
          </p>
        </div>
      )}

      {/* Bộ lọc loại phòng */}
      <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-lg mb-space-md">
        <span className="material-symbols-outlined text-outline text-[18px]">
          filter_list
        </span>
        <select
          value={filterLoaiPhong}
          onChange={(e) => setFilterLoaiPhong(e.target.value)}
          className="bg-transparent flex-1 text-on-surface focus:outline-none font-body-md text-body-md cursor-pointer"
        >
          {loaiPhongList.map((lp) => (
            <option key={lp.IdLPH} value={lp.IdLPH}>
              {lp.TenLPH}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined text-outline text-[18px]">
          expand_more
        </span>
      </div>

      {/* Danh sách phòng trống */}
      {filteredPhong.length === 0 ? (
        <div className="text-center py-margin">
          <span className="material-symbols-outlined text-[48px] text-outline mb-space-xs block">
            meeting_room_off
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Không tìm thấy phòng phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredPhong.map((phong) => {
            const selected = isRoomSelected(phong.IdPH);
            const loaiPhong = phong.loaiPhong;
            // TrangThaiPhong: 0: Trống (khả dụng), 1: Đang sửa chữa
            const available = phong.TrangThaiPhong === 0;

            return (
              <button
                type="button"
                key={phong.IdPH}
                onClick={(e) => {
                  e.preventDefault();
                  if (available && onToggleRoom) {
                    onToggleRoom(phong);
                  }
                }}
                disabled={!available}
                className={cn(
                  'p-space-lg rounded-lg border-2 transition-all text-left relative cursor-pointer',
                  available
                    ? selected
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                      : 'border-surface-container-highest bg-surface-container hover:border-primary/50 hover:bg-surface-container-highest'
                    : 'border-surface-container-high bg-surface-container opacity-50 cursor-not-allowed'
                )}
              >
                {/* Mã phòng & Trạng thái chọn */}
                <div className="flex items-start justify-between mb-space-sm">
                  <div>
                    <p className={cn(
                      'font-headline-sm text-headline-sm font-bold mb-space-xs',
                      selected ? 'text-primary' : 'text-on-surface'
                    )}>
                      {phong.MaPH}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      {loaiPhong?.TenLPH || 'Phòng'}
                    </p>
                  </div>
                  {available && (
                    <div className={cn(
                      'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      selected ? 'border-primary bg-primary' : 'border-outline'
                    )}>
                      {selected && (
                        <span className="material-symbols-outlined text-[16px] text-on-primary">
                          check
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Thông tin từ LoaiPhong */}
                <div className="space-y-space-xs mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[15px] text-outline">
                      bed
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {loaiPhong?.SoGiuong || 1} giường
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[15px] text-outline">
                      people
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Tối đa {loaiPhong?.SoNguoiToiDa || 2} người
                    </span>
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="pt-space-sm border-t border-surface-container-high">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className={cn(
                        'font-body-lg text-body-lg font-bold',
                        selected ? 'text-primary' : 'text-on-surface'
                      )}>
                        {formatCurrency(hinhThucThue === 'GIO' ? (loaiPhong?.GiaGio || loaiPhong?.GiaNgay / 10) : loaiPhong?.GiaNgay)}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                        {hinhThucThue === 'GIO' ? '/giờ' : '/ngày (đêm)'}
                      </p>
                    </div>

                    {/* Hiển thị thêm đơn giá đối ứng */}
                    {loaiPhong?.GiaGio && hinhThucThue === 'NGAY' && (
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {formatCurrency(loaiPhong.GiaGio)}/h
                      </span>
                    )}
                  </div>
                </div>

                {/* Ghi chú phòng */}
                {phong.GhiChu && (
                  <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant italic text-[11px]">
                    {phong.GhiChu}
                  </p>
                )}

                {/* Trạng thái không khả dụng */}
                {!available && (
                  <div className="mt-space-sm pt-space-sm border-t border-error/20">
                    <p className="font-label-sm text-label-sm text-error flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[14px]">build</span>
                      Đang sửa chữa
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomSelector;
