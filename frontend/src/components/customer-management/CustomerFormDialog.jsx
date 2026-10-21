import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * CustomerFormDialog - Dialog thêm/sửa thông tin khách hàng
 * @param {boolean} isOpen - Trạng thái mở/đóng dialog
 * @param {Function} onClose - Hàm đóng dialog
 * @param {Function} onSubmit - Hàm xử lý submit form
 * @param {string} editMode - 'add' | 'edit'
 * @param {Object} customerData - Dữ liệu khách hàng (khi edit)
 * @param {boolean} isLoading - Trạng thái loading
 */
const CustomerFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editMode = 'add',
  customerData = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    citizenId: '',
    nationality: 'Việt Nam',
    gender: 'Nam'
  });

  const [errors, setErrors] = useState({});

  // Reset form khi dialog mở/đóng hoặc data thay đổi
  useEffect(() => {
    if (isOpen) {
      if (editMode === 'edit' && customerData) {
        setFormData({
          fullName: customerData.fullName || '',
          phone: customerData.phone || '',
          citizenId: customerData.citizenId || '',
          nationality: customerData.nationality || 'Việt Nam',
          gender: customerData.gender || 'Nam'
        });
      } else {
        // Reset form cho chế độ thêm mới
        setFormData({
          fullName: '',
          phone: '',
          citizenId: '',
          nationality: 'Việt Nam',
          gender: 'Nam'
        });
      }
      setErrors({});
    }
  }, [isOpen, editMode, customerData]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Họ và tên (bắt buộc)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }

    // Số điện thoại (bắt buộc)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } 

    // CCCD/Passport (bắt buộc)
    if (!formData.citizenId.trim()) {
      newErrors.citizenId = 'Số giấy tờ tùy thân/hộ chiếu không được để trống';
    } 

    // Quốc tịch (bắt buộc)
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Quốc tịch không được để trống';
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
    onSubmit(formData);
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
        'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto',
        'bg-surface-container-low rounded-2xl shadow-2xl',
        'mx-space-lg'
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-space-lg bg-surface-container-low border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-primary text-[28px]">
              {editMode === 'add' ? 'person_add' : 'edit'}
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {editMode === 'add' ? 'Thêm khách hàng mới' : 'Chỉnh sửa thông tin khách hàng'}
              </h2>
              {editMode === 'edit' && customerData && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  ID: #{customerData.customerId}
                </p>
              )}
            </div>
          </div>

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
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
          {/* Tên khách hàng */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
              Tên khách hàng <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={cn(
                'w-full px-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border',
                errors.fullName ? 'border-error' : 'border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
              placeholder="Nhập họ và tên khách hàng"
            />
            {errors.fullName && (
              <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[20px]">
                phone
              </span>
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={cn(
                'w-full px-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border',
                errors.phone ? 'border-error' : 'border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
              placeholder="0123456789"
            />
            {errors.phone && (
              <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {errors.phone}
              </p>
            )}
          </div>

          {/* CCCD/Passport */}
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[20px]">
                badge
              </span>
              CCCD / Passport <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleInputChange}
              className={cn(
                'w-full px-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border',
                errors.citizenId ? 'border-error' : 'border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
              placeholder="001234567890 hoặc AB1234567"
            />
            {errors.citizenId && (
              <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {errors.citizenId}
              </p>
            )}
          </div>

          {/* Row: Quốc tịch và Giới tính */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Quốc tịch */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[20px]">
                  flag
                </span>
                Quốc tịch <span className="text-error">*</span>
              </label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border',
                  errors.nationality ? 'border-error' : 'border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all'
                )}
              >
                <option value="Việt Nam">Việt Nam</option>
                <option value="Mỹ">Mỹ</option>
                <option value="Anh">Anh</option>
                <option value="Pháp">Pháp</option>
                <option value="Đức">Đức</option>
                <option value="Nhật Bản">Nhật Bản</option>
                <option value="Hàn Quốc">Hàn Quốc</option>
                <option value="Trung Quốc">Trung Quốc</option>
                <option value="Thái Lan">Thái Lan</option>
                <option value="Singapore">Singapore</option>
                <option value="Úc">Úc</option>
                <option value="Canada">Canada</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.nationality && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {errors.nationality}
                </p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[20px]">
                  wc
                </span>
                Giới tính <span className="text-error">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={cn(
                  'w-full px-space-md py-space-sm rounded-lg',
                  'bg-surface-container-highest border',
                  errors.gender ? 'border-error' : 'border-outline',
                  'font-body-md text-body-md text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all'
                )}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.gender && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {errors.gender}
                </p>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
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
                    {editMode === 'add' ? 'add' : 'save'}
                  </span>
                  {editMode === 'add' ? 'Thêm khách hàng' : 'Lưu thay đổi'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormDialog;
