import axios from "axios";
import { clearAuth, getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:8080/api";
// Địa chỉ gốc của backend, dùng cho các tệp tĩnh như ảnh đại diện tải lên
export const API_ORIGIN = BASE_URL.replace(/\/api$/, "");

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

// HỒ SƠ CÁ NHÂN (người đang đăng nhập)
export const profileAPI = {
  /** GET /api/profile - hồ sơ của chính mình (không có lương) */
  get: () => unwrap(apiClient.get("/profile")),

  /** PUT /api/profile/avatar - multipart "file": JPG/JPEG/PNG/WEBP, tối đa 5 MB */
  updateAvatar: (file) => {
    const form = new FormData();
    form.append("file", file);
    return unwrap(
      apiClient.put("/profile/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      }),
    );
  },
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

// LƯU TRÚ THEO CHI TIẾT ĐẶT PHÒNG (chỉ lễ tân)
export const stayAPI = {
  /** UC-REN-004 bước 2-4: GET /api/booking-details/{id}/check-in - kiểm tra sơ bộ và lấy thông tin mở biểu mẫu */
  getCheckInContext: (bookingDetailId) =>
    unwrap(apiClient.get(`/booking-details/${bookingDetailId}/check-in`)),

  /** UC-REN-004 bước 5-9: POST /api/booking-details/{id}/check-in - { actualGuests }; giờ nhận phòng do máy chủ ghi */
  checkIn: (bookingDetailId, { actualGuests }) =>
    unwrap(apiClient.post(`/booking-details/${bookingDetailId}/check-in`, { actualGuests })),

  /** UC-REN-007 bước 2-6: GET /api/booking-details/{id}/check-out - kiểm tra lượt lưu trú và lấy chi phí tạm tính */
  getCheckOutContext: (bookingDetailId) =>
    unwrap(apiClient.get(`/booking-details/${bookingDetailId}/check-out`)),

  /** UC-REN-007 bước 7-12: POST /api/booking-details/{id}/check-out - expectedTotalAmount là tổng tiền đã xem; giờ trả do máy chủ ghi */
  checkOut: (bookingDetailId, { expectedTotalAmount } = {}) =>
    unwrap(apiClient.post(`/booking-details/${bookingDetailId}/check-out`, { expectedTotalAmount })),

  /** UC-SVC-005: GET /api/booking-details/{id}/services - dịch vụ khách đã sử dụng kèm tổng tiền */
  getServiceUsages: (bookingDetailId) => unwrap(apiClient.get(`/booking-details/${bookingDetailId}/services`)),

  /** UC-SVC-005 bước 6-11: kiểm tra và tính chi phí. lines: [{ serviceId, quantity }] */
  estimateServices: (bookingDetailId, lines) =>
    unwrap(apiClient.post(`/booking-details/${bookingDetailId}/services/estimate`, { lines })),

  /** UC-SVC-005 bước 12-15: ghi nhận dịch vụ; expectedTotalAmount là tổng tiền đã xem để máy chủ phát hiện giá đổi */
  recordServices: (bookingDetailId, { lines, expectedTotalAmount }) =>
    unwrap(apiClient.post(`/booking-details/${bookingDetailId}/services`, { lines, expectedTotalAmount })),
};

// HÓA ĐƠN: mọi vai trò xem; thanh toán chỉ lễ tân và quản lý
export const invoiceAPI = {
  /** GET /api/invoices - { page, size, keyword, status: PAID|UNPAID, fromDate, toDate (yyyy-MM-dd) }, mới nhất trước */
  getAll: (params = {}) => unwrap(apiClient.get("/invoices", { params: compactParams(params) })),

  /** GET /api/invoices/stats - số lượng và số tiền theo trạng thái */
  getStats: () => unwrap(apiClient.get("/invoices/stats")),

  /** GET /api/invoices/{id} - đầy đủ thông tin để xem chi tiết và in */
  getById: (id) => unwrap(apiClient.get(`/invoices/${id}`)),

  /** POST /api/invoices/{id}/pay - paymentMethod: CASH | CARD | TRANSFER; thời điểm và nhân viên thu tiền do máy chủ ghi */
  pay: (id, paymentMethod) => unwrap(apiClient.post(`/invoices/${id}/pay`, { paymentMethod })),
};

// BÁO CÁO & THỐNG KÊ: chỉ ADMIN và MANAGER
export const reportAPI = {
  /** GET /api/reports/overview - { year, month? }: có month thì theo ngày của tháng, không có thì theo tháng của năm */
  getOverview: (params = {}) => unwrap(apiClient.get("/reports/overview", { params: compactParams(params) })),
};

// SƠ ĐỒ PHÒNG (Room Map) - UC-ROM-005, UC-ROM-006
export const roomMapAPI = {
  /**
   * GET /api/room-map - sơ đồ phòng có phân trang (backend mặc định trang 0, 16 phòng/trang).
   * Tham số rỗng bị bỏ qua. from/to dạng ISO yyyy-MM-ddTHH:mm:ss; mặc định là từ bây giờ đến hết ngày.
   * @param {{page?, size?, from?, to?, displayStatus?, keyword?}} params
   */
  get: (params = {}) => unwrap(apiClient.get("/room-map", { params: compactParams(params) })),
};

// LOẠI DỊCH VỤ (Service Categories) - cập nhật bằng PATCH
export const serviceCategoryAPI = createCrudApi("/service-categories", {
  updateMethod: "patch",
});

// DỊCH VỤ (Service)
const serviceCrud = createCrudApi("/services");
export const serviceAPI = {
  ...serviceCrud,
  /** GET /api/services?activeOnly=true - chỉ dịch vụ đang được phép cung cấp (dùng khi ghi nhận dịch vụ khách sử dụng) */
  getActive: () => unwrap(apiClient.get("/services", { params: { activeOnly: true } })),
};

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
