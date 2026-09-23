# Room Type Management Components

Tài liệu này mô tả các component được sử dụng trong trang **Quản lý loại phòng** (QuanLyLoaiPhongPage).

## 📁 Cấu trúc thư mục

```
room-type-management/
├── RoomTypeTable.jsx              # Bảng hiển thị danh sách loại phòng
├── RoomTypeFormDialog.jsx         # Dialog thêm/sửa loại phòng
├── RoomTypeDeleteDialog.jsx       # Dialog xác nhận xóa (wrapper của GenericDeleteDialog)
├── index.js                       # Export tất cả components
└── README.md                      # Tài liệu này
```

## ♻️ Tái sử dụng Components

### GenericDeleteDialog (Shared Component)
Component `RoomTypeDeleteDialog` **TÁI SỬ DỤNG** component `GenericDeleteDialog` từ thư mục `shared/`. 

**Lợi ích:**
- Giảm code duplicate
- Dễ bảo trì và cập nhật
- Consistent UI/UX across features
- Có thể sử dụng cho các trang khác (Nhân viên, Khách hàng, Dịch vụ...)

**Cách sử dụng GenericDeleteDialog:**
```jsx
import GenericDeleteDialog from '@/components/shared/GenericDeleteDialog';

<GenericDeleteDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Xác nhận xóa"
  itemName="tên item"
  itemDetails={[
    { label: 'Field 1', value: 'Value 1', highlight: true },
    { label: 'Field 2', value: 'Value 2', highlight: false }
  ]}
  warningMessage="Custom warning message"
  isLoading={isLoading}
/>
```

## 🎯 Chức năng

### 1. QuanLyLoaiPhongPage (Component chính)
**File:** `src/pages/dashboard/QuanLyLoaiPhongPage.jsx`

**Chức năng chính:**
- Hiển thị danh sách loại phòng với phân trang
- Thống kê tổng quan (tổng loại phòng, giá TB/ngày, sức chứa tối đa)
- Quản lý các thao tác CRUD: Thêm, Sửa, Xóa
- Xử lý các dialog con

**State:**
- `roomTypes`: Danh sách loại phòng (hiện tại dùng mockLoaiPhong)
- `isFormDialogOpen`: Trạng thái mở/đóng dialog form
- `isDeleteDialogOpen`: Trạng thái mở/đóng dialog xác nhận xóa
- `editMode`: Chế độ 'add' hoặc 'edit'
- `selectedRoomType`: Loại phòng được chọn để sửa/xóa
- `currentPage`: Trang hiện tại
- `isLoading`: Trạng thái loading

---

### 2. RoomTypeTable
**File:** `RoomTypeTable.jsx`

**Chức năng:**
Hiển thị bảng danh sách loại phòng với các cột:
- **ID**: IdLPH với icon category
- **Tên loại phòng**: TenLPH
- **Số giường**: SoGiuong (badge với icon bed)
- **Số người tối đa**: SoNguoiToiDa (badge với icon group)
- **Giá ngày**: GiaNgay được format theo VNĐ
- **Giá giờ**: GiaGio (nếu có)
- **Thao tác**: Nút Sửa và Xóa

**Props:**
```javascript
{
  roomTypes: Array,      // Danh sách loại phòng
  onEdit: Function,      // Callback khi nhấn nút Sửa
  onDelete: Function,    // Callback khi nhấn nút Xóa
  isLoading: Boolean     // Trạng thái loading
}
```

---

### 3. RoomTypeFormDialog
**File:** `RoomTypeFormDialog.jsx`

**Chức năng:**
Dialog form để thêm mới hoặc chỉnh sửa loại phòng với các trường:
- **Tên loại phòng** (TenLPH): Required, text input
- **Số giường** (SoGiuong): Required, number input, min: 1
- **Số người tối đa** (SoNguoiToiDa): Required, number input, min: 1
- **Giá ngày** (GiaNgay): Required, number input, min: 0, step: 10000
- **Giá giờ** (GiaGio): Optional, number input, min: 0, step: 10000

**Props:**
```javascript
{
  isOpen: Boolean,           // Trạng thái mở/đóng
  onClose: Function,         // Callback khi đóng
  onSubmit: Function,        // Callback khi submit
  editMode: String,          // 'add' hoặc 'edit'
  roomTypeData: Object|null, // Dữ liệu loại phòng (null khi thêm mới)
  isLoading: Boolean         // Trạng thái loading
}
```

**Data Binding:**
- Khi `editMode === 'edit'` và `roomTypeData` có giá trị, form tự động binding
- Khi `editMode === 'add'` hoặc `roomTypeData === null`, form reset về mặc định

**Validation:**
- Tên loại phòng không được để trống
- Số giường >= 1
- Số người tối đa >= 1
- Giá ngày > 0
- Giá giờ >= 0

---

### 4. RoomTypeDeleteDialog
**File:** `RoomTypeDeleteDialog.jsx`

**Chức năng:**
Dialog xác nhận xóa loại phòng, wrapper của `GenericDeleteDialog`.

**Props:**
```javascript
{
  isOpen: Boolean,             // Trạng thái mở/đóng
  onClose: Function,           // Callback khi đóng
  onConfirm: Function,         // Callback khi xác nhận xóa
  roomTypeData: Object|null,   // Dữ liệu loại phòng cần xóa
  isLoading: Boolean           // Trạng thái loading
}
```

**Data Mapping:**
Component này map dữ liệu loại phòng thành format chung của `GenericDeleteDialog`:
- Tên loại phòng
- Số giường
- Số người tối đa
- Giá ngày
- Giá giờ (nếu có)

---

## 🔐 Phân quyền (Authorization)

### Các quyền theo Role (từ Database.md):
- **Role 0 (Admin)**: Full quyền - Xem, Thêm, Sửa, Xóa
- **Role 1 (Lễ tân)**: Chỉ xem - KHÔNG có quyền Thêm, Sửa, Xóa
- **Role 2 (Quản lý)**: Xem, Thêm, Sửa - KHÔNG có quyền Xóa

### Vị trí cần implement phân quyền:

#### 1. QuanLyLoaiPhongPage.jsx
```javascript
// Nút "Thêm loại phòng" - Dòng ~212
// TODO: AUTHORIZATION - Chỉ Admin (Role 0) và Quản lý (Role 2) có quyền
<button onClick={handleAddNew} ... >
```

#### 2. RoomTypeTable.jsx
```javascript
// Nút "Sửa" - Dòng ~134
// TODO: AUTHORIZATION - Chỉ Admin và Quản lý
<button onClick={() => onEdit(roomType)} ... >

// Nút "Xóa" - Dòng ~143
// TODO: AUTHORIZATION - Chỉ Admin
<button onClick={() => onDelete(roomType)} ... >
```

---

## 🔌 API Integration

### Các điểm cần tích hợp API:

#### 1. Load danh sách loại phòng
**File:** `QuanLyLoaiPhongPage.jsx` - useEffect khi component mount

```javascript
// TODO: API INTEGRATION
useEffect(() => {
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/loai-phong');
      const data = await response.json();
      setRoomTypes(data);
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchRoomTypes();
}, []);
```

#### 2. Thêm loại phòng mới
**File:** `QuanLyLoaiPhongPage.jsx` - hàm `handleSubmitForm()` (dòng ~92)

```javascript
// TODO: Replace with actual API call
const response = await fetch('/api/loai-phong', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(roomTypeData)
});

if (!response.ok) throw new Error('Failed to create room type');
const newRoomType = await response.json();
```

#### 3. Cập nhật loại phòng
**File:** `QuanLyLoaiPhongPage.jsx` - hàm `handleSubmitForm()` (dòng ~92)

```javascript
// TODO: Replace with actual API call
const response = await fetch(`/api/loai-phong/${selectedRoomType.IdLPH}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(roomTypeData)
});

if (!response.ok) throw new Error('Failed to update room type');
const updatedRoomType = await response.json();
```

#### 4. Xóa loại phòng
**File:** `QuanLyLoaiPhongPage.jsx` - hàm `handleConfirmDelete()` (dòng ~134)

```javascript
// TODO: Replace with actual API call
const response = await fetch(`/api/loai-phong/${selectedRoomType.IdLPH}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (!response.ok) throw new Error('Failed to delete room type');
```

#### 5. Kiểm tra có phòng nào đang sử dụng loại phòng này không
**File:** `QuanLyLoaiPhongPage.jsx` hoặc `RoomTypeDeleteDialog.jsx`

```javascript
// TODO: API INTEGRATION
const response = await fetch(`/api/phong/count-by-type/${IdLPH}`);
const { count } = await response.json();

if (count > 0) {
  alert(`Không thể xóa! Có ${count} phòng đang sử dụng loại phòng này.`);
  return;
}
```

---

## 📊 Cấu trúc dữ liệu (Database Schema)

### Bảng LoaiPhong (Table LoaiPhong)
```sql
Table LoaiPhong {
  IdLPH int [pk, increment]              -- ID loại phòng (tự động tăng)
  TenLPH varchar(100) [not null]         -- Tên loại phòng
  SoGiuong int [not null]                -- Số giường
  SoNguoiToiDa int [not null]            -- Số người tối đa
  GiaNgay decimal(18,2) [not null]       -- Giá thuê theo ngày
  GiaGio decimal(18,2)                   -- Giá thuê theo giờ (optional)
}
```

### Quan hệ với bảng Phong
```sql
Ref: Phong.IdLPH > LoaiPhong.IdLPH
```

**Lưu ý:** Trước khi xóa loại phòng, cần kiểm tra xem có phòng nào đang sử dụng loại phòng này không.

---

## 🎨 UI/UX Features

### 1. Phân trang (Pagination)
- Mỗi trang hiển thị 10 loại phòng
- Footer hiển thị trang hiện tại, tổng số trang, tổng số loại phòng
- Các nút Previous, Next và số trang

### 2. Loading States
- Spinner khi đang tải dữ liệu
- Disable các button khi đang xử lý
- Text "Đang xử lý..." trên các button

### 3. Empty States
- Hiển thị thông báo khi không có dữ liệu
- Icon category và text thân thiện

### 4. Badges & Icons
- Số giường: Badge màu tertiary với icon bed
- Số người: Badge màu primary với icon group
- Format tiền tệ VNĐ cho giá

### 5. Responsive Design
- Bảng có thể scroll ngang trên mobile
- Dialog responsive với max-width
- Grid layout 2 cột cho form fields

### 6. Animations
- Fade-in-up cho dialog (reuse từ CSS global)
- Hover effects trên các button và row
- Smooth transitions

---

## ♻️ So sánh với Room Management

### Điểm giống nhau (Reused):
✅ **GenericDeleteDialog**: Component xác nhận xóa chung  
✅ **Pagination logic**: Cách xử lý phân trang  
✅ **Loading states**: UI và logic loading  
✅ **Form validation**: Pattern validate  
✅ **Layout structure**: Cấu trúc trang (header, stats, table, pagination)  

### Điểm khác biệt:
- **Fields khác nhau**: Loại phòng có số giường, số người, giá giờ/ngày
- **Validation rules khác**: Loại phòng có validation cho số tiền, số lượng người
- **Business logic**: Cần check phòng đang sử dụng loại phòng trước khi xóa

---

## 🔧 Customize

### Thay đổi số items mỗi trang:
```javascript
const [itemsPerPage] = useState(10); // Thay 10 thành số khác
```

### Thêm cột mới vào bảng:
1. Thêm `<th>` vào `<thead>` trong `RoomTypeTable.jsx`
2. Thêm `<td>` tương ứng vào `<tbody>`
3. Đảm bảo dữ liệu có trong `roomType` object

### Thêm field mới vào form:
1. Thêm field vào `formData` state trong `RoomTypeFormDialog.jsx`
2. Thêm input element vào form
3. Cập nhật validation nếu cần

---

## 📝 Notes

- **Mock Data**: Hiện tại sử dụng `mockLoaiPhong` từ `services/mockData.js`
- **Backend Ready**: Tất cả các vị trí cần gọi API đã được đánh dấu `TODO: API INTEGRATION`
- **Authorization Ready**: Các vị trí cần phân quyền đã được đánh dấu `TODO: AUTHORIZATION`
- **Reusability**: Sử dụng `GenericDeleteDialog` từ `shared/` để tái sử dụng code
- **Chuẩn hóa 100%**: Theo Database.md với bảng LoaiPhong

---

## 🚀 Next Steps

1. **Implement API calls**: Thay thế mock data bằng real API
2. **Implement Authorization**: Thêm logic phân quyền dựa trên Role
3. **Add Notifications**: Toast/Snackbar cho các thao tác
4. **Add Search & Filter**: Tìm kiếm theo tên, lọc theo khoảng giá
5. **Add Export**: Xuất danh sách loại phòng ra Excel/PDF
6. **Add Room Count**: Hiển thị số lượng phòng đang dùng mỗi loại
7. **Integrate with Room Management**: Link giữa loại phòng và danh sách phòng

---

## 📞 Support

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng tham khảo:
- Database Schema: `frontend/docs/Database.md`
- Mock Data: `frontend/src/services/mockData.js`
- Shared Components: `frontend/src/components/shared/`
- Room Management (tương tự): `frontend/src/components/room-management/`
