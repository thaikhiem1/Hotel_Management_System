import React, { useState, useMemo } from 'react';
import RoomTypeTable from '@/components/room-type-management/RoomTypeTable';
import RoomTypeFormDialog from '@/components/room-type-management/RoomTypeFormDialog';
import RoomTypeDeleteDialog from '@/components/room-type-management/RoomTypeDeleteDialog';
import { mockLoaiPhong } from '@/services/mockData';

/**
 * QuanLyLoaiPhongPage - Trang quản lý loại phòng
 * Hiển thị danh sách loại phòng với các chức năng CRUD
 * Chuẩn hóa 100% theo Database.md
 * 
 * Table LoaiPhong {
 *   IdLPH int [pk, increment]
 *   TenLPH varchar(100) [not null]
 *   SoGiuong int [not null]
 *   SoNguoiToiDa int [not null]
 *   GiaNgay decimal(18,2) [not null]
 *   GiaGio decimal(18,2)
 * }
 */
const QuanLyLoaiPhongPage = () => {
  // State quản lý dữ liệu loại phòng (sẽ được thay thế bằng API call)
  const [roomTypes, setRoomTypes] = useState(mockLoaiPhong);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State quản lý chế độ thêm/sửa và loại phòng được chọn
  const [editMode, setEditMode] = useState('add'); // 'add' | 'edit'
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán phân trang
  const paginatedRoomTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return roomTypes.slice(startIndex, endIndex);
  }, [roomTypes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(roomTypes.length / itemsPerPage);

  // Tính toán thống kê
  const stats = useMemo(() => {
    const avgPrice = roomTypes.length > 0
      ? roomTypes.reduce((sum, rt) => sum + rt.GiaNgay, 0) / roomTypes.length
      : 0;
    
    const maxCapacity = Math.max(...roomTypes.map(rt => rt.SoNguoiToiDa), 0);
    
    return {
      total: roomTypes.length,
      avgPrice: Math.round(avgPrice),
      maxCapacity
    };
  }, [roomTypes]);

  // ============ HANDLERS ============

  /**
   * Mở dialog thêm loại phòng mới
   */
  const handleAddNew = () => {
    setEditMode('add');
    setSelectedRoomType(null);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog sửa loại phòng với dữ liệu được binding từ dòng được chọn
   * @param {Object} roomType - Đối tượng loại phòng được chọn
   */
  const handleEdit = (roomType) => {
    setEditMode('edit');
    setSelectedRoomType(roomType);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog xác nhận xóa
   * @param {Object} roomType - Đối tượng loại phòng cần xóa
   */
  const handleDelete = (roomType) => {
    setSelectedRoomType(roomType);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Xử lý submit form (thêm mới hoặc cập nhật)
   * @param {Object} roomTypeData - Dữ liệu loại phòng từ form
   * 
   * TODO: API INTEGRATION
   * - Nếu editMode === 'add': Gọi POST /api/loai-phong
   * - Nếu editMode === 'edit': Gọi PUT /api/loai-phong/{IdLPH}
   * - Xử lý response và cập nhật state
   * - Hiển thị thông báo thành công/thất bại
   * 
   * TODO: AUTHORIZATION
   * - Kiểm tra quyền trước khi cho phép thêm/sửa
   * - Role 0 (Admin) và Role 2 (Quản lý) có quyền thêm/sửa loại phòng
   * - Role 1 (Lễ tân) chỉ xem, không được sửa/xóa
   */
  const handleSubmitForm = async (roomTypeData) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = editMode === 'add' 
      //   ? await fetch('/api/loai-phong', { method: 'POST', body: JSON.stringify(roomTypeData) })
      //   : await fetch(`/api/loai-phong/${selectedRoomType.IdLPH}`, { method: 'PUT', body: JSON.stringify(roomTypeData) });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editMode === 'add') {
        // Thêm mới - Mock logic
        const newRoomType = {
          ...roomTypeData,
          IdLPH: roomTypes.length + 1
        };
        setRoomTypes([...roomTypes, newRoomType]);
      } else {
        // Cập nhật - Mock logic
        setRoomTypes(roomTypes.map(rt => 
          rt.IdLPH === selectedRoomType.IdLPH 
            ? { ...rt, ...roomTypeData }
            : rt
        ));
      }

      setIsFormDialogOpen(false);
      setSelectedRoomType(null);
      
      // TODO: Show success notification
      console.log(`${editMode === 'add' ? 'Thêm' : 'Cập nhật'} loại phòng thành công!`);
    } catch (error) {
      // TODO: Show error notification
      console.error('Error submitting room type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý xác nhận xóa loại phòng
   * 
   * TODO: API INTEGRATION
   * - Gọi DELETE /api/loai-phong/{IdLPH}
   * - Xử lý response và cập nhật state
   * - Hiển thị thông báo thành công/thất bại
   * 
   * TODO: AUTHORIZATION
   * - Chỉ Admin (Role 0) mới được phép xóa loại phòng
   * - Kiểm tra có phòng nào đang sử dụng loại phòng này không trước khi xóa
   */
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/loai-phong/${selectedRoomType.IdLPH}`, { method: 'DELETE' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock logic
      setRoomTypes(roomTypes.filter(rt => rt.IdLPH !== selectedRoomType.IdLPH));
      setIsDeleteDialogOpen(false);
      setSelectedRoomType(null);
      
      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      const newTotalPages = Math.ceil((roomTypes.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      // TODO: Show success notification
      console.log('Xóa loại phòng thành công!');
    } catch (error) {
      // TODO: Show error notification
      console.error('Error deleting room type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  /**
   * Format số tiền theo định dạng Việt Nam
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Quản lý loại phòng
          </h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Quản lý các loại phòng, giá cả và thông tin chi tiết
          </p>
        </div>

        {/* Nút thêm mới - TODO: AUTHORIZATION - Chỉ Admin và Quản lý có quyền */}
        <button
          onClick={handleAddNew}
          className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg
                   bg-primary text-on-primary font-label-lg text-label-lg
                   hover:bg-primary/90 transition-colors duration-200
                   shadow-sm hover:shadow-md"
          disabled={isLoading}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Thêm loại phòng</span>
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              category
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Tổng loại phòng
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              payments
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Giá TB/ngày
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {formatCurrency(stats.avgPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              group
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Sức chứa tối đa
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.maxCapacity} người
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu loại phòng */}
      <RoomTypeTable
        roomTypes={paginatedRoomTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-space-md py-space-sm
                      bg-surface-container-low rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Trang {currentPage} / {totalPages} (Tổng {roomTypes.length} loại phòng)
          </p>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-space-xs rounded-lg hover:bg-surface-container-high
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_left
              </span>
            </button>

            {/* Hiển thị các số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`min-w-[32px] h-[32px] rounded-lg font-label-md text-label-md
                          transition-colors ${
                            page === currentPage
                              ? 'bg-primary text-on-primary'
                              : 'hover:bg-surface-container-high text-on-surface'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="p-space-xs rounded-lg hover:bg-surface-container-high
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Dialog thêm/sửa loại phòng */}
      <RoomTypeFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setSelectedRoomType(null);
        }}
        onSubmit={handleSubmitForm}
        editMode={editMode}
        roomTypeData={selectedRoomType}
        isLoading={isLoading}
      />

      {/* Dialog xác nhận xóa */}
      <RoomTypeDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRoomType(null);
        }}
        onConfirm={handleConfirmDelete}
        roomTypeData={selectedRoomType}
        isLoading={isLoading}
      />
    </div>
  );
};

export default QuanLyLoaiPhongPage;
