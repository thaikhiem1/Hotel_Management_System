import React, { useState, useEffect, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all'); 
  const [filterNationality, setFilterNationality] = useState('all');
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerAPI.getAll();
      const mappedData = data.map(item => ({
        customerId: item.customer_id,
        fullName: item.full_name,
        phone: item.phone,
        citizenId: item.citizen_id_passport,
        nationality: item.nationality,
        gender: item.gender 
      }));
      setCustomers(mappedData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Filter by gender
      if (filterGender !== 'all' && customer.gender !== filterGender) {
        return false;
      }
      
      // Filter by nationality
      if (filterNationality === 'Việt Nam' && customer.nationality !== 'Việt Nam') {
        return false;
      }
      if (filterNationality === 'Nước ngoài' && customer.nationality === 'Việt Nam') {
        return false;
      }
      
      // Search by name, phone, CCCD/Passport
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          customer.fullName?.toLowerCase().includes(query) ||
          (customer.phone && customer.phone.includes(query)) ||
          (customer.citizenId && customer.citizenId.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [customers, searchQuery, filterGender, filterNationality]);

  /**
   * Phân trang
   */
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  /**
   * Thống kê khách hàng
   */
  const stats = useMemo(() => {
    const total = customers.length;
    const vietnamese = customers.filter(c => c.nationality === 'Việt Nam').length;
    const foreign = total - vietnamese;
    const male = customers.filter(c => c.gender === 'Nam' || c.gender === 'Male').length;
    const female = customers.filter(c => c.gender === 'Nữ' || c.gender === 'Female').length;
    
    return { total, vietnamese, foreign, male, female };
  }, [customers]);

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
    console.error('Error submitting customer:', error);
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
      console.error('Error deleting customer:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterNationality]);

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
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, CCCD/Passport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
        </div>

        {/* Filter giới tính */}
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all'
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
          onChange={(e) => setFilterNationality(e.target.value)}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all'
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
          Hiển thị <span className="font-semibold text-on-surface">{paginatedCustomers.length}</span> / {filteredCustomers.length} khách hàng
          {totalPages > 1 && (
            <span className="ml-space-sm">
              (Trang {currentPage} / {totalPages})
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
      {totalPages > 1 && !isLoading && filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between px-space-md py-space-sm
                     bg-surface-container-low rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Trang {currentPage} / {totalPages} (Tổng {filteredCustomers.length} khách hàng)
          </p>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={cn(
                'p-space-xs rounded-lg hover:bg-surface-container-high',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_left
              </span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2);

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
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
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