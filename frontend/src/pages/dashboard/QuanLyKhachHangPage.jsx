import { useState, useEffect, useMemo } from 'react';
import { CustomerTable, CustomerFormDialog } from '@/components/customer-management';
import { GenericDeleteDialog } from '@/components/shared';
import { showSuccess, handleApiError } from '@/utils/notification';
import { customerAPI } from '@/services/api';
import { cn } from '@/utils/lib/util';

const QuanLyKhachHangPage = () => {
  // State quản lý dữ liệu khách hàng
  const [customers, setCustomers] = useState([]);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State quản lý chế độ thêm/sửa và khách hàng được chọn
  const [editMode, setEditMode] = useState('add'); 
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State search và filter
  const [searchInput, setSearchInput] = useState(''); // Input của user
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa đã submit để gọi API
  const [filterGender, setFilterGender] = useState('all'); 
  const [filterNationality, setFilterNationality] = useState('all');
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(0); // Backend page bắt đầu từ 0
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 16;

  // Load dữ liệu khi component mount hoặc khi filters thay đổi
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery, filterGender, filterNationality]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // UC-CUS-003: Tra cứu thông tin khách hàng với phân trang
      const response = await customerAPI.getAll({
        page: currentPage,
        size: itemsPerPage,
        search: searchQuery,
        gender: filterGender === 'all' ? '' : filterGender,
        nationality: filterNationality === 'all' ? '' : filterNationality
      });
      
      // Spring Data Page response structure
      setCustomers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang (UC-CUS-003: Bước 10 - Chuyển trang)
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Thống kê khách hàng
   */
  const stats = useMemo(() => {
    const total = totalElements; // Dùng totalElements từ server thay vì length của mảng local
    const vietnamese = customers.filter(c => c.nationality === 'Việt Nam').length;
    const foreign = customers.filter(c => c.nationality !== 'Việt Nam').length;
    const male = customers.filter(c => c.gender === 'Nam').length;
    const female = customers.filter(c => c.gender === 'Nữ').length;
    
    return { total, vietnamese, foreign, male, female };
  }, [totalElements, customers]);

  // Không cần filter và paginate ở client nữa, server đã xử lý
  // Dữ liệu từ API đã được filter và paginate sẵn
  const paginatedCustomers = customers;

  /**
   * Mở dialog thêm khách hàng mới
   */
  const handleAddNew = () => {
    setEditMode('add');
    setSelectedCustomer(null);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog sửa khách hàng
   */
  const handleEdit = (customer) => {
    setEditMode('edit');
    setSelectedCustomer(customer);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog xác nhận xóa
   */
  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Xử lý submit form (thêm mới hoặc cập nhật)
   */
  const handleSubmitForm = async (formData) => {
  setIsLoading(true);

  try {
    // Chuyển dữ liệu từ form sang đúng format CustomerRequest của Backend
    if (editMode === 'add') {
       await customerAPI.create(formData);
      showSuccess(
        'Thêm khách hàng thành công',
        `Khách hàng ${formData.fullName} đã được thêm`
      );
    } else {
       await customerAPI.update(selectedCustomer.customerId,formData
      );
      showSuccess(
        'Cập nhật thành công',
        `Thông tin khách hàng ${formData.fullName} đã được cập nhật`
      );
    }

    await fetchCustomers();
    // Đóng dialog
    setIsFormDialogOpen(false);
    setSelectedCustomer(null);
  } catch (error) {
    handleApiError(error);
  } finally {
    setIsLoading(false);
  }
};

  /**
   * Xử lý xác nhận xóa khách hàng
   */
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    
    setIsLoading(true);
    try {
      // Gọi API xóa khách hàng
    await customerAPI.delete(selectedCustomer.customerId);
      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      const newTotalPages = Math.ceil((customers.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      showSuccess('Xóa khách hàng thành công');
      await fetchCustomers();
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý tìm kiếm - chỉ gọi API khi nhấn nút Tìm kiếm
   * UC-CUS-003: Bước 5 - Nhân viên nhấn nút Tìm kiếm
   */
  const handleSearch = () => {
    const keyword = searchInput.trim();
    
    // Reset về trang đầu và cập nhật search query
    setCurrentPage(0);
    setSearchQuery(keyword);
  };

  /**
   * Xử lý nhấn Enter trong ô tìm kiếm
   */
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Xử lý thay đổi filter giới tính
   */
  const handleGenderChange = (event) => {
    setFilterGender(event.target.value);
    setCurrentPage(0); // Reset về trang đầu
  };

  /**
   * Xử lý thay đổi filter quốc tịch
   */
  const handleNationalityChange = (event) => {
    setFilterNationality(event.target.value);
    setCurrentPage(0); // Reset về trang đầu
  };

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-headline-lg text-headline-lg text-on-surface">
            Quản lý khách hàng
          </h1>
          <p className="text-lg mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Quản lý thông tin khách hàng của khách sạn
          </p>
        </div>

        {/* Nút thêm mới */}
        <button
          onClick={handleAddNew}
          className={cn(
            'flex items-center gap-space-xs px-space-md py-space-sm rounded-lg',
            'bg-primary text-on-primary font-label-lg text-label-lg',
            'hover:bg-primary/90 transition-colors duration-200',
            'shadow-sm hover:shadow-md',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
          disabled={isLoading}
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              group
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Tổng khách hàng
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              flag
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Khách Việt Nam
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.vietnamese}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              public
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Khách nước ngoài
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.foreign}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              male
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Nam
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.male}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[24px]">
              female
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Nữ
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.female}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search và Filter */}
      <div className="flex flex-col sm:flex-row gap-space-md">
        {/* Search */}
        <div className="flex-1 flex gap-space-sm">
          <div className="relative flex-1">
            <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, CCCD/Passport..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className={cn(
                'w-full pl-12 pr-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
          
          {/* Nút Tìm kiếm */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg',
              'bg-primary text-on-primary font-label-lg text-label-lg',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
            <span>Tìm kiếm</span>
          </button>
        </div>

        {/* Filter giới tính */}
        <select
          value={filterGender}
          onChange={handleGenderChange}
          disabled={isLoading}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all disabled:opacity-60'
          )}
        >
          <option value="all">Tất cả giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>

        {/* Filter quốc tịch */}
        <select
          value={filterNationality}
          onChange={handleNationalityChange}
          disabled={isLoading}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all disabled:opacity-60'
          )}
        >
          <option value="all">Tất cả quốc tịch</option>
          <option value="Việt Nam">Việt Nam</option>
          <option value="Nước ngoài">Nước ngoài</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hiển thị <span className="font-semibold text-on-surface">{paginatedCustomers.length}</span> / {totalElements} khách hàng
          {totalPages > 1 && (
            <span className="ml-space-sm">
              (Trang {currentPage + 1} / {totalPages})
            </span>
          )}
        </p>
      </div>

      {/* Bảng dữ liệu khách hàng */}
      <CustomerTable
        customers={paginatedCustomers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Phân trang */}
      {totalPages > 1 && !isLoading && paginatedCustomers.length > 0 && (
        <div className="flex items-center justify-between px-space-md py-space-sm
                     bg-surface-container-low rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Trang {currentPage + 1} / {totalPages} (Tổng {totalElements} khách hàng)
          </p>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className={cn(
                'p-space-xs rounded-lg hover:bg-surface-container-high',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_left
              </span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i).map(page => {
              const showPage = 
                page === 0 || 
                page === totalPages - 1 || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 2) ||
                (page === currentPage + 2 && currentPage < totalPages - 3);

              if (showEllipsis) {
                return (
                  <span 
                    key={page} 
                    className="px-space-xs font-label-md text-label-md text-on-surface-variant"
                  >
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                  className={cn(
                    'min-w-[32px] h-[32px] rounded-lg font-label-md text-label-md',
                    'transition-colors',
                    page === currentPage
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-surface-container-high text-on-surface',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {page + 1}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || isLoading}
              className={cn(
                'p-space-xs rounded-lg hover:bg-surface-container-high',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Dialog thêm/sửa khách hàng */}
      <CustomerFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleSubmitForm}
        editMode={editMode}
        customerData={selectedCustomer}
        isLoading={isLoading}
      />

      {/* Dialog xác nhận xóa */}
      <GenericDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}   
        title="Xác nhận xóa khách hàng"
        itemName={
          selectedCustomer
            ? selectedCustomer.fullName
            : ''
        }
      />
    </div>
  );
};

export default QuanLyKhachHangPage;