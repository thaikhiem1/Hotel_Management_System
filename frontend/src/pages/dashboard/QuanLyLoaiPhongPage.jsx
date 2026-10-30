import { useState, useMemo, useEffect } from 'react';
import RoomTypeTable from '@/components/room-type-management/RoomTypeTable';
import { Pagination } from "@/components/shared";
import RoomTypeFormDialog from '@/components/room-type-management/RoomTypeFormDialog';
import RoomTypeDeleteDialog from '@/components/room-type-management/RoomTypeDeleteDialog';
import { roomTypeAPI } from '@/services/api';
import { showSuccess, handleApiError } from '@/utils/notification';
import { formatCurrency } from '@/utils/format';

const QuanLyLoaiPhongPage = () => {
  // State quản lý dữ liệu loại phòng từ API
  const [roomTypes, setRoomTypes] = useState([]);
  
  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editMode, setEditMode] = useState('add'); 
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  
  // State phân trang (server-side)
  const [currentPage, setCurrentPage] = useState(0); // Backend page bắt đầu từ 0
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 16; // Match backend default
  
  const [isLoading, setIsLoading] = useState(false);
  
  // UC-RTY-004: Load dữ liệu khi component mount hoặc khi page thay đổi
  useEffect(() => {
    fetchRoomTypes();
  }, [currentPage]);
  
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      // UC-RTY-004: Xem danh sách loại phòng với phân trang
      // Backend trả về: ApiResponse<Page<RoomTypeResponse>>
      // axios unwrap HTTP response → response = ApiResponse object
      // ApiResponse.data = Page object
      const apiResponse = await roomTypeAPI.getAll({
        page: currentPage,
        size: itemsPerPage
      });
      console.log(apiResponse);
      // apiResponse = { timestamp, status, message, data: Page {...} }
      // Page = { content: [...], totalPages, totalElements, size, number }
      const pageData = apiResponse.data;
      
      setRoomTypes(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Server đã xử lý phân trang, không cần slice ở client
  const paginatedRoomTypes = roomTypes;

  // Tính toán thống kê (dựa trên totalElements từ server)
  const stats = useMemo(() => {
    const avgPrice = roomTypes.length > 0
      ? roomTypes.reduce((sum, rt) => sum + rt.dailyRate, 0) / roomTypes.length
      : 0;
    
    const maxCapacity = roomTypes.length > 0 
      ? Math.max(...roomTypes.map(rt => rt.maximumOccupancy)) 
      : 0;
    
    return {
      total: totalElements, // Tổng số từ server, không phải length của mảng local
      avgPrice: Math.round(avgPrice),
      maxCapacity
    };
  }, [roomTypes, totalElements]);

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

  // UC-RTY-001: Thêm loại phòng mới hoặc UC-RTY-002: Cập nhật loại phòng
  const handleSubmitForm = async (roomTypeData) => {
    setIsLoading(true);
    
    try {
      if (editMode === 'add') {
        // UC-RTY-001: Thêm loại phòng mới
        const response = await roomTypeAPI.create(roomTypeData);
        
        showSuccess(response.message || 'Thêm loại phòng thành công');
        
        // Refresh lại trang hiện tại để hiển thị dữ liệu mới
        await fetchRoomTypes();
      } else {
        // UC-RTY-002: Cập nhật loại phòng
        const response = await roomTypeAPI.update(selectedRoomType.roomTypeId, roomTypeData);
        
        showSuccess(response.message || 'Cập nhật loại phòng thành công');
        
        // Refresh lại dữ liệu
        await fetchRoomTypes();
      }

      setIsFormDialogOpen(false);
      setSelectedRoomType(null);
          
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // UC-RTY-003: Xóa loại phòng
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await roomTypeAPI.delete(selectedRoomType.roomTypeId);
      
      showSuccess(response.message || 'Xóa loại phòng thành công');
      
      setIsDeleteDialogOpen(false);
      setSelectedRoomType(null);
      
      // Nếu xóa phần tử cuối của trang cuối, quay về trang trước
      if (roomTypes.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchRoomTypes();
      }
       
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        roomTypes={paginatedRoomTypes || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Phân trang */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={itemsPerPage}
        onPageChange={handlePageChange}
        disabled={isLoading}
        unit="loại phòng"
      />

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
