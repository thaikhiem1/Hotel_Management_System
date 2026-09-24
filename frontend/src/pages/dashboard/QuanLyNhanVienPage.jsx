import React, { useState, useEffect, useMemo } from 'react';
import { EmployeeCard, EmployeeProfileDialog } from '@/components/employee-management';
import { cn } from '@/utils/lib/util';

/**
 * QuanLyNhanVienPage - Trang quản lý nhân viên
 * Hiển thị danh sách nhân viên dạng grid card với phân trang
 * Mỗi trang hiển thị tối đa 16 cards (4 dòng x 4 cột)
 * 
 * TODO: Khi có API backend:
 * - Import employeeAPI từ @/services/api
 * - Implement fetchEmployees(), handleSubmit(), handleDelete()
 * - Thêm trường isWorking vào database
 */
const QuanLyNhanVienPage = () => {
  // State quản lý dữ liệu nhân viên
  const [employees, setEmployees] = useState([]);
  
  // State quản lý dialog
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogMode, setDialogMode] = useState('view'); // 'view' | 'edit' | 'add'
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State filter và search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'working' | 'resigned'
  const [filterPosition, setFilterPosition] = useState('all'); // 'all' | 'Tổng Giám Đốc' | 'Quản Lý' | 'Nhân Viên'

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // 4 rows x 4 columns

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    fetchEmployees();
  }, []);

  /**
   * Fetch danh sách nhân viên từ API
   * TODO: Implement API call
   */
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Mock data với nhiều nhân viên để test phân trang
      const mockData = [
        {
          idNV: 1,
          tenNV: 'Alexandre de Montes',
          chucVu: 'Tổng Giám Đốc',
          luong: 50000000,
          sdt: '0901234567',
          cccd: '001234567890',
          ngaySinh: '1980-05-15',
          gioiTinh: 'Nam',
          diaChi: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          email: 'alexandre@grandpalace.com',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA84QaAnq1uM-ytFYqrkEE55SPKO5rKzTBOJZvgi2cFcmWk3b2i-fBEunEYOcrQjjHJBlEXXJvxGmr9E6-niSdqmwcg6CASYunMSo8vd23_Wcv83qg9CeGvj8CoqXWzji9wDOW4keonHDlwJ2aRlCkEYa9r16PUY_SnMHCt3XkVLiCMA171dx0NNIHrhW55GgTxbgvOd5B4_IVBtSmQ7ViWwar6ezjYkmmuWT-4gjdoq7VY8jfzsVDkpA',
          isWorking: true
        },
        {
          idNV: 2,
          tenNV: 'Nguyễn Văn An',
          chucVu: 'Quản Lý',
          luong: 30000000,
          sdt: '0912345678',
          cccd: '001234567891',
          ngaySinh: '1985-08-20',
          gioiTinh: 'Nam',
          diaChi: '456 Lê Lợi, Quận 1, TP.HCM',
          email: 'an.nguyen@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/4285F4/FFFFFF?text=AN',
          isWorking: true
        },
        {
          idNV: 3,
          tenNV: 'Trần Thị Bình',
          chucVu: 'Nhân Viên',
          luong: 15000000,
          sdt: '0923456789',
          cccd: '001234567892',
          ngaySinh: '1990-03-10',
          gioiTinh: 'Nữ',
          diaChi: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
          email: 'binh.tran@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/EA4335/FFFFFF?text=BT',
          isWorking: true
        },
        {
          idNV: 4,
          tenNV: 'Lê Văn Cường',
          chucVu: 'Nhân Viên',
          luong: 14000000,
          sdt: '0934567890',
          cccd: '001234567893',
          ngaySinh: '1992-11-25',
          gioiTinh: 'Nam',
          diaChi: '321 Võ Văn Tần, Quận 3, TP.HCM',
          email: 'cuong.le@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/34A853/FFFFFF?text=LC',
          isWorking: false
        },
        {
          idNV: 5,
          tenNV: 'Phạm Thị Dung',
          chucVu: 'Quản Lý',
          luong: 28000000,
          sdt: '0945678901',
          cccd: '001234567894',
          ngaySinh: '1988-07-18',
          gioiTinh: 'Nữ',
          diaChi: '555 Pasteur, Quận 3, TP.HCM',
          email: 'dung.pham@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/FBBC04/FFFFFF?text=PD',
          isWorking: true
        },
        {
          idNV: 6,
          tenNV: 'Hoàng Văn Em',
          chucVu: 'Nhân Viên',
          luong: 13500000,
          sdt: '0956789012',
          cccd: '001234567895',
          ngaySinh: '1995-02-28',
          gioiTinh: 'Nam',
          diaChi: '777 Cách Mạng Tháng 8, Quận 10, TP.HCM',
          email: 'em.hoang@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/9C27B0/FFFFFF?text=HE',
          isWorking: false
        },
        {
          idNV: 7,
          tenNV: 'Vũ Thị Phương',
          chucVu: 'Nhân Viên',
          luong: 16000000,
          sdt: '0967890123',
          cccd: '001234567896',
          ngaySinh: '1993-09-12',
          gioiTinh: 'Nữ',
          diaChi: '888 Hai Bà Trưng, Quận 1, TP.HCM',
          email: 'phuong.vu@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/FF6D00/FFFFFF?text=VP',
          isWorking: true
        },
        {
          idNV: 8,
          tenNV: 'Đỗ Văn Giang',
          chucVu: 'Nhân Viên',
          luong: 15500000,
          sdt: '0978901234',
          cccd: '001234567897',
          ngaySinh: '1991-06-05',
          gioiTinh: 'Nam',
          diaChi: '999 Lý Thường Kiệt, Quận 10, TP.HCM',
          email: 'giang.do@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/00BCD4/FFFFFF?text=DG',
          isWorking: true
        },
        {
          idNV: 9,
          tenNV: 'Ngô Thị Hà',
          chucVu: 'Nhân Viên',
          luong: 14500000,
          sdt: '0989012345',
          cccd: '001234567898',
          ngaySinh: '1994-04-22',
          gioiTinh: 'Nữ',
          diaChi: '111 Điện Biên Phủ, Quận 1, TP.HCM',
          email: 'ha.ngo@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/E91E63/FFFFFF?text=NH',
          isWorking: true
        },
        {
          idNV: 10,
          tenNV: 'Bùi Văn Khoa',
          chucVu: 'Nhân Viên',
          luong: 15000000,
          sdt: '0990123456',
          cccd: '001234567899',
          ngaySinh: '1989-12-08',
          gioiTinh: 'Nam',
          diaChi: '222 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
          email: 'khoa.bui@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/009688/FFFFFF?text=BK',
          isWorking: true
        },
        {
          idNV: 11,
          tenNV: 'Đinh Thị Lan',
          chucVu: 'Nhân Viên',
          luong: 14000000,
          sdt: '0901234568',
          cccd: '001234567900',
          ngaySinh: '1996-08-15',
          gioiTinh: 'Nữ',
          diaChi: '333 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
          email: 'lan.dinh@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/795548/FFFFFF?text=DL',
          isWorking: false
        },
        {
          idNV: 12,
          tenNV: 'Trương Văn Minh',
          chucVu: 'Quản Lý',
          luong: 32000000,
          sdt: '0912345679',
          cccd: '001234567901',
          ngaySinh: '1983-05-30',
          gioiTinh: 'Nam',
          diaChi: '444 Lê Duẩn, Quận 1, TP.HCM',
          email: 'minh.truong@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/FF5722/FFFFFF?text=TM',
          isWorking: true
        },
        {
          idNV: 13,
          tenNV: 'Lý Thị Nga',
          chucVu: 'Nhân Viên',
          luong: 16500000,
          sdt: '0923456780',
          cccd: '001234567902',
          ngaySinh: '1992-11-11',
          gioiTinh: 'Nữ',
          diaChi: '555 Phan Đình Phùng, Quận Phú Nhuận, TP.HCM',
          email: 'nga.ly@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/607D8B/FFFFFF?text=LN',
          isWorking: true
        },
        {
          idNV: 14,
          tenNV: 'Võ Văn Oanh',
          chucVu: 'Nhân Viên',
          luong: 13000000,
          sdt: '0934567891',
          cccd: '001234567903',
          ngaySinh: '1997-02-14',
          gioiTinh: 'Nam',
          diaChi: '666 Trường Sa, Quận 3, TP.HCM',
          email: 'oanh.vo@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/3F51B5/FFFFFF?text=VO',
          isWorking: true
        },
        {
          idNV: 15,
          tenNV: 'Hồ Thị Phúc',
          chucVu: 'Nhân Viên',
          luong: 14800000,
          sdt: '0945678902',
          cccd: '001234567904',
          ngaySinh: '1993-07-07',
          gioiTinh: 'Nữ',
          diaChi: '777 Hoàng Sa, Quận 1, TP.HCM',
          email: 'phuc.ho@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/00BCD4/FFFFFF?text=HP',
          isWorking: false
        },
        {
          idNV: 16,
          tenNV: 'Mai Văn Quân',
          chucVu: 'Nhân Viên',
          luong: 15200000,
          sdt: '0956789013',
          cccd: '001234567905',
          ngaySinh: '1990-09-20',
          gioiTinh: 'Nam',
          diaChi: '888 Cộng Hòa, Quận Tân Bình, TP.HCM',
          email: 'quan.mai@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/8BC34A/FFFFFF?text=MQ',
          isWorking: true
        },
        {
          idNV: 17,
          tenNV: 'Đặng Thị Rân',
          chucVu: 'Nhân Viên',
          luong: 14200000,
          sdt: '0967890124',
          cccd: '001234567906',
          ngaySinh: '1995-03-18',
          gioiTinh: 'Nữ',
          diaChi: '999 Hồng Bàng, Quận 6, TP.HCM',
          email: 'ran.dang@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/CDDC39/000000?text=DR',
          isWorking: true
        },
        {
          idNV: 18,
          tenNV: 'Phan Văn Sơn',
          chucVu: 'Nhân Viên',
          luong: 13800000,
          sdt: '0978901235',
          cccd: '001234567907',
          ngaySinh: '1991-06-25',
          gioiTinh: 'Nam',
          diaChi: '121 Sư Vạn Hạnh, Quận 10, TP.HCM',
          email: 'son.phan@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/FFC107/000000?text=PS',
          isWorking: true
        },
        {
          idNV: 19,
          tenNV: 'Lâm Thị Thảo',
          chucVu: 'Nhân Viên',
          luong: 15700000,
          sdt: '0989012346',
          cccd: '001234567908',
          ngaySinh: '1994-12-30',
          gioiTinh: 'Nữ',
          diaChi: '232 Lý Chính Thắng, Quận 3, TP.HCM',
          email: 'thao.lam@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/FF9800/FFFFFF?text=LT',
          isWorking: false
        },
        {
          idNV: 20,
          tenNV: 'Huỳnh Văn Út',
          chucVu: 'Nhân Viên',
          luong: 14600000,
          sdt: '0990123457',
          cccd: '001234567909',
          ngaySinh: '1988-10-10',
          gioiTinh: 'Nam',
          diaChi: '343 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
          email: 'ut.huynh@grandpalace.com',
          avatar: 'https://via.placeholder.com/120/673AB7/FFFFFF?text=HU',
          isWorking: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmployees(mockData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter và search nhân viên
   */
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Filter by status
      if (filterStatus === 'working' && !emp.isWorking) return false;
      if (filterStatus === 'resigned' && emp.isWorking) return false;
      
      // Filter by position
      if (filterPosition !== 'all' && emp.chucVu !== filterPosition) return false;
      
      // Search by name, email, phone, cccd
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          emp.tenNV.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.sdt.includes(query) ||
          (emp.cccd && emp.cccd.includes(query))
        );
      }
      
      return true;
    });
  }, [employees, searchQuery, filterStatus, filterPosition]);

  /**
   * Phân trang - Lấy dữ liệu cho trang hiện tại
   */
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  /**
   * Thống kê nhân viên
   */
  const stats = useMemo(() => {
    const total = employees.length;
    const working = employees.filter(e => e.isWorking).length;
    const resigned = total - working;
    const managers = employees.filter(e => 
      (e.chucVu === 'Quản Lý' || e.chucVu === 'Tổng Giám Đốc') && e.isWorking
    ).length;
    
    return { total, working, resigned, managers };
  }, [employees]);

  /**
   * Mở dialog thêm nhân viên mới
   */
  const handleAddNew = () => {
    setDialogMode('add');
    setSelectedEmployee(null);
    setIsProfileDialogOpen(true);
  };

  /**
   * Mở dialog xem thông tin nhân viên
   */
  const handleViewEmployee = (employee) => {
    setDialogMode('view');
    setSelectedEmployee(employee);
    setIsProfileDialogOpen(true);
  };

  /**
   * Xử lý submit form (thêm mới hoặc cập nhật)
   */
  const handleSubmitForm = async (formData) => {
    setIsLoading(true);
    try {
      if (dialogMode === 'add') {
        // TODO: Gọi API thêm mới
        console.log('Thêm nhân viên mới:', formData);
        
        // Mock: Thêm vào state
        const newEmployee = {
          idNV: employees.length + 1,
          ...formData
        };
        setEmployees(prev => [...prev, newEmployee]);
        
        // TODO: Show success notification
      } else {
        // TODO: Gọi API cập nhật
        console.log('Cập nhật nhân viên:', selectedEmployee.idNV, formData);
        
        // Mock: Cập nhật state
        setEmployees(prev => 
          prev.map(emp => 
            emp.idNV === selectedEmployee.idNV 
              ? { ...emp, ...formData } 
              : emp
          )
        );
        
        // TODO: Show success notification
      }
      
      setIsProfileDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error submitting employee:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset về trang 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterPosition]);

  return (
    <div className="w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-headline-lg text-headline-lg text-on-surface">
            Quản lý nhân viên
          </h1>
          <p className="text-lg mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Quản lý thông tin nhân viên, chức vụ và trạng thái làm việc
          </p>
        </div>

        {/* Nút thêm mới - TODO: AUTHORIZATION - Chỉ Admin và Quản lý có quyền */}
        <button
          onClick={handleAddNew}
          className={cn(
            'flex items-center gap-space-xs px-space-md py-space-sm rounded-lg',
            'bg-primary text-on-primary font-label-lg text-label-lg',
            'hover:bg-primary/90 transition-colors duration-200',
            'shadow-sm hover:shadow-md',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
          disabled={isLoading}
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              group
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Tổng nhân viên
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              how_to_reg
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đang làm việc
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.working}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[24px]">
              person_off
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Đã nghỉ việc
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.resigned}
              </p>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              admin_panel_settings
            </span>
            <div>
              <p className="text-lg font-label-sm text-label-sm text-on-surface-variant">
                Ban quản lý
              </p>
              <p className="font-headline-md text-headline-md text-on-surface">
                {stats.managers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter và Search */}
      <div className="flex flex-col sm:flex-row gap-space-md">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT, CCCD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-space-md py-space-sm rounded-lg',
                'bg-surface-container-highest border border-outline',
                'font-body-md text-body-md text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
        </div>

        {/* Filter by Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all'
          )}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="working">Đang làm việc</option>
          <option value="resigned">Đã nghỉ việc</option>
        </select>

        {/* Filter by Position */}
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className={cn(
            'px-space-md py-space-sm rounded-lg',
            'bg-surface-container-highest border border-outline',
            'font-body-md text-body-md text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all'
          )}
        >
          <option value="all">Tất cả chức vụ</option>
          <option value="Tổng Giám Đốc">Tổng Giám Đốc</option>
          <option value="Quản Lý">Quản Lý</option>
          <option value="Nhân Viên">Nhân Viên</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hiển thị <span className="font-semibold text-on-surface">{paginatedEmployees.length}</span> / {filteredEmployees.length} nhân viên
          {totalPages > 1 && (
            <span className="ml-space-sm">
              (Trang {currentPage} / {totalPages})
            </span>
          )}
        </p>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-space-md">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
              progress_activity
            </span>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-space-lg">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-space-md">
            person_search
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">
            Không tìm thấy nhân viên
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Không có nhân viên nào phù hợp với bộ lọc hiện tại
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
          {paginatedEmployees.map(employee => (
            <EmployeeCard
              key={employee.idNV}
              employee={employee}
              onClick={handleViewEmployee}
            />
          ))}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && !isLoading && filteredEmployees.length > 0 && (
        <div className="flex items-center justify-between px-space-md py-space-sm
                      bg-surface-container-low rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Trang {currentPage} / {totalPages} (Tổng {filteredEmployees.length} nhân viên)
          </p>

          <div className="flex items-center gap-space-xs">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'p-space-xs rounded-lg transition-colors',
                'hover:bg-surface-container-high',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_left
              </span>
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Hiển thị trang đầu, trang cuối, trang hiện tại và các trang xung quanh
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span 
                    key={page} 
                    className="px-space-xs font-label-md text-label-md text-on-surface-variant"
                  >
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    'min-w-[32px] h-[32px] rounded-lg font-label-md text-label-md',
                    'transition-colors',
                    page === currentPage
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-surface-container-high text-on-surface'
                  )}
                >
                  {page}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-space-xs rounded-lg transition-colors',
                'hover:bg-surface-container-high',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Dialog */}
      <EmployeeProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleSubmitForm}
        employeeData={selectedEmployee}
        mode={dialogMode}
        isLoading={isLoading}
        canEdit={true} // TODO: Check authorization
      />
    </div>
  );
};

export default QuanLyNhanVienPage;
