import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authAPI } from "@/services/api";
import {
  clearAuth,
  getStoredUser,
  getToken,
  saveAuth,
  updateStoredUser,
} from "@/utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  // Có token thì phải xác minh lại với server (/auth/me) trước khi cho vào trang
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return; // loading đã là false ở state khởi tạo
    let cancelled = false;
    authAPI
      .me()
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
        updateStoredUser(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        clearAuth();
        setUser(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Interceptor phát sự kiện này khi server trả 401 (token hết hạn / không hợp lệ)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = useCallback(async (username, password, remember = true) => {
    const res = await authAPI.login({ username, password });
    const { accessToken, user: authUser } = res.data;
    saveAuth(accessToken, authUser, remember);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // Cập nhật thông tin nhân viên đang lưu (ví dụ ảnh đại diện mới) để Header/Sidebar hiển thị ngay
  const updateEmployee = useCallback(
    (patch) => {
      if (!user) return;
      const next = { ...user, employee: { ...user.employee, ...patch } };
      setUser(next);
      updateStoredUser(next);
    },
    [user],
  );

  const hasRole = useCallback(
    (...roles) => Boolean(user) && roles.includes(user.role),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: Boolean(user), login, logout, hasRole, updateEmployee }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
