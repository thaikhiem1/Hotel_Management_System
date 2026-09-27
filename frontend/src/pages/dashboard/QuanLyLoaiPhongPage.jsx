import React, { useState, useMemo, useEffect } from 'react';
import RoomTypeTable from '@/components/room-type-management/RoomTypeTable';
import RoomTypeFormDialog from '@/components/room-type-management/RoomTypeFormDialog';
import RoomTypeDeleteDialog from '@/components/room-type-management/RoomTypeDeleteDialog';
import { roomTypeAPI } from '@/services/api';
import { showSuccess, handleApiError } from '@/utils/notification';

const QuanLyLoaiPhongPage = () => {
  // State quản lý dữ liệu loại phòng từ API
  const [roomTypes, setRoomTypes] = useState([]);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editMode, setEditMode] = useState('add'); 
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchRoomTypes();
  }, []);
  
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const data = await roomTypeAPI.getAll();
      
      const mappedData = data.map(item => ({
        room_type_id: item.room_type_id,
        room_type_name: item.room_type_name,
        number_of_beds: item.number_of_beds,
        maximum_occupancy: item.maximum_occupancy,
        daily_rate: item.daily_rate,
        hourly_rate: item.hourly_rate
      }));
      
      setRoomTypes(mappedData);
    } catch (error) {
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
      ? roomTypes.reduce((sum, rt) => sum + rt.daily_rate, 0) / roomTypes.length
      : 0;
    
    const maxCapacity = Math.max(...roomTypes.map(rt => rt.maximum_occupancy), 0);
    
    return {
      total: roomTypes.length,
      avgPrice: Math.round(avgPrice),
      maxCapacity
    };
  }, [roomTypes]);

  const handleAddNew = () => {
    setEditMode('add');
    setSelectedRoomType(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (roomTypeData) => {
    setEditMode('edit');
    setSelectedRoomType(roomTypeData);
    setIsFormDialogOpen(true);
  };


  const handleDelete = (roomTypeData) => {
    setSelectedRoomType(roomTypeData);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitForm = async (roomTypeData) => {
    setIsLoading(true);
    
    try {
      if (editMode === 'add') {

        const response = await roomTypeAPI.create(roomTypeData);
        
        setRoomTypes([...roomTypes, response]);
        
        showSuccess('add room_type success');
      } else {

        const response = await roomTypeAPI.update(selectedRoomType.room_type_id, roomTypeData);
        
        setRoomTypes(roomTypes.map(rt => 
          rt.room_type_id === selectedRoomType.room_type_id ? response : rt
        ));
        
        showSuccess('update room_type success!');
      }

      setIsFormDialogOpen(false);
      setSelectedRoomType(null);
          
    } catch (error) {
      console.error('Error submitting room type:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await roomTypeAPI.delete(selectedRoomType.room_type_id);
      
      setRoomTypes(roomTypes.filter(rt => rt.room_type_id !== selectedRoomType.room_type_id));
      
      setIsDeleteDialogOpen(false);
      setSelectedRoomType(null);
      
      const newTotalPages = Math.ceil((roomTypes.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      showSuccess('delete success!');
       
    } catch (error) {
      console.error('Error deleting room type:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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

        {/* Nút thêm mới */}
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
