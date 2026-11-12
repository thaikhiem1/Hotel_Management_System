import { useState, useEffect, useMemo, useCallback } from "react";
import { usePermission } from "@/utils/usePermission";

import { Pagination } from "@/components/shared";
import {
  EmployeeCard,
  EmployeeProfileDialog,
} from "@/components/employee-management";

import { cn } from "@/utils/lib/util";
import { POSITION_OPTIONS } from "@/utils/auth";
import { employeeAPI } from "@/services/api";
import { showSuccess, handleApiError } from "@/utils/notification";

const QuanLyNhanVienPage = () => {
  const { check: checkWrite } = usePermission("employees");
  const [employees, setEmployees] = useState([]);

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogMode, setDialogMode] = useState("view");

  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  // Giá trị search đã được submit
  // Chỉ state này mới được gửi lên API
  const [searchQuery, setSearchQuery] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const [filterPosition, setFilterPosition] = useState("all");

  // Frontend dùng page bắt đầu từ 1
  const [currentPage, setCurrentPage] = useState(1);

  // Backend Spring Page dùng page bắt đầu từ 0
  const itemsPerPage = 16;

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);

    try {
      // Chuyển filter trạng thái của frontend
      // sang Boolean mà backend cần
      const isActive =
        filterStatus === "working"
          ? true
          : filterStatus === "resigned"
            ? false
            : null;

      // "all" thì không gửi position
      const position = filterPosition === "all" ? "" : filterPosition;

      const response = await employeeAPI.getAll({
        page: currentPage - 1,
        size: itemsPerPage,
        search: searchQuery.trim(),
        isActive,
        position,
      });

      // Dữ liệu của trang hiện tại
      setEmployees(response.content || []);

      // Tổng số record trong database sau filter/search
      setTotalElements(response.totalElements || 0);

      // Tổng số page backend tính được
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, filterPosition]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = () => {
    const keyword = searchInput.trim();

    // Nếu đang ở page khác page 1,
    // đưa về page 1 cùng lúc với search
    setCurrentPage(1);
    // Chỉ lúc này search mới được sử dụng để gọi API
    setSearchQuery(keyword);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;

    // Filter mới luôn bắt đầu từ page 1
    setCurrentPage(1);

    setFilterStatus(value);
  };

  const handlePositionChange = (event) => {
    const value = event.target.value;

    // Filter mới luôn bắt đầu từ page 1
    setCurrentPage(1);

    setFilterPosition(value);
  };

  const stats = useMemo(() => {
    const working = employees.filter(
      (employee) => employee.isActive === true,
    ).length;

    const resigned = employees.filter(
      (employee) => employee.isActive === false,
    ).length;

    const managers = employees.filter(
      (employee) =>
        employee.isActive === true &&
        (employee.position === "MANAGER" || employee.position === "ADMIN"),
    ).length;

    return {
      total: totalElements,
      working,
      resigned,
      managers,
    };
  }, [employees, totalElements]);

  const handleAddNew = () => {
    if (!checkWrite()) return;
    setDialogMode("add");
    setSelectedEmployee(null);
    setIsProfileDialogOpen(true);
  };

  const handleViewEmployee = (employee) => {
    setDialogMode("view");
    setSelectedEmployee(employee);
    setIsProfileDialogOpen(true);
  };

  const handleSubmitForm = async (formData, submissionMode = dialogMode) => {
    if (!checkWrite()) return;
    setIsLoading(true);

    try {
      if (submissionMode === "add") {
        const response = await employeeAPI.create(formData);
        // ApiResponse structure: { status, message, data }
        showSuccess(response.message || "Thêm nhân viên thành công");
      } else if (submissionMode === "edit") {
        if (!selectedEmployee) {
          throw new Error("Không tìm thấy nhân viên cần cập nhật");
        }
        const response = await employeeAPI.update(selectedEmployee.employeeId, formData);
        showSuccess(response.message || "Cập nhật nhân viên thành công");
      }

      // Sau khi thêm/sửa thành công: load lại danh sách từ database
      await fetchEmployees();
      setIsProfileDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      // Error sẽ được xử lý bởi handleApiError trong notification.js
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Page change

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setCurrentPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCloseDialog = () => {
    setIsProfileDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="w-full space-y-space-lg">
      <div className="flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h1 className="text-lg font-headline-lg text-headline-lg text-on-surface">
            Quản lý nhân viên
          </h1>

          <p className="text-lg mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Quản lý thông tin nhân viên, chức vụ và trạng thái làm việc
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className={cn(
            "flex items-center gap-space-xs px-space-md py-space-sm rounded-lg",
            "bg-primary text-on-primary font-label-lg text-label-lg",
            "hover:bg-primary/90 transition-colors duration-200",
            "shadow-sm hover:shadow-md",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
          disabled={isLoading}
        >
          <span className="material-symbols-outlined text-[20px]">
            person_add
          </span>

          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Total */}
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              group
            </span>

            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Tổng nhân viên
              </p>

              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Working */}
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              how_to_reg
            </span>

            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đang làm việc
              </p>

              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.working}
              </p>
            </div>
          </div>
        </div>

        {/* Resigned */}
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[24px]">
              person_off
            </span>

            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đã nghỉ việc
              </p>

              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.resigned}
              </p>
            </div>
          </div>
        </div>

        {/* Managers */}
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              admin_panel_settings
            </span>

            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Ban quản lý
              </p>

              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.managers}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-space-md">
        {/* Search */}
        <div className="flex-1">
          <div className="flex gap-space-sm">
            <div className="relative flex-1">
              <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">
                search
              </span>

              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, SĐT, CCCD..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={cn(
                  "w-full pl-12 pr-space-md py-space-sm rounded-lg",
                  "bg-surface-container-highest border border-outline",
                  "font-body-md text-body-md text-on-surface",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all",
                )}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-space-xs",
                "px-space-md py-space-sm rounded-lg",
                "bg-primary text-on-primary",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "whitespace-nowrap",
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={handleStatusChange}
          className={cn(
            "px-space-md py-space-sm rounded-lg",
            "bg-surface-container-highest border border-outline",
            "font-body-md text-body-md text-on-surface",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all",
          )}
        >
          <option value="all">Tất cả trạng thái</option>

          <option value="working">Đang làm việc</option>

          <option value="resigned">Đã nghỉ việc</option>
        </select>

        {/* Filter Position */}
        <select
          value={filterPosition}
          onChange={handlePositionChange}
          className={cn(
            "px-space-md py-space-sm rounded-lg",
            "bg-surface-container-highest border border-outline",
            "font-body-md text-body-md text-on-surface",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all",
          )}
        >
          <option value="all">Tất cả chức vụ</option>

          {POSITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hiển thị{" "}
          <span className="font-semibold text-on-surface">
            {employees.length}
          </span>{" "}
          / {totalElements} nhân viên
          {totalPages > 1 && (
            <span className="ml-space-sm">
              (Trang {currentPage} / {totalPages})
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-space-md">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
              progress_activity
            </span>

            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-space-lg">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-space-md">
            person_search
          </span>

          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
            Không tìm thấy nhân viên
          </h3>

          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Không có nhân viên nào phù hợp với bộ lọc hiện tại
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.employeeId}
              employee={employee}
              onClick={handleViewEmployee}
            />
          ))}
        </div>
      )}

      {!isLoading && employees.length > 0 && (
        <Pagination
          page={currentPage - 1}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={itemsPerPage}
          onPageChange={(p) => handlePageChange(p + 1)}
          unit="nhân viên"
        />
      )}

      <EmployeeProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitForm}
        employeeData={selectedEmployee}
        mode={dialogMode}
        isLoading={isLoading}
        canEdit={true}
      />
    </div>
  );
};

export default QuanLyNhanVienPage;
