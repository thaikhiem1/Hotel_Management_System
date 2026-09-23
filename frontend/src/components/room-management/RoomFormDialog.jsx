import React, { useState, useEffect } from 'react';

/**
 * RoomFormDialog - Dialog form để thêm mới hoặc chỉnh sửa thông tin phòng
 * 
 * Props:
 * - isOpen: Boolean - Trạng thái mở/đóng dialog
 * - onClose: Function - Callback khi đóng dialog
 * - onSubmit: Function - Callback khi submit form
 * - editMode: String - 'add' hoặc 'edit'
 * - roomData: Object - Dữ liệu phòng cần sửa (null khi thêm mới)
 * - loaiPhongList: Array - Danh sách loại phòng
 * - isLoading: Boolean - Trạng thái loading
 * 
 * Form fields theo Database.md:
 * - MaPH: Mã phòng (required, unique)
 * - IdLPH: ID loại phòng (required, select dropdown)
 * - TrangThaiPhong: Trạng thái phòng (required, radio buttons: 0-Trống, 1-Đang sửa chữa)
 * - GhiChu: Ghi chú (optional, textarea)
 */
const RoomFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  roomData,
  loaiPhongList,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    MaPH: '',
    IdLPH: '',
    TrangThaiPhong: 0,
    GhiChu: ''
  });

  const [errors, setErrors] = useState({});

  /**
   * Binding dữ liệu khi mở form sửa
   * Khi roomData thay đổi (từ null thành object hoặc ngược lại),
   * form sẽ được reset hoặc binding dữ liệu từ phòng được chọn
   */
  useEffect(() => {
    if (editMode === 'edit' && roomData) {
      setFormData({
        MaPH: roomData.MaPH || '',
        IdLPH: roomData.IdLPH || '',
        TrangThaiPhong: roomData.TrangThaiPhong ?? 0,
        GhiChu: roomData.GhiChu || ''
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        MaPH: '',
        IdLPH: loaiPhongList.length > 0 ? loaiPhongList[0].IdLPH : '',
        TrangThaiPhong: 0,
        GhiChu: ''
      });
    }
    setErrors({});
  }, [editMode, roomData, loaiPhongList]);

  /**
   * Xử lý thay đổi giá trị input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'IdLPH' || name === 'TrangThaiPhong' 
        ? parseInt(value, 10) 
        : value
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

    if (!formData.MaPH.trim()) {
      newErrors.MaPH = 'Vui lòng nhập mã phòng';
    } else if (!/^[A-Z0-9]+$/i.test(formData.MaPH)) {
      newErrors.MaPH = 'Mã phòng chỉ được chứa chữ cái và số';
    }

    if (!formData.IdLPH) {
      newErrors.IdLPH = 'Vui lòng chọn loại phòng';
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
        MaPH: '',
        IdLPH: '',
        TrangThaiPhong: 0,
        GhiChu: ''
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
            <span className="material-symbols-outlined text-primary text-[24px]">
              {editMode === 'add' ? 'add_circle' : 'edit'}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {editMode === 'add' ? 'Thêm phòng mới' : 'Chỉnh sửa thông tin phòng'}
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
          {/* Mã phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">door_front</span>
              <span>Mã phòng</span>
              <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="MaPH"
              value={formData.MaPH}
              onChange={handleChange}
              disabled={isLoading || editMode === 'edit'} // Không cho sửa mã phòng khi edit
              placeholder="Ví dụ: P101, P202..."
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.MaPH ? 'border-error' : 'border-outline-variant'}`}
            />
            {errors.MaPH && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errors.MaPH}</span>
              </p>
            )}
            {editMode === 'edit' && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Mã phòng không thể thay đổi sau khi tạo
              </p>
            )}
          </div>

          {/* Loại phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">category</span>
              <span>Loại phòng</span>
              <span className="text-error">*</span>
            </label>
            <select
              name="IdLPH"
              value={formData.IdLPH}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-space-md py-space-sm rounded-lg border
                       bg-surface-container font-body-md text-body-md text-on-surface
                       focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.IdLPH ? 'border-error' : 'border-outline-variant'}`}
            >
              <option value="">-- Chọn loại phòng --</option>
              {loaiPhongList.map((loaiPhong) => (
                <option key={loaiPhong.IdLPH} value={loaiPhong.IdLPH}>
                  {loaiPhong.TenLPH} - {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(loaiPhong.GiaNgay)}/ngày
                </option>
              ))}
            </select>
            {errors.IdLPH && (
              <p className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errors.IdLPH}</span>
              </p>
            )}
          </div>

          {/* Trạng thái phòng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Trạng thái phòng</span>
              <span className="text-error">*</span>
            </label>
            <div className="flex gap-space-md">
              {/* Trống */}
              <label className="flex items-center gap-space-sm px-space-md py-space-sm
                              rounded-lg border border-outline-variant cursor-pointer
                              hover:bg-surface-container-high transition-colors
                              has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                <input
                  type="radio"
                  name="TrangThaiPhong"
                  value={0}
                  checked={formData.TrangThaiPhong === 0}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">Trống</span>
                </div>
              </label>

              {/* Đang sửa chữa */}
              <label className="flex items-center gap-space-sm px-space-md py-space-sm
                              rounded-lg border border-outline-variant cursor-pointer
                              hover:bg-surface-container-high transition-colors
                              has-[:checked]:border-error has-[:checked]:bg-error/10">
                <input
                  type="radio"
                  name="TrangThaiPhong"
                  value={1}
                  checked={formData.TrangThaiPhong === 1}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-error focus:ring-2 focus:ring-error"
                />
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[20px]">
                    engineering
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">Đang sửa chữa</span>
                </div>
              </label>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">note</span>
              <span>Ghi chú</span>
            </label>
            <textarea
              name="GhiChu"
              value={formData.GhiChu}
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
                  <span>{editMode === 'add' ? 'Thêm phòng' : 'Lưu thay đổi'}</span>
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
