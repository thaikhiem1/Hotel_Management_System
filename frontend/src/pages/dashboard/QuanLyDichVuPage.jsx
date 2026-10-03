import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/utils/lib/util';
import ServiceModal from '@/components/service-management/ServiceModal';
import CategoryModal from '@/components/service-management/CategoryModal';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';
import { serviceCategoryAPI } from '@/services/api';

const QuanLyDichVuPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fetch service categories from backend
  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceCategoryAPI.getAll();
      setServiceCategories(data);
    } catch (err) {
      console.error('Error fetching service categories:', err);
      setError('Không thể tải danh sách loại dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  // Mock DichVu - TODO: API GET /api/services
  // Table: DichVu { IdDV, TenDV, DonGia, DonVi, SLTon, IdLDV }
  const mockServices = [
    { IdDV: 1, TenDV: 'Ăn sáng buffet', DonGia: 150000, DonVi: 'suất', SLTon: 100, IdLDV: 1 },
    { IdDV: 2, TenDV: 'Ăn trưa set menu', DonGia: 200000, DonVi: 'suất', SLTon: 50, IdLDV: 1 },
    { IdDV: 3, TenDV: 'Ăn tối cao cấp', DonGia: 350000, DonVi: 'suất', SLTon: 30, IdLDV: 1 },
    { IdDV: 4, TenDV: 'Minibar', DonGia: 100000, DonVi: 'combo', SLTon: 200, IdLDV: 1 },
    { IdDV: 5, TenDV: 'Room service đồ uống', DonGia: 50000, DonVi: 'ly', SLTon: 150, IdLDV: 1 },
    { IdDV: 6, TenDV: 'Giặt thường', DonGia: 30000, DonVi: 'kg', SLTon: null, IdLDV: 2 },
    { IdDV: 7, TenDV: 'Giặt khô', DonGia: 80000, DonVi: 'kg', SLTon: null, IdLDV: 2 },
    { IdDV: 8, TenDV: 'Ủi đồ', DonGia: 20000, DonVi: 'bộ', SLTon: null, IdLDV: 2 },
    { IdDV: 9, TenDV: 'Massage body', DonGia: 500000, DonVi: 'giờ', SLTon: null, IdLDV: 3 },
    { IdDV: 10, TenDV: 'Massage foot', DonGia: 200000, DonVi: 'giờ', SLTon: null, IdLDV: 3 },
    { IdDV: 11, TenDV: 'Spa chăm sóc da mặt', DonGia: 400000, DonVi: 'liệu trình', SLTon: null, IdLDV: 3 },
    { IdDV: 12, TenDV: 'Đưa đón sân bay', DonGia: 300000, DonVi: 'lượt', SLTon: null, IdLDV: 4 },
    { IdDV: 13, TenDV: 'Thuê xe du lịch 4 chỗ', DonGia: 800000, DonVi: 'ngày', SLTon: null, IdLDV: 4 },
    { IdDV: 14, TenDV: 'Thuê xe du lịch 7 chỗ', DonGia: 1200000, DonVi: 'ngày', SLTon: null, IdLDV: 4 },
    { IdDV: 15, TenDV: 'Karaoke', DonGia: 300000, DonVi: 'giờ', SLTon: null, IdLDV: 5 },
    { IdDV: 16, TenDV: 'Bida', DonGia: 100000, DonVi: 'giờ', SLTon: null, IdLDV: 5 },
    { IdDV: 17, TenDV: 'Thuê phim', DonGia: 50000, DonVi: 'bộ', SLTon: null, IdLDV: 5 },
    { IdDV: 18, TenDV: 'Thêm giường phụ', DonGia: 150000, DonVi: 'đêm', SLTon: 20, IdLDV: 6 },
    { IdDV: 19, TenDV: 'Giữ hành lý', DonGia: 0, DonVi: 'ngày', SLTon: null, IdLDV: 6 },
    { IdDV: 20, TenDV: 'In ấn tài liệu', DonGia: 5000, DonVi: 'trang', SLTon: 1000, IdLDV: 6 },
  ];

  const [services, setServices] = useState(mockServices);

  // Lọc dịch vụ
  const filteredServices = useMemo(() => {
    let result = services;

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.IdLDV === parseInt(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => s.TenDV.toLowerCase().includes(query));
    }

    return result;
  }, [services, selectedCategory, searchQuery]);

  // Phân trang
  const { paginatedServices, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedServices: filteredServices.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredServices.length / itemsPerPage)
    };
  }, [filteredServices, currentPage]);

  // Thống kê
  const stats = useMemo(() => {
    const servicesWithStock = services.filter(s => s.SLTon !== null);
    return {
      total: services.length,
      categories: serviceCategories.length,
      totalValue: services.reduce((sum, s) => sum + s.DonGia, 0),
      inStock: servicesWithStock.reduce((sum, s) => sum + s.SLTon, 0)
    };
  }, [services, serviceCategories]);

  // CRUD Handlers
  const handleAddService = (data) => {
    console.log('Adding service:', data);
    const newService = { IdDV: services.length + 1, ...data };
    setServices([...services, newService]);
    setIsAddModalOpen(false);
  };

  const handleEditService = (data) => {
    console.log('Editing service:', data);
    setServices(services.map(s => s.IdDV === selectedService.IdDV ? { ...s, ...data } : s));
    setIsEditModalOpen(false);
    setSelectedService(null);
  };

  const handleDeleteService = () => {
    console.log('Deleting service:', selectedService);
    setServices(services.filter(s => s.IdDV !== selectedService.IdDV));
    setIsDeleteModalOpen(false);
    setSelectedService(null);
  };

  // CRUD Handlers for Categories
  const handleAddCategory = async (categoryName) => {
    try {
      const newCategory = await serviceCategoryAPI.create({ 
        serviceCategoryName: categoryName 
      });
      setServiceCategories([...serviceCategories, newCategory]);
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Không thể thêm loại dịch vụ. Vui lòng thử lại.');
    }
  };

  const handleEditCategory = async (id, categoryName) => {
    try {
      const updatedCategory = await serviceCategoryAPI.update(id, { 
        serviceCategoryName: categoryName 
      });
      setServiceCategories(
        serviceCategories.map(cat => 
          cat.serviceCategoryId === id ? updatedCategory : cat
        )
      );
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Không thể cập nhật loại dịch vụ. Vui lòng thử lại.');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await serviceCategoryAPI.delete(selectedCategoryToDelete.serviceCategoryId);
      setServiceCategories(
        serviceCategories.filter(c => c.serviceCategoryId !== selectedCategoryToDelete.serviceCategoryId)
      );
      setIsDeleteCategoryModalOpen(false);
      setSelectedCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Không thể xóa loại dịch vụ. Vui lòng thử lại.');
      setIsDeleteCategoryModalOpen(false);
      setSelectedCategoryToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-space-lg">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-space-md">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="font-body-lg text-on-surface-variant">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-space-lg">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-error text-[32px]">error</span>
            <div>
              <p className="font-title-lg font-semibold text-error">Lỗi</p>
              <p className="font-body-md text-on-surface">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchServiceCategories}
            className="mt-space-md px-space-lg py-space-md rounded-lg bg-error hover:bg-error/80 text-on-error font-label-md font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-xs">
            Quản lý dịch vụ
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Quản lý các dịch vụ bổ sung cho khách hàng
          </p>
        </div>
        <div className="flex gap-space-md">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-secondary hover:bg-secondary/80 text-on-secondary font-label-lg font-semibold transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-[24px]">category</span>
            <span>Quản lý loại dịch vụ</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/80 text-on-primary font-label-lg font-semibold transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <div className="p-space-lg rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8941E] shadow-lg">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-white text-[32px]">room_service</span>
            <div>
              <p className="font-label-sm text-white/80 uppercase tracking-wide">Tổng dịch vụ</p>
              <p className="font-headline-lg font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-white text-[32px]">category</span>
            <div>
              <p className="font-label-sm text-white/80 uppercase tracking-wide">Loại dịch vụ</p>
              <p className="font-headline-lg font-bold text-white">{stats.categories}</p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-white text-[32px]">payments</span>
            <div>
              <p className="font-label-sm text-white/80 uppercase tracking-wide">Tổng giá trị</p>
              <p className="font-headline-md font-bold text-white">{(stats.totalValue / 1000000).toFixed(1)}tr</p>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
          <div className="flex items-center gap-space-md mb-space-sm">
            <span className="material-symbols-outlined text-white text-[32px]">inventory</span>
            <div>
              <p className="font-label-sm text-white/80 uppercase tracking-wide">Tồn kho</p>
              <p className="font-headline-lg font-bold text-white">{stats.inStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-space-lg py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:outline-none"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-space-md overflow-x-auto pb-space-xs scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'flex items-center gap-space-sm px-space-lg py-space-md rounded-full whitespace-nowrap font-label-lg font-semibold transition-all shadow-md',
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          <span className="material-symbols-outlined text-[20px]">apps</span>
          <span>Tất cả</span>
          <span className={cn(
            'px-space-sm py-space-xs rounded-full text-label-sm font-bold',
            selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-surface-container-highest'
          )}>
            {services.length}
          </span>
        </button>
        
        {serviceCategories.map(cat => (
          <button
            key={cat.serviceCategoryId}
            onClick={() => setSelectedCategory(String(cat.serviceCategoryId))}
            className={cn(
              'flex items-center gap-space-sm px-space-lg py-space-md rounded-full whitespace-nowrap font-label-lg font-semibold transition-all shadow-md',
              selectedCategory === String(cat.serviceCategoryId)
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <span>{cat.serviceCategoryName}</span>
            <span className={cn(
              'px-space-sm py-space-xs rounded-full text-label-sm font-bold',
              selectedCategory === String(cat.serviceCategoryId) ? 'bg-white/20 text-white' : 'bg-surface-container-highest'
            )}>
              {services.filter(s => s.IdLDV === cat.serviceCategoryId).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border-2 border-outline-variant overflow-hidden bg-surface shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-surface-container-low to-surface-container">
            <tr>
              <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">Tên dịch vụ</th>
              <th className="px-space-lg py-space-md text-left font-label-lg text-on-surface uppercase tracking-wide">Loại dịch vụ</th>
              <th className="px-space-lg py-space-md text-right font-label-lg text-on-surface uppercase tracking-wide">Đơn giá</th>
              <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">Đơn vị</th>
              <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">Số lượng tồn</th>
              <th className="px-space-lg py-space-md text-center font-label-lg text-on-surface uppercase tracking-wide">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {paginatedServices.map((service) => {
              const category = serviceCategories.find(c => c.serviceCategoryId === service.IdLDV);
              return (
                <tr key={service.IdDV} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-space-lg py-space-lg">
                    <p className="font-title-md font-semibold text-on-surface">{service.TenDV}</p>
                  </td>
                  <td className="px-space-lg py-space-lg">
                    <span className="inline-flex px-space-md py-space-sm rounded-full bg-secondary/20 text-secondary font-label-sm font-semibold">
                      {category?.serviceCategoryName || 'N/A'}
                    </span>
                  </td>
                  <td className="px-space-lg py-space-lg text-right">
                    <p className="font-title-md font-bold text-[#D4AF37]">
                      {service.DonGia.toLocaleString('vi-VN')}đ
                    </p>
                  </td>
                  <td className="px-space-lg py-space-lg text-center">
                    <span className="inline-flex px-space-md py-space-sm rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                      {service.DonVi}
                    </span>
                  </td>
                  <td className="px-space-lg py-space-lg text-center">
                    <span className={cn(
                      'inline-flex px-space-md py-space-sm rounded-full font-label-sm font-bold',
                      service.SLTon === null
                        ? 'bg-surface-container text-on-surface-variant'
                        : service.SLTon > 50
                        ? 'bg-emerald-500/20 text-emerald-700'
                        : service.SLTon > 0
                        ? 'bg-amber-500/20 text-amber-700'
                        : 'bg-error/20 text-error'
                    )}>
                      {service.SLTon === null ? 'N/A' : service.SLTon}
                    </span>
                  </td>
                  <td className="px-space-lg py-space-lg">
                    <div className="flex items-center justify-center gap-space-sm">
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setIsEditModalOpen(true);
                        }}
                        className="p-space-md rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-700 hover:text-white transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-space-md rounded-lg bg-error/20 hover:bg-error text-error hover:text-on-error transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-space-md">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed font-label-md font-semibold text-on-surface transition-colors shadow-md"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                'px-space-lg py-space-md rounded-lg font-label-md font-semibold transition-colors shadow-md',
                currentPage === i + 1
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white'
                  : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'
              )}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-space-lg py-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed font-label-md font-semibold text-on-surface transition-colors shadow-md"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <ServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddService}
        serviceCategories={serviceCategories}
        mode="add"
      />

      <ServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedService(null);
        }}
        onSubmit={handleEditService}
        serviceCategories={serviceCategories}
        mode="edit"
        initialData={selectedService}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedService(null);
        }}
        onConfirm={handleDeleteService}
        title="Xóa dịch vụ"
        message={`Bạn có chắc muốn xóa dịch vụ "${selectedService?.TenDV}"?`}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        categories={serviceCategories}
        onDeleteCategory={(cat) => {
          setSelectedCategoryToDelete(cat);
          setIsDeleteCategoryModalOpen(true);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Xóa loại dịch vụ"
        message={`Bạn có chắc muốn xóa loại "${selectedCategoryToDelete?.serviceCategoryName}"?`}
      />
        </>
      )}
    </div>
  );
};

export default QuanLyDichVuPage;
