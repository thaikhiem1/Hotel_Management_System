import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

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
import BaoCaoThongKePage from "@/pages/dashboard/BaoCaoThongKePage";

function AppRoutes() {
  return (
    <Routes>
      {/* Trang mặc định */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard */}
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bookings" element={<LapPhieuThuePage />} />
        <Route path="/rooms" element={<QuanLyPhongPage />} />
        <Route path="/roomtypes" element={<QuanLyLoaiPhongPage />} />
        <Route path="/customers" element={<QuanLyKhachHangPage />} />
        <Route path="/payments" element={<QuanLyHoaDonPage />} />
        <Route path="/services" element={<QuanLyDichVuPage />} />
        <Route path="/employees" element={<QuanLyNhanVienPage />} />
        <Route path="/reports" element={<BaoCaoThongKePage />} />
      </Route>
    </Routes>
  );
}
export default AppRoutes;
