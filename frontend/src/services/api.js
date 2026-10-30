import axios from "axios";
import { clearAuth, getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 seconds
});

// Request: gắn JWT vào header Authorization
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 -> token hết hạn/không hợp lệ, xóa phiên và báo cho AuthContext
// (trừ chính request đăng nhập: 401 ở đó nghĩa là sai mật khẩu)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      clearAuth();
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  },
);

// Các hàm gọi API trả về response.data (ApiResponse / Page) và để lỗi axios tự ném cho nơi gọi xử lý.
const unwrap = (request) => request.then((response) => response.data);

/**
 * Tạo bộ CRUD chuẩn cho một resource: getAll, getById, create, update, delete.
 * @param {string} path - ví dụ "/rooms"
 * @param {{updateMethod?: "put"|"patch"}} options
 */
const createCrudApi = (path, { updateMethod = "put" } = {}) => ({
  getAll: (params) => unwrap(apiClient.get(path, { params })),
  getById: (id) => unwrap(apiClient.get(`${path}/${id}`)),
  create: (data) => unwrap(apiClient.post(path, data)),
  update: (id, data) => unwrap(apiClient[updateMethod](`${path}/${id}`, data)),
  delete: (id) => unwrap(apiClient.delete(`${path}/${id}`)),
});

/** Bỏ các tham số lọc rỗng (chuỗi trống / null / undefined) trước khi gửi lên server */
const compactParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === ""),
    ),
  );

// XÁC THỰC (Auth)
export const authAPI = {
  /** POST /api/auth/login - { username, password } -> { accessToken, tokenType, expiresIn, user } */
  login: (data) => unwrap(apiClient.post("/auth/login", data)),

  /** GET /api/auth/me - tài khoản + nhân viên của người đang đăng nhập */
  me: () => unwrap(apiClient.get("/auth/me")),
};

// LOẠI PHÒNG (RoomType)
const roomTypeCrud = createCrudApi("/roomTypes");
export const roomTypeAPI = {
  ...roomTypeCrud,
  /** GET /api/roomTypes?page=0&size=16 (phân trang, page bắt đầu từ 0) */
  getAll: ({ page = 0, size = 16 } = {}) => roomTypeCrud.getAll({ page, size }),
};

// PHÒNG (Room)
export const roomAPI = createCrudApi("/rooms");

// KHÁCH HÀNG (Customer)
const customerCrud = createCrudApi("/customers");
export const customerAPI = {
  ...customerCrud,
  /** GET /api/customers?page&size&search&gender&nationality */
  getAll: ({ page = 0, size = 16, search, gender, nationality } = {}) =>
    customerCrud.getAll(
      compactParams({
        page,
        size,
        search: search?.trim(),
        gender: gender?.trim(),
        nationality: nationality?.trim(),
      }),
    ),
};

// NHÂN VIÊN (Employee)
const employeeCrud = createCrudApi("/employees");
export const employeeAPI = {
  ...employeeCrud,
  /** GET /api/employees?page&size&search&isActive&position */
  getAll: ({ page = 0, size = 16, search, isActive, position } = {}) =>
    employeeCrud.getAll(
      compactParams({ page, size, search: search?.trim(), isActive, position }),
    ),
};

// PHIẾU THUÊ (Booking)
export const bookingAPI = createCrudApi("/booking");

// PHIẾU THUÊ (Rental Receipt) - UC-REN-001, UC-REN-009, UC-REN-010
export const rentalReceiptAPI = {
  /** GET /api/rental-receipts?page&size - mới nhất trước */
  getAll: ({ page = 0, size = 20 } = {}) =>
    unwrap(apiClient.get("/rental-receipts", { params: { page, size } })),

  getById: (id) => unwrap(apiClient.get(`/rental-receipts/${id}`)),

  /** UC-REN-009: GET /api/rental-receipts/available-rooms?checkIn&checkOut (ISO yyyy-MM-ddTHH:mm:ss) */
  getAvailableRooms: ({ checkIn, checkOut }) =>
    unwrap(apiClient.get("/rental-receipts/available-rooms", { params: { checkIn, checkOut } })),

  /** UC-REN-010: tính chi phí dự kiến. details: [{ roomId, numberOfGuests, checkIn, checkOut, pricingMethod }] */
  estimate: (details) => unwrap(apiClient.post("/rental-receipts/estimate", { details })),

  /** UC-REN-001: { customerId, details, expectedTotalAmount? } - đơn giá do máy chủ tự tính */
  create: (data) => unwrap(apiClient.post("/rental-receipts", data)),
};

// HÓA ĐƠN (Invoice)
export const invoiceAPI = createCrudApi("/invoice");

// LOẠI DỊCH VỤ (Service Categories) - cập nhật bằng PATCH
export const serviceCategoryAPI = createCrudApi("/service-categories", {
  updateMethod: "patch",
});

// DỊCH VỤ (Service)
export const serviceAPI = createCrudApi("/services");

// TÀI KHOẢN (Account)
const accountCrud = createCrudApi("/accounts");
export const accountAPI = {
  create: accountCrud.create,
  getById: accountCrud.getById,
  update: accountCrud.update,

  /** GET /api/accounts?page&size&isActive */
  getAll: ({ page = 0, size = 16, isActive } = {}) =>
    accountCrud.getAll(compactParams({ page, size, isActive })),

  /** GET /api/accounts/available-employees - nhân viên chưa có tài khoản */
  getAvailableEmployees: () =>
    unwrap(apiClient.get("/accounts/available-employees")),
};

export default apiClient;
