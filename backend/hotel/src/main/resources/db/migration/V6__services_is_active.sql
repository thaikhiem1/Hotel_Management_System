-- Dịch vụ "đang được phép cung cấp" (UC-SVC-005 quy tắc 4).
-- Dịch vụ đã có lịch sử sử dụng không xóa được nên chuyển sang ngừng cung cấp (is_active = FALSE);
-- dịch vụ ngừng cung cấp không còn xuất hiện khi ghi nhận dịch vụ khách sử dụng nhưng lịch sử cũ giữ nguyên.
ALTER TABLE services
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
