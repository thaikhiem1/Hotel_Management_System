# Dashboard Components Documentation

## 📋 Tổng quan

Hệ thống components cho Dashboard Page với thiết kế modular, dễ tái sử dụng và maintain.

## 🏗️ Cấu trúc Components

```
src/components/dashboard/
├── DateTimeFilter.jsx      # Bộ lọc thời gian check-in/check-out
├── QuickActions.jsx         # Các thao tác nhanh (Refresh, Filter)
├── StatCard.jsx             # Card hiển thị thống kê
├── RoomFilterTabs.jsx       # Tabs lọc phòng theo trạng thái
├── RoomCard.jsx             # Card hiển thị thông tin phòng
├── RoomGrid.jsx             # Grid layout cho danh sách RoomCard
└── index.js                 # Export tất cả components
```

## 📦 Components Chi tiết

### 1. DateTimeFilter

**Mô tả**: Component cho phép chọn thời gian check-in và check-out để lọc danh sách phòng.

**Props**:
```typescript
{
  onFilterChange?: (filter: {
    checkIn: { date: string, time: string },
    checkOut: { date: string, time: string }
  }) => void
}
```

**Features**:
- Date picker cho ngày
- Time picker cho giờ
- Real-time update khi thay đổi
- Material Design 3 styling

**Usage**:
```jsx
<DateTimeFilter onFilterChange={(filter) => console.log(filter)} />
```

---

### 2. QuickActions

**Mô tả**: Buttons cho các thao tác nhanh.

**Props**:
```typescript
{
  onRefresh?: () => void,
  onFilterAvailableNow?: () => void
}
```

**Actions**:
- **Làm mới hồ sơ**: Refresh data từ server
- **Lọc phòng trống tức thì**: Quick filter cho phòng available

**Usage**:
```jsx
<QuickActions
  onRefresh={handleRefresh}
  onFilterAvailableNow={handleFilterAvailable}
/>
```

---

### 3. StatCard

**Mô tả**: Card hiển thị thống kê với icon, value và trend.

**Props**:
```typescript
{
  icon: string,              // Material icon name
  label: string,             // Nhãn thống kê
  value: string | number,    // Giá trị chính
  subValue?: string,         // Giá trị phụ
  trend?: number,            // % tăng/giảm (positive/negative)
  colorClass?: string        // Tailwind color class
}
```

**Features**:
- Icon với custom color
- Trend indicator (up/down arrow)
- Hover effect
- Responsive design

**Usage**:
```jsx
<StatCard
  icon="pie_chart"
  label="Công suất phòng"
  value="86.4%"
  trend={5.2}
  colorClass="text-primary"
/>
```

---

### 4. RoomFilterTabs

**Mô tả**: Tabs để lọc phòng theo trạng thái.

**Props**:
```typescript
{
  activeFilter: string,
  onFilterChange: (filterId: string) => void,
  counts?: {
    all: number,
    available: number,
    occupied: number,
    cleaning: number,
    maintenance: number
  }
}
```

**Filter Types**:
- `all` - Tất cả phòng
- `available` - Trống/Sẵn sàng
- `occupied` - Đang có khách
- `cleaning` - Đang dọn dẹp
- `maintenance` - Đang bảo trì

**Usage**:
```jsx
<RoomFilterTabs
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  counts={{ all: 142, available: 18, ... }}
/>
```

---

### 5. RoomCard

**Mô tả**: Card hiển thị thông tin phòng với actions theo trạng thái.

**Props**:
```typescript
{
  room: {
    id: string | number,
    name: string,              // Tên phòng (P101)
    roomType: string,          // Loại phòng
    pricePerDay: number,       // Giá/ngày
    pricePerHour: number,      // Giá/giờ
    status: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance',
    guestName?: string,        // Tên khách (nếu occupied)
    checkOutTime?: string,     // Giờ trả phòng
    maintenanceReason?: string // Lý do bảo trì
  },
  onAction: (actionId: string, room: object) => void
}
```

**Status & Actions**:

| Status | Actions | Description |
|--------|---------|-------------|
| `available` | view, book | Xem chi tiết + Đặt phòng tức thì |
| `reserved` | view, checkin | Xem chi tiết + Nhận phòng |
| `occupied` | view, service, checkout | Xem chi tiết + Thêm dịch vụ + Trả phòng |
| `cleaning` | inspect, ready | Kiểm tra buồng + Đánh dấu sẵn sàng |
| `maintenance` | reason, complete | Xem lý do + Hoàn thành bảo trì |

**Usage**:
```jsx
<RoomCard
  room={{
    id: 1,
    name: 'P101',
    roomType: 'Deluxe Room',
    pricePerDay: 1500000,
    pricePerHour: 150000,
    status: 'available'
  }}
  onAction={(actionId, room) => console.log(actionId, room)}
/>
```

---

### 6. RoomGrid

**Mô tả**: Grid layout responsive cho danh sách RoomCard.

**Props**:
```typescript
{
  rooms: Array<Room>,
  onRoomAction: (actionId: string, room: object) => void,
  isLoading?: boolean
}
```

**Features**:
- Responsive grid (1-4 columns)
- Loading state với spinner
- Empty state với message
- Auto-layout

**Grid Breakpoints**:
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Large Desktop (xl): 4 columns

**Usage**:
```jsx
<RoomGrid
  rooms={filteredRooms}
  onRoomAction={handleRoomAction}
  isLoading={isLoading}
/>
```

---

## 🎨 Layout Structure (DashboardPage)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header (Title + Date)                                   │
├─────────────────────────────────────────────────────────────┤
│ 20% - DateTimeFilter (2/3) | QuickActions (1/3)             │
├─────────────────────────────────────────────────────────────┤
│ 20% - Stats Grid (4 StatCards)                              │
│       ┌──────┬──────┬──────┬──────┐                         │
│       │ Công │ Loại │ Doanh│ Nhân │                         │
│       │ suất │ phòng│ thu  │ sự   │                         │
│       └──────┴──────┴──────┴──────┘                         │
├─────────────────────────────────────────────────────────────┤
│ 10% - RoomFilterTabs                                         │
│       [Tất cả] [Trống] [Có khách] [Dọn] [Bảo trì]          │
├─────────────────────────────────────────────────────────────┤
│ 50% - RoomGrid                                               │
│       ┌────┬────┬────┬────┐                                 │
│       │P101│P102│P103│P104│                                 │
│       ├────┼────┼────┼────┤                                 │
│       │P105│P106│P107│P108│                                 │
│       └────┴────┴────┴────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
DashboardPage (Parent)
  │
  ├─> useState hooks cho:
  │   - activeFilter
  │   - dateTimeFilter
  │   - isLoading
  │   - stats, roomCounts, rooms (mock data)
  │
  ├─> DateTimeFilter
  │   └─> onFilterChange(filter) → setDateTimeFilter(filter)
  │
  ├─> QuickActions
  │   ├─> onRefresh() → setIsLoading + API call
  │   └─> onFilterAvailableNow() → setActiveFilter('available')
  │
  ├─> StatCard (x4)
  │   └─> Display only (no callbacks)
  │
  ├─> RoomFilterTabs
  │   └─> onFilterChange(filterId) → setActiveFilter(filterId)
  │
  └─> RoomGrid
      └─> RoomCard (xN)
          └─> onAction(actionId, room) → handleRoomAction()
```

## 🎯 Action Handlers

### handleRoomAction(actionId, room)

Xử lý tất cả actions từ RoomCard:

```javascript
const handleRoomAction = (actionId, room) => {
  switch (actionId) {
    case 'view':      // Xem chi tiết phòng
    case 'book':      // Đặt phòng tức thì
    case 'checkin':   // Nhận phòng (check-in)
    case 'checkout':  // Trả phòng (check-out)
    case 'service':   // Thêm dịch vụ
    case 'inspect':   // Kiểm tra buồng
    case 'ready':     // Đánh dấu sẵn sàng
    case 'reason':    // Xem lý do bảo trì
    case 'complete':  // Hoàn thành bảo trì
  }
};
```

## 🔌 API Integration (TODO)

### Endpoints cần implement:

```typescript
// GET /api/dashboard/stats
{
  occupancy: { value: string, trend: number },
  roomTypes: { value: string, subValue: string },
  revenue: { value: string, subValue: string, trend: number },
  staff: { value: string, subValue: string }
}

// GET /api/rooms?checkIn=...&checkOut=...&status=...
{
  rooms: Array<Room>,
  counts: {
    all: number,
    available: number,
    occupied: number,
    cleaning: number,
    maintenance: number
  }
}

// POST /api/rooms/:id/book
// POST /api/rooms/:id/checkin
// POST /api/rooms/:id/checkout
// POST /api/rooms/:id/service
// PUT /api/rooms/:id/status
```

## 🎨 Color Coding

- **Primary (Gold)**: Available rooms, main actions
- **Secondary (Blue)**: Room types, cleaning status
- **Tertiary (Cyan)**: Occupied rooms, revenue
- **Error (Red)**: Maintenance status

## 📱 Responsive Behavior

- **Mobile (<768px)**: Single column layout
- **Tablet (768-1024px)**: 2-column room grid
- **Desktop (1024-1280px)**: 3-column room grid
- **Large Desktop (>1280px)**: 4-column room grid

## 🚀 Future Enhancements

- [ ] Real-time updates với WebSocket
- [ ] Drag-and-drop room assignment
- [ ] Advanced filters (price range, amenities)
- [ ] Export statistics to PDF/Excel
- [ ] Room availability calendar view
- [ ] Bulk operations (multiple room selection)
- [ ] Notifications for status changes
- [ ] Room comparison feature
