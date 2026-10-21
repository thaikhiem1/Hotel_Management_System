import React, { useState, useEffect } from "react";
import { cn } from "@/utils/lib/util";

/**
 * AccountFormDialog - Dialog tạo tài khoản mới
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng dialog
 * @param {Function} onClose - Hàm đóng dialog
 * @param {Function} onSubmit - Hàm xử lý submit form
 * @param {Array} availableEmployees - Danh sách nhân viên chưa có tài khoản
 * @param {boolean} isLoading - Trạng thái loading
 */
const AccountFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  availableEmployees = [],
  isLoading = false,
}) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    employeeId: "",
  });

  // Reset form khi dialog mở/đóng
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        password: "",
        employeeId: "",
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    } else if (formData.username.length > 50) {
      newErrors.username = "Tên đăng nhập không được vượt quá 50 ký tự";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.employeeId) {
      newErrors.employeeId = "Vui lòng chọn nhân viên";
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

    // Chuyển đổi employeeId sang number
    const submitData = {
      ...formData,
      employeeId: parseInt(formData.employeeId, 10),
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

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
              person_add
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Tạo tài khoản mới
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tạo tài khoản đăng nhập cho nhân viên
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
          {/* Hướng dẫn */}
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-primary-container/30 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[20px]">
              info
            </span>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-on-surface">
                Tài khoản mới sẽ được tạo với vai trò <strong>Nhân viên lễ tân</strong> và trạng thái <strong>Đang hoạt động</strong> mặc định.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-space-md">
            {/* Chọn nhân viên */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Nhân viên <span className="text-error">*</span>
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all",
                  errors.employeeId && "border-error focus:ring-error",
                )}
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.fullName} - {employee.position})
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  {errors.employeeId}
                </p>
              )}
              {availableEmployees.length === 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    warning
                  </span>
                  Không có nhân viên nào chưa có tài khoản
                </p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Tên đăng nhập <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                autoComplete="username"
                onChange={handleInputChange}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all",
                  errors.username && "border-error focus:ring-error",
                )}
                placeholder="Nhập tên đăng nhập"
                maxLength={50}
                required
              />
              {errors.username && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  {errors.username}
                </p>
              )}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tên đăng nhập không được trùng lặp trong hệ thống
              </p>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className={cn(
                    "w-full px-space-md py-space-sm pr-12 rounded-lg",
                    "bg-surface-container-highest border border-outline",
                    "font-body-md text-body-md text-on-surface",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "transition-all",
                    errors.password && "border-error focus:ring-error",
                  )}
                  placeholder="Nhập mật khẩu"
                  required
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
              {errors.password && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  {errors.password}
                </p>
              )}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Mật khẩu phải có ít nhất 6 ký tự và sẽ được mã hóa khi lưu
              </p>
            </div>
          </div>

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
              disabled={isLoading || availableEmployees.length === 0}
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
                  Đang tạo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  Tạo tài khoản
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormDialog;
