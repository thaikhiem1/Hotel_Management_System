import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import UserProfileMenu from "./UserProfileMenu";
import { EmployeeProfileDialog } from "@/components/employee-management";
import avatar from "@/assets/ronaldo_01.jpg";
const Header = ({ sidebarWidth = 384 }) => {
  const [time, setTime] = useState(new Date());
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock current user - TODO: Get from auth context
  const mockCurrentUser = {
    idNV: 1,
    tenNV: "Sir Alex Fergusion",
    chucVu: "Tổng Giám Đốc",
    luong: 50000000,
    sdt: "0901234567",
    cccd: "001234567890",
    ngaySinh: "1980-05-15",
    gioiTinh: "Nam",
    diaChi: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    email: "",
    avatar: avatar,
    isWorking: true,
  };

  const handleOpenProfile = (user) => {
    setCurrentUser(user);
    setIsProfileDialogOpen(true);
  };

  const handleUpdateProfile = async (formData) => {
    // TODO: Call API to update profile
    console.log("Update profile:", formData);
    setIsProfileDialogOpen(false);
    setCurrentUser(null);
  };

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
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(242,202,80,0.6)]"></span>
          </button>
          <div className="h-8 w-[1px] bg-surface-container-high"></div>
          <UserProfileMenu
            currentUser={mockCurrentUser}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      </header>

      {/* Profile Dialog */}
      <EmployeeProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setCurrentUser(null);
        }}
        onSubmit={handleUpdateProfile}
        employeeData={currentUser}
        mode="view"
        canEdit={true}
        isLoading={false}
      />
    </>
  );
};

export default Header;
