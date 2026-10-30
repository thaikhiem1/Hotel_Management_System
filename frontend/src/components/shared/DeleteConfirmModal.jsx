
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="bg-error text-on-error px-space-xl py-space-lg flex items-center gap-space-md border-b border-outline-variant">
          <span className="material-symbols-outlined text-[32px]">
            warning
          </span>
          <h2 className="font-headline-lg text-headline-lg font-bold">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-space-xl">
          <p className="font-body-lg text-body-lg text-on-surface">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex gap-space-md justify-end">
          <button
            onClick={onClose}
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-space-xl py-space-md rounded-lg bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg font-bold transition-colors shadow-lg flex items-center gap-space-sm"
          >
            <span className="material-symbols-outlined">delete</span>
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
