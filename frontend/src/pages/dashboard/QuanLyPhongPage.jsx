import React, { useState, useMemo } from 'react';
import RoomTable from '@/components/room-management/RoomTable';
import RoomFormDialog from '@/components/room-management/RoomFormDialog';
import DeleteConfirmDialog from '@/components/room-management/DeleteConfirmDialog';
import { mockPhong, mockLoaiPhong } from '@/services/mockData';

/**
 * QuanLyPhongPage - Trang quản lý phòng
 * Hiển thị danh sách phòng với các chức năng CRUD
 * Chuẩn hóa 100% theo Database.md
 * 
 * Table Phong {
 *   IdPH int [pk, increment]
 *   MaPH varchar(20) [not null, unique]
 *   TrangThaiPhong int [not null] -- 0: Trống, 1: Đang sửa chữa
 *   IdLPH int [not null]
 *   GhiChu varchar(255)
 * }
 */
const QuanLyPhongPage = () => {
  // State quản lý dữ liệu phòng (sẽ được thay thế bằng API call)
  const [rooms, setRooms] = useState(mockPhong);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State quản lý chế độ thêm/sửa và phòng được chọn
  const [editMode, setEditMode] = useState('add'); // 'add' | 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán phân trang
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return rooms.slice(startIndex, endIndex);
  }, [rooms, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(rooms.length / itemsPerPage);

  // ============ HANDLERS ============

  /**
   * Mở dialog thêm phòng mới
   */
  const handleAddNew = () => {
    setEditMode('add');
    setSelectedRoom(null);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog sửa phòng với dữ liệu được binding từ dòng được chọn
   * @param {Object} room - Đối tượng phòng được chọn
   */
  const handleEdit = (room) => {
    setEditMode('edit');
    setSelectedRoom(room);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog xác nhận xóa
   * @param {Object} room - Đối tượng phòng cần xóa
   */
  const handleDelete = (room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Xử lý submit form (thêm mới hoặc cập nhật)
   * @param {Object} roomData - Dữ liệu phòng từ form
   * 
   * TODO: API INTEGRATION
   * - Nếu editMode === 'add': Gọi POST /api/phong
   * - Nếu editMode === 'edit': Gọi PUT /api/phong/{IdPH}
   * - Xử lý response và cập nhật state
   * - Hiển thị thông báo thành công/thất bại
   * 
   * TODO: AUTHORIZATION
   * - Kiểm tra quyền trước khi cho phép thêm/sửa
   * - Role 0 (Admin) và Role 2 (Quản lý) có quyền thêm/sửa phòng
   * - Role 1 (Lễ tân) chỉ xem, không được sửa/xóa
   */
  const handleSubmitForm = async (roomData) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = editMode === 'add' 
      //   ? await fetch('/api/phong', { method: 'POST', body: JSON.stringify(roomData) })
      //   : await fetch(`/api/phong/${selectedRoom.IdPH}`, { method: 'PUT', body: JSON.stringify(roomData) });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editMode === 'add') {
        // Thêm mới - Mock logic
        const newRoom = {
          ...roomData,
          IdPH: rooms.length + 1,
          loaiPhong: mockLoaiPhong.find(lp => lp.IdLPH === roomData.IdLPH)
        };
        setRooms([...rooms, newRoom]);
      } else {
        // Cập nhật - Mock logic
        setRooms(rooms.map(room => 
          room.IdPH === selectedRoom.IdPH 
            ? { ...room, ...roomData, loaiPhong: mockLoaiPhong.find(lp => lp.IdLPH === roomData.IdLPH) }
            : room
        ));
      }

      setIsFormDialogOpen(false);
      setSelectedRoom(null);
      
      // TODO: Show success notification
      console.log(`${editMode === 'add' ? 'Thêm' : 'Cập nhật'} phòng thành công!`);
    } catch (error) {
      // TODO: Show error notification
      console.error('Error submitting room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý xác nhận xóa phòng
   * 
   * TODO: API INTEGRATION
   * - Gọi DELETE /api/phong/{IdPH}
   * - Xử lý response và cập nhật state
   * - Hiển thị thông báo thành công/thất bại
   * 
   * TODO: AUTHORIZATION
   * - Chỉ Admin (Role 0) mới được phép xóa phòng
   * - Kiểm tra phòng có đang được thuê hay không trước khi xóa
   */
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/phong/${selectedRoom.IdPH}`, { method: 'DELETE' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock logic
      setRooms(rooms.filter(room => room.IdPH !== selectedRoom.IdPH));
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      
      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      const newTotalPages = Math.ceil((rooms.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      // TODO: Show success notification
      console.log('Xóa phòng thành công!');
    } catch (error) {
      // TODO: Show error notification
      console.error('Error deleting room:', error);
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

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Quản lý phòng
          </h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Quản lý thông tin phòng, loại phòng và trạng thái phòng
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
          <span>Thêm phòng mới</span>
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              meeting_room
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Tổng số phòng
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.length}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              check_circle
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Phòng trống
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.filter(r => r.TrangThaiPhong === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[24px]">
              engineering
            </span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Đang bảo trì
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.filter(r => r.TrangThaiPhong === 1).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu phòng */}
      <RoomTable
        rooms={paginatedRooms}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-space-md py-space-sm
                      bg-surface-container-low rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Trang {currentPage} / {totalPages} (Tổng {rooms.length} phòng)
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

      {/* Dialog thêm/sửa phòng */}
      <RoomFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleSubmitForm}
        editMode={editMode}
        roomData={selectedRoom}
        loaiPhongList={mockLoaiPhong}
        isLoading={isLoading}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRoom(null);
        }}
        onConfirm={handleConfirmDelete}
        roomData={selectedRoom}
        isLoading={isLoading}
      />
    </div>
  );
};

export default QuanLyPhongPage;
