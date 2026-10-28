import axios from "axios";


// Cấu hình base URL

const BASE_URL = "http://localhost:8080/api";


// Tạo axios instance với config mặc định

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request Interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Xử lý response và error

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các lỗi HTTP khác nhau
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Chuyển về trang login
          break;
        case 403:
          // Forbidden - Không có quyền
          break;
        case 404:
          // Not Found
          break;
        case 500:
          // Server Error
          break;
        default:
          // Other errors
          break;
      }
    }

    return Promise.reject(error);
  },
);


// LOẠI PHÒNG API (RoomType)

export const roomTypeAPI = {
  /**
   * UC-RTY-004: Lấy danh sách loại phòng với phân trang
   * GET /api/roomTypes?page=0&size=16
   * 
   * @param {Object} params - Tham số phân trang
   * @param {number} params.page - Số trang (bắt đầu từ 0)
   * @param {number} params.size - Số bản ghi mỗi trang
   * @returns {Promise<ApiResponse<Page<RoomTypeResponse>>>}
   */
  getAll: async ({ page = 0, size = 16 } = {}) => {
    try {
      const response = await apiClient.get("/roomTypes", {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết loại phòng theo ID
   * GET /api/roomTypes/{id}
   * 
   * @param {number} id - ID loại phòng
   * @returns {Promise<ApiResponse<RoomTypeResponse>>}
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
   * UC-RTY-001: Tạo loại phòng mới
   * POST /api/roomTypes
   *
   * @param {Object} data - Dữ liệu loại phòng
   * @param {string} data.roomTypeName - Tên loại phòng (max 100 chars, chỉ chữ cái + khoảng trắng)
   * @param {number} data.numberOfBeds - Số giường [1-10]
   * @param {number} data.maximumOccupancy - Số người tối đa [2-20]
   * @param {number} data.dailyRate - Giá ngày (>=0, max 2 chữ số thập phân)
   * @param {number} data.hourlyRate - Giá giờ (>=0, max 2 chữ số thập phân)
   * @returns {Promise<ApiResponse<RoomTypeResponse>>}
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
   * UC-RTY-002: Cập nhật loại phòng
   * PUT /api/roomTypes/{id}
   * 
   * @param {number} id - ID loại phòng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<ApiResponse<RoomTypeResponse>>}
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
   * UC-RTY-003: Xóa loại phòng
   * DELETE /api/roomTypes/{id}
   * 
   * Chỉ xóa được nếu không có phòng nào đang sử dụng loại phòng này
   * 
   * @param {number} id - ID loại phòng
   * @returns {Promise<ApiResponse<void>>}
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


// PHÒNG API (Room)

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


// KHÁCH HÀNG API (Customer)

export const customerAPI = {
  /**
   * GET /api/customers?page=0&size=16&search=keyword&gender=Nam&nationality=Việt Nam
   */
  getAll: async ({ page = 0, size = 16, search = "", gender = "", nationality = "" } = {}) => {
    try {
      const params = { page, size };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      if (gender && gender.trim()) {
        params.gender = gender.trim();
      }
      
      if (nationality && nationality.trim()) {
        params.nationality = nationality.trim();
      }
      
      const response = await apiClient.get("/customers", { params });
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

// NHÂN VIÊN API (Employee)

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

// PHIẾU THUÊ API (Booking)

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

// HÓA ĐƠN API (Invoice)

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

// LOẠI DỊCH VỤ API (Service Categories)

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

// DỊCH VỤ API (Service)

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

// TÀI KHOẢN API (Account)

export const accountAPI = {
  /**
   * UC-ACC-001: Tạo tài khoản mới
   * POST /api/accounts
   * 
   * @param {Object} data - Dữ liệu tài khoản
   * @param {string} data.username - Tên đăng nhập
   * @param {string} data.password - Mật khẩu
   * @param {number} data.employeeId - ID nhân viên
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/accounts", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả tài khoản có phân trang
   * GET /api/accounts?page=0&size=16&isActive=true
   */
  getAll: async ({ page = 0, size = 16, isActive = null } = {}) => {
    try {
      const params = { page, size };
      
      // Chỉ thêm isActive vào params nếu có giá trị
      if (isActive !== null && isActive !== undefined) {
        params.isActive = isActive;
      }
      
      const response = await apiClient.get("/accounts", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thông tin tài khoản theo ID
   * GET /api/accounts/{accountId}
   */
  getById: async (accountId) => {
    try {
      const response = await apiClient.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * REQ-ACC-002 & REQ-ACC-003: Cập nhật tài khoản
   * PUT /api/accounts/{accountId}
   * 
   * @param {number} accountId - ID tài khoản
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} data.username - Tên đăng nhập mới (optional)
   * @param {string} data.newPassword - Mật khẩu mới (optional)
   * @param {string} data.role - Vai trò mới (ADMIN/MANAGER/RECEPTIONIST) (optional)
   * @param {boolean} data.isActive - Trạng thái tài khoản (optional)
   */
  update: async (accountId, data) => {
    try {
      const response = await apiClient.put(`/accounts/${accountId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách nhân viên chưa có tài khoản
   * GET /api/accounts/available-employees
   */
  getAvailableEmployees: async () => {
    try {
      const response = await apiClient.get("/accounts/available-employees");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
