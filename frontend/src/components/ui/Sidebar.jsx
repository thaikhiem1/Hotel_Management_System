import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/lib/util";
import ResizeHandle from "./ResizeHandle";
import logo from "@/assets/ronaldo_02.jpg";
import avatar from "@/assets/ronaldo_10.webp";
const Sidebar = ({ onWidthChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved width from localStorage or use default
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem("sidebarWidth");
    return savedWidth ? parseInt(savedWidth) : 384;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const MIN_WIDTH = 280; // Minimum sidebar width
  const MAX_WIDTH = 600; // Maximum sidebar width

  const handleLogout = () => {
    // TODO: Clear authentication tokens/session
    // localStorage.removeItem('token');
    // sessionStorage.clear();

    // Navigate to login page
    navigate("/login");
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
        localStorage.setItem("sidebarWidth", newWidth.toString());
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

  const navigationSections = [
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
        },
        {
          path: "/reports",
          label: "Báo cáo & Thống kê",
          icon: "insights",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="fixed left-0 top-0 bottom-0 bg-surface-container-lowest z-50 flex flex-col shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
    >
      {/* Header with Logo */}
      <div className="h-20 px-gutter-lg flex items-center gap-space-md bg-surface-container-low">
        <img
          alt="Grand Palace Hotel Logo"
          className="h-8 w-auto object-contain"
          src={logo}
        />
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            Luxury Operations System
          </span>
        </div>
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
                className={cn(
                  "flex items-center px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-all",
                  isActive(item.path)
                    ? "bg-primary-container text-on-primary-container font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
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
          {/* User Info Card */}
          <div className="p-space-md rounded-lg bg-surface-container-high">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <img
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                src={avatar}
              />
              <div className="flex-1 min-w-0">
                <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                  Sir Alex Fergusion
                </p>
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                  Tổng Giám Đốc
                </p>
              </div>
            </div>
          </div>

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
      <ResizeHandle isResizing={isResizing} onMouseDown={startResizing} />
    </aside>
  );
};

export default Sidebar;
