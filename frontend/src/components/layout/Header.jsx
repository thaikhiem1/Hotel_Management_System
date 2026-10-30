import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import UserProfileMenu from "./UserProfileMenu";
import { resolveAvatarUrl } from "@/utils/avatar";
import { positionLabel } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
const Header = ({ sidebarWidth = 384 }) => {
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
        className="fixed top-0 right-0 h-20 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-lg"
      >
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-primary text-[18px]">
              apartment
            </span>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">
              Grand Palace Resort & Spa ★★★★★
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
            Hôm nay là ngày:{" "}
            {time.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </div>
          <div className="hidden lg:flex items-center gap-space-xs text-on-surface-variant bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-primary">
              schedule
            </span>
            <span className="font-label-md text-label-md tracking-wider text-on-surface">
              {time.toLocaleTimeString("vi-VN", {
                hour12: false,
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-md">
          <ThemeToggle />
          <button className="relative p-space-sm text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container">
            <span className="material-symbols-outlined text-[24px]">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-glow"></span>
          </button>
          <div className="h-8 w-[1px] bg-surface-container-high"></div>
          <UserProfileMenu
            currentUser={currentEmployee}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
