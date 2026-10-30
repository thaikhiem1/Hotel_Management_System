import { useState, useEffect } from "react";
import { cn } from "@/utils/lib/util";
import { resolveAvatarUrl } from "@/utils/avatar";
import { POSITION_OPTIONS, ROLE_LABELS, ROLES } from "@/utils/auth";

const EmployeeProfileDialog = ({
  isOpen,
  onClose,
  onSubmit,
  employeeData = null,
  mode = "view",
  isLoading = false,
  canEdit = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(
    mode === "edit" || mode === "add",
  );
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    position: ROLES.RECEPTIONIST,
    salary: "",
    phone: "",
    citizenId: "",
    dateOfBirth: "",
    gender: "Nam",
    address: "",
    email: "",
    avatar: "",
    isActive: true,
  });

  // Reset form khi dialog mở hoặc dữ liệu nhân viên thay đổi
  useEffect(() => {
    if (!isOpen) return;

    if (employeeData) {
      setFormData({
        fullName: employeeData.fullName || "",
        // Chức vụ cũ chưa chuẩn hóa thì để trống để người dùng chọn lại
        position: [...POSITION_OPTIONS.map((o) => o.value), ROLES.ADMIN].includes(employeeData.position)
          ? employeeData.position
          : "",
        salary: employeeData.salary ?? "",
        phone: employeeData.phone || "",
        citizenId: employeeData.citizenId || "",
        dateOfBirth: employeeData.dateOfBirth || "",
        gender: employeeData.gender || "Nam",
        address: employeeData.address || "",
        email: employeeData.email || "",
        avatar: employeeData.avatar || "",
        isActive: employeeData.isActive ?? true,
      });

    } else {
      setFormData({
        fullName: "",
        position: ROLES.RECEPTIONIST,
        salary: "",
        phone: "",
        citizenId: "",
        dateOfBirth: "",
        gender: "Nam",
        address: "",
        email: "",
        avatar: "",
        isActive: true,
      });

    }

    setErrors({});
    setIsEditMode(mode === "edit" || mode === "add");
  }, [isOpen, employeeData, mode]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Họ tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Họ và tên không được vượt quá 100 ký tự";
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
      newErrors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // Chức vụ
    if (!formData.position) {
      newErrors.position = "Vui lòng chọn chức vụ";
    }

    // Lương
    if (
      formData.salary === "" ||
      formData.salary === null ||
      formData.salary === undefined
    ) {
      newErrors.salary = "Lương không được để trống";
    } else {
      const salaryText = String(formData.salary);
      const salaryNum = Number(salaryText);

      if (!Number.isFinite(salaryNum) || salaryNum < 0) {
        newErrors.salary = "Lương không được âm";
      } else if (!/^\d+(\.\d{1,2})?$/.test(salaryText)) {
        newErrors.salary = "Lương có tối đa hai chữ số thập phân";
      }
    }

    // Số điện thoại
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^0\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone =
        "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0";
    }

    // CCCD
    if (!formData.citizenId.trim()) {
      newErrors.citizenId = "Số CCCD không được để trống";
    } else if (!/^\d{12}$/.test(formData.citizenId.trim())) {
      newErrors.citizenId =
        "Số CCCD phải gồm đúng 12 chữ số";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (formData.email.trim().length > 100) {
      newErrors.email = "Email không được vượt quá 100 ký tự";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Ngày sinh
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    } else {
      const dob = new Date(`${formData.dateOfBirth}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(dob.getTime())) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
      } else if (dob > today) {
        newErrors.dateOfBirth = "Ngày sinh không được nằm trong tương lai";
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        if (age < 18) {
          newErrors.dateOfBirth = "Nhân viên phải đủ 18 tuổi";
        }
      }
    }

    // Giới tính
    if (!formData.gender) {
      newErrors.gender = "Giới tính không được để trống";
    } else if (!["Nam", "Nữ", "Khác"].includes(formData.gender)) {
      newErrors.gender = "Giới tính phải là Nam, Nữ hoặc Khác";
    }

    // Địa chỉ
    if (
      formData.address &&
      formData.address.trim().length > 255
    ) {
      newErrors.address = "Địa chỉ không được vượt quá 255 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const editableFields = { ...formData };
    delete editableFields.avatar;

    onSubmit({
      ...editableFields,
      fullName: formData.fullName.trim(),
      position: formData.position.trim(),
      phone: formData.phone.trim(),
      citizenId: formData.citizenId.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
    }, mode === "add" ? "add" : "edit");
  };

  // Chuyển sang chế độ chỉnh sửa
  const handleToggleEdit = () => {
    setIsEditMode((prev) => !prev);
    setErrors({});
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
          "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto",
          "bg-surface-container-low rounded-2xl shadow-2xl",
          "mx-space-lg",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-space-lg bg-surface-container-low border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-primary text-[28px]">
              {mode === "add" ? "person_add" : "badge"}
            </span>

            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {mode === "add"
                  ? "Thêm nhân viên mới"
                  : isEditMode
                    ? "Chỉnh sửa thông tin"
                    : "Thông tin nhân viên"}
              </h2>

              {employeeData && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  ID: #{employeeData.employeeId}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* Nút chỉnh sửa */}
            {mode === "view" && canEdit && !isEditMode && (
              <button
                type="button"
                onClick={handleToggleEdit}
                className={cn(
                  "flex items-center gap-space-xs px-space-md py-space-sm rounded-lg",
                  "bg-primary text-on-primary font-label-md text-label-md",
                  "hover:bg-primary/90 transition-colors",
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                Chỉnh sửa
              </button>
            )}

            {/* Nút đóng */}
            <button
              type="button"
              onClick={onClose}
              className="p-space-sm rounded-lg hover:bg-surface-container-high transition-colors"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-on-surface text-[24px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-lg">
          {/* Avatar is display-only; it is hidden when adding an employee. */}
          {mode !== "add" && (
            <div className="flex flex-col items-center gap-space-md pb-space-lg border-b border-outline-variant">
              <div className="relative">
                <img
                  src={resolveAvatarUrl(formData.avatar)}
                  alt={`Ảnh đại diện ${formData.fullName || "nhân viên"}`}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/avatars/profileNam.jpg";
                  }}
                />
              </div>

              {isEditMode && (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
                  Ảnh đại diện chỉ được xem và không thể chỉnh sửa tại đây.
                </p>
              )}
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Họ tên */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Họ và tên <span className="text-error">*</span>
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.fullName && "border-error",
                )}
                placeholder="Nhập họ và tên"
              />

              {errors.fullName && (
                <p className="text-error text-sm">{errors.fullName}</p>
              )}
            </div>

            {/* Chức vụ */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Chức vụ <span className="text-error">*</span>
              </label>

              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={!isEditMode || formData.position === ROLES.ADMIN}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.position && "border-error",
                )}
              >
                <option value="" disabled>
                  -- Chọn chức vụ --
                </option>
                {/* Quản trị viên là chức vụ cố định, không chọn và không đổi được */}
                {formData.position === ROLES.ADMIN && (
                  <option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</option>
                )}
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-on-surface-variant text-sm">
                Chức vụ cũng là vai trò đăng nhập của tài khoản nhân viên này.
              </p>

              {errors.position && (
                <p className="text-error text-sm">{errors.position}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Email <span className="text-error">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.email && "border-error",
                )}
                placeholder="email@example.com"
                maxLength={100}
              />

              {errors.email && (
                <p className="text-error text-sm">{errors.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Số điện thoại <span className="text-error">*</span>
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.phone && "border-error",
                )}
                placeholder="0123456789"
                maxLength={10}
              />

              {errors.phone && (
                <p className="text-error text-sm">{errors.phone}</p>
              )}
            </div>

            {/* CCCD */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Căn cước công dân (CCCD){" "}
                <span className="text-error">*</span>
              </label>

              <input
                type="text"
                name="citizenId"
                value={formData.citizenId}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.citizenId && "border-error",
                )}
                placeholder="001234567890"
                maxLength={12}
              />

              {errors.citizenId && (
                <p className="text-error text-sm">{errors.citizenId}</p>
              )}
            </div>

            {/* Ngày sinh */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Ngày sinh <span className="text-error">*</span>
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.dateOfBirth && "border-error",
                )}
              />

              {errors.dateOfBirth && (
                <p className="text-error text-sm">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Giới tính <span className="text-error">*</span>
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.gender && "border-error",
                )}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>

              {errors.gender && (
                <p className="text-error text-sm">{errors.gender}</p>
              )}
            </div>

            {/* Lương */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Lương (VNĐ) <span className="text-error">*</span>
              </label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all",
                  errors.salary && "border-error",
                )}
                placeholder="10000000"
                min="0"
                step="0.01"
              />

              {errors.salary && (
                <p className="text-error text-sm">{errors.salary}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="space-y-space-xs md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Địa chỉ
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditMode}
                rows={3}
                maxLength={255}
                className={cn(
                  "w-full px-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all resize-none",
                  errors.address && "border-error",
                )}
                placeholder="Nhập địa chỉ đầy đủ"
              />

              {errors.address && (
                <p className="text-error text-sm">{errors.address}</p>
              )}
            </div>

            {/* Trạng thái làm việc: ẩn khi thêm nhân viên mới */}
            {mode !== "add" && (
              <div className="space-y-space-xs md:col-span-2">
                <label className="flex items-center gap-space-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    className={cn(
                      "w-5 h-5 rounded border-2 border-outline",
                      "text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      "transition-all",
                    )}
                  />

                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Đang làm việc
                  </span>
                </label>

                <p className="font-body-sm text-body-sm text-on-surface-variant ml-7">
                  Bỏ chọn nếu nhân viên đã nghỉ việc
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant">
              <button
                type="button"
                onClick={mode === "view" ? handleToggleEdit : onClose}
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
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      {mode === "add" ? "person_add" : "save"}
                    </span>
                    {mode === "add" ? "Thêm nhân viên" : "Lưu thay đổi"}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeProfileDialog;