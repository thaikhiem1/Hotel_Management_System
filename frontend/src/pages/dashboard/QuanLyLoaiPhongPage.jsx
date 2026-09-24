import React, { useState, useMemo, useEffect } from 'react';
import RoomTypeTable from '@/components/room-type-management/RoomTypeTable';
import RoomTypeFormDialog from '@/components/room-type-management/RoomTypeFormDialog';
import RoomTypeDeleteDialog from '@/components/room-type-management/RoomTypeDeleteDialog';
import { roomTypeAPI } from '@/services/api';
import { showSuccess, showError, handleApiError } from '@/utils/notification';

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
  // State quản lý dữ liệu loại phòng từ API
  const [roomTypes, setRoomTypes] = useState([]);
  
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
  
  /**
   * useEffect - Load dữ liệu loại phòng khi component mount
   * API: GET /api/roomtype
   */
  useEffect(() => {
    fetchRoomTypes();
  }, []);
  
  /**
   * Fetch danh sách loại phòng từ API
   */
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      // Gọi API lấy danh sách loại phòng
      const data = await roomTypeAPI.getAll();
      
      // Map dữ liệu từ backend sang frontend format
      // Backend: IdLPH, TenLPH, SoGiuong, SoNguoiToiDa, GiaNgay, GiaGio
      const mappedData = data.map(item => ({
        IdLPH: item.IdLPH,
        TenLPH: item.TenLPH,
        SoGiuong: item.SoGiuong,
        SoNguoiToiDa: item.SoNguoiToiDa,
        GiaNgay: item.GiaNgay,
        GiaGio: item.GiaGio
      }));
      
      setRoomTypes(mappedData);
      console.log('Loaded room types:', mappedData.length);
    } catch (error) {
      console.error('Error fetching room types:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

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
   * API INTEGRATION:
   * - Nếu editMode === 'add': Gọi POST /api/roomtype
   * - Nếu editMode === 'edit': Gọi PUT /api/roomtype/{IdLPH}
   * 
   * TODO: AUTHORIZATION
   * - Role 0 (Admin) và Role 2 (Quản lý) có quyền thêm/sửa
   * - Role 1 (Lễ tân) chỉ xem
   */
  const handleSubmitForm = async (roomTypeData) => {
    setIsLoading(true);
    
    try {
      if (editMode === 'add') {
        // Thêm mới - Gọi API POST
        const response = await roomTypeAPI.create(roomTypeData);
        
        // Thêm vào danh sách
        setRoomTypes([...roomTypes, response]);
        
        // Hiển thị thông báo thành công
        showSuccess('Thêm loại phòng thành công!');
      } else {
        // Cập nhật - Gọi API PUT
        const response = await roomTypeAPI.update(selectedRoomType.IdLPH, roomTypeData);
        
        // Cập nhật danh sách
        setRoomTypes(roomTypes.map(rt => 
          rt.IdLPH === selectedRoomType.IdLPH ? response : rt
        ));
        
        // Hiển thị thông báo thành công
        showSuccess('Cập nhật loại phòng thành công!');
      }

      // Đóng dialog và reset
      setIsFormDialogOpen(false);
      setSelectedRoomType(null);
      
      // Refresh lại danh sách từ server
      await fetchRoomTypes();
      
    } catch (error) {
      console.error('Error submitting room type:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý xác nhận xóa loại phòng
   * 
   * API INTEGRATION:
   * - Gọi DELETE /api/roomtype/{IdLPH}
   * 
   * TODO: AUTHORIZATION
   * - Chỉ Admin (Role 0) mới được phép xóa
   * - Kiểm tra có phòng nào đang sử dụng loại phòng này không
   */
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      // Gọi API DELETE
      await roomTypeAPI.delete(selectedRoomType.IdLPH);
      
      // Xóa khỏi danh sách
      setRoomTypes(roomTypes.filter(rt => rt.IdLPH !== selectedRoomType.IdLPH));
      
      // Đóng dialog
      setIsDeleteDialogOpen(false);
      setSelectedRoomType(null);
      
      // Điều chỉnh trang nếu cần
      const newTotalPages = Math.ceil((roomTypes.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      // Hiển thị thông báo thành công
      showSuccess('Xóa loại phòng thành công!');
      
      // Refresh lại danh sách từ server
      await fetchRoomTypes();
      
    } catch (error) {
      console.error('Error deleting room type:', error);
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
          <h1 className="text-lg font-headline-lg text-headline-lg text-on-surface">
            Quản lý loại phòng
          </h1>
          <p className="text-lg mt-space-xs font-body-md text-body-md text-on-surface-variant">
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Tổng loại phòng
              </p>
              <p className="text-lg font-headline-md text-headline-md text-on-surface">
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Giá TB/ngày
              </p>
              <p className="text-lg font-headline-md text-headline-md text-on-surface">
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Sức chứa tối đa
              </p>
              <p className="text-lg font-headline-md text-headline-md text-on-surface">
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
