import { API_ORIGIN } from "@/services/api";

// Ảnh mặc định nằm trong public/avatars của frontend
export const DEFAULT_AVATAR = "/avatars/profileNam.jpg";

/**
 * Đường dẫn ảnh đại diện dùng được trong thẻ img.
 * Ảnh do người dùng tải lên được backend phục vụ tại /uploads/avatars/..., nên phải thêm địa chỉ backend;
 * ảnh mặc định (/avatars/...) và đường dẫn tuyệt đối giữ nguyên.
 */
export const resolveAvatarUrl = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR;
  return avatar.startsWith("/uploads/") ? `${API_ORIGIN}${avatar}` : avatar;
};
