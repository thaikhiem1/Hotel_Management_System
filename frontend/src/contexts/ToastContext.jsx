import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ToastContainer from '@/components/ui/ToastContainer';
import { initToastManager } from '@/utils/notification';

/**
 * Toast Context - Quản lý toast notifications toàn ứng dụng
 */
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Thêm toast mới
   * @param {Object} toast - Toast config
   */
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  /**
   * Xóa toast theo ID
   * @param {string|number} id - Toast ID
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Xóa tất cả toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper functions cho các loại toast phổ biến
  const success = useCallback((title, message, duration) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title, message, duration) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title, message, duration) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title, message, duration) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };

  // Initialize toast manager cho notification.js
  useEffect(() => {
    initToastManager(value);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
