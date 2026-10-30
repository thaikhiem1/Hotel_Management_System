import Toast from './Toast';

/**
 * ToastContainer - Container chứa tất cả các toast
 * Hiển thị ở góc phải dưới màn hình
 * @param {Array} toasts - Mảng các toast đang hiển thị
 * @param {Function} onRemoveToast - Callback để xóa toast
 */
const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-space-lg right-space-lg z-[9999] flex flex-col-reverse gap-space-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
