INSERT INTO employees
(full_name, position, salary, phone, citizen_id, date_of_birth, gender, address, email, avatar, is_active)
VALUES
('Nguyễn Văn An', 'Receptionist', 8500000, '0901000001', '001201000001', '1998-03-15', 'Male', 'Quận 1, TP.HCM', 'nguyenvanan@gmail.com', NULL, TRUE),
('Trần Thị Bình', 'Receptionist', 9000000, '0901000002', '001201000002', '1997-07-21', 'Female', 'Quận 3, TP.HCM', 'tranthibinh@gmail.com', NULL, TRUE),
('Lê Văn Cường', 'Manager', 15000000, '0901000003', '001201000003', '1990-11-10', 'Male', 'Quận 5, TP.HCM', 'levancuong@gmail.com', NULL, TRUE),
('Phạm Thị Dung', 'Receptionist', 8800000, '0901000004', '001201000004', '1999-01-25', 'Female', 'Quận 10, TP.HCM', 'phamthidung@gmail.com', NULL, TRUE),
('Hoàng Văn Đức', 'Manager', 16000000, '0901000005', '001201000005', '1988-05-18', 'Male', 'Bình Thạnh, TP.HCM', 'hoangvanduc@gmail.com', NULL, TRUE),
('Võ Thị Hà', 'Receptionist', 8700000, '0901000006', '001201000006', '2000-09-12', 'Female', 'Tân Bình, TP.HCM', 'vothiha@gmail.com', NULL, TRUE),
('Đặng Văn Giang', 'Receptionist', 8600000, '0901000007', '001201000007', '1996-02-28', 'Male', 'Gò Vấp, TP.HCM', 'dangvangiang@gmail.com', NULL, TRUE),
('Bùi Thị Hạnh', 'Receptionist', 9200000, '0901000008', '001201000008', '1995-12-05', 'Female', 'Phú Nhuận, TP.HCM', 'buithihanh@gmail.com', NULL, TRUE),
('Ngô Văn Khải', 'Manager', 15500000, '0901000009', '001201000009', '1991-06-17', 'Male', 'Thủ Đức, TP.HCM', 'ngovankhai@gmail.com', NULL, TRUE),
('Đỗ Thị Lan', 'Receptionist', 8900000, '0901000010', '001201000010', '1998-10-03', 'Female', 'Quận 7, TP.HCM', 'dothilan@gmail.com', NULL, TRUE),
('Nguyễn Minh Long', 'Receptionist', 8500000, '0901000011', '001201000011', '1999-04-20', 'Male', 'Quận 4, TP.HCM', 'nguyenminhlong@gmail.com', NULL, TRUE),
('Trương Thị Mai', 'Receptionist', 9100000, '0901000012', '001201000012', '1997-08-14', 'Female', 'Quận 6, TP.HCM', 'truongthimai@gmail.com', NULL, TRUE),
('Phan Văn Nam', 'Manager', 17000000, '0901000013', '001201000013', '1987-03-09', 'Male', 'Bình Tân, TP.HCM', 'phanvannam@gmail.com', NULL, TRUE);

INSERT INTO room_types
(room_type_name, number_of_beds, maximum_occupancy, daily_rate, hourly_rate)
VALUES
('Single Standard', 1, 1, 500000, 100000),
('Single Deluxe', 1, 2, 650000, 130000),
('Double Standard', 2, 2, 800000, 160000),
('Double Deluxe', 2, 3, 1000000, 200000),
('Twin Standard', 2, 2, 850000, 170000),
('Twin Deluxe', 2, 3, 1100000, 220000),
('Triple Standard', 3, 3, 1200000, 240000),
('Triple Deluxe', 3, 4, 1400000, 280000),
('Family Standard', 3, 4, 1500000, 300000),
('Family Deluxe', 4, 5, 1800000, 360000);

INSERT INTO rooms
(room_code, room_status, room_type_id, note)
VALUES
('P101', 'AVAILABLE', 1, 'Phòng tầng 1'),
('P102', 'AVAILABLE', 2, 'Phòng tầng 1'),
('P103', 'UNDER_MAINTENANCE', 3, 'Đang bảo trì máy lạnh'),
('P104', 'AVAILABLE', 4, 'Phòng tầng 1'),
('P105', 'AVAILABLE', 5, 'Phòng tầng 1'),

('P201', 'AVAILABLE', 6, 'Phòng tầng 2'),
('P202', 'AVAILABLE', 7, 'Phòng tầng 2'),
('P203', 'UNDER_MAINTENANCE', 8, 'Đang sửa chữa phòng tắm'),
('P204', 'AVAILABLE', 9, 'Phòng tầng 2'),
('P205', 'AVAILABLE', 10, 'Phòng tầng 2');


INSERT INTO customers
(full_name, phone, citizen_id_passport, nationality, gender)
VALUES
('Nguyễn Hoàng Anh', '0912000001', '079201000001', 'Việt Nam', 'Male'),
('Trần Minh Anh', '0912000002', '079201000002', 'Việt Nam', 'Female'),
('Lê Quốc Bảo', '0912000003', '079201000003', 'Việt Nam', 'Male'),
('Phạm Ngọc Châu', '0912000004', '079201000004', 'Việt Nam', 'Female'),
('Hoàng Minh Dũng', '0912000005', '079201000005', 'Việt Nam', 'Male'),
('Võ Thanh Hà', '0912000006', '079201000006', 'Việt Nam', 'Female'),
('Đặng Quốc Huy', '0912000007', '079201000007', 'Việt Nam', 'Male'),
('Bùi Ngọc Lan', '0912000008', '079201000008', 'Việt Nam', 'Female'),
('Ngô Minh Khang', '0912000009', '079201000009', 'Việt Nam', 'Male'),
('Đỗ Thùy Linh', '0912000010', '079201000010', 'Việt Nam', 'Female'),
('Nguyễn Đức Minh', '0912000011', '079201000011', 'Việt Nam', 'Male'),
('Trương Ngọc Mai', '0912000012', '079201000012', 'Việt Nam', 'Female'),
('Phan Thanh Nam', '0912000013', '079201000013', 'Việt Nam', 'Male'),
('Lý Minh Ngọc', '0912000014', '079201000014', 'Việt Nam', 'Female');

-- =========================================================
-- SEED DATA: SERVICE CATEGORIES
-- =========================================================

INSERT INTO service_categories
(category_name)
VALUES
('Food & Beverage'),
('Laundry'),
('Spa & Wellness'),
('Transportation'),
('Room Service'),
('Entertainment'),
('Other');


-- =========================================================
-- SEED DATA: SERVICES
-- =========================================================

INSERT INTO services
(service_name, unit_price, stock_quantity, unit, service_category_id)
VALUES

-- 1. Food & Beverage
('Breakfast Buffet', 150000, NULL, 'person', 1),
('Lunch Set', 120000, NULL, 'person', 1),
('Dinner Set', 180000, NULL, 'person', 1),
('Coffee', 50000, 100, 'cup', 1),
('Soft Drink', 30000, 100, 'bottle', 1),
('Mineral Water', 20000, 200, 'bottle', 1),
('Fresh Orange Juice', 60000, 50, 'glass', 1),
('Beer', 50000, 100, 'can', 1),

-- 2. Laundry
('Laundry - Shirt', 50000, NULL, 'item', 2),
('Laundry - Pants', 60000, NULL, 'item', 2),
('Laundry - Dress', 80000, NULL, 'item', 2),
('Laundry - Jacket', 100000, NULL, 'item', 2),
('Laundry - Express Service', 150000, NULL, 'order', 2),

-- 3. Spa & Wellness
('Full Body Massage 60 Minutes', 500000, NULL, 'session', 3),
('Foot Massage 30 Minutes', 250000, NULL, 'session', 3),
('Facial Care', 400000, NULL, 'session', 3),
('Sauna', 200000, NULL, 'session', 3),

-- 4. Transportation
('Airport Pickup', 350000, NULL, 'trip', 4),
('Airport Drop-off', 350000, NULL, 'trip', 4),
('City Tour Transportation', 800000, NULL, 'trip', 4),
('Car Rental - 4 Seats', 1000000, NULL, 'day', 4),

-- 5. Room Service
('Extra Bed', 250000, 20, 'bed', 5),
('Extra Pillow', 50000, 50, 'item', 5),
('Extra Blanket', 80000, 50, 'item', 5),
('Baby Cot', 200000, 10, 'item', 5),
('Room Cleaning', 100000, NULL, 'service', 5),

-- 6. Entertainment
('Karaoke Room', 300000, NULL, 'hour', 6),
('Swimming Pool', 100000, NULL, 'person', 6),
('Gym Access', 80000, NULL, 'person', 6),

-- 7. Other
('Late Check-out', 200000, NULL, 'hour', 7),
('Early Check-in', 200000, NULL, 'hour', 7),
('Extra Key Card', 50000, 100, 'card', 7),
('Lost Key Card Replacement', 100000, 100, 'card', 7);