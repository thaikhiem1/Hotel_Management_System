import React from 'react';

const GenericDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  itemName = 'item',
  itemDetails = [],
  warningMessage = 'Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống. Vui lòng kiểm tra kỹ trước khi thực hiện.',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/50">
      <div className="w-full max-w-md bg-surface-container-low rounded-lg shadow-xl
                    animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-space-sm px-space-lg py-space-md
                      bg-error/10 border-b border-error/20">
          <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-[24px]">
              warning
            </span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {title}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-space-lg py-space-md space-y-space-md">
          <p className="font-body-md text-body-md text-on-surface">
            Bạn có chắc chắn muốn xóa {itemName} này không?
          </p>

          {/* Chi tiết item sẽ bị xóa */}
          {itemDetails.length > 0 && (
            <div className="p-space-md rounded-lg bg-surface-container border border-outline-variant
                          space-y-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  info
                </span>
                <span className="font-label-lg text-label-lg text-on-surface">
                  Thông tin chi tiết
                </span>
              </div>
              
              <div className="pl-space-lg space-y-space-xs">
                {itemDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {detail.label}:
                    </span>
                    <span className={`font-body-md text-body-md ${
                      detail.highlight ? 'text-primary font-semibold' : 'text-on-surface'
                    }`}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cảnh báo */}
          <div className="flex items-start gap-space-sm p-space-md rounded-lg
                        bg-error/10 border border-error/20">
            <span className="material-symbols-outlined text-error text-[20px] mt-[2px]">
              info
            </span>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-error">
                <strong>Lưu ý:</strong> {warningMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-space-sm px-space-lg py-space-md
                      bg-surface-container-high border-t border-outline-variant">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg
                     text-on-surface bg-surface-container
                     hover:bg-surface-container-highest transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg
                     font-label-lg text-label-lg text-white bg-error
                     hover:bg-error/90 transition-colors shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                              rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">delete</span>
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericDeleteDialog;
