import React from "react";
import { cn } from "@/utils/lib/util";

/**
 * AccountCard - Card hiển thị thông tin tài khoản
 * 
 * @param {Object} account - Dữ liệu tài khoản
 * @param {Function} onClick - Hàm xử lý click vào card
 */
const AccountCard = ({ account, onClick }) => {
  const getRoleBadge = (role) => {
    const roles = {
      ADMIN: {
        bgColor: "bg-error-container",
        textColor: "text-on-error-container",
        icon: "admin_panel_settings",
        label: "Quản trị viên",
      },
      MANAGER: {
        bgColor: "bg-secondary-container",
        textColor: "text-on-secondary-container",
        icon: "supervisor_account",
        label: "Quản lý",
      },
      RECEPTIONIST: {
        bgColor: "bg-tertiary-container",
        textColor: "text-on-tertiary-container",
        icon: "badge",
        label: "Nhân viên lễ tân",
      },
    };

    return roles[role] || roles.RECEPTIONIST;
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return {
        bgColor: "bg-tertiary-container",
        textColor: "text-on-tertiary-container",
        icon: "check_circle",
        label: "Đang hoạt động",
      };
    }

    return {
      bgColor: "bg-error-container",
      textColor: "text-on-error-container",
      icon: "cancel",
      label: "Đã vô hiệu hóa",
    };
  };

  const role = getRoleBadge(account.role);
  const status = getStatusBadge(account.isActive);

  return (
    <div
      onClick={() => onClick(account)}
      className={cn(
        "group relative p-space-lg rounded-xl cursor-pointer",
        "bg-surface-container-low border border-outline-variant",
        "hover:bg-surface-container hover:shadow-lg hover:scale-[1.02]",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30",
      )}
    >
      {/* Role Badge - Top Left */}
      <div
        className={cn(
          "absolute top-space-md left-space-md",
          "flex items-center gap-space-xs px-space-sm py-space-xs rounded-full",
          role.bgColor,
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-[16px]",
            role.textColor,
          )}
        >
          {role.icon}
        </span>

        <span
          className={cn(
            "font-label-sm text-label-sm font-semibold",
            role.textColor,
          )}
        >
          {role.label}
        </span>
      </div>

      {/* Status Badge - Top Right */}
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

      {/* Thông tin chính */}
      <div className="flex flex-col gap-space-md pt-space-xl">
        {/* Username với icon */}
        <div className="flex items-center gap-space-sm px-space-sm">
          <span className="material-symbols-outlined text-[28px] text-primary">
            account_circle
          </span>
          <div className="flex-1">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Tên đăng nhập
            </p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
              {account.username}
            </h3>
          </div>
        </div>

        {/* Thông tin nhân viên */}
        <div className="w-full space-y-space-sm">
          {/* Tên nhân viên */}
          <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
            <span className="material-symbols-outlined text-[18px] text-primary">
              person
            </span>
            <div className="flex-1">
              <span className="font-body-sm text-body-sm text-on-surface truncate">
                {account.employeeName}
              </span>
            </div>
          </div>

          {/* Chức vụ */}
          <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              work
            </span>
            <span className="font-body-sm text-body-sm text-on-surface">
              {account.employeePosition}
            </span>
          </div>

          {/* Email */}
          {account.employeeEmail && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                email
              </span>
              <span className="font-body-sm text-body-sm text-on-surface truncate flex-1">
                {account.employeeEmail}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Hover effect */}
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
      >
        <span className="font-label-sm text-label-sm text-primary">
          Xem chi tiết
        </span>
        <span className="material-symbols-outlined text-primary">
          arrow_forward
        </span>
      </div>
    </div>
  );
};

export default AccountCard;
