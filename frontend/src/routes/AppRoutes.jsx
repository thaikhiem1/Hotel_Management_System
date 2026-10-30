import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

import ProtectedRoute from "@/routes/ProtectedRoute";
import { MANAGEMENT_ROLES } from "@/utils/auth";

// Dashboard Layout
import DashboardLayout from "@/components/layout/DashboardLayout";

// Dashboard Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LapPhieuThuePage from "@/pages/dashboard/LapPhieuThuePage";
import QuanLyPhongPage from "@/pages/dashboard/QuanLyPhongPage";
import QuanLyLoaiPhongPage from "@/pages/dashboard/QuanLyLoaiPhongPage";
import QuanLyKhachHangPage from "@/pages/dashboard/QuanLyKhachHangPage";
import QuanLyHoaDonPage from "@/pages/dashboard/QuanLyHoaDonPage";
import QuanLyDichVuPage from "@/pages/dashboard/QuanLyDichVuPage";
import QuanLyNhanVienPage from "@/pages/dashboard/QuanLyNhanVienPage";
import QuanLyTaiKhoanPage from "@/pages/dashboard/QuanLyTaiKhoanPage";
import BaoCaoThongKePage from "@/pages/dashboard/BaoCaoThongKePage";

function AppRoutes() {
  return (
    <Routes>
      {/* Trang mặc định */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard - yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<LapPhieuThuePage />} />
          <Route path="/rooms" element={<QuanLyPhongPage />} />
          <Route path="/roomtypes" element={<QuanLyLoaiPhongPage />} />
          <Route path="/customers" element={<QuanLyKhachHangPage />} />
          <Route path="/payments" element={<QuanLyHoaDonPage />} />
          <Route path="/services" element={<QuanLyDichVuPage />} />

          {/* Chỉ ADMIN / MANAGER */}
          <Route element={<ProtectedRoute roles={MANAGEMENT_ROLES} />}>
            <Route path="/employees" element={<QuanLyNhanVienPage />} />
            <Route path="/accounts" element={<QuanLyTaiKhoanPage />} />
            <Route path="/reports" element={<BaoCaoThongKePage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
export default AppRoutes;
