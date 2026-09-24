/**
 * Notification Utility
 * Mock notification system - sẽ được thay thế bằng thư viện như toast/snackbar
 */

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 */
export const showSuccess = (message) => {
  console.log('✅ SUCCESS:', message);
  
  // TODO: Thay thế bằng toast notification library
  // Ví dụ: toast.success(message)
  
  // Mock alert (tạm thời)
  alert(`✅ ${message}`);
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo lỗi
 */
export const showError = (message) => {
  console.error('❌ ERROR:', message);
  
  // TODO: Thay thế bằng toast notification library
  // Ví dụ: toast.error(message)
  
  // Mock alert (tạm thời)
  alert(`❌ ${message}`);
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung cảnh báo
 */
export const showWarning = (message) => {
  console.warn('⚠️ WARNING:', message);
  
  // TODO: Thay thế bằng toast notification library
  // Ví dụ: toast.warning(message)
  
  // Mock alert (tạm thời)
  alert(`⚠️ ${message}`);
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông tin
 */
export const showInfo = (message) => {
  console.info('ℹ️ INFO:', message);
  
  // TODO: Thay thế bằng toast notification library
  // Ví dụ: toast.info(message)
  
  // Mock alert (tạm thời)
  alert(`ℹ️ ${message}`);
};

/**
 * Xử lý và hiển thị lỗi từ API
 * @param {Error} error - Error object từ API
 */
export const handleApiError = (error) => {
  let message = 'Đã có lỗi xảy ra';
  
  if (error.response) {
    // Server trả về error response
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = data.message || 'Dữ liệu không hợp lệ';
        break;
      case 401:
        message = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại';
        break;
      case 403:
        message = 'Bạn không có quyền thực hiện thao tác này';
        break;
      case 404:
        message = 'Không tìm thấy dữ liệu';
        break;
      case 409:
        message = data.message || 'Dữ liệu đã tồn tại';
        break;
      case 500:
        message = 'Lỗi máy chủ. Vui lòng thử lại sau';
        break;
      default:
        message = data.message || 'Đã có lỗi xảy ra';
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
  } else {
    // Lỗi khác
    message = error.message || 'Đã có lỗi xảy ra';
  }
  
  showError(message);
};

/**
 * Hiển thị loading notification
 * @param {string} message - Nội dung loading
 * @returns {function} Function để dismiss loading
 */
export const showLoading = (message = 'Đang xử lý...') => {
  console.log('⏳ LOADING:', message);
  
  // TODO: Thay thế bằng loading spinner/overlay
  
  // Return dismiss function
  return () => {
    console.log('⏳ LOADING DISMISSED');
  };
};
