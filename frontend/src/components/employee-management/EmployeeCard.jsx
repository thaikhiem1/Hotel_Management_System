import React from "react";
import { cn } from "@/utils/lib/util";

/**
 * @param {Object} employee - Dữ liệu nhân viên
 * @param {Function} onClick - Hàm xử lý khi click vào card
 */
const EmployeeCard = ({ employee, onClick }) => {
  // Xác định màu sắc badge theo trạng thái làm việc
  const getStatusBadge = (isWorking) => {
    if (isWorking) {
      return {
        bgColor: "bg-tertiary-container",
        textColor: "text-on-tertiary-container",
        icon: "check_circle",
        label: "Đang làm việc",
      };
    }
    return {
      bgColor: "bg-error-container",
      textColor: "text-on-error-container",
      icon: "cancel",
      label: "Đã nghỉ việc",
    };
  };

  // Xác định màu sắc theo chức vụ
  const getPositionColor = (chucVu) => {
    const positions = {
      "Tổng Giám Đốc": "text-primary",
      "Quản Lý": "text-secondary",
      "Nhân Viên": "text-tertiary",
    };
    return positions[chucVu] || "text-on-surface-variant";
  };

  const status = getStatusBadge(employee.isWorking);
  const positionColor = getPositionColor(employee.chucVu);

  return (
    <div
      onClick={() => onClick(employee)}
      className={cn(
        "group relative p-space-lg rounded-xl cursor-pointer",
        "bg-surface-container-low border border-outline-variant",
        "hover:bg-surface-container hover:shadow-lg hover:scale-[1.02]",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30",
      )}
    >
      {/* Status Badge */}
      <div
        className={cn(
          "absolute top-space-md right-space-md",
          "flex items-center gap-space-xs px-space-sm py-space-xs rounded-full",
          status.bgColor,
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-[16px]",
            status.textColor,
          )}
        >
          {status.icon}
        </span>
        <span
          className={cn(
            "font-label-sm text-label-sm font-semibold",
            status.textColor,
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Avatar và thông tin chính */}
      <div className="flex flex-col items-center gap-space-md pt-space-md">
        {/* Avatar với border gradient effect */}
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-100",
              "transition-opacity duration-300",
              employee.isWorking ? "bg-primary/30" : "bg-error/30",
            )}
          />
          <img
            src={employee.avatar || "https://via.placeholder.com/120"}
            alt={employee.tenNV}
            className={cn(
              "relative w-24 h-24 rounded-full object-cover",
              "ring-4 ring-surface-container-highest",
              "group-hover:ring-primary/20 transition-all duration-300",
            )}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/120?text=" +
                employee.tenNV.charAt(0);
            }}
          />
          {/* Status indicator dot */}
          <div
            className={cn(
              "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-surface-container-low",
              employee.isWorking ? "bg-tertiary" : "bg-error",
            )}
          />
        </div>

        {/* Tên nhân viên */}
        <div className="text-center space-y-space-xs">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate max-w-full px-space-sm">
            {employee.tenNV}
          </h3>
          <p
            className={cn(
              "font-label-md text-label-md font-semibold uppercase tracking-wider",
              positionColor,
            )}
          >
            {employee.chucVu}
          </p>
        </div>

        {/* Thông tin liên hệ */}
        <div className="w-full space-y-space-sm">
          {/* Email */}
          {employee.email && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-primary">
                email
              </span>
              <span className="font-body-sm text-body-sm text-on-surface truncate flex-1">
                {employee.email}
              </span>
            </div>
          )}

          {/* Số điện thoại */}
          {employee.sdt && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                phone
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">
                {employee.sdt}
              </span>
            </div>
          )}

          {/* CCCD */}
          {employee.cccd && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                badge
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">
                {employee.cccd}
              </span>
            </div>
          )}
        </div>

        {/* Lương - chỉ hiển thị cho admin/quản lý */}
        {employee.luong && (
          <div className="w-full pt-space-sm border-t border-outline-variant">
            <div className="flex items-center justify-between px-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Lương:
              </span>
              <span className="font-label-lg text-label-lg text-primary font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(employee.luong)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100",
          "pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-br from-primary/5 to-transparent",
        )}
      />

      {/* Click indicator */}
      <div
        className={cn(
          "absolute bottom-space-md right-space-md",
          "flex items-center gap-space-xs opacity-0 group-hover:opacity-100",
          "transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
        )}
      ></div>
    </div>
  );
};

export default EmployeeCard;
