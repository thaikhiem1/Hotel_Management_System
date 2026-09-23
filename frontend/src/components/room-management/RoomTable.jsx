import React from 'react';

/**
 * RoomTable - Component hiển thị bảng danh sách phòng
 * 
 * Props:
 * - rooms: Array - Danh sách phòng cần hiển thị
 * - onEdit: Function - Callback khi nhấn nút sửa
 * - onDelete: Function - Callback khi nhấn nút xóa
 * - isLoading: Boolean - Trạng thái loading
 * 
 * Hiển thị các cột theo Database.md:
 * - IdPH: ID phòng (có icon)
 * - MaPH: Mã phòng (P101, P102...)
 * - TenLPH: Tên loại phòng (từ bảng LoaiPhong)
 * - GiaNgay: Giá thuê theo ngày (từ bảng LoaiPhong)
 * - TrangThaiPhong: Trạng thái (0: Trống, 1: Đang sửa chữa)
 * - GhiChu: Ghi chú
 * - Actions: Các nút thao tác (Sửa, Xóa)
 * 
 * TODO: AUTHORIZATION
 * - Nút Sửa: Chỉ hiển thị cho Admin (Role 0) và Quản lý (Role 2)
 * - Nút Xóa: Chỉ hiển thị cho Admin (Role 0)
 */
const RoomTable = ({ rooms, onEdit, onDelete, isLoading }) => {
  /**
   * Format số tiền theo định dạng Việt Nam
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  /**
   * Lấy badge trạng thái phòng
   */
  const getStatusBadge = (status) => {
    if (status === 0) {
      return (
        <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs
                       rounded-full bg-tertiary/20 text-tertiary font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Trống</span>
        </span>
      );
    } else if (status === 1) {
      return (
        <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs
                       rounded-full bg-error/20 text-error font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px]">engineering</span>
          <span>Đang sửa chữa</span>
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full p-space-xl flex items-center justify-center
                    bg-surface-container-low rounded-lg border border-outline-variant">
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-body-md text-on-surface-variant">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="w-full p-space-xl flex items-center justify-center
                    bg-surface-container-low rounded-lg border border-outline-variant">
        <div className="flex flex-col items-center gap-space-md">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            meeting_room
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Không có dữ liệu phòng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-surface-container-low rounded-lg border border-outline-variant">
      <table className="w-full">
        <thead className="bg-surface-container-high border-b border-outline-variant">
          <tr>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[20px]">tag</span>
                <span>ID Phòng</span>
              </div>
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Mã phòng
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Loại phòng
            </th>
            <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
              Giá ngày
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
              Trạng thái
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Ghi chú
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rooms.map((room) => (
            <tr
              key={room.IdPH}
              className="hover:bg-surface-container-highest transition-colors duration-150"
            >
              {/* ID Phòng với icon */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      meeting_room
                    </span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    #{room.IdPH}
                  </span>
                </div>
              </td>

              {/* Mã phòng */}
              <td className="px-space-md py-space-md">
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {room.MaPH}
                </span>
              </td>

              {/* Tên loại phòng */}
              <td className="px-space-md py-space-md">
                <span className="font-body-md text-body-md text-on-surface">
                  {room.loaiPhong?.TenLPH || 'N/A'}
                </span>
              </td>

              {/* Giá ngày */}
              <td className="px-space-md py-space-md text-right">
                <span className="font-body-md text-body-md text-on-surface font-semibold text-primary">
                  {formatCurrency(room.loaiPhong?.GiaNgay || 0)}
                </span>
              </td>

              {/* Trạng thái */}
              <td className="px-space-md py-space-md text-center">
                {getStatusBadge(room.TrangThaiPhong)}
              </td>

              {/* Ghi chú */}
              <td className="px-space-md py-space-md">
                <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {room.GhiChu || '—'}
                </span>
              </td>

              {/* Thao tác */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center justify-center gap-space-xs">
                  {/* Nút Sửa - TODO: AUTHORIZATION - Chỉ Admin và Quản lý */}
                  <button
                    onClick={() => onEdit(room)}
                    className="p-space-xs rounded-lg hover:bg-primary/10 text-primary
                             transition-colors duration-150 group"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>

                  {/* Nút Xóa - TODO: AUTHORIZATION - Chỉ Admin */}
                  <button
                    onClick={() => onDelete(room)}
                    className="p-space-xs rounded-lg hover:bg-error/10 text-error
                             transition-colors duration-150 group"
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomTable;
