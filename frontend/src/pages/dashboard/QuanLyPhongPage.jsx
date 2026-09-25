import React, { useState, useEffect , useMemo } from 'react';
import RoomTable from '@/components/room-management/RoomTable';
import RoomFormDialog from '@/components/room-management/RoomFormDialog';
import DeleteConfirmDialog from '@/components/room-management/DeleteConfirmDialog';
import { roomAPI, roomTypeAPI } from '@/services/api';
import { showSuccess, handleApiError } from '@/utils/notification';

const QuanLyPhongPage = () => {
  // State quản lý dữ liệu phòng (sẽ được thay thế bằng API call)
  const [rooms, setRooms] = useState([]);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State quản lý chế độ thêm/sửa và phòng được chọn
  const [editMode, setEditMode] = useState('add'); // 'add' | 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  // State quản lý danh sách loại phòng
  const [roomtype, setRoomTypes] = useState([]);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);
 useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);
  
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      // Gọi API lấy danh sách phòng
      const data = await roomAPI.getAll();

      const mappedData = data.map(item => ({
        IdPH: item.IdPH,
        MaPH: item.MaPH,
        IdLPH: item.IdLPH,
        TenLPH: item.TenLPH,
        GiaNgay: item.GiaNgay,
        GiaGio: item.GiaGio,
        TrangThaiPhong: item.TrangThaiPhong,
        GhiChu: item.GhiChu,
      }));
      setRooms(mappedData);
      console.log('Loaded rooms :', mappedData.length);
    } catch (error) {
      console.error('Error fetching room :', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch danh sách loại phòng từ API
   */
  const fetchRoomTypes = async () => {
    try {
      const data = await roomTypeAPI.getAll();
      setRoomTypes(data);
      console.log('Loaded room types:', data.length);
    } catch (error) {
      console.error('Error fetching room types:', error);
      handleApiError(error);
    }
  };
  
  // Tính toán phân trang
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return rooms.slice(startIndex, endIndex);
  }, [rooms, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(rooms.length / itemsPerPage);

  const handleAddNew = () => {
    setEditMode('add');
    setSelectedRoom(null);
    setIsFormDialogOpen(true);
  };
  /**
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
   */
  const handleSubmitForm = async (roomData) => {

    setIsLoading(true);    
    try {
      if (editMode === 'add') {
        // Gọi API thêm mới
        const newRoom = await roomAPI.create(roomData);

        await fetchRooms();
        showSuccess("Thêm phòng mới thành công");
        console.log('Thêm phòng thành công:', newRoom);
      } else {
        // Gọi API cập nhật
        const updatedRoom = await roomAPI.update(selectedRoom.IdPH, roomData);
        // Reload lại danh sách phòng sau khi cập nhật thành công
        await fetchRooms();
        showSuccess("Cập nhật phòng thành công");
        console.log('Cập nhật phòng thành công:', updatedRoom);
      }
      
      setIsFormDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error submitting room:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      // Gọi API xóa phòng
      await roomAPI.delete(selectedRoom.IdPH);
      // Reload danh sách sau khi xóa thành công
      await fetchRooms();
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      const newTotalPages = Math.ceil((rooms.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      showSuccess("Xóa phòng thành công");
    } catch (error) {
      console.error('Error deleting room:', error);
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

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-headline-lg text-headline-lg text-on-surface">
            Quản lý phòng
          </h1>
          <p className="text-lg mt-space-xs font-body-md text-body-md text-on-surface-variant">
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Phòng trống
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.filter(r => r.TrangThaiPhong === "TRONG").length}
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
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đang bảo trì
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.filter(r => r.TrangThaiPhong === "DANG_SUA_CHUA").length}
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
        roomtypeData = {roomtype}
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
