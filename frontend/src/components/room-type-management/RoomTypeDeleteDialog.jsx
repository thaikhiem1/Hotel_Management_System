import React from "react";
import GenericDeleteDialog from "@/components/shared/GenericDeleteDialog";

const RoomTypeDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  roomTypeData,
  isLoading,
}) => {
  if (!roomTypeData) return null;

  /**
   * Format số tiền theo định dạng Việt Nam
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Map room type data to generic dialog format
  const itemDetails = [
    { label: "Tên loại phòng", value: roomTypeData.TenLPH, highlight: true },
    { label: "Số giường", value: roomTypeData.SoGiuong, highlight: false },
    {
      label: "Số người tối đa",
      value: roomTypeData.SoNguoiToiDa,
      highlight: false,
    },
    {
      label: "Giá ngày",
      value: formatCurrency(roomTypeData.GiaNgay),
      highlight: false,
    },
  ];

  // Add price per hour if exists
  if (roomTypeData.GiaGio) {
    itemDetails.push({
      label: "Giá giờ",
      value: formatCurrency(roomTypeData.GiaGio),
      highlight: false,
    });
  }

  return (
    <GenericDeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Xác nhận xóa loại phòng"
      itemName="loại phòng"
      itemDetails={itemDetails}
      warningMessage="Dữ liệu loại phòng sẽ bị xóa vĩnh viễn khỏi hệ thống. Nếu có phòng nào đang sử dụng loại phòng này, bạn cần xóa hoặc chuyển đổi các phòng đó trước."
      isLoading={isLoading}
    />
  );
};

export default RoomTypeDeleteDialog;
