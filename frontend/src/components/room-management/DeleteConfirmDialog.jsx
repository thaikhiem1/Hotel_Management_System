import React from 'react';
import GenericDeleteDialog from '@/components/shared/GenericDeleteDialog';

/**
 * DeleteConfirmDialog - Dialog xác nhận xóa phòng
 * Wrapper của GenericDeleteDialog với data mapping cho Phòng
 * 
 * Props:
 * - isOpen: Boolean - Trạng thái mở/đóng dialog
 * - onClose: Function - Callback khi đóng dialog
 * - onConfirm: Function - Callback khi xác nhận xóa
 * - roomData: Object - Dữ liệu phòng cần xóa
 * - isLoading: Boolean - Trạng thái loading
 * 
 * TODO: AUTHORIZATION
 * - Chỉ Admin (Role 0) mới được phép xóa phòng
 * 
 * TODO: API INTEGRATION
 * - Trước khi xóa, cần kiểm tra xem phòng có đang được thuê hay không
 * - Gọi API GET /api/phieu-thue/check-room/{IdPH} để kiểm tra
 * - Nếu phòng đang được thuê, hiển thị cảnh báo và không cho phép xóa
 */
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, roomData, isLoading }) => {
  if (!roomData) return null;

  // Map room data to generic dialog format
  const itemDetails = [
    { label: 'Mã phòng', value: roomData.MaPH, highlight: true },
    { label: 'Loại phòng', value: roomData.loaiPhong?.TenLPH || 'N/A', highlight: false },
    { 
      label: 'Trạng thái', 
      value: roomData.TrangThaiPhong === 0 ? 'Trống' : 'Đang sửa chữa',
      highlight: false
    }
  ];

  // Add note if exists
  if (roomData.GhiChu) {
    itemDetails.push({ label: 'Ghi chú', value: roomData.GhiChu, highlight: false });
  }

  return (
    <GenericDeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Xác nhận xóa phòng"
      itemName="phòng"
      itemDetails={itemDetails}
      warningMessage="Dữ liệu phòng sẽ bị xóa vĩnh viễn khỏi hệ thống. Vui lòng kiểm tra kỹ trước khi thực hiện."
      isLoading={isLoading}
    />
  );
};

export default DeleteConfirmDialog;
