import React, { useState, useEffect } from "react";
import { cn } from "@/utils/lib/util";
import { accountAPI } from "@/services/api";
import { showSuccess, handleApiError } from "@/utils/notification";
import AccountCard from "@/components/account-management/AccountCard";
import AccountFormDialog from "@/components/account-management/AccountFormDialog";
import AccountEditDialog from "@/components/account-management/AccountEditDialog";

/**
 * QuanLyTaiKhoanPage - Trang quản lý tài khoản
 * UC-ACC-001: Tạo tài khoản cho nhân viên
 */
const QuanLyTaiKhoanPage = () => {
  // States
  const [accounts, setAccounts] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // null = all, true = active, false = inactive
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 16;

  // Fetch accounts với phân trang và filter
  const fetchAccounts = async (page = 0, statusFilter = null) => {
    setIsLoading(true);
    try {
      const response = await accountAPI.getAll({ 
        page, 
        size: pageSize,
        isActive: statusFilter 
      });
      
      if (response.data) {
        setAccounts(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch danh sách nhân viên chưa có tài khoản
  const fetchAvailableEmployees = async () => {
    try {
      const response = await accountAPI.getAvailableEmployees();
      
      if (response.data) {
        // Backend đã trả về danh sách EmployeeResponse đầy đủ
        setAvailableEmployees(response.data);
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách nhân viên");
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Xử lý mở dialog tạo tài khoản
  const handleOpenDialog = async () => {
    await fetchAvailableEmployees();
    setIsDialogOpen(true);
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(null);
  };

  // Xử lý tạo tài khoản mới
  const handleCreateAccount = async (formData) => {
    setIsLoading(true);
    try {
      const response = await accountAPI.create(formData);
      
      if (response.message) {
        showSuccess(response.message);
      }
      
      handleCloseDialog();
      fetchAccounts(currentPage, statusFilter); // Reload trang hiện tại với filter
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý click vào card - Mở dialog edit
  const handleCardClick = async (account) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };

  // Xử lý đóng dialog edit
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedAccount(null);
  };

  // Xử lý cập nhật tài khoản
  const handleUpdateAccount = async (formData) => {
    if (!selectedAccount) return;
    
    setIsLoading(true);
    try {
      const response = await accountAPI.update(selectedAccount.accountId, formData);
      
      if (response.message) {
        showSuccess(response.message);
      }
      
      handleCloseEditDialog();
      fetchAccounts(currentPage, statusFilter); // Reload trang hiện tại
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAccounts(newPage, statusFilter);
    }
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    fetchAccounts(0, newFilter); // Reset về trang đầu khi filter
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex-shrink-0 p-space-lg border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-primary text-[32px]">
              manage_accounts
            </span>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                Quản lý tài khoản
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Quản lý tài khoản đăng nhập cho nhân viên
              </p>
            </div>
          </div>

          {/* Nút tạo tài khoản mới */}
          <button
            onClick={handleOpenDialog}
            className={cn(
              "flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg",
              "bg-primary text-on-primary font-label-lg text-label-lg",
              "hover:bg-primary/90 transition-all",
              "shadow-md hover:shadow-lg",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo tài khoản mới
          </button>
        </div>

        {/* Stats và Filter */}
        <div className="flex items-center justify-between gap-space-lg mt-space-md">
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container/30">
            <span className="material-symbols-outlined text-primary text-[20px]">
              group
            </span>
            <span className="font-label-md text-label-md text-on-surface">
              Tổng số tài khoản: <strong>{totalElements}</strong>
            </span>
          </div>

          {/* Filter theo trạng thái */}
          <div className="flex items-center gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Trạng thái:
            </span>
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => handleFilterChange(null)}
                className={cn(
                  "px-space-md py-space-xs rounded-lg font-label-sm text-label-sm transition-colors",
                  statusFilter === null
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
                )}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterChange(true)}
                className={cn(
                  "px-space-md py-space-xs rounded-lg font-label-sm text-label-sm transition-colors",
                  statusFilter === true
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
                )}
              >
                Đang hoạt động
              </button>
              <button
                onClick={() => handleFilterChange(false)}
                className={cn(
                  "px-space-md py-space-xs rounded-lg font-label-sm text-label-sm transition-colors",
                  statusFilter === false
                    ? "bg-error-container text-on-error-container"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
                )}
              >
                Đã khóa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-space-lg">
        {isLoading && accounts.length === 0 ? (
          // Loading State
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-space-md">
              <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
                progress_activity
              </span>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Đang tải dữ liệu...
              </p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          // Empty State
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-space-md">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant">
                person_off
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                Chưa có tài khoản nào
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Nhấn "Tạo tài khoản mới" để bắt đầu
              </p>
            </div>
          </div>
        ) : (
          // Accounts Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {accounts.map((account) => (
              <AccountCard
                key={account.accountId}
                account={account}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between p-space-lg border-t border-outline-variant bg-surface-container-low">
          <div className="font-body-md text-body-md text-on-surface-variant">
            Trang {currentPage + 1} / {totalPages} • Tổng {totalElements} tài khoản
          </div>

          <div className="flex items-center gap-space-sm">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className={cn(
                "p-space-sm rounded-lg transition-colors",
                "hover:bg-surface-container-high",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined text-on-surface">
                first_page
              </span>
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={cn(
                "p-space-sm rounded-lg transition-colors",
                "hover:bg-surface-container-high",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined text-on-surface">
                chevron_left
              </span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-space-xs">
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(
                  (page) =>
                    page === 0 ||
                    page === totalPages - 1 ||
                    Math.abs(page - currentPage) <= 1,
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-space-xs text-on-surface-variant">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "min-w-[40px] px-space-sm py-space-xs rounded-lg",
                        "font-label-md text-label-md transition-colors",
                        page === currentPage
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
                      )}
                    >
                      {page + 1}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "p-space-sm rounded-lg transition-colors",
                "hover:bg-surface-container-high",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined text-on-surface">
                chevron_right
              </span>
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "p-space-sm rounded-lg transition-colors",
                "hover:bg-surface-container-high",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined text-on-surface">
                last_page
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Dialog tạo tài khoản */}
      <AccountFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateAccount}
        availableEmployees={availableEmployees}
        isLoading={isLoading}
      />

      {/* Dialog cập nhật tài khoản */}
      <AccountEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateAccount}
        account={selectedAccount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default QuanLyTaiKhoanPage;
