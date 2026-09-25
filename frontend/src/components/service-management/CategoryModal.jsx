import React, { useState } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * CategoryModal - Modal quản lý loại dịch vụ (LoaiDichVu)
 * Table: LoaiDichVu { IdLDV, TenLDV }
 */
const CategoryModal = ({ isOpen, onClose, onAddCategory, categories, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Tên loại dịch vụ không được để trống');
      return;
    }

    if (categories.some(c => c.TenLDV.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('Loại dịch vụ này đã tồn tại');
      return;
    }

    // TODO: API POST /api/service-categories
    // Body: { TenLDV: string }
    // Authorization: Bearer token (quyền Admin/Quản lý)
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setError('');
  };

  const handleDelete = (category) => {
    // TODO: Kiểm tra xem còn dịch vụ nào thuộc loại này không
    // API: GET /api/services?IdLDV={IdLDV}&count=true
    // Nếu count > 0 thì không cho xóa
    if (confirm(`Xóa loại dịch vụ "${category.TenLDV}"?`)) {
      // TODO: API DELETE /api/service-categories/{IdLDV}
      // Authorization: Bearer token (quyền Admin/Quản lý)
      onDeleteCategory(category);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-surface rounded-xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 text-on-secondary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant shadow-md">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px]">category</span>
            <h2 className="font-headline-lg font-bold">Quản lý loại dịch vụ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-space-sm rounded-full hover:bg-on-secondary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Form thêm */}
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-space-xl bg-surface-container-low border-b border-outline-variant">
          <label className="block font-label-lg text-on-surface mb-space-sm">
            Thêm loại dịch vụ mới
          </label>
          <div className="flex gap-space-md">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setError('');
              }}
              className={cn(
                'flex-1 px-space-lg py-space-md rounded-lg border-2 bg-surface text-on-surface font-body-md focus:outline-none transition-colors',
                error ? 'border-error' : 'border-outline focus:border-primary'
              )}
              placeholder="VD: Spa & Massage"
            />
            <button
              type="submit"
              className="px-space-xl py-space-md rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white font-label-lg font-bold transition-all shadow-lg"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          {error && <p className="mt-space-sm text-error font-body-sm">{error}</p>}
        </form>

        {/* Danh sách loại dịch vụ */}
        <div className="flex-1 overflow-y-auto p-space-xl">
          <p className="font-label-md text-on-surface-variant mb-space-md">
            Danh sách loại dịch vụ hiện có ({categories.length})
          </p>
          <div className="space-y-space-sm">
            {categories.map((category) => (
              <div
                key={category.IdLDV}
                className="flex items-center justify-between p-space-lg rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant transition-all"
              >
                <div className="flex items-center gap-space-md">
                  <span className="material-symbols-outlined text-secondary text-[24px]">
                    label
                  </span>
                  <div>
                    <p className="font-title-md font-semibold text-on-surface">
                      {category.TenLDV}
                    </p>
                    <p className="font-body-sm text-on-surface-variant">
                      ID: {category.IdLDV}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-space-md rounded-lg bg-error/20 hover:bg-error text-error hover:text-on-error transition-all shadow-md"
                  title="Xóa loại dịch vụ"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg font-semibold transition-colors shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
