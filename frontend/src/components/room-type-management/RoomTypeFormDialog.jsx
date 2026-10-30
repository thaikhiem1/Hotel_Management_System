import { useState, useEffect } from "react";

const RoomTypeFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  roomTypeData,
  isLoading,
}) => {
  const initialFormData = {
    roomTypeName: "",
    numberOfBeds: 1,
    maximumOccupancy: 2,
    dailyRate: 0,
    hourlyRate: 0,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  /**
   * Binding dữ liệu khi mở form thêm/sửa
   */
  useEffect(() => {
    if (!isOpen) return;

    if (editMode === "edit" && roomTypeData) {
      setFormData({
        roomTypeName: roomTypeData.roomTypeName ?? "",
        numberOfBeds: roomTypeData.numberOfBeds ?? 1,
        maximumOccupancy: roomTypeData.maximumOccupancy ?? 2,
        dailyRate: roomTypeData.dailyRate ?? 0,
        hourlyRate: roomTypeData.hourlyRate ?? 0,
      });
    } else {
      setFormData({ ...initialFormData });
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
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    // Xóa lỗi của trường đang được chỉnh sửa
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Kiểm tra dữ liệu trước khi gửi lên backend
   */
  const validate = () => {
    const newErrors = {};

    // Tên loại phòng
    const roomTypeName = formData.roomTypeName.trim();

    if (!roomTypeName) {
      newErrors.roomTypeName = "Vui lòng nhập tên loại phòng";
    } else if (roomTypeName.length > 100) {
      newErrors.roomTypeName =
        "Tên loại phòng không được vượt quá 100 ký tự";
    } else if (!/^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(roomTypeName)) {
      newErrors.roomTypeName =
        "Tên loại phòng chỉ được chứa chữ cái và khoảng trắng giữa các từ";
    }

    // Số giường: số nguyên từ 1 đến 10
    if (
      formData.numberOfBeds === "" ||
      !Number.isInteger(formData.numberOfBeds) ||
      formData.numberOfBeds < 1 ||
      formData.numberOfBeds > 10
    ) {
      newErrors.numberOfBeds =
        "Số giường phải là số nguyên từ 1 đến 10";
    }

    // Sức chứa: số nguyên từ 2 đến 20
    if (
      formData.maximumOccupancy === "" ||
      !Number.isInteger(formData.maximumOccupancy) ||
      formData.maximumOccupancy < 2 ||
      formData.maximumOccupancy > 20
    ) {
      newErrors.maximumOccupancy =
        "Sức chứa phải là số nguyên từ 2 đến 20 người";
    }

    // Giá ngày
    if (
      formData.dailyRate === "" ||
      !Number.isFinite(formData.dailyRate) ||
      formData.dailyRate < 0
    ) {
      newErrors.dailyRate =
        "Giá ngày phải là số lớn hơn hoặc bằng 0";
    } else if (
      !/^\d+(\.\d{1,2})?$/.test(String(formData.dailyRate))
    ) {
      newErrors.dailyRate =
        "Giá ngày chỉ được có tối đa 2 chữ số thập phân";
    }

    // Giá giờ
    if (
      formData.hourlyRate === "" ||
      !Number.isFinite(formData.hourlyRate) ||
      formData.hourlyRate < 0
    ) {
      newErrors.hourlyRate =
        "Giá giờ phải là số lớn hơn hoặc bằng 0";
    } else if (
      !/^\d+(\.\d{1,2})?$/.test(String(formData.hourlyRate))
    ) {
      newErrors.hourlyRate =
        "Giá giờ chỉ được có tối đa 2 chữ số thập phân";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (!validate()) return;

    onSubmit({
      ...formData,
      roomTypeName: formData.roomTypeName.trim(),
    });
  };

  /**
   * Xử lý đóng dialog
   */
  const handleClose = () => {
    if (isLoading) return;

    setFormData({ ...initialFormData });
    setErrors({});
    onClose();
  };

  /**
   * Class input dùng chung
   */
  const getInputClass = (fieldName) =>
    `w-full px-space-md py-space-sm rounded-lg border
     bg-surface-container font-body-md text-body-md text-on-surface
     focus:outline-none focus:ring-2 focus:ring-primary
     disabled:opacity-50 disabled:cursor-not-allowed
     ${
       errors[fieldName]
         ? "border-error focus:border-error"
         : "border-outline-variant"
     }`;

  /**
   * Hiển thị thông báo lỗi bên dưới trường
   */
  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;

    return (
      <p
        className="mt-1 flex items-start gap-space-xs text-error font-body-sm text-body-sm"
        role="alert"
      >
        <span className="material-symbols-outlined text-[16px]">
          error
        </span>
        <span>{errors[fieldName]}</span>
      </p>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/50">
      <div
        className="w-full max-w-2xl bg-surface-container-low rounded-lg shadow-xl
                   animate-fade-in-up overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-space-lg py-space-md
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
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Đóng biểu mẫu"
            className="p-space-xs rounded-lg hover:bg-surface-container-highest
                       transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-space-lg space-y-space-md"
        >
          {/* Tên loại phòng */}
          <div className="space-y-space-xs">
            <label
              htmlFor="roomTypeName"
              className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">
                badge
              </span>
              <span>Tên loại phòng</span>
              <span className="text-error">*</span>
            </label>

            <input
              id="roomTypeName"
              type="text"
              name="roomTypeName"
              value={formData.roomTypeName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ví dụ: Phòng Deluxe, Phòng Suite..."
              maxLength={100}
              aria-invalid={Boolean(errors.roomTypeName)}
              aria-describedby={
                errors.roomTypeName ? "roomTypeName-error" : undefined
              }
              className={getInputClass("roomTypeName")}
            />

            {errors.roomTypeName && (
              <div id="roomTypeName-error">
                {renderError("roomTypeName")}
              </div>
            )}
          </div>

          {/* Số giường và sức chứa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Số giường */}
            <div className="space-y-space-xs">
              <label
                htmlFor="numberOfBeds"
                className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  bed
                </span>
                <span>Số giường</span>
                <span className="text-error">*</span>
              </label>

              <input
                id="numberOfBeds"
                type="number"
                name="numberOfBeds"
                value={formData.numberOfBeds}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                max="10"
                step="1"
                aria-invalid={Boolean(errors.numberOfBeds)}
                aria-describedby={
                  errors.numberOfBeds ? "numberOfBeds-error" : undefined
                }
                className={getInputClass("numberOfBeds")}
              />

              {errors.numberOfBeds && (
                <div id="numberOfBeds-error">
                  {renderError("numberOfBeds")}
                </div>
              )}
            </div>

            {/* Số người tối đa */}
            <div className="space-y-space-xs">
              <label
                htmlFor="maximumOccupancy"
                className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  group
                </span>
                <span>Số người tối đa</span>
                <span className="text-error">*</span>
              </label>

              <input
                id="maximumOccupancy"
                type="number"
                name="maximumOccupancy"
                value={formData.maximumOccupancy}
                onChange={handleChange}
                disabled={isLoading}
                min="2"
                max="20"
                step="1"
                aria-invalid={Boolean(errors.maximumOccupancy)}
                aria-describedby={
                  errors.maximumOccupancy
                    ? "maximumOccupancy-error"
                    : undefined
                }
                className={getInputClass("maximumOccupancy")}
              />

              {errors.maximumOccupancy && (
                <div id="maximumOccupancy-error">
                  {renderError("maximumOccupancy")}
                </div>
              )}
            </div>
          </div>

          {/* Giá ngày và giá giờ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Giá ngày */}
            <div className="space-y-space-xs">
              <label
                htmlFor="dailyRate"
                className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  payments
                </span>
                <span>Giá ngày (VNĐ)</span>
                <span className="text-error">*</span>
              </label>

              <input
                id="dailyRate"
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="0.01"
                placeholder="800000"
                aria-invalid={Boolean(errors.dailyRate)}
                aria-describedby={
                  errors.dailyRate ? "dailyRate-error" : undefined
                }
                className={getInputClass("dailyRate")}
              />

              {errors.dailyRate && (
                <div id="dailyRate-error">
                  {renderError("dailyRate")}
                </div>
              )}
            </div>

            {/* Giá giờ */}
            <div className="space-y-space-xs">
              <label
                htmlFor="hourlyRate"
                className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  schedule
                </span>
                <span>Giá giờ (VNĐ)</span>
              </label>

              <input
                id="hourlyRate"
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="0.01"
                placeholder="100000"
                aria-invalid={Boolean(errors.hourlyRate)}
                aria-describedby={
                  errors.hourlyRate ? "hourlyRate-error" : undefined
                }
                className={getInputClass("hourlyRate")}
              />

              {errors.hourlyRate && (
                <div id="hourlyRate-error">
                  {renderError("hourlyRate")}
                </div>
              )}
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
                    {editMode === "add"
                      ? "Thêm loại phòng"
                      : "Lưu thay đổi"}
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
