import React, { useState, useEffect } from "react";
import { cn } from "@/utils/lib/util";

/**
 * AccountEditDialog - Dialog cập nhật thông tin tài khoản
 * REQ-ACC-002: Cập nhật tài khoản và vai trò
 * REQ-ACC-003: Khóa/Mở khóa tài khoản
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng dialog
 * @param {Function} onClose - Hàm đóng dialog
 * @param {Function} onSubmit - Hàm xử lý submit form
 * @param {Object} account - Dữ liệu tài khoản hiện tại
 * @param {boolean} isLoading - Trạng thái loading
 */
const AccountEditDialog = ({
  isOpen,
  onClose,
  onSubmit,
  account = null,
  isLoading = false,
}) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    role: "RECEPTIONIST",
    isActive: true,
  });

  // Reset form khi dialog mở/đóng hoặc account thay đổi
  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        newPassword: "",
        role: account.role || "RECEPTIONIST",
        isActive: account.isActive ?? true,
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, account]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error khi user nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Basic validation
  const validateForm = () => {
    const newErrors = {};

    // Chỉ validate password nếu user nhập
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Chỉ gửi các field có thay đổi
    const submitData = {
      role: formData.role,
      isActive: formData.isActive,
    };

    // Chỉ thêm password nếu user nhập
    if (formData.newPassword && formData.newPassword.trim()) {
      submitData.newPassword = formData.newPassword;
    }

    onSubmit(submitData);
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto",
          "bg-surface-container-low rounded-2xl shadow-2xl",
          "mx-space-lg",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-space-lg bg-surface-container-low border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-primary text-[28px]">
              edit
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Cập nhật tài khoản
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Chỉnh sửa thông tin tài khoản: {account.username}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-space-sm rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              close
            </span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-lg">
          {/* Thông tin nhân viên (Read-only) */}
          <div className="p-space-md rounded-lg bg-surface-container-highest border border-outline-variant">
            <div className="flex items-start gap-space-md">
              <span className="material-symbols-outlined text-primary text-[32px]">
                person
              </span>
              <div className="flex-1 space-y-space-xs">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Nhân viên
                  </p>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                    {account.employeeName}
                  </p>
                </div>
                <div className="flex items-center gap-space-md">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Chức vụ
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      {account.employeePosition}
                    </p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Email
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      {account.employeeEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Username (Read-only) */}
          <div className="space-y-space-xs">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Tên đăng nhập
            </label>
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-highest border border-outline">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                lock
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                {account.username}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tên đăng nhập không thể thay đổi
            </p>
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-space-xs">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Mật khẩu mới (để trống nếu không đổi)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-space-md py-space-sm pr-12 rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all",
                  errors.newPassword && "border-error focus:ring-error",
                )}
                placeholder="Nhập mật khẩu mới (tùy chọn)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-space-sm rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.newPassword && (
              <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                {errors.newPassword}
              </p>
            )}
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Mật khẩu mới sẽ được mã hóa trước khi lưu vào hệ thống
            </p>
          </div>

          {/* Vai trò */}
          <div className="space-y-space-xs">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Vai trò <span className="text-error">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={cn(
                "w-full px-space-md py-space-sm rounded-lg",
                "bg-surface-container-highest border border-outline",
                "font-body-md text-body-md text-on-surface",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all",
                errors.role && "border-error focus:ring-error",
              )}
              required
            >
              <option value="RECEPTIONIST">Nhân viên lễ tân</option>
              <option value="MANAGER">Quản lý</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {errors.role && (
              <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                {errors.role}
              </p>
            )}
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Vai trò quyết định quyền truy cập của tài khoản trong hệ thống
            </p>
          </div>

          {/* Trạng thái tài khoản */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-sm cursor-pointer p-space-md rounded-lg hover:bg-surface-container-highest transition-colors">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className={cn(
                  "w-5 h-5 rounded border-2 border-outline",
                  "text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "transition-all",
                )}
              />
              <div className="flex-1">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Tài khoản đang hoạt động
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {formData.isActive
                    ? "Tài khoản có thể đăng nhập và sử dụng hệ thống"
                    : "Tài khoản bị khóa, không thể đăng nhập"}
                </p>
              </div>
              <span
                className={cn(
                  "material-symbols-outlined text-[24px]",
                  formData.isActive ? "text-tertiary" : "text-error",
                )}
              >
                {formData.isActive ? "lock_open" : "lock"}
              </span>
            </label>
          </div>

          {/* Warning nếu khóa tài khoản */}
          {!formData.isActive && (
            <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-error-container/30 border border-error/20">
              <span className="material-symbols-outlined text-error text-[20px]">
                warning
              </span>
              <div className="flex-1">
                <p className="font-body-sm text-body-sm text-on-surface">
                  <strong>Cảnh báo:</strong> Khi khóa tài khoản, người dùng sẽ không thể đăng nhập vào hệ thống. 
                  Bạn có thể mở khóa lại bất cứ lúc nào.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "px-space-lg py-space-sm rounded-lg",
                "bg-surface-container-high text-on-surface",
                "font-label-lg text-label-lg",
                "hover:bg-surface-container-highest transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg",
                "bg-primary text-on-primary font-label-lg text-label-lg",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    save
                  </span>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditDialog;
