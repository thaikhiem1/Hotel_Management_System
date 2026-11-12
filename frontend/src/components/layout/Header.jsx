import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import UserProfileMenu from "./UserProfileMenu";
import { SIDEBAR_DEFAULT_WIDTH } from "@/utils/sidebarWidth";
import { resolveAvatarUrl } from "@/utils/avatar";
import { positionLabel } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
const Header = ({ sidebarWidth = SIDEBAR_DEFAULT_WIDTH, onMenuClick }) => {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Nhân viên của tài khoản đang đăng nhập (từ JWT -> /api/auth/me)
  const { user } = useAuth();
  const emp = user?.employee;
  const currentEmployee = emp && {
    idNV: emp.employeeId,
    tenNV: emp.fullName,
    chucVu: positionLabel(emp.position),
    email: emp.email,
    avatar: resolveAvatarUrl(emp.avatar),
  };

  // Hồ sơ cá nhân là một trang riêng, chỉ xem và đổi ảnh đại diện
  const handleOpenProfile = () => navigate("/profile");

  return (
    <>
      <header
        style={{ left: `${sidebarWidth}px` }}
        className="fixed top-0 right-0 h-20 z-40 flex items-center justify-between gap-space-sm px-space-md md:px-space-lg text-white bg-gradient-to-r from-[#4f3a0c] via-[#7a5c16] to-[#a87f25] border-b-2 border-[#e2c36d]/70 shadow-[0_6px_20px_-6px_rgba(79,58,12,0.55)]"
      >
        <div className="flex items-center gap-space-sm lg:gap-space-lg min-w-0">
          <button
            onClick={onMenuClick}
            aria-label="Mở menu"
            className="lg:hidden shrink-0 p-space-sm rounded-lg text-white hover:bg-white/15 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
          <div className="flex items-center gap-space-sm bg-white/15 border border-white/25 px-space-sm md:px-space-md py-space-sm rounded-lg min-w-0">
            <span className="material-symbols-outlined text-[#ffe9a8] text-[20px]">
              apartment
            </span>
            <span className="font-label-lg text-label-lg text-white font-bold tracking-wide truncate">
              <span className="lg:hidden">Grand Palace</span>
              <span className="hidden lg:inline">Grand Palace Resort & Spa ★★★★★</span>
            </span>
            <span className="max-lg:!hidden material-symbols-outlined text-white/70 text-[18px]">
              expand_more
            </span>
          </div>
          <div className="hidden md:flex items-center gap-space-md bg-black/25 border border-white/20 px-space-md py-space-xs rounded-lg">
            <span className="material-symbols-outlined text-[24px] text-[#ffe9a8]">
              schedule
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-label-lg text-label-lg tracking-widest text-white font-bold tabular-nums">
                {time.toLocaleTimeString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  hour12: false,
                })}
              </span>
              <span className="font-label-sm text-label-sm text-white/80 capitalize">
                {time.toLocaleDateString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm md:gap-space-md shrink-0">
          <ThemeToggle onBrand />
          <div className="hidden sm:block h-8 w-[1px] bg-white/30"></div>
          <UserProfileMenu
            onBrand
            currentUser={currentEmployee}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
