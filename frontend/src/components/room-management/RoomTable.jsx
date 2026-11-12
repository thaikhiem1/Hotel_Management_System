import { formatCurrency } from "@/utils/format";
import { ROOM_STATUS_META, getRoomStatusLabel } from "@/utils/roomStatus";

const RoomTable = ({ rooms, onEdit, onDelete, isLoading }) => {
  /**
   * Format số tiền theo định dạng Việt Nam
   */
  /**
   * Lấy badge trạng thái phòng
   */
  const getStatusBadge = (room) => {
    const meta = ROOM_STATUS_META[room.room_status];
    const badge = meta?.badge ?? "bg-surface-container-high text-on-surface-variant";
    return (
      <div className="flex flex-col items-center gap-space-xs">
        <span
          className={`inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full font-label-sm text-label-sm ${badge}`}
        >
          <span className="material-symbols-outlined text-[16px]">{meta?.icon ?? "help"}</span>
          <span>{getRoomStatusLabel(room.room_status)}</span>
        </span>
        {room.has_active_stay && (
          <span className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary">
            <span className="material-symbols-outlined text-[14px]">person</span>
            <span>Đang có khách</span>
          </span>
        )}
        {!room.has_active_stay && room.has_upcoming_booking && (
          <span className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">event</span>
            <span>Có lượt đặt sắp tới</span>
          </span>
        )}
      </div>
    );
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

  if (!rooms || rooms.length === 0) {
    return (
      <div
        className="w-full p-space-xl flex items-center justify-center
                    bg-surface-container-low rounded-lg border border-outline-variant"
      >
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
  const getformatMaP = (room_id) => `P${String(room_id).padStart(3, 0)}`;
  return (
    <div className="w-full overflow-x-auto bg-surface-container-low rounded-lg border border-outline-variant">
      <table className="w-full">
        <thead className="bg-surface-container-high border-b border-outline-variant">
          <tr>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Mã phòng
            </th>
            <th className="px-4px py-space-sm text-left font-label-md text-label-md text-on-surface">
              Tên phòng
            </th>
            <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
              Loại phòng
            </th>
            <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
              Giá ngày
            </th>
            <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
              Giá giờ
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
              key={room.room_id}
              className="hover:bg-surface-container-highest transition-colors duration-150"
            >
              {/* ID Phòng với icon */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-primary">meeting_room</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {getformatMaP(room.room_id)}
                  </span>
                </div>
              </td>

              {/* Mã phòng */}
              <td className="px-space-md py-space-md">
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {room.room_code}
                </span>
              </td>

              {/* Tên loại phòng */}
              <td className="px-space-md py-space-md">
                <span className="font-body-md text-body-md text-on-surface">
                  {room.room_type_name}
                </span>
              </td>

              {/* Giá ngày */}
              <td className="px-space-md py-space-md text-right">
                <span className="font-body-md text-body-md text-on-surface font-semibold text-primary">
                  {formatCurrency(room.daily_rate || 0)}
                </span>
              </td>
              {/* Giá giờ */}
              <td className="px-space-md py-space-md text-right">
                <span className="font-body-md text-body-md text-on-surface font-semibold text-primary">
                  {formatCurrency(room.hourly_rate || 0)}
                </span>
              </td>

              {/* Trạng thái */}
              <td className="px-space-md py-space-md text-center">
                {getStatusBadge(room)}
              </td>

              {/* Ghi chú */}
              <td className="px-space-md py-space-md">
                <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {room.note || "—"}
                </span>
              </td>

              {/* Thao tác */}
              <td className="px-space-md py-space-md">
                <div className="flex items-center justify-center gap-space-xs">
                  {/* Nút Sửa - TODO: AUTHORIZATION - Chỉ Admin và Quản lý */}
                  <button
                    onClick={() => onEdit(room)}
                    disabled={room.has_active_stay}
                    className="p-space-xs rounded-lg hover:bg-primary/10 text-primary
                             transition-colors duration-150 group disabled:opacity-40 disabled:cursor-not-allowed"
                    title={room.has_active_stay ? "Phòng đang có khách nên không thể cập nhật" : "Chỉnh sửa"}
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>

                  {/* Nút Xóa - TODO: AUTHORIZATION - Chỉ Admin */}
                  <button
                    onClick={() => onDelete(room)}
                    disabled={room.has_active_stay}
                    className="p-space-xs rounded-lg hover:bg-error/10 text-error
                             transition-colors duration-150 group disabled:opacity-40 disabled:cursor-not-allowed"
                    title={room.has_active_stay ? "Phòng đang có khách nên không thể xóa" : "Xóa"}
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
