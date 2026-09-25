import React, { useState, useMemo } from 'react';
import { InvoiceCard, InvoiceDetailModal } from '@/components/invoice';
import { cn } from '@/utils/lib/util';

/**
 * QuanLyHoaDonPage - Trang quản lý hóa đơn
 * Hiển thị danh sách hóa đơn, lọc theo trạng thái, tìm kiếm
 * Chuẩn hóa 100% theo Database.md - bảng invoices
 * 
 * Features:
 * - Danh sách hóa đơn với thông tin chi tiết
 * - Lọc theo trạng thái thanh toán (PAID/UNPAID)
 * - Tìm kiếm theo mã hóa đơn, tên khách hàng
 * - Xem chi tiết hóa đơn
 * - In hóa đơn
 */
const QuanLyHoaDonPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'PAID', 'UNPAID'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Lấy dữ liệu từ API
  // API: GET /api/invoices
  // Query params: ?status={PAID|UNPAID}&fromDate={date}&toDate={date}&search={query}
  // Authorization: Bearer token (quyền lễ tân/quản lý)
  // Response: Array of invoices with relations: employee, rental_receipt (with customer, booking_details)
  
  // Mock data - Chuẩn hóa theo Database.md
  const mockInvoices = [
    {
      invoice_id: 1,
      invoice_date: '2026-09-25',
      total_amount: 5450000,
      employee_id: 1,
      rental_receipt_id: 1,
      payment_status: 'PAID',
      employee: {
        employee_id: 1,
        full_name: 'Nguyễn Văn A',
        position: 'Lễ tân'
      },
      rental_receipt: {
        rental_receipt_id: 1,
        rental_date: '2026-09-23',
        customer_id: 1,
        customer: {
          customer_id: 1,
          full_name: 'Trần Thị B',
          phone: '0901234567',
          citizen_id_passport: '079123456789',
          nationality: 'Việt Nam',
          gender: 'Nữ'
        },
        booking_details: [
          {
            booking_detail_id: 1,
            room_id: 101,
            number_of_guests: 2,
            check_in_date: '2026-09-23',
            check_out_date: '2026-09-25',
            unit_price: 2500000,
            total_amount: 5000000,
            room: {
              room_id: 101,
              room_code: 'P101',
              room_type: {
                room_type_name: 'Deluxe'
              }
            }
          }
        ]
      }
    },
    {
      invoice_id: 2,
      invoice_date: '2026-09-25',
      total_amount: 3200000,
      employee_id: 2,
      rental_receipt_id: 2,
      payment_status: 'PAID',
      employee: {
        employee_id: 2,
        full_name: 'Lê Văn C',
        position: 'Lễ tân'
      },
      rental_receipt: {
        rental_receipt_id: 2,
        rental_date: '2026-09-24',
        customer_id: 2,
        customer: {
          customer_id: 2,
          full_name: 'Phạm Văn D',
          phone: '0912345678',
          citizen_id_passport: '001234567890',
          nationality: 'Việt Nam',
          gender: 'Nam'
        },
        booking_details: [
          {
            booking_detail_id: 2,
            room_id: 102,
            number_of_guests: 1,
            check_in_date: '2026-09-24',
            check_out_date: '2026-09-25',
            unit_price: 1800000,
            total_amount: 1800000,
            room: {
              room_id: 102,
              room_code: 'P102',
              room_type: {
                room_type_name: 'Standard'
              }
            }
          }
        ]
      }
    },
    {
      invoice_id: 3,
      invoice_date: '2026-09-24',
      total_amount: 7800000,
      employee_id: 1,
      rental_receipt_id: 3,
      payment_status: 'PAID',
      employee: {
        employee_id: 1,
        full_name: 'Nguyễn Văn A',
        position: 'Lễ tân'
      },
      rental_receipt: {
        rental_receipt_id: 3,
        rental_date: '2026-09-20',
        customer_id: 3,
        customer: {
          customer_id: 3,
          full_name: 'Hoàng Thị E',
          phone: '0923456789',
          citizen_id_passport: 'A12345678',
          nationality: 'Hàn Quốc',
          gender: 'Nữ'
        },
        booking_details: [
          {
            booking_detail_id: 3,
            room_id: 201,
            number_of_guests: 3,
            check_in_date: '2026-09-20',
            check_out_date: '2026-09-24',
            unit_price: 1800000,
            total_amount: 7200000,
            room: {
              room_id: 201,
              room_code: 'P201',
              room_type: {
                room_type_name: 'Suite'
              }
            }
          }
        ]
      }
    }
  ];

  // Lọc theo ngày
  const dateFilteredInvoices = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        return mockInvoices.filter(inv => {
          const invDate = new Date(inv.invoice_date);
          invDate.setHours(0, 0, 0, 0);
          return invDate.getTime() === today.getTime();
        });
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return mockInvoices.filter(inv => {
          const invDate = new Date(inv.invoice_date);
          return invDate >= weekAgo && invDate <= today;
        });
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return mockInvoices.filter(inv => {
          const invDate = new Date(inv.invoice_date);
          return invDate >= monthAgo && invDate <= today;
        });
      
      default:
        return mockInvoices;
    }
  }, [dateFilter]);

  // Lọc theo trạng thái và tìm kiếm
  const filteredInvoices = useMemo(() => {
    let result = dateFilteredInvoices;

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.payment_status === statusFilter);
    }

    // Tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(inv => {
        const invoiceId = String(inv.invoice_id).padStart(6, '0');
        const customerName = inv.rental_receipt?.customer?.full_name?.toLowerCase() || '';
        const rentalReceiptId = String(inv.rental_receipt_id).padStart(6, '0');
        
        return (
          invoiceId.includes(query) ||
          customerName.includes(query) ||
          rentalReceiptId.includes(query)
        );
      });
    }

    return result;
  }, [dateFilteredInvoices, statusFilter, searchQuery]);

  // Thống kê
  const statistics = useMemo(() => {
    const total = mockInvoices.length;
    const paid = mockInvoices.filter(inv => inv.payment_status === 'PAID').length;
    const unpaid = mockInvoices.filter(inv => inv.payment_status === 'UNPAID').length;
    const totalRevenue = mockInvoices
      .filter(inv => inv.payment_status === 'PAID')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    return { total, paid, unpaid, totalRevenue };
  }, []);

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handlePrintInvoice = (invoice) => {
    // TODO: Implement print functionality
    // Có thể sử dụng window.print() hoặc tạo PDF
    console.log('Print invoice:', invoice);
    alert(`In hóa đơn #${String(invoice.invoice_id).padStart(6, '0')}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // TODO: Gọi API để refresh dữ liệu
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-xs">
            Quản lý Hóa đơn
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Quản lý và theo dõi các hóa đơn thanh toán
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
        >
          <span className={cn('material-symbols-outlined', isLoading && 'animate-spin')}>
            refresh
          </span>
          <span>Làm mới</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <div className="p-space-lg rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-primary text-[32px]">
              receipt_long
            </span>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tổng hóa đơn
              </p>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">
                {statistics.total}
              </p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-tertiary/10 to-tertiary/5 border border-tertiary/20">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[32px]">
              check_circle
            </span>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Đã thanh toán
              </p>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">
                {statistics.paid}
              </p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-error/10 to-error/5 border border-error/20">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-error text-[32px]">
              pending
            </span>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Chưa thanh toán
              </p>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">
                {statistics.unpaid}
              </p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-secondary text-[32px]">
              payments
            </span>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Doanh thu
              </p>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">
                {(statistics.totalRevenue / 1000000).toFixed(1)}tr
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Search */}
          <div className="lg:col-span-1">
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">
              Tìm kiếm
            </label>
            <div className="relative">
              <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Mã hóa đơn, tên khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-space-md py-space-md rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">
              Trạng thái thanh toán
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-space-md py-space-md rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-colors"
            >
              <option value="all">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">
              Thời gian
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-space-md py-space-md rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-colors"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hiển thị <span className="font-semibold text-primary">{filteredInvoices.length}</span> hóa đơn
        </p>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-space-2xl">
          <div className="flex flex-col items-center gap-space-md">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
              refresh
            </span>
            <p className="font-body-lg text-on-surface-variant">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-space-2xl">
          <span className="material-symbols-outlined text-[72px] text-on-surface-variant/30 mb-space-md">
            receipt_long
          </span>
          <h3 className="font-title-lg text-title-lg font-semibold text-on-surface mb-space-sm">
            Không tìm thấy hóa đơn
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Chưa có hóa đơn nào được tạo'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.invoice_id}
              invoice={invoice}
              onView={handleViewDetail}
              onPrint={handlePrintInvoice}
            />
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        onPrint={handlePrintInvoice}
      />
    </div>
  );
};

export default QuanLyHoaDonPage;
