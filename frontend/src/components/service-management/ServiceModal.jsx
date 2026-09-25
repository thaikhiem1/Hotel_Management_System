import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/lib/util';

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  serviceCategories,
  mode = 'add',
  initialData = null
}) => {
  const [formData, setFormData] = useState({
    TenDV: '',
    IdLDV: '',
    DonGia: '',
    DonVi: '',
    SLTon: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        TenDV: initialData.TenDV || '',
        IdLDV: initialData.IdLDV || '',
        DonGia: initialData.DonGia || '',
        DonVi: initialData.DonVi || '',
        SLTon: initialData.SLTon === null ? '' : initialData.SLTon
      });
    } else {
      setFormData({
        TenDV: '',
        IdLDV: '',
        DonGia: '',
        DonVi: '',
        SLTon: ''
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.TenDV.trim()) {
      newErrors.TenDV = 'Tên dịch vụ không được để trống';
    }

    if (!formData.IdLDV) {
      newErrors.IdLDV = 'Vui lòng chọn loại dịch vụ';
    }

    if (!formData.DonGia || formData.DonGia < 0) {
      newErrors.DonGia = 'Đơn giá không hợp lệ';
    }

    if (!formData.DonVi.trim()) {
      newErrors.DonVi = 'Đơn vị không được để trống';
    }

    if (formData.SLTon !== '' && formData.SLTon < 0) {
      newErrors.SLTon = 'Số lượng tồn không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        TenDV: formData.TenDV,
        IdLDV: parseInt(formData.IdLDV),
        DonGia: parseFloat(formData.DonGia),
        DonVi: formData.DonVi,
        SLTon: formData.SLTon === '' ? null : parseInt(formData.SLTon)
      });
    }
  };

  const handleClose = () => {
    const initialValues = {
      TenDV: initialData?.TenDV || '',
      IdLDV: initialData?.IdLDV || '',
      DonGia: initialData?.DonGia || '',
      DonVi: initialData?.DonVi || '',
      SLTon: initialData?.SLTon === null ? '' : initialData?.SLTon
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
                value={formData.TenDV}
                onChange={(e) => setFormData({ ...formData, TenDV: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.TenDV 
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
                placeholder="VD: Ăn sáng buffet"
              />
              {errors.TenDV && (
                <p className="mt-space-xs text-error font-body-sm">{errors.TenDV}</p>
              )}
            </div>

            {/* Loại dịch vụ */}
            <div>
              <label className="block font-label-lg text-on-surface mb-space-sm">
                Loại dịch vụ <span className="text-error">*</span>
              </label>
              <select
                value={formData.IdLDV}
                onChange={(e) => setFormData({ ...formData, IdLDV: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.IdLDV 
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                {serviceCategories.map(cat => (
                  <option key={cat.IdLDV} value={cat.IdLDV}>
                    {cat.TenLDV}
                  </option>
                ))}
              </select>
              {errors.IdLDV && (
                <p className="mt-space-xs text-error font-body-sm">{errors.IdLDV}</p>
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
                  value={formData.DonGia}
                  onChange={(e) => setFormData({ ...formData, DonGia: e.target.value })}
                  className={cn(
                    'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                    'focus:outline-none transition-colors',
                    errors.DonGia 
                      ? 'border-error focus:border-error' 
                      : 'border-outline focus:border-primary'
                  )}
                  placeholder="150000"
                />
                {errors.DonGia && (
                  <p className="mt-space-xs text-error font-body-sm">{errors.DonGia}</p>
                )}
              </div>

              <div>
                <label className="block font-label-lg text-on-surface mb-space-sm">
                  Đơn vị <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.DonVi}
                  onChange={(e) => setFormData({ ...formData, DonVi: e.target.value })}
                  className={cn(
                    'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                    'focus:outline-none transition-colors',
                    errors.DonVi 
                      ? 'border-error focus:border-error' 
                      : 'border-outline focus:border-primary'
                  )}
                  placeholder="VD: suất, kg, giờ"
                />
                {errors.DonVi && (
                  <p className="mt-space-xs text-error font-body-sm">{errors.DonVi}</p>
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
                value={formData.SLTon}
                onChange={(e) => setFormData({ ...formData, SLTon: e.target.value })}
                className={cn(
                  'w-full px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md',
                  'focus:outline-none transition-colors',
                  errors.SLTon 
                    ? 'border-error focus:border-error' 
                    : 'border-outline focus:border-primary'
                )}
                placeholder="100"
              />
              {errors.SLTon && (
                <p className="mt-space-xs text-error font-body-sm">{errors.SLTon}</p>
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
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm"
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span>{mode === 'add' ? 'Thêm dịch vụ' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
