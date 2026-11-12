// Phân quyền giao diện theo vai trò (khớp SecurityConfig phía máy chủ, máy chủ vẫn là nơi kiểm tra cuối cùng).
//
// - ADMIN: chỉ quản lý tài khoản; xem được mọi trang nhưng thêm/sửa/xóa dữ liệu khác sẽ báo không có quyền.
// - MANAGER: toàn quyền trừ tài khoản (không thấy mục tài khoản).
// - RECEPTIONIST: lập phiếu thuê, nhận/trả phòng, ghi nhận dịch vụ, khách hàng; chỉ xem phòng, loại phòng, dịch vụ;
//   không thấy nhân viên, tài khoản, báo cáo thống kê (xem được loại dịch vụ nhưng không thêm/sửa/xóa).
import { ROLES } from "@/utils/auth";

export const NO_PERMISSION_MESSAGE = "Bạn không có quyền thực hiện thao tác này";

const { ADMIN, MANAGER, RECEPTIONIST } = ROLES;

// Vai trò được thêm/sửa/xóa theo từng nhóm chức năng
const WRITE_ROLES = {
  accounts: [ADMIN],
  employees: [MANAGER],
  rooms: [MANAGER],
  roomTypes: [MANAGER],
  services: [MANAGER],
  serviceCategories: [MANAGER],
  customers: [RECEPTIONIST, MANAGER],
  // lập phiếu thuê, nhận phòng, trả phòng, ghi nhận dịch vụ, thanh toán hóa đơn
  stays: [RECEPTIONIST, MANAGER],
};

// Vai trò thấy mục/trang tương ứng; không liệt kê thì mọi vai trò đều thấy
const VIEW_ROLES = {
  accounts: [ADMIN],
  employees: [ADMIN, MANAGER],
  reports: [ADMIN, MANAGER],
  revenue: [ADMIN, MANAGER],
};

export const canWrite = (role, resource) => (WRITE_ROLES[resource] ?? []).includes(role);

export const canView = (role, resource) => !VIEW_ROLES[resource] || VIEW_ROLES[resource].includes(role);

/** Vai trò vào được trang của nhóm chức năng (dùng cho route và thanh bên) */
export const viewRoles = (resource) => VIEW_ROLES[resource];
