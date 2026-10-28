import { useState, useEffect } from 'react';
import { cn } from '@/utils/lib/util';

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  serviceCategories,
  mode = 'add',
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCategoryId: '',
    unitPrice: '',
    unit: '',
    stockQuantity: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        serviceName: initialData.serviceName || '',
        serviceCategoryId: initialData.serviceCateroriesId ?? '',
        unitPrice: initialData.unitPrice ?? '',
        unit: initialData.unit || '',
        stockQuantity: initialData.stockQuality ?? ''
      });
    } else {
      setFormData({
        serviceName: '',
        serviceCategoryId: '',
        unitPrice: '',
        unit: '',
        stockQuantity: ''
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Tên dịch vụ không được để trống';
    } else if (formData.serviceName.trim().length > 100) {
      newErrors.serviceName = 'Tên dịch vụ không được vượt quá 100 ký tự';
    }

    if (!formData.serviceCategoryId || Number(formData.serviceCategoryId) <= 0) {
      newErrors.serviceCategoryId = 'Vui lòng chọn loại dịch vụ';
    }

    const unitPrice = Number(formData.unitPrice);
    if (formData.unitPrice === '' || !Number.isFinite(unitPrice) || unitPrice < 0) {
      newErrors.unitPrice = 'Đơn giá phải là số không âm';
    } else if (!/^\d{1,16}(\.\d{1,2})?$/.test(String(formData.unitPrice))) {
      newErrors.unitPrice = 'Đơn giá có tối đa 16 chữ số phần nguyên và 2 chữ số phần thập phân';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Đơn vị tính không được để trống';
    } else if (formData.unit.trim().length > 20) {
      newErrors.unit = 'Đơn vị tính không được vượt quá 20 ký tự';
    }

    if (formData.stockQuantity !== '' &&
        (!/^\d+$/.test(String(formData.stockQuantity)) || Number(formData.stockQuantity) < 0)) {
      newErrors.stockQuantity = 'Số lượng tồn kho phải là số nguyên không âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        serviceName: formData.serviceName.trim(),
        serviceCategoryId: Number(formData.serviceCategoryId),
        unitPrice: Number(formData.unitPrice),
        unit: formData.unit.trim(),
        stockQuantity: formData.stockQuantity === '' ? null : Number(formData.stockQuantity)
      });
    }
  };

  const handleClose = () => {
    const initialValues = {
      serviceName: initialData?.serviceName || '',
      serviceCategoryId: initialData?.serviceCateroriesId ?? '',
      unitPrice: initialData?.unitPrice ?? '',
      unit: initialData?.unit || '',
      stockQuantity: initialData?.stockQuality ?? ''
    };
    
    if (JSON.stringify(formData) !== JSON.stringify(initialValues)) {
      if (!confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?')) {
        return;
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-surface rounded-xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant shadow-md">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px]">
              {mode === 'add' ? 'add_circle' : 'edit'}
            </span>
            <h2 className="font-headline-lg font-bold">
              {mode === 'add' ? 'Thêm dịch vụ mới' : 'Sửa thông tin dịch vụ'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-space-xl">
          <div className="space-y-space-lg">
            {/* Tên dịch vụ */}
            <div>
              <label className="block font-label-lg text-on-surface mb-space-sm">
                Tên dịch vụ <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.serviceName
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
                placeholder="VD: Ăn sáng buffet"
              />
              {errors.serviceName && (
                <p className="mt-space-xs text-error font-body-sm">{errors.serviceName}</p>
              )}
            </div>

            {/* Loại dịch vụ */}
            <div>
              <label className="block font-label-lg text-on-surface mb-space-sm">
                Loại dịch vụ <span className="text-error">*</span>
              </label>
              <select
                value={formData.serviceCategoryId}
                onChange={(e) => setFormData({ ...formData, serviceCategoryId: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.serviceCategoryId
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                {serviceCategories.map(category => (
                  <option key={category.serviceCategoryId} value={category.serviceCategoryId}>
                    {category.serviceCategoryName}
                  </option>
                ))}
              </select>
              {errors.serviceCategoryId && (
                <p className="mt-space-xs text-error font-body-sm">{errors.serviceCategoryId}</p>
              )}
            </div>

            {/* Đơn giá & Đơn vị */}
            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <label className="block font-label-lg text-on-surface mb-space-sm">
                  Đơn giá (VNĐ) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className={cn(
                    'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                    'focus:outline-none transition-colors',
                    errors.unitPrice
                      ? 'border-error focus:border-error' 
                      : 'border-outline focus:border-primary'
                  )}
                  placeholder="150000"
                />
                {errors.unitPrice && (
                  <p className="mt-space-xs text-error font-body-sm">{errors.unitPrice}</p>
                )}
              </div>

              <div>
                <label className="block font-label-lg text-on-surface mb-space-sm">
                  Đơn vị <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className={cn(
                    'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                    'focus:outline-none transition-colors',
                    errors.unit
                      ? 'border-error focus:border-error' 
                      : 'border-outline focus:border-primary'
                  )}
                  placeholder="VD: suất, kg, giờ"
                />
                {errors.unit && (
                  <p className="mt-space-xs text-error font-body-sm">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* Số lượng tồn */}
            <div>
              <label className="block font-label-lg text-on-surface mb-space-sm">
                Số lượng tồn kho (để trống nếu không áp dụng)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.stockQuantity
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
                placeholder="100"
              />
              {errors.stockQuantity && (
                <p className="mt-space-xs text-error font-body-sm">{errors.stockQuantity}</p>
              )}
              <p className="mt-space-xs text-on-surface-variant font-body-sm">
                Dùng cho dịch vụ có hàng tồn kho (minibar, nước uống, v.v.)
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex gap-space-md justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm"
          >
            <span className="material-symbols-outlined">
              {isSubmitting ? 'progress_activity' : 'check_circle'}
            </span>
            <span>
              {isSubmitting
                ? 'Đang lưu...'
                : mode === 'add'
                  ? 'Thêm dịch vụ'
                  : 'Lưu thay đổi'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
