-- Chức vụ của nhân viên chính là vai trò tài khoản (ADMIN, MANAGER, RECEPTIONIST).
-- Chuẩn hóa các nhân viên đã có tài khoản; nhân viên chưa có tài khoản giữ nguyên để ADMIN chọn lại khi cập nhật.
UPDATE employees e
SET position = a.role
FROM accounts a
WHERE a.employee_id = e.employee_id
  AND e.position <> a.role;
