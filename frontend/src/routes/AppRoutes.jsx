import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

import ProtectedRoute from "@/routes/ProtectedRoute";
import { viewRoles } from "@/utils/permissions";

// Dashboard Layout
import DashboardLayout from "@/components/layout/DashboardLayout";

// Dashboard Pages: mỗi trang là một gói riêng, chỉ tải khi mở trang đó
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const LapPhieuThuePage = lazy(() => import("@/pages/dashboard/LapPhieuThuePage"));
const QuanLyPhongPage = lazy(() => import("@/pages/dashboard/QuanLyPhongPage"));
const QuanLyLoaiPhongPage = lazy(() => import("@/pages/dashboard/QuanLyLoaiPhongPage"));
const QuanLyKhachHangPage = lazy(() => import("@/pages/dashboard/QuanLyKhachHangPage"));
const QuanLyHoaDonPage = lazy(() => import("@/pages/dashboard/QuanLyHoaDonPage"));
const QuanLyDichVuPage = lazy(() => import("@/pages/dashboard/QuanLyDichVuPage"));
const QuanLyNhanVienPage = lazy(() => import("@/pages/dashboard/QuanLyNhanVienPage"));
const QuanLyTaiKhoanPage = lazy(() => import("@/pages/dashboard/QuanLyTaiKhoanPage"));
const BaoCaoThongKePage = lazy(() => import("@/pages/dashboard/BaoCaoThongKePage"));
const HoSoCaNhanPage = lazy(() => import("@/pages/dashboard/HoSoCaNhanPage"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-space-xl">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
        </div>
      }
    >
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
          <Route path="/profile" element={<HoSoCaNhanPage />} />

          {/* Nhân viên, báo cáo thống kê: ADMIN / MANAGER */}
          <Route element={<ProtectedRoute roles={viewRoles("employees")} />}>
            <Route path="/employees" element={<QuanLyNhanVienPage />} />
            <Route path="/reports" element={<BaoCaoThongKePage />} />
          </Route>

          {/* Tài khoản: chỉ ADMIN */}
          <Route element={<ProtectedRoute roles={viewRoles("accounts")} />}>
            <Route path="/accounts" element={<QuanLyTaiKhoanPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
export default AppRoutes;
