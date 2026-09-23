# Folder Structure

This project is the Vite + React + JavaScript frontend for the **Hotel Management System**.

## `src/`

The `src/` directory contains the main application source code.

```text
src/
├── assets/          # Static images, icons, and local media assets
├── components/      # Reusable UI components
│   ├── ui/          # Generic UI components
│   ├── layout/      # Layout components such as Sidebar, Header, Navbar
│   └── hotel/       # Hotel-specific components
├── contexts/        # Shared React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Screen-level page components
├── routes/          # Client-side route configuration
├── services/        # Backend API integration
├── utils/           # Reusable utility/helper functions
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── styles: index.css, App.css        # Global CSS and Tailwind CSS configuration
```

### Folder Description

* `assets/` - Chứa hình ảnh, icon và các tài nguyên tĩnh của hệ thống.
* `components/` - Chứa các component React có thể tái sử dụng.

  * `ui/` - Các component giao diện cơ bản như Button, Input, Dialog, Badge,...
  * `layout/` - Các component bố cục như Sidebar, Header, Navbar,...
  * `hotel/` - Các component nghiệp vụ riêng của hệ thống khách sạn.
* `contexts/` - Quản lý các state dùng chung bằng React Context.
* `hooks/` - Chứa các Custom Hook để tái sử dụng logic xử lý.
* `pages/` - Chứa các trang chính của hệ thống như Dashboard, quản lý phòng, loại phòng, khách hàng, hóa đơn, dịch vụ,...
* `routes/` - Cấu hình các route và điều hướng giữa các trang.
* `services/` - Chứa logic gọi và xử lý dữ liệu từ Backend API.
* `utils/` - Chứa các hàm tiện ích dùng chung.
* `App.jsx` - Component gốc của ứng dụng.
* `main.jsx` - Điểm khởi chạy của React application.
* `index.css` - CSS toàn cục và cấu hình Tailwind CSS.
