# Mapping Pages Frontend - API Endpoints

> Tài liệu này map chi tiết từng page frontend với các API endpoints cần thiết

---

## 📊 Dashboard Page

**File:** `DashboardPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/rooms/dashboard-stats` | GET | Thống kê tổng quan phòng | HIGH |
| `/api/invoices/stats` | GET | Thống kê hóa đơn hôm nay/tháng | HIGH |
| `/api/reports/overview` | GET | Báo cáo tổng quan | HIGH |
| `/api/rooms` | GET | Danh sách phòng (filter by status) | HIGH |
| `/api/rooms/{id}` | GET | Chi tiết phòng (modal) | MEDIUM |
| `/api/booking-details/{id}/status` | PATCH | Cập nhật trạng thái booking | HIGH |

### Data Flow:
```
Dashboard Mount
  ↓
1. Fetch dashboard stats (rooms, invoices, overview)
  ↓
2. Display summary cards
  ↓
3. Fetch rooms list with current bookings
  ↓
4. Display room grid with statuses
  ↓
User clicks room → Show RoomDetailModal
  ↓
5. Fetch room detail
  ↓
User changes status → Update booking status
```

---

## 🏨 Quản lý Phòng Page

**File:** `QuanLyPhongPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/rooms` | GET | Danh sách phòng (có filter, search) | HIGH |
| `/api/rooms/{id}` | GET | Chi tiết phòng | MEDIUM |
| `/api/rooms` | POST | Tạo phòng mới | HIGH |
| `/api/rooms/{id}` | PUT | Cập nhật thông tin phòng | HIGH |
| `/api/rooms/{id}` | DELETE | Xóa phòng | HIGH |
| `/api/rooms/{id}/status` | PATCH | Cập nhật trạng thái nhanh | MEDIUM |
| `/api/room-types` | GET | Danh sách loại phòng (cho dropdown) | HIGH |

### Filter & Search:
- `?status=AVAILABLE`
- `?room_type_id=1`
- `?search=101`

---

## 🛏️ Quản lý Loại Phòng Page

**File:** `QuanLyLoaiPhongPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/room-types` | GET | Danh sách loại phòng | HIGH |
| `/api/room-types/{id}` | GET | Chi tiết loại phòng | MEDIUM |
| `/api/room-types` | POST | Tạo loại phòng mới | HIGH |
| `/api/room-types/{id}` | PUT | Cập nhật loại phòng | HIGH |
| `/api/room-types/{id}` | DELETE | Xóa loại phòng | HIGH |

---

## 👥 Quản lý Khách hàng Page

**File:** `QuanLyKhachHangPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/customers` | GET | Danh sách khách hàng (có pagination) | HIGH |
| `/api/customers/{id}` | GET | Chi tiết khách hàng + lịch sử | MEDIUM |
| `/api/customers` | POST | Tạo khách hàng mới | HIGH |
| `/api/customers/{id}` | PUT | Cập nhật thông tin khách hàng | HIGH |
| `/api/customers/{id}` | DELETE | Xóa khách hàng | HIGH |
| `/api/customers/search` | GET | Tìm kiếm nhanh (autocomplete) | MEDIUM |

### Filter & Search:
- `?search=Nguyen`
- `?gender=male`
- `?nationality=Việt Nam`
- `?page=0&size=10`

---

## 👔 Quản lý Nhân viên Page

**File:** `QuanLyNhanVienPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/employees` | GET | Danh sách nhân viên | HIGH |
| `/api/employees/{id}` | GET | Chi tiết nhân viên | MEDIUM |
| `/api/employees` | POST | Tạo nhân viên mới | HIGH |
| `/api/employees/{id}` | PUT | Cập nhật thông tin nhân viên | HIGH |
| `/api/employees/{id}` | DELETE | Xóa nhân viên | HIGH |
| `/api/employees/{id}/status` | PATCH | Cập nhật trạng thái | MEDIUM |
| `/api/employees/positions` | GET | Danh sách chức vụ (distinct) | LOW |
| `/api/accounts` | POST | Tạo tài khoản cho nhân viên | MEDIUM |
| `/api/accounts/{username}/password` | PUT | Đổi mật khẩu | MEDIUM |

### Filter & Search:
- `?position=Lễ tân`
- `?is_active=true`
- `?search=Le Van`

---

## 🍽️ Quản lý Dịch vụ Page

**File:** `QuanLyDichVuPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/services` | GET | Danh sách dịch vụ | HIGH |
| `/api/services/{id}` | GET | Chi tiết dịch vụ | MEDIUM |
| `/api/services` | POST | Tạo dịch vụ mới | HIGH |
| `/api/services/{id}` | PUT | Cập nhật dịch vụ | HIGH |
| `/api/services/{id}` | DELETE | Xóa dịch vụ | HIGH |
| `/api/service-categories` | GET | Danh sách loại dịch vụ | HIGH |
| `/api/service-categories` | POST | Tạo loại dịch vụ | MEDIUM |
| `/api/service-categories/{id}` | DELETE | Xóa loại dịch vụ | MEDIUM |

### Filter & Search:
- `?category_id=1`
- `?search=Ăn sáng`

### Stats displayed:
- Tổng dịch vụ
- Số loại dịch vụ
- Tổng giá trị
- Tồn kho

---

## 📝 Lập Phiếu Thuê Page

**File:** `LapPhieuThuePage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/customers/search` | GET | Tìm/chọn khách hàng | HIGH |
| `/api/customers` | POST | Tạo khách hàng mới (inline) | HIGH |
| `/api/rooms` | GET | Danh sách phòng trống | HIGH |
| `/api/room-types` | GET | Thông tin giá phòng | HIGH |
| `/api/services` | GET | Danh sách dịch vụ | MEDIUM |
| `/api/rental-receipts` | POST | Tạo phiếu thuê + bookings | HIGH |
| `/api/rental-receipts/{id}` | GET | Xem phiếu thuê vừa tạo | MEDIUM |

### Request Flow:
```
1. User searches customer → `/api/customers/search?q=Nguyen`
2. Select customer or create new → `/api/customers` POST
3. Select rooms (filter available) → `/api/rooms?status=AVAILABLE`
4. Add services (optional) → `/api/services`
5. Calculate total
6. Submit → `/api/rental-receipts` POST
   Body: {
     customer_id,
     employee_id,
     booking_details: [
       {
         room_id,
         check_in_date,
         check_out_date,
         number_of_guests,
         unit_price,
         services: [...]
       }
     ]
   }
```

---

## 🧾 Quản lý Hóa đơn Page

**File:** `QuanLyHoaDonPage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/invoices` | GET | Danh sách hóa đơn (có pagination) | HIGH |
| `/api/invoices/{id}` | GET | Chi tiết hóa đơn (để in) | HIGH |
| `/api/invoices` | POST | Tạo hóa đơn từ phiếu thuê | HIGH |
| `/api/invoices/{id}/payment-status` | PATCH | Cập nhật trạng thái thanh toán | HIGH |
| `/api/rental-receipts/{id}` | GET | Xem phiếu thuê liên quan | MEDIUM |

### Filter & Search:
- `?from_date=2024-01-01&to_date=2024-01-31`
- `?payment_status=UNPAID`
- `?search=Nguyen Van`
- `?page=0&size=10`

### Display features:
- Tổng doanh thu
- Số hóa đơn đã/chưa thanh toán
- Bộ lọc theo thời gian, trạng thái
- In hóa đơn (PDF)

---

## 📊 Báo cáo & Thống kê Page

**File:** `BaoCaoThongKePage.jsx`

### APIs cần thiết:

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/reports/revenue-statistics` | GET | Dữ liệu biểu đồ doanh thu | HIGH |
| `/api/reports/salary-by-position` | GET | Biểu đồ lương theo vị trí | HIGH |
| `/api/employees/salary-by-position` | GET | Chi tiết lương nhân viên | MEDIUM |
| `/api/reports/overview` | GET | Tổng quan (cards) | HIGH |
| `/api/reports/export` | POST | Xuất báo cáo PDF/Excel | LOW |

### Query Parameters:
- `type=month&year=2024&month=1` → Dữ liệu tháng 1/2024
- `type=year&year=2024` → Dữ liệu cả năm 2024

### Charts displayed:
1. **Revenue Chart** (Line/Bar toggle)
   - Theo tháng: Doanh thu từng ngày
   - Theo năm: Doanh thu từng tháng

2. **Salary Chart** (Bar)
   - Tổng lương theo chức vụ

3. **Revenue Table**
   - Chi tiết từng tháng

### Stats Cards:
- Tổng doanh thu
- Tổng chi phí lương
- Lợi nhuận ước tính
- Trung bình/hóa đơn
- Chi phí trung bình/NV

---

## 🔐 Authentication Flow

### Login Page

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/auth/login` | POST | Đăng nhập | HIGH |
| `/api/auth/me` | GET | Lấy thông tin user | HIGH |

### Global (All Pages)

| API Endpoint | Method | Mục đích | Priority |
|--------------|--------|----------|----------|
| `/api/auth/refresh` | POST | Làm mới token | HIGH |
| `/api/auth/logout` | POST | Đăng xuất | MEDIUM |
| `/api/auth/me` | GET | Verify token | MEDIUM |

---

## 📦 API Priority Summary

### HIGH Priority (Cần triển khai ngay)
- ✅ Authentication APIs
- ✅ Rooms & Room Types CRUD
- ✅ Customers CRUD
- ✅ Rental Receipts Create/Read
- ✅ Invoices CRUD
- ✅ Services & Categories CRUD
- ✅ Dashboard Stats
- ✅ Revenue Statistics

### MEDIUM Priority (Tuần 2-3)
- ✅ Employees CRUD
- ✅ Accounts Management
- ✅ Booking Services
- ✅ Detail Views (chi tiết từng entity)
- ✅ Customer Search
- ✅ Room Status Quick Update

### LOW Priority (Tuần 4+)
- ✅ Export Reports
- ✅ Advanced Filters
- ✅ Employee Positions List
- ✅ Comprehensive Search

---

## 🔄 Common API Patterns

### Pagination Request
```
GET /api/customers?page=0&size=10
```

### Search Request
```
GET /api/customers?search=nguyen
```

### Filter Request
```
GET /api/rooms?status=AVAILABLE&room_type_id=1
```

### Date Range Request
```
GET /api/invoices?from_date=2024-01-01&to_date=2024-01-31
```

### Combined Request
```
GET /api/invoices?search=nguyen&payment_status=UNPAID&page=0&size=10
```

---

## 📝 Testing Checklist

### For each API endpoint:

- [ ] **Unit Tests**
  - Request validation
  - Business logic
  - Error handling

- [ ] **Integration Tests**
  - Database operations
  - Transaction handling
  - Cascade operations

- [ ] **API Tests (Postman/Swagger)**
  - Happy path
  - Edge cases
  - Error responses
  - Authentication

- [ ] **Frontend Integration**
  - Data binding
  - Loading states
  - Error handling
  - User feedback

---

## 🎯 Implementation Roadmap

### Week 1: Foundation
- [ ] Setup Spring Boot project structure
- [ ] Configure Database (PostgreSQL)
- [ ] Implement Authentication (JWT)
- [ ] Create base entities & repositories
- [ ] Setup error handling & validation

### Week 2: Core Features
- [ ] Rooms & Room Types APIs
- [ ] Customers APIs
- [ ] Dashboard Stats APIs
- [ ] Frontend integration testing

### Week 3: Main Features
- [ ] Employees & Accounts APIs
- [ ] Services & Categories APIs
- [ ] Rental Receipts APIs (complex)
- [ ] Booking Details APIs

### Week 4: Advanced Features
- [ ] Invoices APIs
- [ ] Booking Services APIs
- [ ] Reports & Statistics APIs
- [ ] Frontend integration

### Week 5: Polish & Testing
- [ ] Export functionality
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Documentation

---

**Last Updated:** 2024-01-20  
**Version:** 1.0
