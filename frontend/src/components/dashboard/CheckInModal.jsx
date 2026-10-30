import { useState } from "react";
import { ModalShell, InfoCard } from "@/components/shared";
import { rentalService } from "@/services/mockRentalService";
import { formatDateTime, formatReceiptCode, RENTAL_TYPE_LABELS } from "@/utils/format";
import { cn } from "@/utils/lib/util";

/**
 * CheckInModal - Form nhận phòng (UC-REN-004)
 * Hiển thị khách hàng, phòng, thời gian nhận dự kiến và ô nhập số khách thực tế.
 * Điều kiện nhận phòng đã được kiểm tra trước khi mở (bước 3) và được kiểm tra lại khi Xác nhận (bước 6).
 *
 * Props:
 * - isOpen
 * - stay: kết quả rentalService.getCheckInContext()
 * - onClose
 * - onSuccess(result): gọi sau khi nhận phòng thành công (form tự đóng bằng onClose do cha xử lý)
 */
const CheckInForm = ({ stay, onClose, onSuccess }) => {
  const { customer, room, detail, receipt } = stay;
  const [guests, setGuests] = useState(String(detail.bookedGuests ?? 1));
  const [touched, setTouched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState(null);

  const guestsNumber = Number(guests);
  const guestsError =
    guests.trim() === "" ||
    !Number.isInteger(guestsNumber) ||
    guestsNumber <= 0 ||
    guestsNumber > room.maxOccupancy
      ? `Số lượng khách phải từ 1 đến ${room.maxOccupancy} người (sức chứa tối đa của phòng).`
      : null;
  const fieldError =
    (touched && guestsError) ||
    (serverError?.field === "actualGuests" ? serverError.message : null);

  const handleConfirm = async () => {
    setTouched(true);
    setServerError(null);
    if (guestsError) return;

    setIsProcessing(true);
    try {
      const result = await rentalService.checkIn({
        detailId: detail.id,
        actualGuests: guestsNumber,
      });
      onSuccess?.(result);
    } catch (error) {
      setServerError({
        code: error.code,
        field: error.field,
        message: error.message || "Nhận phòng thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const conditions = [
    "Chi tiết đặt phòng ở trạng thái RESERVED",
    "Đã đến thời gian nhận phòng dự kiến",
    "Phòng đủ điều kiện tiếp nhận khách",
  ];

  // Lỗi không gắn với ô nhập (E1, E2, E4, E5...) hiển thị thành banner
  const bannerError = serverError && serverError.field !== "actualGuests";

  return (
    <ModalShell
      icon="login"
      title={`Nhận phòng ${room.code}`}
      subtitle={`${room.typeName} • Phiếu thuê ${formatReceiptCode(receipt.id)}`}
      onClose={onClose}
      closeDisabled={isProcessing}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                <span>Xác nhận nhận phòng</span>
              </>
            )}
          </button>
        </>
      }
    >
      {bannerError && (
        <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-error-container text-on-error-container border border-error/30">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md">{serverError.message}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <InfoCard
          icon="person"
          title="Thông tin khách hàng"
          rows={[
            { label: "Họ và tên", value: customer.name },
            { label: "Số điện thoại", value: customer.phone },
            { label: "CCCD/Passport", value: customer.citizenId },
            { label: "Quốc tịch", value: customer.nationality },
          ]}
        />
        <InfoCard
          icon="hotel"
          title="Thông tin phòng"
          rows={[
            { label: "Mã phòng", value: room.code },
            { label: "Loại phòng", value: room.typeName },
            { label: "Số giường", value: room.beds },
            {
              label: "Sức chứa tối đa",
              value: `${room.maxOccupancy} người`,
              highlight: true,
            },
          ]}
        />
      </section>

      <InfoCard
        icon="event"
        title="Thông tin lưu trú"
        rows={[
          {
            label: "Nhận phòng dự kiến",
            value: formatDateTime(detail.expectedCheckIn),
            highlight: true,
          },
          {
            label: "Trả phòng dự kiến",
            value: formatDateTime(detail.expectedCheckOut),
          },
          {
            label: "Hình thức thuê",
            value: RENTAL_TYPE_LABELS[detail.rentalType],
          },
          { label: "Số khách đã đặt", value: `${detail.bookedGuests} người` },
        ]}
      />

      <section className="p-space-lg rounded-lg bg-primary-container border border-outline-variant">
        <label
          htmlFor="actualGuests"
          className="flex items-center gap-space-sm mb-space-sm font-title-md text-title-md font-semibold text-on-primary-container"
        >
          <span className="material-symbols-outlined">groups</span>
          Số lượng khách thực tế
        </label>
        <div className="flex items-center gap-space-md">
          <input
            id="actualGuests"
            type="number"
            min="1"
            max={room.maxOccupancy}
            value={guests}
            onChange={(e) => {
              setGuests(e.target.value);
              setServerError(null);
            }}
            onBlur={() => setTouched(true)}
            disabled={isProcessing}
            className={cn(
              "w-32 px-space-md py-space-md rounded-lg border-2 bg-surface text-on-surface font-semibold text-center focus:outline-none",
              fieldError
                ? "border-error focus:border-error"
                : "border-outline focus:border-primary",
            )}
          />
          <span className="text-on-primary-container/70">
            người (tối đa {room.maxOccupancy})
          </span>
        </div>
        {fieldError && (
          <p className="mt-space-sm flex items-center gap-space-xs text-error font-body-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {fieldError}
          </p>
        )}
      </section>

      <section className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
        <h4 className="font-label-lg text-label-lg font-semibold text-on-surface mb-space-sm">
          Điều kiện nhận phòng
        </h4>
        <ul className="space-y-space-xs">
          {conditions.map((text) => (
            <li
              key={text}
              className="flex items-center gap-space-sm text-on-surface-variant font-body-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                check_circle
              </span>
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-space-sm text-on-surface-variant font-body-sm">
          Nhận phòng này không tự động nhận các phòng khác trong cùng phiếu thuê.
          Hệ thống sẽ kiểm tra lại các điều kiện khi bạn nhấn Xác nhận.
        </p>
      </section>
    </ModalShell>
  );
};

const CheckInModal = ({ isOpen, stay, onClose, onSuccess }) => {
  if (!isOpen || !stay) return null;
  // key: mỗi lượt đặt phòng có state form riêng, không cần reset thủ công
  return (
    <CheckInForm
      key={stay.detail.id}
      stay={stay}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CheckInModal;
