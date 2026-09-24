import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * EmployeeProfileDialog - Dialog hiển thị và chỉnh sửa profile nhân viên
 * @param {boolean} isOpen - Trạng thái mở/đóng dialog
 * @param {Function} onClose - Hàm đóng dialog
 * @param {Function} onSubmit - Hàm xử lý submit form
 * @param {Object} employeeData - Dữ liệu nhân viên (null nếu thêm mới)
 * @param {string} mode - 'view' | 'edit' | 'add'
 * @param {boolean} isLoading - Trạng thái loading
 * @param {boolean} canEdit - Quyền chỉnh sửa (admin/manager hoặc chính nhân viên đó)
 */
const EmployeeProfileDialog = ({
  isOpen,
  onClose,
  onSubmit,
  employeeData = null,
  mode = 'view',
  isLoading = false,
  canEdit = false
}) => {
  const fileInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(mode === 'edit' || mode === 'add');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    tenNV: '',
    chucVu: 'Nhân Viên',
    luong: '',
    sdt: '',
    cccd: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    diaChi: '',
    email: '',
    avatar: '',
    isWorking: true
  });

  // Reset form khi dialog mở/đóng hoặc data thay đổi
  useEffect(() => {
    if (isOpen) {
      if (employeeData) {
        setFormData({
          tenNV: employeeData.tenNV || '',
          chucVu: employeeData.chucVu || 'Nhân Viên',
          luong: employeeData.luong || '',
          sdt: employeeData.sdt || '',
          cccd: employeeData.cccd || '',
          ngaySinh: employeeData.ngaySinh || '',
          gioiTinh: employeeData.gioiTinh || 'Nam',
          diaChi: employeeData.diaChi || '',
          email: employeeData.email || '',
          avatar: employeeData.avatar || '',
          isWorking: employeeData.isWorking ?? true
        });
        setAvatarPreview(employeeData.avatar);
      } else {
        // Reset form cho chế độ thêm mới
        setFormData({
          tenNV: '',
          chucVu: 'Nhân Viên',
          luong: '',
          sdt: '',
          cccd: '',
          ngaySinh: '',
          gioiTinh: 'Nam',
          diaChi: '',
          email: '',
          avatar: '',
          isWorking: true
        });
        setAvatarPreview(null);
      }
      setIsEditMode(mode === 'edit' || mode === 'add');
    }
  }, [isOpen, employeeData, mode]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      // Preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result // Base64 string hoặc URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.tenNV.trim()) {
      alert('Vui lòng nhập tên nhân viên!');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email!');
      return;
    }
    
    if (!formData.sdt.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    onSubmit(formData);
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditMode(!isEditMode);
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
      <div className={cn(
        'relative w-full max-w-4xl max-h-[90vh] overflow-y-auto',
        'bg-surface-container-low rounded-2xl shadow-2xl',
        'mx-space-lg'
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-space-lg bg-surface-container-low border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-primary text-[28px]">
              {mode === 'add' ? 'person_add' : 'badge'}
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {mode === 'add' ? 'Thêm nhân viên mới' : 
                 isEditMode ? 'Chỉnh sửa thông tin' : 'Thông tin nhân viên'}
              </h2>
              {employeeData && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  ID: #{employeeData.idNV}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* Toggle Edit Button */}
            {mode === 'view' && canEdit && !isEditMode && (
              <button
                onClick={handleToggleEdit}
                className={cn(
                  'flex items-center gap-space-xs px-space-md py-space-sm rounded-lg',
                  'bg-primary text-on-primary font-label-md text-label-md',
                  'hover:bg-primary/90 transition-colors'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Chỉnh sửa
              </button>
            )}

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
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-lg">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-space-md pb-space-lg border-b border-outline-variant">
            <div className="relative">
              <img
                src={avatarPreview || formData.avatar || 'https://via.placeholder.com/150'}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Avatar';
                }}
              />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'absolute bottom-0 right-0 p-space-sm rounded-full',
                    'bg-primary text-on-primary shadow-lg',
                    'hover:bg-primary/90 transition-colors'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    photo_camera
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={!isEditMode}
              />
            </div>
            {isEditMode && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
                Click vào icon camera để thay đổi ảnh đại diện
                <br />
                (Tối đa 5MB, định dạng: JPG, PNG, GIF)
              </p>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Tên nhân viên */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Họ và tên <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="tenNV"
                value={formData.tenNV}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            {/* Chức vụ */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Chức vụ <span className="text-error">*</span>
              </label>
              <select
                name="chucVu"
                value={formData.chucVu}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                required
              >
                <option value="Nhân Viên">Nhân Viên</option>
                <option value="Quản Lý">Quản Lý</option>
              </select>
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
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Số điện thoại <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                name="sdt"
                value={formData.sdt}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                placeholder="0123456789"
                required
              />
            </div>

            {/* CCCD */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Căn cước công dân (CCCD)
              </label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                placeholder="001234567890"
              />
            </div>

            {/* Ngày sinh */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Ngày sinh
              </label>
              <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Giới tính
              </label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Lương */}
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Lương (VNĐ)
              </label>
              <input
                type="number"
                name="luong"
                value={formData.luong}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all'
                )}
                placeholder="10000000"
                min="0"
                step="100000"
              />
            </div>

            {/* Địa chỉ - Full width */}
            <div className="space-y-space-xs md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Địa chỉ
              </label>
              <textarea
                name="diaChi"
                value={formData.diaChi}
                onChange={handleInputChange}
                disabled={!isEditMode}
                rows="3"
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all resize-none'
                )}
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>

            {/* Trạng thái làm việc */}
            <div className="space-y-space-xs md:col-span-2">
              <label className="flex items-center gap-space-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isWorking"
                  checked={formData.isWorking}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={cn(
                    'w-5 h-5 rounded border-2 border-outline',
                    'text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'transition-all'
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
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant">
              <button
                type="button"
                onClick={mode === 'view' ? handleToggleEdit : onClose}
                disabled={isLoading}
                className={cn(
                  'px-space-lg py-space-sm rounded-lg',
                  'bg-surface-container-high text-on-surface',
                  'font-label-lg text-label-lg',
                  'hover:bg-surface-container-highest transition-colors',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg',
                  'bg-primary text-on-primary font-label-lg text-label-lg',
                  'hover:bg-primary/90 transition-colors',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
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
                      {mode === 'add' ? 'person_add' : 'save'}
                    </span>
                    {mode === 'add' ? 'Thêm nhân viên' : 'Lưu thay đổi'}
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
