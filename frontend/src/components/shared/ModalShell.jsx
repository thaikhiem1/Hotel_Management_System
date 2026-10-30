
/**
 * ModalShell - Khung modal dùng chung (overlay, header, nội dung cuộn, footer cố định)
 * cùng kiểu với RoomDetailModal / AddServiceModal.
 *
 * Props:
 * - icon, title, subtitle: phần header
 * - onClose: đóng modal (nút X)
 * - closeDisabled: khóa nút X khi đang xử lý
 * - maxWidth: class max-w-* của hộp modal
 * - footer: nội dung footer (nút thao tác)
 */
const ModalShell = ({
  icon,
  title,
  subtitle,
  onClose,
  closeDisabled = false,
  maxWidth = "max-w-3xl",
  footer,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div
      className={`relative w-full ${maxWidth} max-h-[90vh] bg-surface rounded-xl shadow-2xl m-4 flex flex-col overflow-hidden`}
    >
      <div className="bg-primary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
        <div className="flex items-center gap-space-md">
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body-md text-body-md opacity-90">{subtitle}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={closeDisabled}
          className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-space-xl space-y-space-lg">
        {children}
      </div>

      {footer && (
        <div className="bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex gap-space-md justify-end">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export default ModalShell;
