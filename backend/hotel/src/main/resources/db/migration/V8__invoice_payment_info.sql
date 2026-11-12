-- =========================================================
-- V8: Thông tin thanh toán của hóa đơn (phương thức và nhân viên thu tiền)
--     Phục vụ thanh toán hóa đơn sau khi trả phòng (hóa đơn lập ở trạng thái UNPAID).
-- =========================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_by INTEGER;

ALTER TABLE invoices
    ADD CONSTRAINT fk_invoice_paid_by FOREIGN KEY (paid_by) REFERENCES employees(employee_id);

-- Hóa đơn đã thanh toán từ trước (dữ liệu mẫu): mặc định tiền mặt, nhân viên thu tiền là người lập hóa đơn
UPDATE invoices
   SET payment_method = 'CASH', paid_by = employee_id
 WHERE invoice_status = 'PAID' AND payment_method IS NULL;

ALTER TABLE invoices
    ADD CONSTRAINT chk_invoice_payment_method CHECK (payment_method IS NULL OR payment_method IN ('CASH', 'CARD', 'TRANSFER'));

-- Đã thanh toán thì phải có phương thức và nhân viên thu tiền; chưa thanh toán thì không có
ALTER TABLE invoices
    ADD CONSTRAINT chk_invoice_payment_info CHECK (
        (invoice_status = 'PAID'   AND payment_method IS NOT NULL AND paid_by IS NOT NULL)
     OR (invoice_status = 'UNPAID' AND payment_method IS NULL     AND paid_by IS NULL)
    );
