import React from "react";
import GenericDeleteDialog from "@/components/shared/GenericDeleteDialog";

const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  roomData,
  isLoading,
}) => {
  if (!roomData) return null;

  // Map room data to generic dialog format
  const itemDetails = [
    { label: "Mã phòng", value: roomData.MaPH, highlight: true },
    { label: "Loại phòng", value: roomData.TenLPH || "N/A", highlight: false },
    {
      label: "Trạng thái",
      value: roomData.TrangThaiPhong === "TRONG" ? "Trống" : "Đang sửa chữa",
      highlight: false,
    },
  ];

  if (roomData.GhiChu) {
    itemDetails.push({
      label: "Ghi chú",
      value: roomData.GhiChu,
      highlight: false,
    });
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
