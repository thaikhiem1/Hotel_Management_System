import GenericDeleteDialog from "@/components/shared/GenericDeleteDialog";
import { getRoomStatusLabel } from "@/utils/roomStatus";

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
    { label: "Mã phòng", value: roomData.room_code, highlight: true },
    { label: "Loại phòng", value: roomData.room_type_name || "N/A", highlight: false },
    {
      label: "Trạng thái",
      value: getRoomStatusLabel(roomData.room_status),
      highlight: false,
    },
  ];

  if (roomData.note) {
    itemDetails.push({
      label: "Ghi chú",
      value: roomData.note,
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
