INSERT INTO employees (full_name, position, salary, phone, citizen_id, date_of_birth, gender, address, email, is_active)
VALUES
    ('Trần Thái Khiêm', 'Quản trị viên hệ thống', 50000000, '0326440685', '083206006644', '1985-01-01', 'Nam', '123 Main St', 'tranthaikhiem321@gmail.com', true),
    ('Nguyễn Văn A', 'Quản lý khách sạn', 30000000, '0326440684', '083206006645', '1990-01-01', 'Nam', '123 Main St', 'nguyenvana@gmail.com', true),
    ('Trần Văn B', 'Nhân viên lễ tân', 15000000, '0326440686', '083206006646', '1995-01-01', 'Nam', '123 Main St', 'tranthib@gmail.com', true);
    
INSERT INTO accounts (username, password_hash, employee_id, role, is_active)
VALUES
    ('admin', '$2a$12$cSbbgV238MI1N1CPBeJ8ju017BQRlKe3GwJI8OL2SkRaePImHAeu6', 1, 'ADMIN', true),
    ('manager', '$2a$12$cSbbgV238MI1N1CPBeJ8ju017BQRlKe3GwJI8OL2SkRaePImHAeu6', 2, 'MANAGER',true),
    ('receptionist', '$2a$12$cSbbgV238MI1N1CPBeJ8ju017BQRlKe3GwJI8OL2SkRaePImHAeu6', 3, 'RECEPTIONIST',true);