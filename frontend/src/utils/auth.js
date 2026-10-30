// Lưu token + thông tin user. "Ghi nhớ" -> localStorage (giữ sau khi đóng trình duyệt),
// ngược lại -> sessionStorage (mất khi đóng tab).
const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

const stores = () => [localStorage, sessionStorage];

export const getToken = () => {
  for (const store of stores()) {
    const token = store.getItem(TOKEN_KEY);
    if (token) return token;
  }
  return null;
};

export const getStoredUser = () => {
  for (const store of stores()) {
    const raw = store.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const saveAuth = (token, user, remember = true) => {
  clearAuth();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
};

export const updateStoredUser = (user) => {
  for (const store of stores()) {
    if (store.getItem(TOKEN_KEY)) {
      store.setItem(USER_KEY, JSON.stringify(user));
    }
  }
};

export const clearAuth = () => {
  for (const store of stores()) {
    store.removeItem(TOKEN_KEY);
    store.removeItem(USER_KEY);
  }
};

// Vai trò khớp với backend (Enums.Role)
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  RECEPTIONIST: "RECEPTIONIST",
};

export const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  RECEPTIONIST: "Lễ tân",
};

// Các route chỉ dành cho quản lý (khớp rule /api/accounts, /api/employees ở backend)
export const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
