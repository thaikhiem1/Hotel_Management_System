/**
 * API Service - Centralized API calls
 * Hotel Management System
 *
 * Base URL: http://localhost:8080/api
 */

import axios from "axios";

// ============================================
// Cấu hình base URL
// ============================================
const BASE_URL = "http://localhost:8080/api";

// ============================================
// Tạo axios instance với config mặc định
// ============================================
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// ============================================
// Request Interceptor - Thêm token vào header
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// ============================================
// Response Interceptor - Xử lý response và error
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("Response Error:", error.response || error);

    // Xử lý các lỗi HTTP khác nhau
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Chuyển về trang login
          console.error("Unauthorized - Please login");
          // TODO: Redirect to login page
          break;
        case 403:
          // Forbidden - Không có quyền
          console.error("Forbidden - You do not have permission");
          break;
        case 404:
          // Not Found
          console.error("Resource not found");
          break;
        case 500:
          // Server Error
          console.error("Internal server error");
          break;
        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("No response from server");
    } else {
      // Lỗi khi setup request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  },
);

// ============================================
// LOẠI PHÒNG API (RoomType)
// ============================================
export const roomTypeAPI = {
  /**
   * Lấy danh sách tất cả loại phòng
   * GET /api/roomtype
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/roomTypes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết loại phòng theo ID
   * GET /api/roomtype/{id}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/roomTypes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo loại phòng mới
   * POST /api/roomtype
   *
   * @param {Object} data - Dữ liệu loại phòng
   * @param {string} data.TenLPH - Tên loại phòng
   * @param {number} data.SoGiuong - Số giường
   * @param {number} data.SoNguoiToiDa - Số người tối đa
   * @param {number} data.GiaNgay - Giá ngày
   * @param {number} data.GiaGio - Giá giờ
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/roomTypes", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật loại phòng
   * PUT /api/roomtype/{id}
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/roomTypes/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa loại phòng
   * DELETE /api/roomtype/{id}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/roomTypes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// PHÒNG API (Room)
// ============================================
export const roomAPI = {
  /**
   * Lấy danh sách tất cả phòng
   * GET /api/room
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/rooms");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết phòng theo ID
   * GET /api/room/{id}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo phòng mới
   * POST /api/room
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/rooms", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật phòng
   * PUT /api/room/{id}
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/rooms/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa phòng
   * DELETE /api/room/{id}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// KHÁCH HÀNG API (Customer)
// ============================================
export const customerAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/customers");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post("/customers", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customers/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// NHÂN VIÊN API (Employee)
// ============================================
export const employeeAPI = {
  getAll: async ({
    page = 0,
    size = 16,
    search = "",
    isActive = null,
    position = "",
  } = {}) => {
    const params = {
      page,
      size,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (isActive !== null) {
      params.isActive = isActive;
    }

    if (position) {
      params.position = position;
    }

    const response = await apiClient.get("/employees", {
      params,
    });

    return response.data;
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post("/employees", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// PHIẾU THUÊ API (Booking)
// ============================================
export const bookingAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/booking");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/booking/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post("/booking", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/booking/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/booking/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// HÓA ĐƠN API (Invoice)
// ============================================
export const invoiceAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/invoice");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post("/invoice", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoice/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// LOẠI DỊCH VỤ API (Service Categories)
// ============================================
export const serviceCategoryAPI = {
  /**
   * Lấy danh sách tất cả loại dịch vụ
   * GET /api/service-categories
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/service-categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo loại dịch vụ mới
   * POST /api/service-categories
   *
   * @param {Object} data - Dữ liệu loại dịch vụ
   * @param {string} data.serviceCategoryName - Tên loại dịch vụ
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/service-categories", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật loại dịch vụ
   * PATCH /api/service-categories/{id}
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.patch(`/service-categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa loại dịch vụ
   * DELETE /api/service-categories/{id}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/service-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// DỊCH VỤ API (Service)
// ============================================
export const serviceAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/services");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post("/services", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/services/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// Export default axios instance
// ============================================
export default apiClient;
