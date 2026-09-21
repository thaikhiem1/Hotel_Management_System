```SRS - HỆ THỐNG QUẢN LÝ KHÁCH SẠN
│
├── 1. Giới thiệu
│   ├── 1.1 Mục đích
│   ├── 1.2 Phạm vi hệ thống
│   ├── 1.3 Đối tượng sử dụng
│   └── 1.4 Định nghĩa và thuật ngữ
│
├── 2. Tổng quan hệ thống
│   ├── 2.1 Mô tả hệ thống
│   ├── 2.2 Actor
│   └── 2.3 Phân quyền
│
├── 3. Yêu cầu chức năng
│   ├── 3.1 Đăng nhập
│   ├── 3.2 Quản lý tài khoản
│   ├── 3.3 Quản lý nhân viên
│   ├── 3.4 Quản lý khách hàng
│   ├── 3.5 Quản lý loại phòng
│   ├── 3.6 Quản lý phòng
│   ├── 3.7 Đặt/thuê phòng
│   ├── 3.8 Quản lý dịch vụ
│   ├── 3.9 Sử dụng dịch vụ
│   ├── 3.10 Thanh toán
│   ├── 3.11 Quản lý hóa đơn
│   └── 3.12 Báo cáo doanh thu
│
├── 4. Use Case
│   ├── 4.1 Use Case tổng quan
│   ├── 4.2 Actor Nhân viên lễ tân
│   ├── 4.3 Actor Quản lý
│   └── 4.4 Actor Admin
│
├── 5. Đặc tả Use Case
│   ├── UC01 Đăng nhập
│   ├── UC02 Quản lý khách hàng
│   ├── UC03 Quản lý phòng
│   ├── UC04 Lập phiếu thuê
│   ├── UC05 Quản lý dịch vụ
│   ├── UC06 Thanh toán
│   ├── UC07 Xem hóa đơn
│   ├── UC08 Báo cáo doanh thu
│   ├── UC09 Quản lý nhân viên
│   └── UC10 Quản lý tài khoản
│
├── 6. Yêu cầu phi chức năng
│
├── 7. Quy tắc nghiệp vụ
```

**Quy tắc làm việc với github**

- Không code trực tiếp lên nhánh `main`
- `main`: Code ổn định, dùng để release.
- `develop`: Branch phát triển chung.
- `feature/*`: Phát triển chức năng mới.
- Trước khi code nên làm: 1. Chạy các lệnh sau: `git checkout develop`, `git pull origin develop` 2. Tạo branch: `git checkout -b feature/ten_chuc_nang` 3. Sau khi code xong commit và tạo PR
  **Quy tắc commit**
  feat Thêm chức năng mới
  fix Sửa lỗi
  refactor Thay đổi cấu trúc code, không thêm chức năng
  docs Thay đổi tài liệu
  test Thêm hoặc sửa test
  chore Công việc cấu hình, dependency,...
  style Format code, không thay đổi logic
  Cú pháp commit: `git commit -m "descripsion: thông tin commit đúng theo các mô tả của quy tác"`
  EX: `git commit -m "feat: add room management API"`
  **Quy trình push**

1. Kiểm tra những file đã thay đổi: `git status`
2. `git add .`
3. Tạo commit: `git commit -m "feat: add room management API"`
4. Push: `git push origin feature/ten_chuc_nang`
