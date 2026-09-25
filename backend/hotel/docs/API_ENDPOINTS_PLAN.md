# Kế hoạch API Endpoints - Hotel Management System

> **Tài liệu này mô tả chi tiết tất cả API endpoints cần thiết cho hệ thống quản lý khách sạn**  
> Dựa trên Database.md và các pages frontend đã có

---

## 📋 Mục lục

1. [Phòng & Loại phòng](#1-phòng--loại-phòng)
2. [Khách hàng](#2-khách-hàng)
3. [Nhân viên & Tài khoản](#3-nhân-viên--tài-khoản)
4. [Dịch vụ & Loại dịch vụ](#4-dịch-vụ--loại-dịch-vụ)
5. [Phiếu thuê & Đặt phòng](#5-phiếu-thuê--đặt-phòng)
6. [Hóa đơn](#6-hóa-đơn)
7. [Báo cáo & Thống kê](#7-báo-cáo--thống-kê)
8. [Authentication](#8-authentication)

---

## 1. Phòng & Loại phòng

### 1.1 Quản lý Loại phòng (Room Types)

**Page:** `QuanLyLoaiPhongPage.jsx`  
**Database Table:** `room_types`

#### GET `/api/room-types`
Lấy danh sách tất cả loại phòng

**Response:**
```json
[
  {
    "room_type_id": 1,
    "room_type_name": "Phòng Standard",
    "number_of_beds": 2,
    "maximum_occupancy": 2,
    "daily_rate": 500000,
    "hourly_rate": 100000
  }
]
```

#### GET `/api/room-types/{id}`
Lấy thông tin chi tiết một loại phòng

**Response:**
```json
{
  "room_type_id": 1,
  "room_type_name": "Phòng Standard",
  "number_of_beds": 2,
  "maximum_occupancy": 2,
  "daily_rate": 500000,
  "hourly_rate": 100000,
  "room_count": 10
}
```

#### POST `/api/room-types`
Tạo loại phòng mới

**Request Body:**
```json
{
  "room_type_name": "Phòng Deluxe",
  "number_of_beds": 2,
  "maximum_occupancy": 3,
  "daily_rate": 800000,
  "hourly_rate": 150000
}
```

**Response:**
```json
{
  "room_type_id": 5,
  "room_type_name": "Phòng Deluxe",
  "number_of_beds": 2,
  "maximum_occupancy": 3,
  "daily_rate": 800000,
  "hourly_rate": 150000
}
```

#### PUT `/api/room-types/{id}`
Cập nhật thông tin loại phòng

**Request Body:**
```json
{
  "room_type_name": "Phòng Deluxe Plus",
  "number_of_beds": 2,
  "maximum_occupancy": 3,
  "daily_rate": 900000,
  "hourly_rate": 180000
}
```

#### DELETE `/api/room-types/{id}`
Xóa loại phòng (chỉ xóa được nếu không có phòng nào đang sử dụng)

**Response:**
```json
{
  "message": "Xóa loại phòng thành công"
}
```

---

### 1.2 Quản lý Phòng (Rooms)

**Page:** `QuanLyPhongPage.jsx`, `DashboardPage.jsx`  
**Database Table:** `rooms`

#### GET `/api/rooms`
Lấy danh sách phòng (có thể lọc)

**Query Parameters:**
- `status` (optional): AVAILABLE, UNDER_MAINTENANCE
- `room_type_id` (optional): Filter theo loại phòng
- `search` (optional): Tìm kiếm theo mã phòng

**Response:**
```json
[
  {
    "room_id": 1,
    "room_code": "101",
    "room_status": "AVAILABLE",
    "room_type_id": 1,
    "room_type_name": "Phòng Standard",
    "daily_rate": 500000,
    "hourly_rate": 100000,
    "note": null
  }
]
```

#### GET `/api/rooms/{id}`
Lấy thông tin chi tiết phòng

**Response:**
```json
{
  "room_id": 1,
  "room_code": "101",
  "room_status": "AVAILABLE",
  "room_type": {
    "room_type_id": 1,
    "room_type_name": "Phòng Standard",
    "number_of_beds": 2,
    "maximum_occupancy": 2,
    "daily_rate": 500000,
    "hourly_rate": 100000
  },
  "note": null,
  "current_booking": null
}
```

#### GET `/api/rooms/dashboard-stats`
Lấy thống kê phòng cho Dashboard

**Response:**
```json
{
  "total_rooms": 50,
  "available_rooms": 30,
  "checked_in_rooms": 15,
  "cleaning_rooms": 3,
  "maintenance_rooms": 2,
  "rooms_by_type": [
    {
      "room_type_name": "Standard",
      "total": 20,
      "available": 12
    }
  ]
}
```

#### POST `/api/rooms`
Tạo phòng mới

**Request Body:**
```json
{
  "room_code": "301",
  "room_type_id": 1,
  "room_status": "AVAILABLE",
  "note": "Phòng view biển"
}
```

#### PUT `/api/rooms/{id}`
Cập nhật thông tin phòng

**Request Body:**
```json
{
  "room_code": "301A",
  "room_type_id": 2,
  "room_status": "UNDER_MAINTENANCE",
  "note": "Đang sửa điều hòa"
}
```

#### PATCH `/api/rooms/{id}/status`
Cập nhật trạng thái phòng (nhanh)

**Request Body:**
```json
{
  "room_status": "AVAILABLE"
}
```

#### DELETE `/api/rooms/{id}`
Xóa phòng

---

## 2. Khách hàng

**Page:** `QuanLyKhachHangPage.jsx`  
**Database Table:** `customers`

#### GET `/api/customers`
Lấy danh sách khách hàng

**Query Parameters:**
- `search` (optional): Tìm kiếm theo tên, SĐT, CCCD
- `gender` (optional): male, female, other
- `nationality` (optional): Lọc theo quốc tịch
- `page` (optional): Số trang
- `size` (optional): Số lượng/trang

**Response:**
```json
{
  "content": [
    {
      "customer_id": 1,
      "full_name": "Nguyễn Văn An",
      "phone": "0901234567",
      "citizen_id_passport": "001234567890",
      "nationality": "Việt Nam",
      "gender": "male"
    }
  ],
  "total_elements": 100,
  "total_pages": 10,
  "current_page": 0,
  "page_size": 10
}
```

#### GET `/api/customers/{id}`
Lấy thông tin chi tiết khách hàng

**Response:**
```json
{
  "customer_id": 1,
  "full_name": "Nguyễn Văn An",
  "phone": "0901234567",
  "citizen_id_passport": "001234567890",
  "nationality": "Việt Nam",
  "gender": "male",
  "rental_history": [
    {
      "rental_receipt_id": 10,
      "rental_date": "2024-01-15",
      "total_amount": 1500000,
      "status": "completed"
    }
  ],
  "total_bookings": 5,
  "total_spent": 7500000
}
```

#### GET `/api/customers/search`
Tìm kiếm khách hàng (autocomplete)

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm

**Response:**
```json
[
  {
    "customer_id": 1,
    "full_name": "Nguyễn Văn An",
    "phone": "0901234567",
    "citizen_id_passport": "001234567890"
  }
]
```

#### POST `/api/customers`
Tạo khách hàng mới

**Request Body:**
```json
{
  "full_name": "Trần Thị Bình",
  "phone": "0912345678",
  "citizen_id_passport": "002345678901",
  "nationality": "Việt Nam",
  "gender": "female"
}
```

#### PUT `/api/customers/{id}`
Cập nhật thông tin khách hàng

**Request Body:**
```json
{
  "full_name": "Trần Thị Bình",
  "phone": "0912345678",
  "citizen_id_passport": "002345678901",
  "nationality": "Việt Nam",
  "gender": "female"
}
```

#### DELETE `/api/customers/{id}`
Xóa khách hàng

---

## 3. Nhân viên & Tài khoản

**Page:** `QuanLyNhanVienPage.jsx`  
**Database Tables:** `employees`, `accounts`

### 3.1 Nhân viên (Employees)

#### GET `/api/employees`
Lấy danh sách nhân viên

**Query Parameters:**
- `position` (optional): Lọc theo chức vụ
- `is_active` (optional): true/false
- `search` (optional): Tìm kiếm theo tên, SĐT

**Response:**
```json
[
  {
    "employee_id": 1,
    "full_name": "Lê Văn Cường",
    "position": "Lễ tân",
    "salary": 8000000,
    "phone": "0923456789",
    "citizen_id": "003456789012",
    "date_of_birth": "1995-05-20",
    "gender": "male",
    "address": "123 Nguyễn Huệ, Q.1, TP.HCM",
    "email": "cuong.lv@hotel.com",
    "avatar": null,
    "is_active": true,
    "has_account": true
  }
]
```

#### GET `/api/employees/{id}`
Lấy thông tin chi tiết nhân viên

**Response:**
```json
{
  "employee_id": 1,
  "full_name": "Lê Văn Cường",
  "position": "Lễ tân",
  "salary": 8000000,
  "phone": "0923456789",
  "citizen_id": "003456789012",
  "date_of_birth": "1995-05-20",
  "gender": "male",
  "address": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "email": "cuong.lv@hotel.com",
  "avatar": null,
  "is_active": true,
  "account": {
    "username": "cuonglv",
    "role": 1,
    "is_active": true
  },
  "work_statistics": {
    "total_rental_receipts": 50,
    "total_invoices": 45
  }
}
```

#### GET `/api/employees/positions`
Lấy danh sách chức vụ (distinct)

**Response:**
```json
[
  "Quản lý",
  "Lễ tân",
  "Kế toán",
  "Bảo vệ",
  "Tạp vụ"
]
```

#### GET `/api/employees/salary-by-position`
Lấy thống kê lương theo chức vụ (cho báo cáo)

**Response:**
```json
[
  {
    "position": "Quản lý",
    "total_salary": 45000000,
    "employee_count": 3,
    "avg_salary": 15000000
  }
]
```

#### POST `/api/employees`
Tạo nhân viên mới

**Request Body:**
```json
{
  "full_name": "Phạm Thị Dung",
  "position": "Lễ tân",
  "salary": 8000000,
  "phone": "0934567890",
  "citizen_id": "004567890123",
  "date_of_birth": "1998-08-15",
  "gender": "female",
  "address": "456 Lê Lợi, Q.1, TP.HCM",
  "email": "dung.pt@hotel.com"
}
```

#### PUT `/api/employees/{id}`
Cập nhật thông tin nhân viên

#### PATCH `/api/employees/{id}/status`
Cập nhật trạng thái hoạt động

**Request Body:**
```json
{
  "is_active": false
}
```

#### DELETE `/api/employees/{id}`
Xóa nhân viên

---

### 3.2 Tài khoản (Accounts)

#### GET `/api/accounts`
Lấy danh sách tài khoản

**Response:**
```json
[
  {
    "username": "admin",
    "role": 0,
    "role_name": "Admin",
    "is_active": true,
    "employee": {
      "employee_id": 1,
      "full_name": "Nguyễn Văn Admin"
    }
  }
]
```

#### POST `/api/accounts`
Tạo tài khoản cho nhân viên

**Request Body:**
```json
{
  "username": "dungpt",
  "password": "password123",
  "role": 1,
  "employee_id": 5
}
```

#### PUT `/api/accounts/{username}/password`
Đổi mật khẩu

**Request Body:**
```json
{
  "old_password": "password123",
  "new_password": "newpassword456"
}
```

#### PATCH `/api/accounts/{username}/status`
Cập nhật trạng thái tài khoản

**Request Body:**
```json
{
  "is_active": false
}
```

---

## 4. Dịch vụ & Loại dịch vụ

**Page:** `QuanLyDichVuPage.jsx`  
**Database Tables:** `services`, `service_categories`

### 4.1 Loại dịch vụ (Service Categories)

#### GET `/api/service-categories`
Lấy danh sách loại dịch vụ

**Response:**
```json
[
  {
    "service_category_id": 1,
    "category_name": "Ăn uống",
    "service_count": 10
  }
]
```

#### POST `/api/service-categories`
Tạo loại dịch vụ mới

**Request Body:**
```json
{
  "category_name": "Spa & Massage"
}
```

#### PUT `/api/service-categories/{id}`
Cập nhật loại dịch vụ

#### DELETE `/api/service-categories/{id}`
Xóa loại dịch vụ

---

### 4.2 Dịch vụ (Services)

#### GET `/api/services`
Lấy danh sách dịch vụ

**Query Parameters:**
- `category_id` (optional): Lọc theo loại dịch vụ
- `search` (optional): Tìm kiếm theo tên

**Response:**
```json
[
  {
    "service_id": 1,
    "service_name": "Ăn sáng buffet",
    "unit_price": 150000,
    "stock_quantity": 100,
    "unit": "suất",
    "service_category_id": 1,
    "category_name": "Ăn uống"
  }
]
```

#### GET `/api/services/{id}`
Lấy thông tin chi tiết dịch vụ

#### POST `/api/services`
Tạo dịch vụ mới

**Request Body:**
```json
{
  "service_name": "Massage body",
  "unit_price": 500000,
  "stock_quantity": null,
  "unit": "giờ",
  "service_category_id": 3
}
```

#### PUT `/api/services/{id}`
Cập nhật dịch vụ

#### DELETE `/api/services/{id}`
Xóa dịch vụ

---

## 5. Phiếu thuê & Đặt phòng

**Page:** `LapPhieuThuePage.jsx`, `DashboardPage.jsx`  
**Database Tables:** `rental_receipts`, `booking_details`, `booking_detail_services`

### 5.1 Phiếu thuê (Rental Receipts)

#### GET `/api/rental-receipts`
Lấy danh sách phiếu thuê

**Query Parameters:**
- `from_date` (optional): Từ ngày
- `to_date` (optional): Đến ngày
- `customer_id` (optional): Lọc theo khách hàng
- `status` (optional): Trạng thái đặt phòng

**Response:**
```json
[
  {
    "rental_receipt_id": 1,
    "rental_date": "2024-01-15",
    "customer": {
      "customer_id": 1,
      "full_name": "Nguyễn Văn An",
      "phone": "0901234567"
    },
    "employee": {
      "employee_id": 2,
      "full_name": "Lê Văn Cường"
    },
    "booking_count": 2,
    "total_amount": 2500000,
    "has_invoice": true
  }
]
```

#### GET `/api/rental-receipts/{id}`
Lấy chi tiết phiếu thuê

**Response:**
```json
{
  "rental_receipt_id": 1,
  "rental_date": "2024-01-15",
  "customer": {
    "customer_id": 1,
    "full_name": "Nguyễn Văn An",
    "phone": "0901234567",
    "citizen_id_passport": "001234567890"
  },
  "employee": {
    "employee_id": 2,
    "full_name": "Lê Văn Cường"
  },
  "booking_details": [
    {
      "booking_detail_id": 1,
      "room": {
        "room_id": 5,
        "room_code": "201",
        "room_type_name": "Deluxe"
      },
      "number_of_guests": 2,
      "check_in_date": "2024-01-15",
      "check_out_date": "2024-01-17",
      "booking_status": "CHECKED_IN",
      "unit_price": 800000,
      "total_amount": 1600000,
      "services": [
        {
          "service_id": 1,
          "service_name": "Ăn sáng buffet",
          "unit_price": 150000,
          "quantity": 4,
          "total_amount": 600000
        }
      ]
    }
  ],
  "grand_total": 2500000,
  "invoice": {
    "invoice_id": 15,
    "invoice_date": "2024-01-17",
    "payment_status": "PAID"
  }
}
```

#### POST `/api/rental-receipts`
Tạo phiếu thuê mới

**Request Body:**
```json
{
  "customer_id": 1,
  "employee_id": 2,
  "booking_details": [
    {
      "room_id": 5,
      "number_of_guests": 2,
      "check_in_date": "2024-01-20",
      "check_out_date": "2024-01-22",
      "booking_status": "RESERVED",
      "unit_price": 800000
    }
  ]
}
```

**Response:**
```json
{
  "rental_receipt_id": 20,
  "rental_date": "2024-01-20",
  "message": "Tạo phiếu thuê thành công"
}
```

#### PUT `/api/rental-receipts/{id}`
Cập nhật phiếu thuê

---

### 5.2 Chi tiết đặt phòng (Booking Details)

#### GET `/api/booking-details/{id}`
Lấy chi tiết một booking

#### PATCH `/api/booking-details/{id}/status`
Cập nhật trạng thái đặt phòng

**Request Body:**
```json
{
  "booking_status": "CHECKED_IN"
}
```

#### POST `/api/booking-details/{id}/services`
Thêm dịch vụ vào booking

**Request Body:**
```json
{
  "service_id": 1,
  "quantity": 2
}
```

#### DELETE `/api/booking-details/{booking_id}/services/{service_id}`
Xóa dịch vụ khỏi booking

#### PUT `/api/booking-details/{booking_id}/services/{service_id}`
Cập nhật số lượng dịch vụ

**Request Body:**
```json
{
  "quantity": 5
}
```

---

## 6. Hóa đơn

**Page:** `QuanLyHoaDonPage.jsx`  
**Database Table:** `invoices`

#### GET `/api/invoices`
Lấy danh sách hóa đơn

**Query Parameters:**
- `from_date` (optional): Từ ngày
- `to_date` (optional): Đến ngày
- `payment_status` (optional): PAID, UNPAID
- `search` (optional): Tìm kiếm theo mã hóa đơn, tên khách

**Response:**
```json
{
  "content": [
    {
      "invoice_id": 1,
      "invoice_date": "2024-01-17",
      "total_amount": 2500000,
      "payment_status": "PAID",
      "customer": {
        "customer_id": 1,
        "full_name": "Nguyễn Văn An",
        "phone": "0901234567"
      },
      "employee": {
        "employee_id": 2,
        "full_name": "Lê Văn Cường"
      },
      "rental_receipt_id": 1
    }
  ],
  "total_elements": 150,
  "total_pages": 15,
  "current_page": 0
}
```

#### GET `/api/invoices/{id}`
Lấy chi tiết hóa đơn (để in)

**Response:**
```json
{
  "invoice_id": 1,
  "invoice_date": "2024-01-17",
  "total_amount": 2500000,
  "payment_status": "PAID",
  "customer": {
    "customer_id": 1,
    "full_name": "Nguyễn Văn An",
    "phone": "0901234567",
    "citizen_id_passport": "001234567890"
  },
  "employee": {
    "employee_id": 2,
    "full_name": "Lê Văn Cường"
  },
  "rental_receipt": {
    "rental_receipt_id": 1,
    "rental_date": "2024-01-15",
    "booking_details": [
      {
        "room_code": "201",
        "room_type_name": "Deluxe",
        "check_in_date": "2024-01-15",
        "check_out_date": "2024-01-17",
        "nights": 2,
        "unit_price": 800000,
        "total_amount": 1600000,
        "services": [
          {
            "service_name": "Ăn sáng buffet",
            "unit_price": 150000,
            "quantity": 4,
            "total_amount": 600000
          }
        ]
      }
    ]
  }
}
```

#### POST `/api/invoices`
Tạo hóa đơn từ phiếu thuê

**Request Body:**
```json
{
  "rental_receipt_id": 20,
  "employee_id": 2,
  "payment_status": "PAID"
}
```

#### PATCH `/api/invoices/{id}/payment-status`
Cập nhật trạng thái thanh toán

**Request Body:**
```json
{
  "payment_status": "PAID"
}
```

#### GET `/api/invoices/stats`
Thống kê hóa đơn (cho Dashboard)

**Response:**
```json
{
  "today": {
    "total_invoices": 5,
    "total_amount": 12500000,
    "paid_amount": 10000000,
    "unpaid_amount": 2500000
  },
  "this_month": {
    "total_invoices": 150,
    "total_amount": 375000000
  }
}
```

---

## 7. Báo cáo & Thống kê

**Page:** `BaoCaoThongKePage.jsx`  
**Database Table:** `monthly_revenue_statistics`

#### GET `/api/reports/revenue-statistics`
Lấy thống kê doanh thu

**Query Parameters:**
- `type` (required): month, year
- `year` (required): Năm
- `month` (optional): Tháng (bắt buộc nếu type=month)

**Response (type=year):**
```json
[
  {
    "statistic_id": 1,
    "year": 2024,
    "month": 1,
    "total_revenue": 125000000,
    "invoice_count": 45,
    "last_updated_at": "2024-01-31T23:59:59"
  },
  {
    "statistic_id": 2,
    "year": 2024,
    "month": 2,
    "total_revenue": 138000000,
    "invoice_count": 52,
    "last_updated_at": "2024-02-29T23:59:59"
  }
]
```

**Response (type=month):**
```json
{
  "year": 2024,
  "month": 1,
  "total_revenue": 125000000,
  "invoice_count": 45,
  "daily_breakdown": [
    {
      "day": 1,
      "revenue": 4200000,
      "invoice_count": 2
    },
    {
      "day": 2,
      "revenue": 3800000,
      "invoice_count": 1
    }
  ]
}
```

#### GET `/api/reports/salary-by-position`
Lấy thống kê lương theo chức vụ

**Response:**
```json
[
  {
    "position": "Quản lý",
    "total_salary": 45000000,
    "employee_count": 3,
    "avg_salary": 15000000
  },
  {
    "position": "Lễ tân",
    "total_salary": 36000000,
    "employee_count": 6,
    "avg_salary": 6000000
  }
]
```

#### GET `/api/reports/overview`
Báo cáo tổng quan (Dashboard)

**Query Parameters:**
- `from_date` (optional): Từ ngày
- `to_date` (optional): Đến ngày

**Response:**
```json
{
  "revenue": {
    "total": 125000000,
    "growth_percentage": 12.5
  },
  "bookings": {
    "total": 45,
    "checked_in": 15,
    "reserved": 20,
    "cleaning": 10
  },
  "rooms": {
    "total": 50,
    "available": 30,
    "occupancy_rate": 40
  },
  "customers": {
    "total": 500,
    "new_this_month": 25
  },
  "top_services": [
    {
      "service_name": "Ăn sáng buffet",
      "total_quantity": 120,
      "total_revenue": 18000000
    }
  ]
}
```

#### POST `/api/reports/export`
Xuất báo cáo (PDF/Excel)

**Request Body:**
```json
{
  "report_type": "revenue",
  "format": "pdf",
  "year": 2024,
  "month": 1
}
```

**Response:**
```json
{
  "file_url": "/downloads/report_2024_01.pdf",
  "file_name": "BaoCaoDoanhThu_2024_01.pdf"
}
```

---

## 8. Authentication

#### POST `/api/auth/login`
Đăng nhập

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "username": "admin",
    "role": 0,
    "role_name": "Admin",
    "employee": {
      "employee_id": 1,
      "full_name": "Nguyễn Văn Admin",
      "avatar": null
    }
  }
}
```

#### POST `/api/auth/logout`
Đăng xuất

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/refresh`
Làm mới token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### GET `/api/auth/me`
Lấy thông tin user hiện tại

**Response:**
```json
{
  "username": "admin",
  "role": 0,
  "role_name": "Admin",
  "employee": {
    "employee_id": 1,
    "full_name": "Nguyễn Văn Admin",
    "position": "Quản lý",
    "email": "admin@hotel.com",
    "avatar": null
  }
}
```

---

## 📝 Ghi chú quan trọng

### Quy ước chung

1. **Base URL**: `http://localhost:8080/api`
2. **Authentication**: Tất cả API (trừ `/auth/login`) yêu cầu JWT token trong header:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Response Format**:
   - Success: Status 200-299
   - Client Error: Status 400-499
   - Server Error: Status 500-599

### Error Response Format

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "room_code",
      "message": "Mã phòng đã tồn tại"
    }
  ],
  "path": "/api/rooms"
}
```

### Pagination Format (khi có)

```json
{
  "content": [...],
  "page": {
    "size": 10,
    "number": 0,
    "total_elements": 100,
    "total_pages": 10
  }
}
```

### Date Format

- **ISO 8601**: `YYYY-MM-DD` (ví dụ: `2024-01-20`)
- **DateTime**: `YYYY-MM-DDTHH:mm:ss` (ví dụ: `2024-01-20T14:30:00`)

### Role Codes

- `0`: Admin (Quản trị viên)
- `1`: Receptionist (Lễ tân)
- `2`: Manager (Quản lý)

### Status Values

**Room Status:**
- `AVAILABLE`: Phòng trống
- `UNDER_MAINTENANCE`: Đang bảo trì

**Booking Status:**
- `RESERVED`: Đã đặt
- `CHECKED_IN`: Đang thuê
- `CLEANING`: Đang dọn dẹp

**Payment Status:**
- `PAID`: Đã thanh toán
- `UNPAID`: Chưa thanh toán

---

## 🔄 Thứ tự triển khai đề xuất

### Phase 1: Core (Tuần 1-2)
1. ✅ Authentication APIs
2. ✅ Room Types APIs
3. ✅ Rooms APIs
4. ✅ Customers APIs

### Phase 2: Main Features (Tuần 3-4)
5. ✅ Employees & Accounts APIs
6. ✅ Service Categories & Services APIs
7. ✅ Rental Receipts & Booking Details APIs

### Phase 3: Advanced (Tuần 5-6)
8. ✅ Invoices APIs
9. ✅ Booking Services APIs
10. ✅ Reports & Statistics APIs

### Phase 4: Polish (Tuần 7)
11. ✅ Export Reports
12. ✅ Advanced Filters
13. ✅ Performance Optimization
14. ✅ Testing & Bug Fixes

---

**Tài liệu được tạo:** 2024-01-20  
**Phiên bản:** 1.0  
**Tác giả:** Development Team
