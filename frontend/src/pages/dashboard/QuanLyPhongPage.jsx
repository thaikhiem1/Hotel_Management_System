import { useState, useEffect, useMemo } from "react";
import { usePermission } from "@/utils/usePermission";
import RoomTable from "@/components/room-management/RoomTable";
import { Pagination } from "@/components/shared";
import RoomFormDialog from "@/components/room-management/RoomFormDialog";
import DeleteConfirmDialog from "@/components/room-management/DeleteConfirmDialog";
import { roomAPI, roomTypeAPI } from "@/services/api";
import { showSuccess, handleApiError } from "@/utils/notification";

const QuanLyPhongPage = () => {
  const { check: checkWrite } = usePermission("rooms");
  // State quản lý dữ liệu phòng (sẽ được thay thế bằng API call)
  const [rooms, setRooms] = useState([]);

  // State quản lý dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State quản lý chế độ thêm/sửa và phòng được chọn
  const [editMode, setEditMode] = useState("add"); // 'add' | 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  // State quản lý danh sách loại phòng
  const [roomType, setRoomTypes] = useState([]);

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

      const mappedData = data.map((item) => ({
        room_id: item.room_id,
        room_code: item.room_code,
        room_type_id: item.room_type_id,
        room_type_name: item.room_type_name,
        daily_rate: item.daily_rate,
        hourly_rate: item.hourly_rate,
        room_status: item.room_status,
        note: item.note,
        has_active_stay: item.has_active_stay ?? false,
        has_upcoming_booking: item.has_upcoming_booking ?? false,
      }));
      setRooms(mappedData);
      console.log("Loaded rooms :", mappedData.length);
    } catch (error) {
      console.error("Error fetching room :", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await roomTypeAPI.getAll();
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.content)
              ? response.data.content
              : [];
      setRoomTypes(data);
      console.log("Loaded room types:", data.length);
    } catch (error) {
      console.error("Error fetching room types:", error);
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
    if (!checkWrite()) return;
    setEditMode("add");
    setSelectedRoom(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (room) => {
    if (!checkWrite()) return;
    setEditMode("edit");
    setSelectedRoom(room);
    setIsFormDialogOpen(true);
  };

  /**
   * Mở dialog xác nhận xóa
   */
  const handleDelete = (room) => {
    if (!checkWrite()) return;
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Xử lý submit form (thêm mới hoặc cập nhật)
   */
  const handleSubmitForm = async (roomData) => {
    setIsLoading(true);
    try {
      if (editMode === "add") {
        // Gọi API thêm mới
        const response = await roomAPI.create(roomData);
        setRooms([...rooms, response]);
        showSuccess("add success");
      } else {
        // Gọi API cập nhật
        const response = await roomAPI.update(selectedRoom.room_id, roomData);
        setRooms(
          rooms.map((r) => (r.room_id === selectedRoom.room_id ? response : r)),
        );
        showSuccess("update success");
      }
      setIsFormDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Error submitting room:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    console.log("room_id: " + selectedRoom.room_id);

    setIsLoading(true);
    try {
      // Gọi API xóa phòng
      await roomAPI.delete(selectedRoom.room_id);
      setRooms(rooms.filter((r) => r.room_id !== selectedRoom.room_id));
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      // Điều chỉnh trang nếu trang hiện tại không còn dữ liệu
      const newTotalPages = Math.ceil((rooms.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      showSuccess("delete success");
    } catch (error) {
      console.error("Error deleting room:", error);
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
      <div className="flex flex-wrap items-center justify-between gap-space-md">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
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
                {rooms.filter((r) => r.room_status === "AVAILABLE").length}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              cleaning_services
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đang dọn dẹp
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {rooms.filter((r) => r.room_status === "CLEANING").length}
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
                {
                  rooms.filter((r) => r.room_status === "UNDER_MAINTENANCE")
                    .length
                }
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
      <Pagination
        page={currentPage - 1}
        totalPages={totalPages}
        totalElements={rooms.length}
        pageSize={itemsPerPage}
        onPageChange={(p) => handlePageChange(p + 1)}
        disabled={isLoading}
        unit="phòng"
      />

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
        roomTypeData={roomType}
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
