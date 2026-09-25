import React, { useState, useEffect } from "react";

const RoomTypeFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  roomTypeData,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    room_type_name: "",
    number_of_beds: 1,
    maximum_occupancy: 2,
    daily_rate: 0,
    hourly_rate: 0,
  });

  const [errors, setErrors] = useState({});

  /**
   * Binding dữ liệu khi mở form sửa
   */
  useEffect(() => {
    if (!isOpen) return;
    if (editMode === "edit" && roomTypeData) {
      setFormData({
        room_type_name: roomTypeData.room_type_name || "",
        number_of_beds: roomTypeData.number_of_beds || 1,
        maximum_occupancy: roomTypeData.maximum_occupancy || 2,
        daily_rate: roomTypeData.daily_rate || 0,
        hourly_rate: roomTypeData.hourly_rate || 0,
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        room_type_name: "",
        number_of_beds: 1,
        maximum_occupancy: 2,
        daily_rate: 0,
        hourly_rate: 0,
      });
    }
    setErrors({});
  }, [isOpen, editMode, roomTypeData]);

  /**
   * Xử lý thay đổi giá trị input
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || "" : value,
    }));

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.room_type_name.trim()) {
      newErrors.room_type_name = "Vui lòng nhập tên loại phòng";
    }

    if (formData.number_of_beds < 1) {
      newErrors.number_of_beds = "Số giường phải lớn hơn 0";
    }

    if (formData.maximum_occupancy < 1) {
      newErrors.maximum_occupancy = "Số người tối đa phải lớn hơn 0";
    }

    if (formData.daily_rate <= 0) {
      newErrors.daily_rate = "Giá ngày phải lớn hơn 0";
    }

    if (formData.hourly_rate < 0) {
      newErrors.hourly_rate = "Giá giờ không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  /**
   * Xử lý đóng dialog
   */
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        room_type_name: "",
        number_of_beds: 1,
        maximum_occupancy: 2,
        daily_rate: 0,
        hourly_rate: 0,
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/50">
      <div
        className="w-full max-w-2xl bg-surface-container-low rounded-lg shadow-xl
                    animate-fade-in-up overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-space-lg py-space-md
                      bg-surface-container-high border-b border-outline-variant"
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              {editMode === "add" ? "add_circle" : "edit"}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {editMode === "add"
                ? "Thêm loại phòng mới"
                : "Chỉnh sửa loại phòng"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-space-xs rounded-lg hover:bg-surface-container-highest
                     transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
          {/* Tên loại phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                badge
              </span>
              <span>Tên loại phòng</span>
              <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="room_type_name"
              value={formData.room_type_name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ví dụ: Phòng Deluxe, Phòng Suite..."
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.room_type_name ? "border-error" : "border-outline-variant"}`}
            />
            {errors.room_type_name && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                <span>{errors.room_type_name}</span>
              </p>
            )}
          </div>

          {/* Grid 2 cột cho Số giường và Số người tối đa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Số giường */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  bed
                </span>
                <span>Số giường</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="number_of_beds"
                value={formData.number_of_beds}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.number_of_beds ? "border-error" : "border-outline-variant"}`}
              />
              {errors.number_of_beds && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  <span>{errors.number_of_beds}</span>
                </p>
              )}
            </div>

            {/* Số người tối đa */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  group
                </span>
                <span>Số người tối đa</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="maximum_occupancy"
                value={formData.maximum_occupancy}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.maximum_occupancy ? "border-error" : "border-outline-variant"}`}
              />
              {errors.maximum_occupancy && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  <span>{errors.maximum_occupancy}</span>
                </p>
              )}
            </div>
          </div>

          {/* Grid 2 cột cho Giá ngày và Giá giờ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Giá ngày */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  payments
                </span>
                <span>Giá ngày (VNĐ)</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="daily_rate"
                value={formData.daily_rate}
                onChange={handleChange}
                disabled={isLoading}
                required
                min="0"
                step="1"
                placeholder="800000"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.daily_rate ? "border-error" : "border-outline-variant"}`}
              />
              {errors.daily_rate && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  <span>{errors.daily_rate}</span>
                </p>
              )}
            </div>

            {/* Giá giờ */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  schedule
                </span>
                <span>Giá giờ (VNĐ)</span>
              </label>
              <input
                type="number"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleChange}
                disabled={isLoading}
                required
                min="0"
                step="1"
                placeholder="100000"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.hourly_rate ? "border-error" : "border-outline-variant"}`}
              />
              {errors.hourly_rate && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  <span>{errors.hourly_rate}</span>
                </p>
              )}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Để trống hoặc 0 nếu không cho thuê theo giờ
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-end gap-space-sm pt-space-md
                        border-t border-outline-variant"
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg
                       text-on-surface bg-surface-container-high
                       hover:bg-surface-container-highest transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg
                       font-label-lg text-label-lg text-on-primary bg-primary
                       hover:bg-primary/90 transition-colors shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-on-primary border-t-transparent
                                rounded-full animate-spin"
                  />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {editMode === "add" ? "add" : "save"}
                  </span>
                  <span>
                    {editMode === "add" ? "Thêm loại phòng" : "Lưu thay đổi"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeFormDialog;
