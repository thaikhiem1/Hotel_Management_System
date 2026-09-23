# Dashboard System Structure

## 📋 Tổng quan

Hệ thống Dashboard cho Grand Palace Hotel Management System với thiết kế Material Design 3.

## 🏗️ Kiến trúc

### Layout Components

```
src/components/layout/
├── DashboardLayout.jsx    # Layout chính với Sidebar + Header + Main content
├── Sidebar.jsx            # Navigation sidebar với menu và stats
└── Header.jsx             # Top header với hotel info và user profile
```

### Dashboard Pages

```
src/pages/dashboard/
├── DashboardPage.jsx           # Trang chủ: Dashboard
├── LapPhieuThuePage.jsx        # Lập phiếu thuê: Đặt phòng
├── QuanLyPhongPage.jsx         # Quản lý phòng
├── QuanLyLoaiPhongPage.jsx     # Quản lý loại phòng
├── QuanLyKhachHangPage.jsx     # Quản lý khách hàng
├── QuanLyPhieuThuePage.jsx     # Quản lý phiếu thuê
├── QuanLyHoaDonPage.jsx        # Quản lý hóa đơn
├── QuanLyDichVuPage.jsx        # Quản lý dịch vụ
├── QuanLyNhanVienPage.jsx      # Quản lý nhân viên
├── BaoCaoThongKePage.jsx       # Báo cáo & Thống kê
└── index.js                    # Export tất cả pages
```

## 🎨 Design System

### Colors (Material Design 3 - Dark Theme)
- **Primary**: `#f2ca50` (Gold) - Brand color
- **Primary Container**: `#d4af37` - Hover states
- **Surface**: `#0f131c` - Main background
- **Surface Container**: `#1c2028` - Card backgrounds
- **On Surface**: `#dfe2ee` - Text on surface
- **Outline**: `#99907c` - Borders and dividers

### Typography
- **Headline XL**: 40px/48px - Page titles
- **Headline LG**: 28px/36px - Section headers
- **Headline MD**: 20px/28px - Card headers
- **Body LG**: 16px/24px - Primary text
- **Label LG**: 14px/20px - Navigation items

### Spacing
- **Gutter**: 1.25rem (20px) - Main padding
- **Space MD**: 1rem (16px) - Standard spacing
- **Space SM**: 0.5rem (8px) - Compact spacing

## 🧭 Navigation Structure

### 1. Tổng quan & Đặt phòng
- `/dashboard` - Trang chủ: Dashboard
- `/lap-phieu-thue` - Lập phiếu thuê: Đặt phòng

### 2. Vận hành buồng phòng
- `/quan-ly-phong` - Quản lý phòng
- `/quan-ly-loai-phong` - Quản lý loại phòng

### 3. Lễ tân & Dịch vụ
- `/quan-ly-khach-hang` - Quản lý khách hàng
- `/quan-ly-phieu-thue` - Quản lý phiếu thuê
- `/quan-ly-hoa-don` - Quản lý hóa đơn
- `/quan-ly-dich-vu` - Quản lý dịch vụ

### 4. Quản trị & Báo cáo
- `/quan-ly-nhan-vien` - Quản lý nhân viên
- `/bao-cao-thong-ke` - Báo cáo & Thống kê

## 🚀 Routing

```jsx
<Route path="/" element={<DashboardLayout />}>
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="lap-phieu-thue" element={<LapPhieuThuePage />} />
  {/* ... các routes khác */}
</Route>
```

## 📦 Components Breakdown

### DashboardLayout
- Container chính cho toàn bộ dashboard
- Sử dụng `<Outlet />` từ react-router-dom
- Layout: `Sidebar (fixed) + Header (fixed) + Main Content (scrollable)`

### Sidebar
**Features:**
- Fixed position (384px width)
- Logo và branding
- Search bar
- Navigation menu với 4 sections
- Footer stats (công suất phòng, ca trực)

**State Management:**
- Active link detection với `useLocation()`
- Search query state

### Header
**Features:**
- Fixed position với backdrop blur
- Hotel selector dropdown
- Real-time clock
- Notifications badge
- User profile với avatar

## 🔧 Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x"
}
```

## 📝 Usage

```jsx
// App.jsx
import AppRoutes from '@/routes/Approutes';

function App() {
  return <AppRoutes />;
}
```

## 🎯 Next Steps

1. **Implement page content** - Thêm nội dung thực cho từng trang
2. **Add authentication** - Protect routes với auth middleware
3. **Connect to API** - Integrate với backend endpoints
4. **Add state management** - Redux/Zustand cho global state
5. **Implement real-time updates** - WebSocket cho notifications

## 📐 Layout Measurements

- **Sidebar Width**: 384px (w-96)
- **Header Height**: 80px (h-20)
- **Content Padding**: 20px (px-gutter-lg)
- **Section Gaps**: 24px (gap-space-lg)

## 🎨 Material Icons Used

- `dashboard` - Dashboard
- `hotel_class` - Đặt phòng
- `meeting_room` - Quản lý phòng
- `king_bed` - Loại phòng
- `badge` - Khách hàng
- `receipt_long` - Phiếu thuê
- `payments` - Hóa đơn
- `room_service` - Dịch vụ
- `group` - Nhân viên
- `insights` - Báo cáo

## 🔄 Active State Logic

```jsx
const isActive = (path) => location.pathname === path;

// Apply active classes
className={cn(
  'base-classes',
  isActive(item.path)
    ? 'bg-primary-container text-on-primary-container font-bold'
    : 'text-on-surface-variant hover:bg-surface-container'
)}
```

## 📱 Responsive Behavior

- Desktop: Full layout với sidebar
- Tablet/Mobile: TBD - Cần implement responsive menu

## 🔐 Future Enhancements

- [ ] Permission-based navigation
- [ ] Dynamic stats update
- [ ] Theme switcher (light/dark)
- [ ] Multi-language support
- [ ] Breadcrumb navigation
- [ ] Quick actions menu
- [ ] Advanced search với filters
