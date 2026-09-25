import React, { useState, useMemo } from 'react';
import {
  DateTimeFilter,
  QuickActions,
  StatCard,
  RoomFilterTabs,
  RoomGrid,
  RoomDetailModal,
  AddServiceModal
} from '@/components/dashboard';
import { InvoiceModal } from '@/components/invoice';
import {
  mockPhong,
  mockLoaiPhong,
  mockNhanVien,
  mockHoaDon,
  mockPhieuThue,
  getRoomStatusAtTime
} from '@/services/mockData';

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Bộ lọc ngày giờ (mặc định hôm nay lúc 14:00 đến 12:00 hôm sau)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [dateTimeFilter, setDateTimeFilter] = useState({
    checkIn: { date: todayStr, time: '14:00' },
    checkOut: { date: tomorrowStr, time: '12:00' }
  });

  // Chuyển đổi bộ lọc ngày giờ thành chuỗi ISO để kiểm tra xung đột/trạng thái phòng
  const { startDateTimeStr, endDateTimeStr } = useMemo(() => {
    if (!dateTimeFilter?.checkIn?.date || !dateTimeFilter?.checkOut?.date) {
      return { startDateTimeStr: null, endDateTimeStr: null };
    }
    const start = `${dateTimeFilter.checkIn.date}T${dateTimeFilter.checkIn.time || '14:00'}:00`;
    const end = `${dateTimeFilter.checkOut.date}T${dateTimeFilter.checkOut.time || '12:00'}:00`;
    return { startDateTimeStr: start, endDateTimeStr: end };
  }, [dateTimeFilter]);

  // Tính toán danh sách phòng và trạng thái phòng tại khung giờ được lọc
  const processedRooms = useMemo(() => {
    return mockPhong.map((phong) => {
      const statusInfo = getRoomStatusAtTime(phong, startDateTimeStr, endDateTimeStr, mockPhieuThue);
      const loaiPhong = phong.loaiPhong || {};

      return {
        id: phong.IdPH,
        name: phong.MaPH,
        roomType: loaiPhong.TenLPH || 'Phòng',
        pricePerDay: loaiPhong.GiaNgay || 0,
        pricePerHour: loaiPhong.GiaGio || Math.round((loaiPhong.GiaNgay || 0) / 10),
        status: statusInfo.status,
        guestName: statusInfo.guestName,
        checkInTime: statusInfo.checkInTime,
        checkOutTime: statusInfo.checkOutTime,
        maintenanceReason: statusInfo.maintenanceReason,
        // Dữ liệu gốc theo Database.md
        rawData: phong
      };
    });
  }, [startDateTimeStr, endDateTimeStr]);

  // Thống kê số lượng phòng theo từng trạng thái tại khung giờ được lọc
  const roomCounts = useMemo(() => {
    const counts = {
      all: processedRooms.length,
      available: 0,
      reserved: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0
    };

    processedRooms.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });

    return counts;
  }, [processedRooms]);

  // Thống kê KPIs từ dữ liệu chuẩn Database.md
  const stats = useMemo(() => {
    // 1. Công suất phòng = (số phòng đang có khách / tổng số phòng khả dụng) * 100%
    const totalWorkingRooms = mockPhong.filter(p => p.TrangThaiPhong === 0).length;
    const occupiedCount = roomCounts.occupied;
    const occupancyRate = totalWorkingRooms > 0
      ? ((occupiedCount / totalWorkingRooms) * 100).toFixed(1)
      : '0.0';

    // 2. Số loại phòng từ LoaiPhong
    const roomTypesCount = mockLoaiPhong.length;

    // 3. Doanh thu hôm nay từ HoaDon
    const todayRevenue = mockHoaDon
      .filter(hd => hd.NgHD === todayStr)
      .reduce((sum, hd) => sum + (hd.TriGia || 0), 0);

    const formattedRevenue = (todayRevenue / 1000000).toFixed(1) + ' tr';

    // 4. Nhân sự từ NhanVien
    const totalStaff = mockNhanVien.length;

    return {
      occupancy: { value: `${occupancyRate}%`, trend: 4.5 },
      roomTypes: { value: String(roomTypesCount), subValue: 'Loại phòng chuẩn' },
      revenue: { value: formattedRevenue, subValue: 'VNĐ hôm nay', trend: 10.2 },
      staff: { value: String(totalStaff), subValue: `${totalStaff} đang làm việc` }
    };
  }, [roomCounts, todayStr]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleFilterAvailableNow = () => {
    setActiveFilter('available');
  };

  const handleRoomAction = (actionId, room) => {
    console.log(`Action: ${actionId} on room:`, room);
    
    switch (actionId) {
      case 'view':
        // Mở modal chi tiết phòng
        setSelectedRoom(room);
        setIsDetailModalOpen(true);
        break;

      case 'book':
        // TODO: Điều hướng tới trang đặt phòng với phòng được chọn sẵn
        // API: GET /api/rooms/{IdPH}/availability (kiểm tra tính khả dụng)
        // Sau đó chuyển đến form đặt phòng
        // Authorization: Bearer token (quyền lễ tân/quản lý)
        alert(`Điều hướng tới trang lập phiếu thuê phòng ${room.name}`);
        break;

      case 'checkin':
        // TODO: API xử lý nhận phòng (chuyển từ "đã đặt" sang "đang thuê")
        // API: POST /api/rental-details/{IdCTDP}/checkin
        // Body: { checkinTime: ISO string, actualGuests: number }
        // Authorization: Bearer token (quyền lễ tân)
        if (confirm(`Xác nhận nhận phòng ${room.name} cho khách ${room.guestName}?`)) {
          console.log('Processing check-in for room:', room);
          alert('Đang xử lý nhận phòng...');
          // Sau khi API thành công, cần refresh lại danh sách phòng
          handleRefresh();
        }
        break;

      case 'cancel':
        // TODO: API hủy đặt phòng
        // API: POST /api/rental-details/{IdCTDP}/cancel
        // Authorization: Bearer token (quyền quản lý/admin)
        if (confirm(`Xác nhận HỦY đặt phòng ${room.name}? Hành động này không thể hoàn tác!`)) {
          console.log('Cancelling reservation for room:', room);
          alert('Đang xử lý hủy đặt phòng...');
          handleRefresh();
        }
        break;

      case 'service':
        // Mở modal thêm dịch vụ riêng biệt
        setSelectedRoom(room);
        setIsAddServiceModalOpen(true);
        break;

      case 'checkout': {
        // TODO: API lấy thông tin đầy đủ để xuất hóa đơn
        // API: GET /api/rental-details/{IdCTDP}/invoice-data
        // Bao gồm: rental_receipt, booking_detail, customer, services
        // Authorization: Bearer token (quyền lễ tân)
        
        // Tìm phiếu thuê và chi tiết đặt phòng từ mock data
        let foundRentalReceipt = null;
        let foundBookingDetail = null;
        
        for (const phieuThue of mockPhieuThue) {
          const chiTiet = phieuThue.chiTiet?.find(ct => 
            ct.IdPH === room.id && ct.TrangThaiDatPhong === 1 // 1: Đang thuê
          );
          
          if (chiTiet) {
            foundBookingDetail = chiTiet;
            foundRentalReceipt = phieuThue;
            break;
          }
        }
        
        if (!foundRentalReceipt || !foundBookingDetail) {
          alert('Không tìm thấy thông tin phiếu thuê cho phòng này!\nVui lòng kiểm tra lại trạng thái phòng.');
          break;
        }
        
        // Chuyển đổi từ format mock data sang format Database.md
        const rentalReceipt = {
          rental_receipt_id: foundRentalReceipt.IdPT,
          rental_date: foundRentalReceipt.NgPT,
          customer_id: foundRentalReceipt.IdKH,
          employee_id: foundRentalReceipt.IdNV,
          customer: {
            customer_id: foundRentalReceipt.khachHang.IdKH,
            full_name: foundRentalReceipt.khachHang.TenKH,
            phone: foundRentalReceipt.khachHang.SDT,
            citizen_id_passport: foundRentalReceipt.khachHang.CCCD_Passport,
            nationality: foundRentalReceipt.khachHang.QuocTich,
            gender: foundRentalReceipt.khachHang.GioiTinh
          },
          employee: {
            employee_id: mockNhanVien.find(nv => nv.IdNV === foundRentalReceipt.IdNV)?.IdNV || 1,
            full_name: mockNhanVien.find(nv => nv.IdNV === foundRentalReceipt.IdNV)?.TenNV || 'N/A',
            position: mockNhanVien.find(nv => nv.IdNV === foundRentalReceipt.IdNV)?.ChucVu || 'N/A'
          }
        };

        const bookingDetail = {
          booking_detail_id: foundBookingDetail.IdCTDP,
          rental_receipt_id: foundRentalReceipt.IdPT,
          room_id: foundBookingDetail.IdPH,
          number_of_guests: foundBookingDetail.SoNguoi,
          check_in_date: foundBookingDetail.NgayCheckIn?.split('T')[0] || '',
          check_out_date: foundBookingDetail.NgayCheckOut?.split('T')[0] || '',
          booking_status: 'CHECKED_IN',
          unit_price: foundBookingDetail.DonGia,
          total_amount: foundBookingDetail.ThanhTien
        };

        // Mock services - TODO: lấy từ API thực
        const services = [
          {
            booking_detail_id: foundBookingDetail.IdCTDP,
            service_id: 1,
            unit_price: 150000,
            quantity: 2,
            total_amount: 300000,
            service: {
              service_id: 1,
              service_name: 'Ăn sáng buffet',
              unit: 'suất'
            }
          },
          {
            booking_detail_id: foundBookingDetail.IdCTDP,
            service_id: 2,
            unit_price: 30000,
            quantity: 5,
            total_amount: 150000,
            service: {
              service_id: 2,
              service_name: 'Giặt ủi',
              unit: 'kg'
            }
          }
        ];

        setInvoiceData({
          rentalReceipt: rentalReceipt,
          bookingDetail: bookingDetail,
          services: services
        });
        setSelectedRoom(room);
        setIsInvoiceModalOpen(true);
        break;
      }

      case 'ready':
        // TODO: API đánh dấu phòng sẵn sàng sau khi dọn dẹp
        // API: PUT /api/rooms/{IdPH}/status
        // Body: { status: 'available' }
        // Authorization: Bearer token (quyền lễ tân)
        if (confirm(`Xác nhận phòng ${room.name} đã dọn dẹp xong và sẵn sàng?`)) {
          console.log('Marking room as ready:', room);
          alert('Đã đánh dấu phòng sẵn sàng');
          handleRefresh();
        }
        break;

      case 'complete':
        // TODO: API hoàn thành bảo trì
        // API: PUT /api/rooms/{IdPH}/maintenance
        // Body: { status: 0, completionNote: string }
        // Authorization: Bearer token (quyền quản lý/admin)
        if (confirm(`Xác nhận hoàn thành bảo trì phòng ${room.name}?`)) {
          console.log('Completing maintenance for room:', room);
          alert('Đã hoàn thành bảo trì');
          handleRefresh();
        }
        break;

      default:
        break;
    }
  };

  const handleAddService = (room, services) => {
    // TODO: API thêm dịch vụ cho phòng
    // API: POST /api/rental-details/{IdCTDP}/services
    // Body: { services: [{ serviceId, quantity, price }] }
    // Authorization: Bearer token (quyền lễ tân/quản lý)
    console.log('Adding services to room:', room, services);
    
    const totalAmount = services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    alert(`Đã thêm ${services.length} dịch vụ cho phòng ${room.name}\nTổng: ${totalAmount.toLocaleString('vi-VN')}đ`);
    
    // Refresh sau khi thêm dịch vụ thành công
    handleRefresh();
  };

  const handleInvoiceConfirm = (invoiceResult) => {
    // TODO: API tạo hóa đơn và cập nhật trạng thái phòng
    // API: POST /api/invoices
    // Body: { rental_receipt_id, employee_id, total_amount, invoice_date, payment_status: 'PAID' }
    // Authorization: Bearer token (quyền lễ tân)
    
    console.log('Invoice created:', invoiceResult);
    alert(`Đã tạo hóa đơn thành công!\nTổng thanh toán: ${invoiceResult.totalAmount.toLocaleString('vi-VN')}đ\nPhòng sẽ chuyển sang trạng thái "Đang dọn dẹp"`);
    
    // Đóng modal và refresh
    setIsInvoiceModalOpen(false);
    setSelectedRoom(null);
    setInvoiceData(null);
    handleRefresh();
  };

  // Lọc phòng theo tab được chọn
  const filteredRooms = useMemo(() => {
    if (activeFilter === 'all') return processedRooms;
    return processedRooms.filter(room => room.status === activeFilter);
  }, [activeFilter, processedRooms]);

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ml-6 text-lg font-body-lg text-body-lg text-on-surface-variant font-medium">
            Tổng quan hoạt động và tình trạng phòng khách sạn
          </p>
        </div>
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-low">
          <span className="material-symbols-outlined text-primary text-[20px]">
            schedule
          </span>
          <span className="font-label-lg text-label-lg text-on-surface">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* 20% Top Section: DateTime Filter & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-2">
          <DateTimeFilter onFilterChange={setDateTimeFilter} />
        </div>
        <div>
          <QuickActions
            onRefresh={handleRefresh}
            onFilterAvailableNow={handleFilterAvailableNow}
          />
        </div>
      </div>

      {/* 20% Stats Section - Chuẩn hóa theo Database.md */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <StatCard
          icon="pie_chart"
          label="Công suất phòng"
          value={stats.occupancy.value}
          trend={stats.occupancy.trend}
          colorClass="text-primary"
        />
        <StatCard
          icon="king_bed"
          label="Loại phòng"
          value={stats.roomTypes.value}
          subValue={stats.roomTypes.subValue}
          colorClass="text-secondary"
        />
        <StatCard
          icon="payments"
          label="Doanh thu"
          value={stats.revenue.value}
          subValue={stats.revenue.subValue}
          trend={stats.revenue.trend}
          colorClass="text-tertiary"
        />
        <StatCard
          icon="group"
          label="Nhân sự"
          value={stats.staff.value}
          subValue={stats.staff.subValue}
          colorClass="text-on-surface"
        />
      </div>

      {/* 10% Filter Tabs Section */}
      <div>
        <RoomFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={roomCounts}
        />
      </div>

      {/* 50% Room Grid Section */}
      <div>
        <div className="mb-space-sm flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Hiển thị {filteredRooms.length} phòng trong khoảng thời gian:{' '}
            <span className="text-primary font-semibold">
              {dateTimeFilter.checkIn.time} {dateTimeFilter.checkIn.date} &rarr; {dateTimeFilter.checkOut.time} {dateTimeFilter.checkOut.date}
            </span>
          </p>
        </div>

        <RoomGrid
          rooms={filteredRooms}
          onRoomAction={handleRoomAction}
          isLoading={isLoading}
        />
      </div>

      {/* Room Detail Modal - Hiển thị chi tiết phòng */}
      <RoomDetailModal
        room={selectedRoom}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRoom(null);
        }}
        onOpenAddService={(room) => {
          setSelectedRoom(room);
          setIsAddServiceModalOpen(true);
        }}
      />

      {/* Add Service Modal - Form thêm dịch vụ */}
      <AddServiceModal
        room={selectedRoom}
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          // Không set selectedRoom = null để có thể quay lại modal chi tiết
        }}
        onSubmit={handleAddService}
      />

      {/* Invoice Modal - Phiếu hóa đơn thanh toán */}
      <InvoiceModal
        room={selectedRoom}
        rentalReceipt={invoiceData?.rentalReceipt}
        bookingDetail={invoiceData?.bookingDetail}
        services={invoiceData?.services}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedRoom(null);
          setInvoiceData(null);
        }}
        onConfirm={handleInvoiceConfirm}
      />
    </div>
  );
};

export default DashboardPage;
