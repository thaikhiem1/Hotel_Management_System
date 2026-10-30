
/**
 * RoomDetailModal - Modal hiển thị chi tiết đầy đủ của phòng
 * Hiển thị thông tin phòng + thông tin khách + danh sách dịch vụ đã sử dụng
 * 
 * Props:
 * - room: Thông tin phòng
 * - isOpen: Trạng thái mở/đóng modal
 * - onClose: Callback khi đóng modal
 * - onOpenAddService: Callback khi mở modal thêm dịch vụ
 */
const RoomDetailModal = ({ room, isOpen, onClose, onOpenAddService }) => {
  if (!isOpen || !room) return null;

  // Dịch vụ đã sử dụng: chưa có API ghi nhận dịch vụ (UC-SVC-005) nên danh sách trống
  // cho đến khi nối API: GET /api/rental-details/{bookingDetailId}/services
  const usedServices = room.services ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px]">
              hotel
            </span>
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold">
                Chi tiết phòng {room.name}
              </h2>
              <p className="font-body-md text-body-md opacity-90">
                {room.roomType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-xl space-y-space-lg">
          {/* Thông tin phòng cơ bản */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-primary">info</span>
                <h3 className="font-title-lg text-title-lg font-semibold text-on-surface">
                  Thông tin phòng
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mã phòng:</span>
                  <span className="font-semibold text-on-surface">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Loại phòng:</span>
                  <span className="font-semibold text-on-surface">{room.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Giá/ngày:</span>
                  <span className="font-semibold text-primary">
                    {room.pricePerDay?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Giá/giờ:</span>
                  <span className="font-semibold text-secondary">
                    {room.pricePerHour != null ? `${room.pricePerHour.toLocaleString('vi-VN')}đ` : 'Chưa có giá'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số giường:</span>
                  <span className="font-semibold text-on-surface">{room.numberOfBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Sức chứa tối đa:</span>
                  <span className="font-semibold text-on-surface">{room.maximumOccupancy} người</span>
                </div>
                {room.note && (
                  <div className="flex justify-between gap-space-md">
                    <span className="text-on-surface-variant">Ghi chú:</span>
                    <span className="font-semibold text-on-surface text-right">{room.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin khách hàng */}
            {(room.status === 'occupied' || room.status === 'reserved') && (
              <div className="p-space-lg rounded-lg bg-tertiary-container border border-outline-variant">
                <div className="flex items-center gap-space-sm mb-space-md">
                  <span className="material-symbols-outlined text-tertiary">person</span>
                  <h3 className="font-title-lg text-title-lg font-semibold text-on-tertiary-container">
                    Thông tin khách hàng
                  </h3>
                </div>
                <div className="space-y-space-sm">
                  <div className="flex justify-between">
                    <span className="text-on-tertiary-container/70">Tên khách:</span>
                    <span className="font-semibold text-on-tertiary-container">
                      {room.guestName || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-tertiary-container/70">Số điện thoại:</span>
                    <span className="font-semibold text-on-tertiary-container">
                      {room.guestPhone || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-tertiary-container/70">Mã phiếu thuê:</span>
                    <span className="font-semibold text-on-tertiary-container">
                      {room.receiptCode || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-tertiary-container/70">Số người:</span>
                    <span className="font-semibold text-on-tertiary-container">
                      {room.numberOfGuests != null ? `${room.numberOfGuests} người` : '—'}
                    </span>
                  </div>
                  {room.status === 'occupied' && room.checkInTime && (
                    <div className="flex justify-between">
                      <span className="text-on-tertiary-container/70">Check-in:</span>
                      <span className="font-semibold text-on-tertiary-container">
                        {room.checkInTime}
                      </span>
                    </div>
                  )}
                  {room.checkOutTime && (
                    <div className="flex justify-between">
                      <span className="text-on-tertiary-container/70">
                        {room.status === 'occupied' ? 'Check-out dự kiến:' : 'Check-in dự kiến:'}
                      </span>
                      <span className="font-semibold text-on-tertiary-container">
                        {room.status === 'occupied' ? room.checkOutTime : room.checkInTime}
                      </span>
                    </div>
                  )}
                  {/* TODO: Hiển thị thêm thông tin từ API */}
                  {/* API: GET /api/rental-details/{IdCTDP}/guest-info */}
                  {/* Bao gồm: SDT, CCCD, số người, ghi chú */}
                </div>
              </div>
            )}
          </section>

          {/* Danh sách dịch vụ đã sử dụng - chỉ hiển thị khi phòng đang thuê */}
          {room.status === 'occupied' && (
            <section className="space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    room_service
                  </span>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                    Dịch vụ đã sử dụng
                  </h3>
                </div>
                {/* TODO: Kiểm tra quyền lễ tân/quản lý trước khi hiển thị nút */}
                {/* Authorization: Role 0 (Admin) hoặc 1 (Lễ tân) */}
                <button
                  onClick={() => {
                    onClose(); // Đóng modal chi tiết
                    if (onOpenAddService) {
                      onOpenAddService(room); // Mở modal thêm dịch vụ
                    }
                  }}
                  className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Thêm dịch vụ</span>
                </button>
              </div>

              {usedServices.length === 0 ? (
                <div className="p-space-xl rounded-lg bg-surface-container-low border border-outline-variant text-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-space-md block">
                    receipt_long
                  </span>
                  <p className="font-body-lg text-on-surface-variant">
                    Chưa có dịch vụ nào được sử dụng
                  </p>
                </div>
              ) : (
                <div className="space-y-space-sm">
                  {usedServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-space-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-space-sm mb-space-xs">
                            <span className="material-symbols-outlined text-primary text-[20px]">
                              receipt
                            </span>
                            <h4 className="font-title-md text-title-md font-semibold text-on-surface">
                              {service.name}
                            </h4>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant ml-7">
                            Thời gian: {service.addedAt}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xs">
                            {service.quantity} {service.unit} × {service.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="font-title-lg text-title-lg font-bold text-primary">
                            {service.total.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tổng cộng dịch vụ */}
                  <div className="p-space-lg rounded-lg bg-primary-container border-2 border-primary">
                    <div className="flex items-center justify-between">
                      <span className="font-title-lg text-title-lg font-bold text-on-primary-container">
                        Tổng tiền dịch vụ:
                      </span>
                      <span className="font-headline-lg text-headline-lg font-bold text-primary">
                        {usedServices.reduce((sum, s) => sum + s.total, 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Ghi chú cho phòng đã đặt */}
          {room.status === 'reserved' && (
            <section className="p-space-lg rounded-lg bg-secondary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-secondary">info</span>
                <h3 className="font-title-md text-title-md font-semibold text-on-secondary-container">
                  Lưu ý
                </h3>
              </div>
              <p className="text-on-secondary-container">
                Phòng đã được đặt trước. Khách hàng sẽ check-in vào {room.checkInTime}.
                Vui lòng chuẩn bị phòng trước thời gian check-in.
              </p>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex gap-space-md justify-end">
          <button
            onClick={onClose}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
          >
            Đóng
          </button>
          {/* TODO: Thêm các nút action khác tùy theo trạng thái và quyền */}
          {/* Ví dụ: Sửa thông tin, Hủy đặt phòng, etc. */}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
