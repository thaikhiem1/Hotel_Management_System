# Room Management Components

Tài liệu này mô tả các component được sử dụng trong trang **Quản lý phòng** (QuanLyPhongPage).

## 📁 Cấu trúc thư mục

```
room-management/
├── RoomTable.jsx              # Bảng hiển thị danh sách phòng
├── RoomFormDialog.jsx         # Dialog thêm/sửa phòng
├── DeleteConfirmDialog.jsx    # Dialog xác nhận xóa
├── index.js                   # Export tất cả components
└── README.md                  # Tài liệu này
```

## 🎯 Chức năng

### 1. QuanLyPhongPage (Component chính)
**File:** `src/pages/dashboard/QuanLyPhongPage.jsx`

**Chức năng chính:**
- Hiển thị danh sách phòng với phân trang
- Thống kê tổng quan (tổng số phòng, phòng trống, phòng đang bảo trì)
- Quản lý các thao tác CRUD: Thêm, Sửa, Xóa
- Xử lý các dialog con

**Props:** Không có (component độc lập)

**State:**
- `rooms`: Danh sách phòng (hiện tại dùng mockData)
- `isFormDialogOpen`: Trạng thái mở/đóng dialog form
- `isDeleteDialogOpen`: Trạng thái mở/đóng dialog xác nhận xóa
- `editMode`: Chế độ 'add' hoặc 'edit'
- `selectedRoom`: Phòng được chọn để sửa/xóa
- `currentPage`: Trang hiện tại
- `isLoading`: Trạng thái loading

---

### 2. RoomTable
**File:** `RoomTable.jsx`

**Chức năng:**
Hiển thị bảng danh sách phòng với các cột:
- **ID Phòng**: Có icon, hiển thị IdPH
- **Mã phòng**: MaPH (P101, P102...)
- **Loại phòng**: TenLPH từ bảng LoaiPhong
- **Giá ngày**: GiaNgay được format theo VNĐ
- **Trạng thái**: Badge trực quan (Trống/Đang sửa chữa)
- **Ghi chú**: GhiChu của phòng
- **Thao tác**: Nút Sửa và Xóa

**Props:**
```javascript
{
  rooms: Array,          // Danh sách phòng cần hiển thị
  onEdit: Function,      // Callback khi nhấn nút Sửa
  onDelete: Function,    // Callback khi nhấn nút Xóa
  isLoading: Boolean     // Trạng thái loading
}
```

**Ví dụ sử dụng:**
```jsx
<RoomTable
  rooms={paginatedRooms}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={isLoading}
/>
```

---

### 3. RoomFormDialog
**File:** `RoomFormDialog.jsx`

**Chức năng:**
Dialog form để thêm mới hoặc chỉnh sửa thông tin phòng với các trường:
- **Mã phòng** (MaPH): Required, unique, không được sửa khi ở chế độ edit
- **Loại phòng** (IdLPH): Required, select dropdown từ bảng LoaiPhong
- **Trạng thái** (TrangThaiPhong): Required, radio buttons (0: Trống, 1: Đang sửa chữa)
- **Ghi chú** (GhiChu): Optional, textarea

**Props:**
```javascript
{
  isOpen: Boolean,           // Trạng thái mở/đóng
  onClose: Function,         // Callback khi đóng
  onSubmit: Function,        // Callback khi submit
  editMode: String,          // 'add' hoặc 'edit'
  roomData: Object|null,     // Dữ liệu phòng (null khi thêm mới)
  loaiPhongList: Array,      // Danh sách loại phòng
  isLoading: Boolean         // Trạng thái loading
}
```

**Data Binding:**
- Khi `editMode === 'edit'` và `roomData` có giá trị, form sẽ tự động binding dữ liệu từ phòng được chọn
- Khi `editMode === 'add'` hoặc `roomData === null`, form sẽ reset về trạng thái mặc định

**Validation:**
- Mã phòng không được để trống
- Mã phòng chỉ chứa chữ cái và số
- Loại phòng phải được chọn

**Ví dụ sử dụng:**
```jsx
<RoomFormDialog
  isOpen={isFormDialogOpen}
  onClose={() => setIsFormDialogOpen(false)}
  onSubmit={handleSubmitForm}
  editMode={editMode}
  roomData={selectedRoom}
  loaiPhongList={mockLoaiPhong}
  isLoading={isLoading}
/>
```

---

### 4. DeleteConfirmDialog
**File:** `DeleteConfirmDialog.jsx`

**Chức năng:**
Dialog xác nhận trước khi xóa phòng, hiển thị:
- Thông tin phòng sẽ bị xóa (mã phòng, loại phòng, trạng thái, ghi chú)
- Cảnh báo về việc xóa vĩnh viễn
- Các nút Hủy và Xác nhận xóa

**Props:**
```javascript
{
  isOpen: Boolean,         // Trạng thái mở/đóng
  onClose: Function,       // Callback khi đóng
  onConfirm: Function,     // Callback khi xác nhận xóa
  roomData: Object|null,   // Dữ liệu phòng cần xóa
  isLoading: Boolean       // Trạng thái loading
}
```

**Ví dụ sử dụng:**
```jsx
<DeleteConfirmDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={handleConfirmDelete}
  roomData={selectedRoom}
  isLoading={isLoading}
/>
```

---

## 🔐 Phân quyền (Authorization)

### Các quyền theo Role (từ Database.md):
- **Role 0 (Admin)**: Full quyền - Xem, Thêm, Sửa, Xóa
- **Role 1 (Lễ tân)**: Chỉ xem - KHÔNG có quyền Thêm, Sửa, Xóa
- **Role 2 (Quản lý)**: Xem, Thêm, Sửa - KHÔNG có quyền Xóa

### Vị trí cần implement phân quyền:

#### 1. QuanLyPhongPage.jsx
```javascript
// Nút "Thêm phòng mới" - Dòng ~147
// TODO: AUTHORIZATION - Chỉ Admin (Role 0) và Quản lý (Role 2) có quyền
<button onClick={handleAddNew} ... >
```

#### 2. RoomTable.jsx
```javascript
// Nút "Sửa" - Dòng ~149
// TODO: AUTHORIZATION - Chỉ Admin và Quản lý
<button onClick={() => onEdit(room)} ... >

// Nút "Xóa" - Dòng ~158
// TODO: AUTHORIZATION - Chỉ Admin
<button onClick={() => onDelete(room)} ... >
```

### Cách implement (ví dụ):
```javascript
// Giả sử có context AuthContext cung cấp thông tin user
const { user } = useAuth();
const canEdit = user.Role === 0 || user.Role === 2; // Admin hoặc Quản lý
const canDelete = user.Role === 0; // Chỉ Admin

// Sử dụng trong JSX
{canEdit && (
  <button onClick={handleAddNew}>Thêm phòng mới</button>
)}

{canEdit && (
  <button onClick={() => onEdit(room)}>Sửa</button>
)}

{canDelete && (
  <button onClick={() => onDelete(room)}>Xóa</button>
)}
```

---

## 🔌 API Integration

### Các điểm cần tích hợp API:

#### 1. Load danh sách phòng
**File:** `QuanLyPhongPage.jsx` - useEffect khi component mount

```javascript
// TODO: API INTEGRATION
useEffect(() => {
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/phong');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchRooms();
}, []);
```

#### 2. Thêm phòng mới
**File:** `QuanLyPhongPage.jsx` - hàm `handleSubmitForm()` (dòng ~90)

```javascript
// TODO: Replace with actual API call
const response = await fetch('/api/phong', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(roomData)
});

if (!response.ok) throw new Error('Failed to create room');
const newRoom = await response.json();
```

#### 3. Cập nhật phòng
**File:** `QuanLyPhongPage.jsx` - hàm `handleSubmitForm()` (dòng ~90)

```javascript
// TODO: Replace with actual API call
const response = await fetch(`/api/phong/${selectedRoom.IdPH}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(roomData)
});

if (!response.ok) throw new Error('Failed to update room');
const updatedRoom = await response.json();
```

#### 4. Xóa phòng
**File:** `QuanLyPhongPage.jsx` - hàm `handleConfirmDelete()` (dòng ~125)

```javascript
// TODO: Replace with actual API call
const response = await fetch(`/api/phong/${selectedRoom.IdPH}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (!response.ok) throw new Error('Failed to delete room');
```

#### 5. Kiểm tra phòng có đang được thuê không (trước khi xóa)
**File:** `DeleteConfirmDialog.jsx` hoặc `QuanLyPhongPage.jsx`

```javascript
// TODO: API INTEGRATION
const response = await fetch(`/api/phieu-thue/check-room/${IdPH}`);
const { isOccupied } = await response.json();

if (isOccupied) {
  // Hiển thị cảnh báo không cho phép xóa
  alert('Phòng đang được thuê, không thể xóa!');
  return;
}
```

---

## 📊 Cấu trúc dữ liệu (Database Schema)

### Bảng Phong (Table Phong)
```sql
Table Phong {
  IdPH int [pk, increment]              -- ID phòng (tự động tăng)
  MaPH varchar(20) [not null, unique]   -- Mã phòng (P101, P102...)
  TrangThaiPhong int [not null]         -- 0: Trống, 1: Đang sửa chữa
  IdLPH int [not null]                  -- ID loại phòng (FK)
  GhiChu varchar(255)                   -- Ghi chú
}
```

### Bảng LoaiPhong (Table LoaiPhong)
```sql
Table LoaiPhong {
  IdLPH int [pk, increment]
  TenLPH varchar(100) [not null]
  SoGiuong int [not null]
  SoNguoiToiDa int [not null]
  GiaNgay decimal(18,2) [not null]
  GiaGio decimal(18,2)
}
```

### Foreign Key
```sql
Ref: Phong.IdLPH > LoaiPhong.IdLPH
```

---

## 🎨 UI/UX Features

### 1. Phân trang (Pagination)
- Mỗi trang hiển thị 10 phòng (có thể thay đổi qua `itemsPerPage`)
- Footer hiển thị trang hiện tại, tổng số trang, tổng số phòng
- Các nút Previous, Next và số trang

### 2. Loading States
- Spinner khi đang tải dữ liệu
- Disable các button khi đang xử lý
- Text "Đang xử lý..." trên các button

### 3. Empty States
- Hiển thị thông báo khi không có dữ liệu
- Icon và text thân thiện

### 4. Responsive Design
- Bảng có thể scroll ngang trên mobile
- Dialog responsive với max-width
- Grid layout cho thống kê

### 5. Animations
- Fade-in-up cho dialog
- Hover effects trên các button và row
- Smooth transitions

### 6. Accessibility
- Focus states rõ ràng
- ARIA labels
- Keyboard navigation
- Screen reader friendly

---

## 🔧 Customize

### Thay đổi số items mỗi trang:
```javascript
const [itemsPerPage] = useState(10); // Thay 10 thành số khác
```

### Thêm cột mới vào bảng:
1. Thêm `<th>` vào `<thead>` trong `RoomTable.jsx`
2. Thêm `<td>` tương ứng vào `<tbody>`
3. Đảm bảo dữ liệu có trong `room` object

### Thêm field mới vào form:
1. Thêm field vào `formData` state trong `RoomFormDialog.jsx`
2. Thêm input element vào form
3. Cập nhật validation nếu cần

---

## 📝 Notes

- **Mock Data**: Hiện tại sử dụng `mockPhong` và `mockLoaiPhong` từ `services/mockData.js`
- **Backend Ready**: Tất cả các vị trí cần gọi API đã được đánh dấu bằng comment `TODO: API INTEGRATION`
- **Authorization Ready**: Các vị trí cần phân quyền đã được đánh dấu bằng comment `TODO: AUTHORIZATION`
- **Chuẩn hóa 100%**: Theo Database.md với các bảng Phong và LoaiPhong

---

## 🚀 Next Steps

1. **Implement API calls**: Thay thế mock data bằng real API
2. **Implement Authorization**: Thêm logic phân quyền dựa trên Role
3. **Add Notifications**: Toast/Snackbar cho các thao tác thành công/thất bại
4. **Add Search & Filter**: Tìm kiếm theo mã phòng, lọc theo loại phòng, trạng thái
5. **Add Export**: Xuất danh sách phòng ra Excel/PDF
6. **Add Bulk Actions**: Xóa nhiều phòng cùng lúc, thay đổi trạng thái hàng loạt

---

## 📞 Support

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng tham khảo:
- Database Schema: `frontend/docs/Database.md`
- Mock Data: `frontend/src/services/mockData.js`
- Main App: `frontend/src/App.jsx`
