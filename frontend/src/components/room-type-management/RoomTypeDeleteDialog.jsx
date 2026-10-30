import GenericDeleteDialog from "@/components/shared/GenericDeleteDialog";
import { formatCurrency } from "@/utils/format";

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
  // Map room type data to generic dialog format (camelCase fields)
  const itemDetails = [
    { label: "Tên loại phòng", value: roomTypeData.roomTypeName, highlight: true },
    { label: "Số giường", value: roomTypeData.numberOfBeds, highlight: false },
    {
      label: "Số người tối đa",
      value: roomTypeData.maximumOccupancy,
      highlight: false,
    },
    {
      label: "Giá ngày",
      value: formatCurrency(roomTypeData.dailyRate),
      highlight: false,
    },
  ];

  // Add price per hour if exists
  if (roomTypeData.hourlyRate) {
    itemDetails.push({
      label: "Giá giờ",
      value: formatCurrency(roomTypeData.hourlyRate),
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
