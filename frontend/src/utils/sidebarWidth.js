// Độ rộng thanh bên: mặc định vừa đủ để header (tên khách sạn, giờ, tài khoản) hiển thị gọn trên màn hình laptop.
// Khóa lưu có hậu tố phiên bản để bỏ độ rộng 384px cũ đã lưu từ trước, người dùng kéo lại thì lưu theo khóa mới.
export const SIDEBAR_DEFAULT_WIDTH = 288;
export const SIDEBAR_MIN_WIDTH = 256;
export const SIDEBAR_MAX_WIDTH = 480;
const STORAGE_KEY = "sidebarWidth.v2";

export const getInitialSidebarWidth = () => {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (Number.isFinite(saved)) {
      return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, saved));
    }
  } catch {
    // không đọc được localStorage thì dùng mặc định
  }
  return SIDEBAR_DEFAULT_WIDTH;
};

export const saveSidebarWidth = (width) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(width));
  } catch {
    // bỏ qua: chỉ mất việc nhớ độ rộng
  }
};
