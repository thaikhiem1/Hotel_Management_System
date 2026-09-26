
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
('Phan Văn Nam', 'Manager', 17000000, '0901000013', '001201000013', '1987-03-09', 'Male', 'Bình Tân, TP.HCM', 'phanvannam@gmail.com', NULL, TRUE),
('Lý Thị Oanh', 'Receptionist', 8800000, '0901000014', '001201000014', '2000-11-22', 'Female', 'Quận 11, TP.HCM', 'lythioanh@gmail.com', NULL, TRUE),
('Huỳnh Văn Phúc', 'Receptionist', 8600000, '0901000015', '001201000015', '1996-01-16', 'Male', 'Tân Phú, TP.HCM', 'huynhvanphuc@gmail.com', NULL, TRUE),
('Mai Thị Quỳnh', 'Receptionist', 9000000, '0901000016', '001201000016', '1998-06-30', 'Female', 'Quận 8, TP.HCM', 'maithiquynh@gmail.com', NULL, TRUE),
('Vũ Văn Sơn', 'Manager', 16500000, '0901000017', '001201000017', '1989-09-11', 'Male', 'Bình Thạnh, TP.HCM', 'vuvanson@gmail.com', NULL, TRUE),
('Đinh Thị Thảo', 'Receptionist', 8700000, '0901000018', '001201000018', '1999-02-07', 'Female', 'Quận 12, TP.HCM', 'dinhthithao@gmail.com', NULL, TRUE),
('Cao Văn Tuấn', 'Receptionist', 8900000, '0901000019', '001201000019', '1995-05-26', 'Male', 'Hóc Môn, TP.HCM', 'caovantuan@gmail.com', NULL, TRUE),
('Phạm Minh Trang', 'Receptionist', 9300000, '0901000020', '001201000020', '1997-12-19', 'Female', 'Nhà Bè, TP.HCM', 'phamminhtrang@gmail.com', NULL, TRUE);


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
('Family Deluxe', 4, 5, 1800000, 360000),
('Executive Single', 1, 2, 900000, 180000),
('Executive Double', 2, 3, 1300000, 260000),
('Executive Twin', 2, 4, 1500000, 300000),
('Junior Suite', 2, 3, 1700000, 340000),
('Suite Standard', 2, 4, 2000000, 400000),
('Suite Deluxe', 2, 4, 2500000, 500000),
('Family Suite', 3, 5, 2800000, 560000),
('Presidential Suite', 4, 6, 5000000, 1000000),
('Business Room', 1, 2, 1000000, 200000),
('Premium Room', 2, 3, 1600000, 320000);

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
('P205', 'AVAILABLE', 10, 'Phòng tầng 2'),

('P301', 'AVAILABLE', 11, 'Phòng tầng 3'),
('P302', 'AVAILABLE', 12, 'Phòng tầng 3'),
('P303', 'AVAILABLE', 13, 'Phòng tầng 3'),
('P304', 'UNDER_MAINTENANCE', 14, 'Đang bảo trì nội thất'),
('P305', 'AVAILABLE', 15, 'Phòng tầng 3'),

('P401', 'AVAILABLE', 16, 'Phòng tầng 4'),
('P402', 'AVAILABLE', 17, 'Phòng tầng 4'),
('P403', 'AVAILABLE', 18, 'Phòng tầng 4'),
('P404', 'AVAILABLE', 19, 'Phòng tầng 4'),
('P405', 'AVAILABLE', 20, 'Phòng tầng 4');

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
('Lý Minh Ngọc', '0912000014', '079201000014', 'Việt Nam', 'Female'),
('Huỳnh Quốc Phong', '0912000015', '079201000015', 'Việt Nam', 'Male'),
('Mai Khánh Quỳnh', '0912000016', '079201000016', 'Việt Nam', 'Female'),
('Vũ Hoàng Sơn', '0912000017', 'Việt Nam', 'Việt Nam', 'Male'),
('Đinh Thảo Vy', '0912000018', '079201000018', 'Việt Nam', 'Female'),
('Cao Minh Tuấn', '0912000019', '079201000019', 'Việt Nam', 'Male'),
('Phạm Ngọc Trang', '0912000020', '079201000020', 'Việt Nam', 'Female');