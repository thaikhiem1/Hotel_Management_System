import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/lib/util";
import ResizeHandle from "./ResizeHandle";
import { useAuth } from "@/contexts/AuthContext";
import { viewRoles } from "@/utils/permissions";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  getInitialSidebarWidth,
  saveSidebarWidth,
} from "@/utils/sidebarWidth";
const Sidebar = ({ onWidthChange, isDesktop = true, isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load saved width from localStorage or use default
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const MIN_WIDTH = SIDEBAR_MIN_WIDTH;
  const MAX_WIDTH = SIDEBAR_MAX_WIDTH;

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        // Save to localStorage
        saveSidebarWidth(newWidth);
        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(sidebarWidth);
    }
  }, []);

  const allSections = [
    {
      title: "Tổng quan & Đặt phòng",
      items: [
        {
          path: "/dashboard",
          label: "Trang chủ",
          icon: "dashboard",
        },
        {
          path: "/bookings",
          label: "Đặt phòng",
          icon: "hotel_class",
        },
      ],
    },
    {
      title: "Vận hành buồng phòng",
      items: [
        {
          path: "/rooms",
          label: "Quản lý phòng",
          icon: "meeting_room",
        },
        {
          path: "/roomtypes",
          label: "Quản lý loại phòng",
          icon: "king_bed",
        },
      ],
    },
    {
      title: "Lễ tân & Dịch vụ",
      items: [
        {
          path: "/customers",
          label: "Quản lý khách hàng",
          icon: "badge",
        },
        {
          path: "/payments",
          label: "Quản lý hóa đơn",
          icon: "payments",
        },
        {
          path: "/services",
          label: "Quản lý dịch vụ",
          icon: "room_service",
        },
      ],
    },
    {
      title: "Quản trị & Báo cáo",
      items: [
        {
          path: "/employees",
          label: "Quản lý nhân viên",
          icon: "group",
          roles: viewRoles("employees"),
        },
        {
          path: "/accounts",
          label: "Quản lý tài khoản",
          icon: "manage_accounts",
          roles: viewRoles("accounts"),
        },
        {
          path: "/reports",
          label: "Báo cáo & Thống kê",
          icon: "insights",
          roles: viewRoles("reports"),
        },
      ],
    },
  ];

  // Ẩn mục menu mà vai trò hiện tại không được truy cập
  const navigationSections = allSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(user?.role),
      ),
    }))
    .filter((section) => section.items.length > 0);

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      ref={sidebarRef}
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-surface-container-lowest z-50 flex flex-col shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]",
        !isDesktop &&
          "w-72 max-w-[85vw] transition-transform duration-300 " + (isOpen ? "translate-x-0" : "-translate-x-full"),
      )}
    >
      {/* Header with Logo */}
      <div className="h-20 shrink-0 px-space-md lg:px-space-lg flex items-center gap-space-md text-white bg-gradient-to-r from-[#4f3a0c] via-[#7a5c16] to-[#a87f25] border-b-2 border-[#e2c36d]/70 shadow-[0_6px_20px_-6px_rgba(79,58,12,0.55)]">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 border border-white/30">
          <span className="material-symbols-outlined text-[#ffe9a8] text-[28px]">hotel</span>
        </div>
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="font-headline-sm text-headline-sm font-bold text-white tracking-wide truncate">
            Grand Palace
          </span>
          <span className="font-label-sm text-label-sm text-[#ffe9a8] uppercase tracking-widest truncate">
            Luxury Operations System
          </span>
        </div>
        {!isDesktop && (
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="p-space-sm rounded-lg text-white/90 hover:bg-white/15 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        )}
      </div>
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-xs">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="px-space-md pt-space-sm pb-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                {section.title}
              </span>
            </div>
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={isDesktop ? undefined : onClose}
                className={cn(
                  "flex items-center px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-all",
                  isActive(item.path)
                    ? "bg-primary-container text-on-primary-container font-bold shadow-glow"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <span className="material-symbols-outlined mr-space-md text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="p-space-md bg-surface-container-low border-t border-surface-container-high">
        <div className="space-y-space-sm">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-space-sm px-space-md py-space-md rounded-lg bg-error-container hover:bg-error transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] text-on-error-container group-hover:text-on-error">
              logout
            </span>
            <span className="font-label-lg text-label-lg font-semibold text-on-error-container group-hover:text-on-error">
              Đăng xuất
            </span>
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      {isDesktop && <ResizeHandle isResizing={isResizing} onMouseDown={startResizing} />}
    </aside>
  );
};

export default Sidebar;
