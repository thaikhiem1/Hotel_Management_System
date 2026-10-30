import { useState } from 'react';
import { cn } from '@/utils/lib/util';

const CategoryModal = ({ isOpen, onClose, onAddCategory, onEditCategory, categories, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Tên loại dịch vụ không được để trống');
      return;
    }

    if (categories.some(c => c.serviceCategoryName.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('Loại dịch vụ này đã tồn tại');
      return;
    }

    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setError('');
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.serviceCategoryName);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editCategoryName.trim()) {
      setEditError('Tên loại dịch vụ không được để trống');
      return;
    }

    if (categories.some(c => 
      c.serviceCategoryId !== editingCategory.serviceCategoryId && 
      c.serviceCategoryName.toLowerCase() === editCategoryName.trim().toLowerCase()
    )) {
      setEditError('Loại dịch vụ này đã tồn tại');
      return;
    }

    await onEditCategory(editingCategory.serviceCategoryId, editCategoryName.trim());
    setEditingCategory(null);
    setEditCategoryName('');
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditError('');
  };

  const handleDelete = (category) => {
    if (window.confirm(`Xóa loại dịch vụ "${category.serviceCategoryName}"?`)) {
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
              className="px-space-xl py-space-md rounded-lg bg-gradient-to-r from-brand-light to-brand-dark hover:from-brand-dark hover:to-brand-light text-white font-label-lg font-bold transition-all shadow-lg"
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
                key={category.serviceCategoryId}
                className="flex items-center justify-between p-space-lg rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant transition-all"
              >
                {editingCategory?.serviceCategoryId === category.serviceCategoryId ? (
                  // Edit Mode
                  <form onSubmit={handleEditSubmit} className="flex-1 flex items-center gap-space-md">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => {
                          setEditCategoryName(e.target.value);
                          setEditError('');
                        }}
                        className={cn(
                          'w-full px-space-md py-space-sm rounded-lg border-2 bg-surface text-on-surface font-body-md focus:outline-none transition-colors',
                          editError ? 'border-error' : 'border-outline focus:border-primary'
                        )}
                        autoFocus
                      />
                      {editError && <p className="mt-space-xs text-error font-body-sm">{editError}</p>}
                    </div>
                    <div className="flex gap-space-sm">
                      <button
                        type="submit"
                        className="p-space-md rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white transition-all shadow-md"
                        title="Lưu"
                      >
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-all shadow-md"
                        title="Hủy"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center gap-space-md">
                      <span className="material-symbols-outlined text-secondary text-[24px]">
                        label
                      </span>
                      <div>
                        <p className="font-title-md font-semibold text-on-surface">
                          {category.serviceCategoryName}
                        </p>
                        <p className="font-body-sm text-on-surface-variant">
                          ID: {category.serviceCategoryId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-space-sm">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="p-space-md rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-700 dark:text-blue-300 hover:text-white transition-all shadow-md"
                        title="Sửa loại dịch vụ"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-space-md rounded-lg bg-error/20 hover:bg-error text-error hover:text-on-error transition-all shadow-md"
                        title="Xóa loại dịch vụ"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
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
