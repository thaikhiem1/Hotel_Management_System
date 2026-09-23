import React, { useState, useEffect } from 'react';

/**
 * RoomTypeFormDialog - Dialog form để thêm mới hoặc chỉnh sửa loại phòng
 * 
 * Props:
 * - isOpen: Boolean - Trạng thái mở/đóng dialog
 * - onClose: Function - Callback khi đóng dialog
 * - onSubmit: Function - Callback khi submit form
 * - editMode: String - 'add' hoặc 'edit'
 * - roomTypeData: Object - Dữ liệu loại phòng cần sửa (null khi thêm mới)
 * - isLoading: Boolean - Trạng thái loading
 * 
 * Form fields theo Database.md:
 * - TenLPH: Tên loại phòng (required)
 * - SoGiuong: Số giường (required, number, min: 1)
 * - SoNguoiToiDa: Số người tối đa (required, number, min: 1)
 * - GiaNgay: Giá ngày (required, number, min: 0)
 * - GiaGio: Giá giờ (optional, number, min: 0)
 */
const RoomTypeFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  roomTypeData,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    TenLPH: '',
    SoGiuong: 1,
    SoNguoiToiDa: 2,
    GiaNgay: 0,
    GiaGio: 0
  });

  const [errors, setErrors] = useState({});

  /**
   * Binding dữ liệu khi mở form sửa
   */
  useEffect(() => {
    if (editMode === 'edit' && roomTypeData) {
      setFormData({
        TenLPH: roomTypeData.TenLPH || '',
        SoGiuong: roomTypeData.SoGiuong || 1,
        SoNguoiToiDa: roomTypeData.SoNguoiToiDa || 2,
        GiaNgay: roomTypeData.GiaNgay || 0,
        GiaGio: roomTypeData.GiaGio || 0
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        TenLPH: '',
        SoGiuong: 1,
        SoNguoiToiDa: 2,
        GiaNgay: 0,
        GiaGio: 0
      });
    }
    setErrors({});
  }, [editMode, roomTypeData]);

  /**
   * Xử lý thay đổi giá trị input
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.TenLPH.trim()) {
      newErrors.TenLPH = 'Vui lòng nhập tên loại phòng';
    }

    if (formData.SoGiuong < 1) {
      newErrors.SoGiuong = 'Số giường phải lớn hơn 0';
    }

    if (formData.SoNguoiToiDa < 1) {
      newErrors.SoNguoiToiDa = 'Số người tối đa phải lớn hơn 0';
    }

    if (formData.GiaNgay <= 0) {
      newErrors.GiaNgay = 'Giá ngày phải lớn hơn 0';
    }

    if (formData.GiaGio < 0) {
      newErrors.GiaGio = 'Giá giờ không được âm';
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
        TenLPH: '',
        SoGiuong: 1,
        SoNguoiToiDa: 2,
        GiaNgay: 0,
        GiaGio: 0
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/50">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-lg shadow-xl
                    animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md
                      bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              {editMode === 'add' ? 'add_circle' : 'edit'}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {editMode === 'add' ? 'Thêm loại phòng mới' : 'Chỉnh sửa loại phòng'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-space-xs rounded-lg hover:bg-surface-container-highest
                     transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
          {/* Tên loại phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Tên loại phòng</span>
              <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="TenLPH"
              value={formData.TenLPH}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ví dụ: Phòng Deluxe, Phòng Suite..."
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.TenLPH ? 'border-error' : 'border-outline-variant'}`}
            />
            {errors.TenLPH && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errors.TenLPH}</span>
              </p>
            )}
          </div>

          {/* Grid 2 cột cho Số giường và Số người tối đa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Số giường */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">bed</span>
                <span>Số giường</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="SoGiuong"
                value={formData.SoGiuong}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.SoGiuong ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.SoGiuong && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errors.SoGiuong}</span>
                </p>
              )}
            </div>

            {/* Số người tối đa */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">group</span>
                <span>Số người tối đa</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="SoNguoiToiDa"
                value={formData.SoNguoiToiDa}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.SoNguoiToiDa ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.SoNguoiToiDa && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errors.SoNguoiToiDa}</span>
                </p>
              )}
            </div>
          </div>

          {/* Grid 2 cột cho Giá ngày và Giá giờ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Giá ngày */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>Giá ngày (VNĐ)</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="GiaNgay"
                value={formData.GiaNgay}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="10000"
                placeholder="800000"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.GiaNgay ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.GiaNgay && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errors.GiaNgay}</span>
                </p>
              )}
            </div>

            {/* Giá giờ */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span>Giá giờ (VNĐ)</span>
              </label>
              <input
                type="number"
                name="GiaGio"
                value={formData.GiaGio}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="10000"
                placeholder="100000"
                className={`w-full px-space-md py-space-sm rounded-lg border
                         bg-surface-container font-body-md text-body-md text-on-surface
                         focus:outline-none focus:ring-2 focus:ring-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${errors.GiaGio ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.GiaGio && (
                <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errors.GiaGio}</span>
                </p>
              )}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Để trống hoặc 0 nếu không cho thuê theo giờ
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-md
                        border-t border-outline-variant">
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
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent
                                rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {editMode === 'add' ? 'add' : 'save'}
                  </span>
                  <span>{editMode === 'add' ? 'Thêm loại phòng' : 'Lưu thay đổi'}</span>
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
