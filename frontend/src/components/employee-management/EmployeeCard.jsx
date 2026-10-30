
import { cn } from "@/utils/lib/util";
import { resolveAvatarUrl } from "@/utils/avatar";
import { positionLabel } from "@/utils/auth";

const EmployeeCard = ({ employee, onClick }) => {
  const getStatusBadge = (isActive) => {
    if (isActive) {
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

  const getPositionColor = (position) => {
    const positions = {
      RECEPTIONIST: "text-primary",
      MANAGER: "text-secondary",
      ADMIN: "text-tertiary",
    };

    return positions[position] || "text-on-surface-variant";
  };

  const avatarSrc = resolveAvatarUrl(employee.avatar);
  const status = getStatusBadge(employee.isActive);
  const positionColor = getPositionColor(employee.position);

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
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-100",
              "transition-opacity duration-300",
              employee.isActive ? "bg-primary/30" : "bg-error/30",
            )}
          />

          <img
            src={avatarSrc}
            alt={employee.fullName}
            className={cn(
              "relative w-24 h-24 rounded-full object-cover",
              "ring-4 ring-surface-container-highest",
              "group-hover:ring-primary/20 transition-all duration-300",
            )}
          />

          {/* Status indicator */}
          <div
            className={cn(
              "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-surface-container-low",
              employee.isActive ? "bg-tertiary" : "bg-error",
            )}
          />
        </div>

        {/* Tên nhân viên */}
        <div className="text-center space-y-space-xs">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate max-w-full px-space-sm">
            {employee.fullName}
          </h3>

          <p
            className={cn(
              "font-label-md text-label-md font-semibold uppercase tracking-wider",
              positionColor,
            )}
          >
            {positionLabel(employee.position)}
          </p>
        </div>

        {/* Thông tin liên hệ */}
        <div className="w-full space-y-space-sm">
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

          {employee.phone && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                phone
              </span>

              <span className="font-body-sm text-body-sm text-on-surface">
                {employee.phone}
              </span>
            </div>
          )}

          {employee.citizenId && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-highest/50">
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                badge
              </span>

              <span className="font-body-sm text-body-sm text-on-surface">
                {employee.citizenId}
              </span>
            </div>
          )}
        </div>

        {/* Lương */}
        {employee.salary && (
          <div className="w-full pt-space-sm border-t border-outline-variant">
            <div className="flex items-center justify-between px-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Lương:
              </span>

              <span className="font-label-lg text-label-lg text-primary font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(employee.salary)}
              </span>
            </div>
          </div>
        )}
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
        <span className="material-symbols-outlined text-primary">
          arrow_forward
        </span>
      </div>
    </div>
  );
};

export default EmployeeCard;
