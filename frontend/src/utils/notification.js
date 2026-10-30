/**
 * Notification Utility
 * Sử dụng Toast context để hiển thị notifications
 * 
 * Note: File này cung cấp functions không cần hook
 * Để sử dụng trong components, prefer useToast() hook
 */

// Store toast manager instance
let toastManager = null;

/**
 * Initialize toast manager
 * Được gọi tự động từ ToastContext
 */
export const initToastManager = (manager) => {
  toastManager = manager;
};

/**
 * Hiển thị thông báo thành công
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo (optional)
 * @param {number} duration - Thời gian hiển thị ms (optional)
 */
export const showSuccess = (title, message = '', duration) => {
  if (toastManager) {
    toastManager.success(title, message, duration);
  } else {
    alert(`✅ ${title}${message ? '\n' + message : ''}`);
  }
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} title - Tiêu đề thông báo lỗi
 * @param {string} message - Nội dung thông báo lỗi (optional)
 * @param {number} duration - Thời gian hiển thị ms (optional)
 */
export const showError = (title, message = '', duration) => {
  if (toastManager) {
    toastManager.error(title, message, duration);
  } else {
    alert(`❌ ${title}${message ? '\n' + message : ''}`);
  }
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} title - Tiêu đề cảnh báo
 * @param {string} message - Nội dung cảnh báo (optional)
 * @param {number} duration - Thời gian hiển thị ms (optional)
 */
export const showWarning = (title, message = '', duration) => {
  if (toastManager) {
    toastManager.warning(title, message, duration);
  } else {
    alert(`⚠️ ${title}${message ? '\n' + message : ''}`);
  }
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} title - Tiêu đề thông tin
 * @param {string} message - Nội dung thông tin (optional)
 * @param {number} duration - Thời gian hiển thị ms (optional)
 */
export const showInfo = (title, message = '', duration) => {
  if (toastManager) {
    toastManager.info(title, message, duration);
  } else {
    alert(`ℹ️ ${title}${message ? '\n' + message : ''}`);
  }
};

/**
 * Xử lý và hiển thị lỗi từ API
 * @param {Error} error - Error object từ API
 */
export const handleApiError = (error) => {
  let title;
  let message;
  
  if (error.response) {
    // Server trả về error response
    const { status, data } = error.response;
    
    // Hiển thị mã HTTP trong title
    const httpCode = `[${status}]`;
    
    switch (status) {
      case 400:
        title = `${httpCode} ${data.error || 'Dữ liệu không hợp lệ'}`;
        
        // Xử lý validation errors (fieldErrors)
        if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
          const fieldErrors = Object.entries(data.fieldErrors)
            .map(([, msg]) => `• ${msg}`)
            .join('\n');
          message = fieldErrors;
        } else {
          message = data.message || 'Vui lòng kiểm tra lại thông tin';
        }
        break;
        
      case 401:
        title = `${httpCode} ${data.error || 'Phiên đăng nhập hết hạn'}`;
        message = data.message || 'Vui lòng đăng nhập lại';
        break;
        
      case 403:
        title = `${httpCode} ${data.error || 'Không có quyền truy cập'}`;
        message = data.message || 'Bạn không có quyền thực hiện thao tác này';
        break;
        
      case 404:
        title = `${httpCode} ${data.error || 'Không tìm thấy'}`;
        message = data.message || 'Dữ liệu không tồn tại hoặc đã bị xóa';
        break;
        
      case 409:
        title = `${httpCode} ${data.error || 'Dữ liệu đã tồn tại'}`;
        message = data.message || 'Vui lòng kiểm tra lại';
        break;
        
      case 500:
        title = `${httpCode} ${data.error || 'Lỗi máy chủ'}`;
        message = data.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau';
        break;
        
      default:
        title = `${httpCode} ${data.error || 'Lỗi'}`;
        message = data.message || 'Đã có lỗi xảy ra';
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    title = 'Lỗi kết nối';
    message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
  } else {
    // Lỗi khác
    title = 'Lỗi';
    message = error.message || 'Đã có lỗi xảy ra';
  }
  
  showError(title, message, 6000);
};

/**
 * Hiển thị loading notification
 * @param {string} message - Nội dung loading
 * @returns {function} Function để dismiss loading
 */
export const showLoading = () => {
  // TODO: Implement loading spinner/overlay if needed
  
  // Return dismiss function
  return () => {
    // Loading dismissed
  };
};
