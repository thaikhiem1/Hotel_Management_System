-- =========================================================
-- V7: Dữ liệu mẫu để chạy thử hệ thống (mỗi bảng 10 dòng, riêng hóa đơn chỉ có cho các lượt đã trả phòng)
--     Tài khoản mới dùng chung mật khẩu 123456 như các tài khoản mẫu ở V4.
--     Các bảng danh mục dùng ON CONFLICT DO NOTHING nên chạy lại trên DB đã có dữ liệu trùng vẫn an toàn.
-- =========================================================

-- 1. EMPLOYEES: V4 đã có 3 nhân viên, thêm 7 để đủ 10 (chức vụ chính là vai trò tài khoản)
INSERT INTO employees (full_name, position, salary, phone, citizen_id, date_of_birth, gender, address, email, is_active)
VALUES
    ('Lê Thị Hương',     'MANAGER',      28000000, '0912345601', '079190001001', '1991-03-12', 'Nữ',  '25 Lê Lợi, Quận 1, TP.HCM',          'lethihuong@hotel.local',     true),
    ('Phạm Minh Tuấn',   'RECEPTIONIST', 14000000, '0912345602', '079195001002', '1995-07-21', 'Nam', '78 Nguyễn Huệ, Quận 1, TP.HCM',      'phamminhtuan@hotel.local',   true),
    ('Nguyễn Thu Trang', 'RECEPTIONIST', 14000000, '0912345603', '079196001003', '1996-11-05', 'Nữ',  '12 Hai Bà Trưng, Quận 3, TP.HCM',    'nguyenthutrang@hotel.local', true),
    ('Võ Hoàng Nam',     'RECEPTIONIST', 13500000, '0912345604', '079197001004', '1997-01-30', 'Nam', '56 Cách Mạng Tháng 8, Quận 10',      'vohoangnam@hotel.local',     true),
    ('Đặng Ngọc Ánh',    'RECEPTIONIST', 13500000, '0912345605', '079198001005', '1998-09-17', 'Nữ',  '9 Điện Biên Phủ, Bình Thạnh',        'dangngocanh@hotel.local',    true),
    ('Bùi Quốc Bảo',     'RECEPTIONIST', 13000000, '0912345606', '079199001006', '1999-05-08', 'Nam', '101 Võ Văn Tần, Quận 3, TP.HCM',     'buiquocbao@hotel.local',     true),
    ('Trương Mỹ Linh',   'RECEPTIONIST', 13000000, '0912345607', '079200001007', '2000-12-25', 'Nữ',  '33 Phan Xích Long, Phú Nhuận',       'truongmylinh@hotel.local',   true)
ON CONFLICT DO NOTHING;

-- 2. ACCOUNTS: V4 đã có 3 tài khoản, thêm 7 tài khoản cho 7 nhân viên mới
INSERT INTO accounts (username, password_hash, employee_id, role, is_active)
SELECT v.username,
       '$2a$12$cSbbgV238MI1N1CPBeJ8ju017BQRlKe3GwJI8OL2SkRaePImHAeu6',
       e.employee_id,
       e.position,
       true
FROM (VALUES
    ('manager2', 'lethihuong@hotel.local'),
    ('letan01',  'phamminhtuan@hotel.local'),
    ('letan02',  'nguyenthutrang@hotel.local'),
    ('letan03',  'vohoangnam@hotel.local'),
    ('letan04',  'dangngocanh@hotel.local'),
    ('letan05',  'buiquocbao@hotel.local'),
    ('letan06',  'truongmylinh@hotel.local')
) AS v(username, email)
JOIN employees e ON e.email = v.email
ON CONFLICT DO NOTHING;

-- 3. ROOM_TYPES
INSERT INTO room_types (room_type_name, number_of_beds, maximum_occupancy, daily_rate, hourly_rate)
VALUES
    ('Standard Single',    1, 2,  450000,  90000),
    ('Standard Double',    2, 3,  550000, 110000),
    ('Superior',           2, 3,  700000, 140000),
    ('Deluxe',             2, 3,  850000, 170000),
    ('Deluxe Twin',        2, 4,  900000, 180000),
    ('Family',             3, 5, 1200000, 240000),
    ('Junior Suite',       2, 4, 1500000, 300000),
    ('Executive Suite',    2, 4, 2000000, 400000),
    ('Presidential Suite', 3, 6, 3500000, 700000),
    ('Studio',             1, 2,  650000, 130000)
ON CONFLICT DO NOTHING;

-- 4. ROOMS (P204 đang sửa chữa, P205 đang dọn dẹp, còn lại sẵn sàng)
INSERT INTO rooms (room_code, room_status, room_type_id, note)
SELECT v.room_code, v.room_status, rt.room_type_id, v.note
FROM (VALUES
    ('P101', 'AVAILABLE',         'Standard Single',    'Tầng 1, hướng sân vườn'),
    ('P102', 'AVAILABLE',         'Standard Double',    'Tầng 1, gần sảnh'),
    ('P103', 'AVAILABLE',         'Superior',           'Tầng 1, cửa sổ lớn'),
    ('P104', 'AVAILABLE',         'Deluxe',             'Tầng 1, ban công'),
    ('P105', 'AVAILABLE',         'Deluxe Twin',        'Tầng 1, hai giường đơn'),
    ('P201', 'AVAILABLE',         'Family',             'Tầng 2, phòng gia đình'),
    ('P202', 'AVAILABLE',         'Junior Suite',       'Tầng 2, có phòng khách nhỏ'),
    ('P203', 'AVAILABLE',         'Executive Suite',    'Tầng 2, view thành phố'),
    ('P204', 'UNDER_MAINTENANCE', 'Presidential Suite', 'Đang sửa hệ thống điều hòa'),
    ('P205', 'CLEANING',          'Studio',             'Đang dọn dẹp sau khi khách trả phòng')
) AS v(room_code, room_status, type_name, note)
JOIN room_types rt ON rt.room_type_name = v.type_name
ON CONFLICT DO NOTHING;

-- 5. CUSTOMERS
INSERT INTO customers (full_name, phone, citizen_id_passport, nationality, gender)
VALUES
    ('Nguyễn Văn An',      '0901000001', '079085000001', 'Việt Nam', 'Nam'),
    ('Trần Thị Bích',      '0901000002', '079090000002', 'Việt Nam', 'Nữ'),
    ('Lê Hoàng Cường',     '0901000003', '079088000003', 'Việt Nam', 'Nam'),
    ('Phạm Thu Dung',      '0901000004', '079092000004', 'Việt Nam', 'Nữ'),
    ('Hoàng Minh Đức',     '0901000005', '079087000005', 'Việt Nam', 'Nam'),
    ('John Smith',         '0901000006', 'US12345678',   'Hoa Kỳ',   'Nam'),
    ('Emma Johnson',       '0901000007', 'GB98765432',   'Anh',      'Nữ'),
    ('Tanaka Hiroshi',     '0901000008', 'JP55667788',   'Nhật Bản', 'Nam'),
    ('Kim Min Jung',       '0901000009', 'KR11223344',   'Hàn Quốc', 'Nữ'),
    ('Vũ Thanh Hà',        '0901000010', '079094000010', 'Việt Nam', 'Nữ')
ON CONFLICT DO NOTHING;

-- 6. SERVICE_CATEGORIES
INSERT INTO service_categories (category_name)
VALUES
    ('Ăn uống'),
    ('Đồ uống'),
    ('Minibar'),
    ('Giặt ủi'),
    ('Spa & Massage'),
    ('Vận chuyển'),
    ('Thuê phương tiện'),
    ('Giải trí'),
    ('Dịch vụ phòng'),
    ('Tiện ích khác')
ON CONFLICT DO NOTHING;

-- 7. SERVICES (stock_quantity NULL = không quản lý tồn kho; tồn kho đã trừ sẵn phần seed ở service_usages)
INSERT INTO services (service_name, unit_price, stock_quantity, unit, service_category_id, is_active)
SELECT v.service_name, v.unit_price, v.stock_quantity, v.unit, c.service_category_id, true
FROM (VALUES
    ('Bữa sáng buffet',         150000, NULL, 'suất',  'Ăn uống'),
    ('Nước suối',                15000,  198, 'chai',  'Đồ uống'),
    ('Bia Heineken',             35000,  117, 'lon',   'Minibar'),
    ('Giặt ủi',                  50000, NULL, 'kg',    'Giặt ủi'),
    ('Massage toàn thân',       400000, NULL, 'lượt',  'Spa & Massage'),
    ('Đưa đón sân bay',         300000, NULL, 'chuyến','Vận chuyển'),
    ('Thuê xe máy',             150000, NULL, 'ngày',  'Thuê phương tiện'),
    ('Karaoke',                 200000, NULL, 'giờ',   'Giải trí'),
    ('Dọn phòng thêm',          100000, NULL, 'lượt',  'Dịch vụ phòng'),
    ('Bộ dụng cụ vệ sinh',       20000,   79, 'bộ',    'Tiện ích khác')
) AS v(service_name, unit_price, stock_quantity, unit, category_name)
JOIN service_categories c ON c.category_name = v.category_name
ON CONFLICT DO NOTHING;

-- 8-11. Phiếu thuê, chi tiết đặt phòng, dịch vụ sử dụng, hóa đơn: sinh theo từng lượt lưu trú để các bảng khớp nhau
--       và vượt qua các ràng buộc/trigger của V2, V5 (giá chốt, số đêm/giờ, tổng dịch vụ, không chồng lịch).
CREATE TEMP TABLE seed_usage (
    room_code    VARCHAR(20),
    service_name VARCHAR(100),
    quantity     INTEGER,
    hours_after  INTEGER   -- ghi nhận sau lúc nhận phòng thực tế bao nhiêu giờ
) ON COMMIT DROP;

INSERT INTO seed_usage VALUES
    ('P101', 'Bữa sáng buffet',    2, 20),
    ('P101', 'Giặt ủi',            3, 30),
    ('P102', 'Nước suối',          2,  5),
    ('P103', 'Karaoke',            2,  1),
    ('P205', 'Bia Heineken',       3, 10),
    ('P104', 'Đưa đón sân bay',    1,  2),
    ('P104', 'Bữa sáng buffet',    2, 19),
    ('P105', 'Massage toàn thân',  2, 22),
    ('P201', 'Bộ dụng cụ vệ sinh', 1,  3),
    ('P201', 'Thuê xe máy',        2, 24);

DO $$
DECLARE
    base        TIMESTAMP := date_trunc('day', now());
    s           RECORD;
    u           RECORD;
    v_room      rooms%ROWTYPE;
    v_price     NUMERIC(18,2);
    v_customer  INTEGER;
    v_employee  INTEGER;
    v_receipt   INTEGER;
    v_detail    INTEGER;
    v_check_in  TIMESTAMP;
    v_check_out TIMESTAMP;
    v_act_in    TIMESTAMP;
    v_act_out   TIMESTAMP;
    v_units     INTEGER;
    v_billed    INTEGER;
    v_service_sum NUMERIC(18,2);
BEGIN
    FOR s IN
        SELECT * FROM (VALUES
          -- phòng, khách (SĐT), nhân viên lập (email), trạng thái phiếu, trạng thái chi tiết, cách tính,
          -- ngày nhận (so với hôm nay), giờ nhận, ngày trả, giờ trả, số khách, hóa đơn
          ('P101','0901000001','tranthib@gmail.com',          'DA_TRA_PHONG', 'CHECKED_OUT','NGAY', -6,'14:00', -4,'12:00', 1,'PAID'),
          ('P102','0901000002','phamminhtuan@hotel.local',    'DA_TRA_PHONG', 'CHECKED_OUT','NGAY', -5,'14:00', -4,'12:00', 2,'PAID'),
          ('P103','0901000006','nguyenthutrang@hotel.local',  'DA_TRA_PHONG', 'CHECKED_OUT','GIO',  -3,'09:00', -3,'13:00', 2,'UNPAID'),
          ('P205','0901000010','tranthib@gmail.com',          'DA_TRA_PHONG', 'CHECKED_OUT','NGAY', -2,'14:00', -1,'11:00', 1,'UNPAID'),
          ('P104','0901000003','tranthib@gmail.com',          'DANG_LUU_TRU', 'CHECKED_IN', 'NGAY', -1,'14:00',  1,'12:00', 2,NULL),
          ('P105','0901000007','vohoangnam@hotel.local',      'DANG_LUU_TRU', 'CHECKED_IN', 'NGAY', -2,'14:00',  1,'12:00', 3,NULL),
          ('P201','0901000008','dangngocanh@hotel.local',     'DANG_LUU_TRU', 'CHECKED_IN', 'NGAY', -1,'14:00',  2,'12:00', 4,NULL),
          ('P202','0901000004','buiquocbao@hotel.local',      'DA_XAC_NHAN',  'RESERVED',   'NGAY',  2,'14:00',  4,'12:00', 2,NULL),
          ('P203','0901000009','truongmylinh@hotel.local',    'DA_XAC_NHAN',  'RESERVED',   'NGAY',  3,'14:00',  5,'12:00', 2,NULL),
          ('P204','0901000005','tranthib@gmail.com',          'DA_HUY',       'CANCELLED',  'NGAY',  1,'14:00',  3,'12:00', 2,NULL)
        ) AS t(room_code, cust_phone, emp_email, receipt_status, booking_status, pricing,
               in_day, in_time, out_day, out_time, guests, invoice_status)
    LOOP
        SELECT * INTO v_room FROM rooms WHERE room_code = s.room_code;
        SELECT customer_id INTO v_customer FROM customers WHERE phone = s.cust_phone;
        SELECT employee_id INTO v_employee FROM employees WHERE email = s.emp_email;
        CONTINUE WHEN v_room.room_id IS NULL OR v_customer IS NULL OR v_employee IS NULL;

        v_check_in  := base + make_interval(days => s.in_day)  + s.in_time::TIME;
        v_check_out := base + make_interval(days => s.out_day) + s.out_time::TIME;

        -- Bỏ qua nếu phòng đã có lượt khác chồng lịch (DB đã có dữ liệu thật)
        CONTINUE WHEN EXISTS (
            SELECT 1 FROM booking_details bd
             WHERE bd.room_id = v_room.room_id
               AND bd.booking_status IN ('RESERVED', 'CHECKED_IN')
               AND tsrange(bd.check_in_at, bd.check_out_at, '[)') && tsrange(v_check_in, v_check_out, '[)'));

        SELECT CASE s.pricing WHEN 'GIO' THEN rt.hourly_rate ELSE rt.daily_rate END
          INTO v_price FROM room_types rt WHERE rt.room_type_id = v_room.room_type_id;

        v_units := CASE s.pricing
            WHEN 'GIO' THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_check_out - v_check_in)) / 3600)::INTEGER)
            ELSE GREATEST(1, (v_check_out::DATE - v_check_in::DATE))
        END;

        -- Phiếu thuê (mã phiếu do trigger sinh)
        INSERT INTO rental_receipts (receipt_code, rental_date, customer_id, employee_id, receipt_status,
                                     cancelled_at, cancelled_by, cancel_reason)
        VALUES ('', v_check_in - INTERVAL '1 day', v_customer, v_employee, s.receipt_status,
                CASE WHEN s.receipt_status = 'DA_HUY' THEN base END,
                CASE WHEN s.receipt_status = 'DA_HUY' THEN v_employee END,
                CASE WHEN s.receipt_status = 'DA_HUY' THEN 'Khách báo hủy do thay đổi lịch trình' END)
        RETURNING rental_receipt_id INTO v_receipt;

        v_act_in  := v_check_in + INTERVAL '10 minutes';
        v_act_out := v_check_out;

        -- Chi tiết đặt phòng: lượt đã trả phòng được tạo ở trạng thái đang lưu trú trước,
        -- vì chỉ ghi nhận dịch vụ được cho lượt đang lưu trú (trigger V5)
        INSERT INTO booking_details (rental_receipt_id, room_id, number_of_guests, actual_number_of_guests,
                                     check_in_at, check_out_at, actual_check_in_at,
                                     booking_status, pricing_method, unit_price, estimated_units, estimated_amount,
                                     cancelled_at, cancelled_by, cancel_reason)
        VALUES (v_receipt, v_room.room_id, s.guests,
                CASE WHEN s.booking_status IN ('CHECKED_IN', 'CHECKED_OUT') THEN s.guests END,
                v_check_in, v_check_out,
                CASE WHEN s.booking_status IN ('CHECKED_IN', 'CHECKED_OUT') THEN v_act_in END,
                CASE WHEN s.booking_status = 'CHECKED_OUT' THEN 'CHECKED_IN' ELSE s.booking_status END,
                s.pricing, v_price, v_units, ROUND(v_price * v_units, 2),
                CASE WHEN s.booking_status = 'CANCELLED' THEN base END,
                CASE WHEN s.booking_status = 'CANCELLED' THEN v_employee END,
                CASE WHEN s.booking_status = 'CANCELLED' THEN 'Khách báo hủy do thay đổi lịch trình' END)
        RETURNING booking_detail_id INTO v_detail;

        -- Dịch vụ đã sử dụng, đơn giá chốt tại thời điểm ghi nhận
        FOR u IN
            SELECT su.quantity, su.hours_after, sv.service_id, sv.unit_price
              FROM seed_usage su
              JOIN services sv ON sv.service_name = su.service_name
             WHERE su.room_code = s.room_code
        LOOP
            INSERT INTO service_usages (booking_detail_id, service_id, quantity, unit_price, amount, used_at, recorded_by)
            VALUES (v_detail, u.service_id, u.quantity, u.unit_price, ROUND(u.unit_price * u.quantity, 2),
                    v_act_in + make_interval(hours => u.hours_after), v_employee);
        END LOOP;

        -- Trả phòng và lập hóa đơn
        IF s.booking_status = 'CHECKED_OUT' THEN
            UPDATE booking_details
               SET booking_status = 'CHECKED_OUT', actual_check_out_at = v_act_out
             WHERE booking_detail_id = v_detail;

            v_billed := CASE s.pricing
                WHEN 'GIO' THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_act_out - v_act_in)) / 3600)::INTEGER)
                ELSE GREATEST(1, (v_act_out::DATE - v_act_in::DATE))
            END;
            SELECT COALESCE(SUM(amount), 0) INTO v_service_sum
              FROM service_usages WHERE booking_detail_id = v_detail;

            INSERT INTO invoices (invoice_code, booking_detail_id, rental_receipt_id, employee_id, pricing_method,
                                  unit_price, billed_units, room_amount, service_amount, total_amount,
                                  invoice_status, issued_at, paid_at)
            VALUES ('', v_detail, v_receipt, v_employee, s.pricing,
                    v_price, v_billed, ROUND(v_price * v_billed, 2), v_service_sum,
                    ROUND(v_price * v_billed, 2) + v_service_sum,
                    s.invoice_status, v_act_out,
                    CASE WHEN s.invoice_status = 'PAID' THEN v_act_out + INTERVAL '30 minutes' END);
        END IF;
    END LOOP;
END $$;
