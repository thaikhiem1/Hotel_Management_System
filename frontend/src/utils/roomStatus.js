// Trạng thái phòng ở trang Quản lý phòng (RoomStatus phía máy chủ) và luật chuyển trạng thái thủ công.
// Máy chủ vẫn là nơi kiểm tra cuối cùng; các luật ở đây chỉ để vô hiệu hóa lựa chọn không hợp lệ trên giao diện.

export const ROOM_STATUS_META = {
  AVAILABLE: {
    label: "Trống",
    icon: "check_circle",
    badge: "bg-tertiary/20 text-tertiary",
    accent: "text-tertiary",
  },
  CLEANING: {
    label: "Đang dọn dẹp",
    icon: "cleaning_services",
    badge: "bg-secondary/20 text-secondary",
    accent: "text-secondary",
  },
  UNDER_MAINTENANCE: {
    label: "Đang sửa chữa",
    icon: "engineering",
    badge: "bg-error/20 text-error",
    accent: "text-error",
  },
};

export const ROOM_STATUS_ORDER = ["AVAILABLE", "CLEANING", "UNDER_MAINTENANCE"];

export const getRoomStatusLabel = (status) => ROOM_STATUS_META[status]?.label ?? "Không xác định";

// Trống <-> Đang sửa chữa; Đang dọn dẹp chuyển được sang Trống (dọn xong) hoặc Đang sửa chữa.
// Đang dọn dẹp chỉ do trả phòng tạo ra nên không đặt thủ công được.
const TRANSITIONS = {
  AVAILABLE: ["UNDER_MAINTENANCE"],
  UNDER_MAINTENANCE: ["AVAILABLE"],
  CLEANING: ["AVAILABLE", "UNDER_MAINTENANCE"],
};

/**
 * Lý do không chọn được trạng thái `target` cho phòng `room`; null nếu chọn được.
 */
export const getStatusBlockReason = (room, target) => {
  if (!room || target === room.room_status) return null;
  if (room.has_active_stay) return "Phòng đang có khách";
  if (!(TRANSITIONS[room.room_status] ?? []).includes(target)) {
    return target === "CLEANING" ? "Chỉ tự động khi trả phòng" : "Không chuyển trực tiếp được";
  }
  if (room.has_upcoming_booking && target !== "AVAILABLE") return "Phòng có lượt đặt sắp tới";
  return null;
};
