import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * InvoiceModal - Modal xuất hóa đơn thanh toán
 * Hiển thị đầy đủ thông tin: khách hàng, nhân viên, phòng, dịch vụ, tổng tiền
 * Chuẩn hóa 100% theo Database.md
 * 
 * Props:
 * - room: Thông tin phòng đang checkout
 * - rentalReceipt: Thông tin phiếu thuê (rental_receipts)
 * - bookingDetail: Chi tiết đặt phòng (booking_details)
 * - services: Danh sách dịch vụ đã sử dụng (booking_detail_services)
 * - isOpen: Trạng thái modal
 * - onClose: Callback đóng modal
 * - onConfirm: Callback xác nhận thanh toán
 */
const InvoiceModal = ({ 
  room, 
  rentalReceipt,
  bookingDetail,
  services = [],
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Tính toán chi phí
  const calculations = useMemo(() => {
    if (!bookingDetail) return { roomTotal: 0, servicesTotal: 0, grandTotal: 0 };
    
    // 1. Tiền phòng từ booking_details.total_amount
    const roomTotal = bookingDetail.total_amount || 0;

    // 2. Tiền dịch vụ tổng từ booking_detail_services
    const servicesTotal = services.reduce((sum, s) => sum + (s.total_amount || 0), 0);

    // 3. Tổng cộng
    const grandTotal = roomTotal + servicesTotal;

    return {
      roomTotal,
      servicesTotal,
      grandTotal
    };
  }, [bookingDetail, services]);

  // Early return AFTER all hooks
  if (!isOpen || !room || !rentalReceipt || !bookingDetail) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: API tạo hóa đơn
      // API: POST /api/invoices
      // Body: {
      //   rental_receipt_id: rentalReceipt.rental_receipt_id,
      //   employee_id: currentUser.employee_id,
      //   invoice_date: today,
      //   total_amount: calculations.grandTotal,
      //   payment_status: 'PAID'
      // }
      // Authorization: Bearer token (quyền lễ tân)
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      if (onConfirm) {
        onConfirm({
          rentalReceiptId: rentalReceipt.rental_receipt_id,
          totalAmount: calculations.grandTotal,
          invoiceDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Có lỗi xảy ra khi tạo hóa đơn');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format ngày giờ
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-tertiary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[36px]">
              receipt_long
            </span>
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold">
                Phiếu Hóa Đơn Thanh Toán
              </h2>
              <p className="font-body-md text-body-md opacity-90">
                Phòng {room.name} - {room.roomType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-xl space-y-space-lg">
          {/* Thông tin hóa đơn */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {/* Thông tin khách hàng */}
            <div className="p-space-lg rounded-lg bg-primary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  person
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-primary-container">
                  Thông tin khách hàng
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div className="flex justify-between">
                  <span className="text-on-primary-container/70">Họ và tên:</span>
                  <span className="font-semibold text-on-primary-container">
                    {rentalReceipt.customer?.full_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-primary-container/70">Số điện thoại:</span>
                  <span className="font-semibold text-on-primary-container">
                    {rentalReceipt.customer?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-primary-container/70">CCCD/Passport:</span>
                  <span className="font-semibold text-on-primary-container">
                    {rentalReceipt.customer?.citizen_id_passport || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-primary-container/70">Quốc tịch:</span>
                  <span className="font-semibold text-on-primary-container">
                    {rentalReceipt.customer?.nationality || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin nhân viên và phiếu thuê */}
            <div className="p-space-lg rounded-lg bg-secondary-container border border-outline-variant">
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  badge
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-secondary-container">
                  Thông tin nhân viên
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div className="flex justify-between">
                  <span className="text-on-secondary-container/70">Nhân viên lập phiếu:</span>
                  <span className="font-semibold text-on-secondary-container">
                    {rentalReceipt.employee?.full_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-secondary-container/70">Chức vụ:</span>
                  <span className="font-semibold text-on-secondary-container">
                    {rentalReceipt.employee?.position || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-secondary-container/70">Mã phiếu thuê:</span>
                  <span className="font-semibold text-on-secondary-container">
                    PT{String(rentalReceipt.rental_receipt_id).padStart(6, '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-secondary-container/70">Ngày lập phiếu:</span>
                  <span className="font-semibold text-on-secondary-container">
                    {formatDate(rentalReceipt.rental_date)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Thông tin đặt phòng */}
          <section className="p-space-lg rounded-lg bg-tertiary-container border border-outline-variant">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-tertiary text-[24px]">
                hotel
              </span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-tertiary-container">
                Thông tin phòng và lưu trú
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="space-y-space-sm">
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Mã phòng:</span>
                  <span className="font-semibold text-on-tertiary-container">
                    {room.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Loại phòng:</span>
                  <span className="font-semibold text-on-tertiary-container">
                    {room.roomType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Số khách:</span>
                  <span className="font-semibold text-on-tertiary-container">
                    {bookingDetail.number_of_guests} người
                  </span>
                </div>
              </div>
              <div className="space-y-space-sm">
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Check-in:</span>
                  <span className="font-semibold text-on-tertiary-container">
                    {formatDate(bookingDetail.check_in_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Check-out:</span>
                  <span className="font-semibold text-on-tertiary-container">
                    {formatDate(bookingDetail.check_out_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-tertiary-container/70">Đơn giá phòng:</span>
                  <span className="font-semibold text-tertiary">
                    {bookingDetail.unit_price?.toLocaleString('vi-VN')}đ/ngày
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Chi tiết dịch vụ */}
          <section className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">
                room_service
              </span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                Chi tiết dịch vụ đã sử dụng
              </h3>
            </div>

            {services.length === 0 ? (
              <div className="p-space-xl rounded-lg bg-surface-container-low border border-outline-variant text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-space-md block">
                  receipt
                </span>
                <p className="font-body-lg text-on-surface-variant">
                  Không có dịch vụ nào được sử dụng
                </p>
              </div>
            ) : (
              <div className="space-y-space-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
                          STT
                        </th>
                        <th className="px-space-md py-space-sm text-left font-label-md text-label-md text-on-surface">
                          Tên dịch vụ
                        </th>
                        <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
                          Đơn giá
                        </th>
                        <th className="px-space-md py-space-sm text-center font-label-md text-label-md text-on-surface">
                          Số lượng
                        </th>
                        <th className="px-space-md py-space-sm text-right font-label-md text-label-md text-on-surface">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {services.map((service, index) => (
                        <tr key={`${service.service_id}-${index}`} className="hover:bg-surface-container-low/50">
                          <td className="px-space-md py-space-md text-on-surface">
                            {index + 1}
                          </td>
                          <td className="px-space-md py-space-md">
                            <div className="flex items-center gap-space-sm">
                              <span className="material-symbols-outlined text-primary text-[20px]">
                                shopping_cart
                              </span>
                              <span className="font-semibold text-on-surface">
                                {service.service?.service_name || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-space-md py-space-md text-right text-on-surface">
                            {service.unit_price?.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="px-space-md py-space-md text-center text-on-surface">
                            {service.quantity}
                          </td>
                          <td className="px-space-md py-space-md text-right font-semibold text-primary">
                            {service.total_amount?.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Tổng kết thanh toán */}
          <section className="space-y-space-md">
            <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
              <div className="space-y-space-sm">
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-title-md text-on-surface">
                    Tiền phòng:
                  </span>
                  <span className="font-title-lg text-title-lg font-semibold text-on-surface">
                    {calculations.roomTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-title-md text-on-surface">
                    Tiền dịch vụ:
                  </span>
                  <span className="font-title-lg text-title-lg font-semibold text-on-surface">
                    {calculations.servicesTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="p-space-xl rounded-lg bg-gradient-to-r from-primary to-tertiary border-2 border-primary">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  TỔNG THANH TOÁN:
                </span>
                <span className="font-headline-lg text-headline-lg font-bold text-on-primary">
                  {calculations.grandTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </section>

          {/* Ghi chú */}
          <section className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <span className="material-symbols-outlined text-on-surface-variant">
                info
              </span>
              <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">
                Ghi chú
              </h4>
            </div>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant list-disc list-inside">
              <li>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận thanh toán</li>
              <li>Hóa đơn sẽ được lưu vào hệ thống sau khi thanh toán</li>
              <li>Phòng sẽ chuyển sang trạng thái "Đang dọn dẹp" sau khi thanh toán</li>
            </ul>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface-container-low px-space-xl py-space-lg border-t border-outline-variant flex gap-space-md justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-space-xl py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-space-xl py-space-md rounded-lg bg-gradient-to-r from-primary to-tertiary hover:opacity-90 text-on-primary font-label-lg text-label-lg font-bold transition-all shadow-lg flex items-center gap-space-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                <span>Xác nhận thanh toán</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
