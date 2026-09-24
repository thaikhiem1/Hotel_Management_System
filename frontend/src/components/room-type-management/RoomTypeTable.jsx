import React from "react";

/**
 * RoomTypeTable - Component hiển thị bảng danh sách loại phòng
 *
 * Props:
 * - roomTypes: Array - Danh sách loại phòng cần hiển thị
 * - onEdit: Function - Callback khi nhấn nút sửa
 * - onDelete: Function - Callback khi nhấn nút xóa
 * - isLoading: Boolean - Trạng thái loading
 *
 * Hiển thị các cột theo Database.md:
 * - IdLPH: ID loại phòng (có icon)
 * - TenLPH: Tên loại phòng
 * - SoGiuong: Số giường
 * - SoNguoiToiDa: Số người tối đa
 * - GiaNgay: Giá thuê theo ngày
 * - GiaGio: Giá thuê theo giờ
 * - Actions: Các nút thao tác (Sửa, Xóa)
 *
 * TODO: AUTHORIZATION
 * - Nút Sửa: Chỉ hiển thị cho Admin (Role 0) và Quản lý (Role 2)
 * - Nút Xóa: Chỉ hiển thị cho Admin (Role 0)
 */
const RoomTypeTable = ({ roomTypes, onEdit, onDelete, isLoading }) => {
  /**
   * Format số tiền theo định dạng Việt Nam
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div
        className="w-full p-space-xl flex items-center justify-center
                    bg-surface-container-low rounded-lg border border-outline-variant"
      >
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <div
        className="w-full p-space-xl flex items-center justify-center
                    bg-surface-container-low rounded-lg border border-outline-variant"
      >
        <div className="flex flex-col items-center gap-space-md">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            category
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Không có dữ liệu loại phòng
          </p>
        </div>
      </div>
    );
  }
  const getformatMaLPH = (idLPH) => `LP${String(idLPH).padStart(3, 0)}`;
  return (
    <div className="w-full overflow-x-auto bg-surface-container-low rounded-lg border border-outline-variant">
      <table className="w-full">
        <thead className="bg-surface-container-high border-b border-outline-variant">
          <tr>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              <div className="flex items-center gap-space-xs">
                <span className="text-left font-label-md text-label-md text-on-surface">
                  Mã loại phòng
                </span>
              </div>
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Tên loại phòng
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
              Số giường
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
              Số người tối đa
            </th>
            <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
              Giá ngày
            </th>
            <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
              Giá giờ
            </th>
            <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {roomTypes.map((roomType) => (
            <tr
              key={roomType.IdLPH}
              className="hover:bg-surface-container-highest transition-colors duration-150"
            >
              {/* ID Loại phòng với icon */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      category
                    </span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {getformatMaLPH(roomType.IdLPH)}
                  </span>
                </div>
              </td>

              {/* Tên loại phòng */}
              <td className="px-space-md py-space-md">
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {roomType.TenLPH}
                </span>
              </td>

              {/* Số giường */}
              <td className="px-space-md py-space-md text-center">
                <div
                  className="inline-flex items-center gap-space-xs px-space-sm py-space-xs
                              rounded-full bg-tertiary/20 text-tertiary"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    bed
                  </span>
                  <span className="font-body-sm text-body-sm">
                    {roomType.SoGiuong}
                  </span>
                </div>
              </td>

              {/* Số người tối đa */}
              <td className="px-space-md py-space-md text-center">
                <div
                  className="inline-flex items-center gap-space-xs px-space-sm py-space-xs
                              rounded-full bg-primary/20 text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    group
                  </span>
                  <span className="font-body-sm text-body-sm">
                    {roomType.SoNguoiToiDa}
                  </span>
                </div>
              </td>

              {/* Giá ngày */}
              <td className="px-space-md py-space-md text-right">
                <span className="font-body-md text-body-md text-primary font-semibold">
                  {formatCurrency(roomType.GiaNgay)}
                </span>
              </td>

              {/* Giá giờ */}
              <td className="px-space-md py-space-md text-right">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {roomType.GiaGio ? formatCurrency(roomType.GiaGio) : "—"}
                </span>
              </td>

              {/* Thao tác */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center justify-center gap-space-xs">
                  {/* Nút Sửa - TODO: AUTHORIZATION - Chỉ Admin và Quản lý */}
                  <button
                    onClick={() => onEdit(roomType)}
                    className="p-space-xs rounded-lg hover:bg-primary/10 text-primary
                             transition-colors duration-150 group"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      edit
                    </span>
                  </button>

                  {/* Nút Xóa - TODO: AUTHORIZATION - Chỉ Admin */}
                  <button
                    onClick={() => onDelete(roomType)}
                    className="p-space-xs rounded-lg hover:bg-error/10 text-error
                             transition-colors duration-150 group"
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
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

export default RoomTypeTable;
