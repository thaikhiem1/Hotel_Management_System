# 📋 Hướng dẫn Test Dashboard - Hotel Management

## ✅ Đã sửa các lỗi

### 1. **Nút "Hoàn thành bảo trì" bị mất**
- **Nguyên nhân**: `userRole = 1` (Lễ tân) không có quyền, action yêu cầu roles `[0, 2]` (Admin/Quản lý)
- **Giải pháp**: Đổi `userRole = 0` (Admin) trong RoomCard.jsx để test đầy đủ chức năng
- **Production**: Cần lấy role thực từ AuthContext/Redux

### 2. **Export components trong index.js**
- Đã đảm bảo đúng thứ tự export:
  - ✅ DateTimeFilter
  - ✅ QuickActions
  - ✅ StatCard
  - ✅ RoomFilterTabs
  - ✅ RoomGrid
  - ✅ RoomCard
  - ✅ RoomDetailModal
  - ✅ AddServiceModal

## 🎯 Các trạng thái phòng và Actions

### 1. **Trống/Sẵn sàng (Available)**
- 🔹 Xem chi tiết → Modal RoomDetailModal
- 🔹 Đặt phòng → Alert (TODO: navigate to booking page)

### 2. **Đã đặt (Reserved)**
- 🔹 Xem chi tiết → Modal RoomDetailModal (hiển thị thông tin khách + thời gian check-in)
- 🔹 Nhận phòng (Admin/Lễ tân) → Confirm dialog
- 🔹 Hủy đặt (Admin/Quản lý) → Confirm dialog

### 3. **Đang có khách (Occupied)**
- 🔹 Xem chi tiết → Modal RoomDetailModal (hiển thị khách + danh sách dịch vụ đã dùng)
- 🔹 **Thêm dịch vụ (Admin/Lễ tân)** → Modal AddServiceModal
- 🔹 Trả phòng (Admin/Lễ tân) → Confirm dialog

### 4. **Đang dọn dẹp (Cleaning)**
- 🔹 Xem chi tiết → Modal RoomDetailModal
- 🔹 Đánh dấu sẵn sàng (Admin/Lễ tân) → Confirm dialog

### 5. **Đang bảo trì (Maintenance)**
- 🔹 Xem chi tiết → Modal RoomDetailModal (hiển thị lý do bảo trì)
- 🔹 **Hoàn thành bảo trì (Admin/Quản lý)** → Confirm dialog

## 🧪 Cách Test chức năng "Thêm dịch vụ"

### Flow chính:
1. Tìm phòng có trạng thái **"Đang có khách"** (màu xanh, icon person)
2. Click nút **"Thêm dịch vụ"** trên card phòng
3. Modal AddServiceModal sẽ mở với:
   - Header: Thông tin phòng + khách
   - Thanh tìm kiếm dịch vụ
   - Tabs lọc theo nhóm (Tất cả, Ăn uống, Giặt ủi, Spa, Vận chuyển, Giải trí, Khác)
   - Grid 2 cột hiển thị các dịch vụ
4. Chọn dịch vụ → Điều chỉnh số lượng
5. Xem tổng tiền tự động tính
6. Click **"Xác nhận thêm dịch vụ"**
7. Alert hiển thị kết quả
8. Modal đóng

### Flow xem chi tiết sau khi thêm dịch vụ:
1. Click nút **"Xem chi tiết"** trên cùng card phòng
2. Modal RoomDetailModal mở với:
   - Thông tin phòng
   - Thông tin khách hàng
   - **Danh sách dịch vụ đã sử dụng** (mock 3 dịch vụ)
   - Tổng tiền dịch vụ
   - Nút "Thêm dịch vụ" ở section dịch vụ → Mở AddServiceModal

## 🔍 Debug nếu có lỗi

### Lỗi: "Cannot read property of undefined"
```javascript
// Kiểm tra trong console:
console.log('Selected Room:', selectedRoom);
console.log('Is Add Service Modal Open:', isAddServiceModalOpen);
```

### Lỗi: Modal không hiển thị
- Check state trong DashboardPage:
  - `isDetailModalOpen` - Modal xem chi tiết
  - `isAddServiceModalOpen` - Modal thêm dịch vụ
  - `selectedRoom` - Phòng được chọn

### Lỗi: Không tìm thấy component
```bash
# Restart dev server
npm run dev
```

## 📝 Mock Data cho Test

### Phòng "Đang có khách" (để test thêm dịch vụ):
- **P101** - Khách: Nguyễn Văn An
- **P102** - Khách: Trần Thị Bình  
- **P107** - Khách: Trần Thị Bình

### Phòng "Đã đặt" (để test xem chi tiết):
- **P103** - Khách: Lê Minh Cường

### Phòng "Đang bảo trì" (để test hoàn thành bảo trì):
- **P105** - Lý do: Đang bảo trì điều hòa và hệ thống nước

## 🔐 Phân quyền Actions

| Action | Admin (0) | Lễ tân (1) | Quản lý (2) |
|--------|-----------|------------|-------------|
| Xem chi tiết | ✅ | ✅ | ✅ |
| Đặt phòng | ✅ | ✅ | ✅ |
| Nhận phòng | ✅ | ✅ | ❌ |
| Hủy đặt | ✅ | ❌ | ✅ |
| Thêm dịch vụ | ✅ | ✅ | ❌ |
| Trả phòng | ✅ | ✅ | ❌ |
| Đánh dấu sẵn sàng | ✅ | ✅ | ❌ |
| Hoàn thành bảo trì | ✅ | ❌ | ✅ |

## 🚀 Checklist trước khi deploy

- [ ] Thay `userRole = 0` bằng role thực từ auth context
- [ ] Thay mock data bằng API calls thực
- [ ] Test tất cả actions với các roles khác nhau
- [ ] Test responsive trên mobile/tablet
- [ ] Xử lý error states (API fail, network error)
- [ ] Thêm loading states cho các actions
- [ ] Validate input trước khi submit
- [ ] Add confirmation dialogs cho actions quan trọng
- [ ] Log actions để audit
- [ ] Test với data thực từ backend

## 📞 Liên hệ nếu cần hỗ trợ
Nếu gặp lỗi, cung cấp:
1. Screenshot lỗi
2. Console log
3. Bước tái hiện lỗi
4. Browser và version
