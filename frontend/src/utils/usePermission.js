import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/notification";
import { canView, canWrite, NO_PERMISSION_MESSAGE } from "@/utils/permissions";

/**
 * Quyền của người dùng hiện tại trên một nhóm chức năng.
 * - canWrite: được thêm/sửa/xóa không
 * - canView: thấy nhóm chức năng này không
 * - guard(fn): bọc hàm mở form con/thao tác ghi; không có quyền thì báo chung và không chạy fn
 */
export const usePermission = (resource) => {
  const { user } = useAuth();
  const role = user?.role;
  const writable = canWrite(role, resource);

  const guard = useCallback(
    (fn) =>
      (...args) => {
        if (!writable) {
          showError("Không có quyền", NO_PERMISSION_MESSAGE);
          return undefined;
        }
        return fn(...args);
      },
    [writable],
  );

  /** Dùng ở đầu hàm mở form con/thao tác ghi: không có quyền thì báo chung và trả false */
  const check = useCallback(() => {
    if (!writable) showError("Không có quyền", NO_PERMISSION_MESSAGE);
    return writable;
  }, [writable]);

  return { canWrite: writable, canView: canView(role, resource), guard, check };
};
