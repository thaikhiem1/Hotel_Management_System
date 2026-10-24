import React, { useState, useEffect } from "react";

const RoomFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  roomData,
  roomTypeData = [],
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    room_code: "",
    room_type_id: "",
    room_status: "AVAILABLE",
    note: "",
  });

  const [errors, setErrors] = useState({});

  /**
   * Binding dữ liệu khi mở form sửa
   **/
useEffect(() => {
  if (!isOpen) return;

  if (editMode === "edit" && roomData) {
    // Ép kiểu an toàn, tránh bị NaN
    let rawId = roomData.room_type_id;
    let room_type_id =
      rawId !== null && rawId !== undefined && !isNaN(Number(rawId))
        ? Number(rawId)
        : "";

    // Fallback: tìm theo room_type_name nếu không có room_type_id hợp lệ
    if (!room_type_id && roomData.room_type_name && roomTypeData.length > 0) {
      const matched = roomTypeData.find(
        (lp) => lp.roomTypeName === roomData.room_type_name,
      );
      room_type_id = matched ? matched.roomTypeId : "";
    }

    setFormData({
      room_code: roomData.room_code || "",
      room_type_id:
        room_type_id !== "" && !isNaN(room_type_id) ? room_type_id : "",
      room_status: roomData.room_status || "AVAILABLE",
      note: roomData.note || "",
    });
  } else if (editMode === "add") {
    setFormData({
      room_code: "",
      room_type_id: roomTypeData.length > 0 ? roomTypeData[0].roomTypeId : "",
      room_status: "AVAILABLE",
      note: "",
    });
  }
  setErrors({});
}, [isOpen, editMode, roomData, roomTypeData]);

  // Xử lý thay đổi giá trị input
 const handleChange = (e) => {
   const { name, value } = e.target;

   setFormData((prev) => ({
     ...prev,
     [name]:
       name === "room_type_id"
         ? value === ""
           ? ""
           : isNaN(Number(value))
             ? ""
             : Number(value)
         : value,
   }));

   if (errors[name]) {
     setErrors((prev) => ({ ...prev, [name]: "" }));
   }
 };

  const validate = () => {
    const newErrors = {};

    if (!formData.room_code.trim()) {
      newErrors.room_code = "Vui lòng nhập mã phòng";
    } else if (!/^[A-Z0-9]+$/i.test(formData.room_code.trim())) {
      newErrors.room_code = "Mã phòng chỉ được chứa chữ cái và số";
    }

    if (!formData.room_type_id) {
      newErrors.room_type_id = "Vui lòng chọn loại phòng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      room_code: formData.room_code,
      room_type_id: formData.room_type_id,
      room_status: editMode === "add" ? "AVAILABLE" : formData.room_status,
      note: formData.note || null,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        room_code: "",
        room_type_id: "",
        room_status: "AVAILABLE",
        note: "",
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
            <span className="material-symbols-outlined text-primary text-[24px]">
              {editMode === "add" ? "add_circle" : "edit"}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {editMode === "add"
                ? "Thêm phòng mới"
                : "Chỉnh sửa thông tin phòng"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-space-xs rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
          {/* Mã phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                door_front
              </span>
              <span>Mã phòng</span>
              <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="room_code"
              value={formData.room_code}
              onChange={handleChange}
              disabled={isLoading || editMode === "edit"} // Không cho sửa mã phòng khi edit
              placeholder="Ví dụ: P101, P202..."
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.room_code ? "border-error" : "border-outline-variant"}`}
            />
            {errors.room_code && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                <span>{errors.room_code}</span>
              </p>
            )}
            {editMode === "edit" && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Mã phòng không thể thay đổi sau khi tạo
              </p>
            )}
          </div>

          {/* Loại phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                category
              </span>
              <span>Loại phòng</span>
              <span className="text-error">*</span>
            </label>
            <select
              name="room_type_id"
              value={formData.room_type_id}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.room_type_id ? "border-error" : "border-outline-variant"}`}
            >
              <option value="">
                {roomTypeData.length === 0
                  ? "-- Không có loại phòng --"
                  : "-- Chọn loại phòng --"}
              </option>

              {roomTypeData.map((roomType) => (
                <option key={roomType.roomTypeId} value={roomType.roomTypeId}>
                  {roomType.roomTypeName}
                </option>
              ))}
            </select>
            {errors.room_type_id && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                <span>{errors.room_type_id}</span>
              </p>
            )}
          </div>
          {/* Trạng thái phòng*/}
          {editMode === "edit" && (
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  info
                </span>
                <span>Trạng thái phòng</span>
                <span className="text-error">*</span>
              </label>
              <div className="flex gap-space-md">
                {/* Trống */}
                <label
                  className="flex items-center gap-space-sm px-space-md py-space-sm
                                rounded-lg border border-outline-variant cursor-pointer
                                hover:bg-surface-container-high transition-colors
                                has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <input
                    type="radio"
                    name="room_status"
                    value="AVAILABLE"
                    checked={formData.room_status === "AVAILABLE"}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      check_circle
                    </span>
                    <span className="font-body-md text-body-md text-on-surface">
                      Trống
                    </span>
                  </div>
                </label>

                {/* Đang sửa chữa */}
                <label
                  className="flex items-center gap-space-sm px-space-md py-space-sm
                                rounded-lg border border-outline-variant cursor-pointer
                                hover:bg-surface-container-high transition-colors
                                has-[:checked]:border-error has-[:checked]:bg-error/10"
                >
                  <input
                    type="radio"
                    name="room_status"
                    value="UNDER_MAINTENANCE"
                    checked={formData.room_status === "UNDER_MAINTENANCE"}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-4 h-4 text-error focus:ring-2 focus:ring-error"
                  />
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-error text-[20px]">
                      engineering
                    </span>
                    <span className="font-body-md text-body-md text-on-surface">
                      Đang sửa chữa
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                note
              </span>
              <span>Ghi chú</span>
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Nhập ghi chú về phòng (tùy chọn)..."
              rows={4}
              className="w-full px-space-md py-space-sm rounded-lg border border-outline-variant
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary resize-none
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
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
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {editMode === "add" ? "add" : "save"}
                  </span>
                  <span>
                    {editMode === "add" ? "Thêm phòng" : "Lưu thay đổi"}
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

export default RoomFormDialog;
