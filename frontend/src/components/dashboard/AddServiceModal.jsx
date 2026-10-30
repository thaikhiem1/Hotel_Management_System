import { useState, useMemo } from 'react';
import { cn } from '@/utils/lib/util';

/**
 * AddServiceModal - Modal chuyên dụng để thêm dịch vụ cho phòng đang thuê
 * 
 * Props:
 * - room: Thông tin phòng
 * - isOpen: Trạng thái mở/đóng modal
 * - onClose: Callback khi đóng modal
 * - onSubmit: Callback khi submit dịch vụ
 */
const AddServiceModal = ({ room, isOpen, onClose, onSubmit }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Mock danh sách nhóm dịch vụ - TODO: Thay bằng API call
  // API: GET /api/service-categories
  // Authorization: Bearer token
  const serviceCategories = [
    { id: 'all', name: 'Tất cả dịch vụ', icon: 'apps' },
    { id: 'food', name: 'Ăn uống', icon: 'restaurant' },
    { id: 'laundry', name: 'Giặt ủi', icon: 'local_laundry_service' },
    { id: 'spa', name: 'Spa & Massage', icon: 'spa' },
    { id: 'transport', name: 'Vận chuyển', icon: 'local_shipping' },
    { id: 'entertainment', name: 'Giải trí', icon: 'sports_esports' },
    { id: 'other', name: 'Khác', icon: 'more_horiz' }
  ];

  // Mock danh sách dịch vụ - TODO: Thay bằng API call
  // API: GET /api/services
  // Authorization: Bearer token (kiểm tra quyền lễ tân/quản lý)
  const availableServices = [
    // Ăn uống
    { id: 1, name: 'Ăn sáng buffet', price: 150000, unit: 'suất', category: 'food', description: 'Buffet sáng từ 6h-10h' },
    { id: 2, name: 'Ăn trưa set menu', price: 200000, unit: 'suất', category: 'food', description: 'Set menu 3 món' },
    { id: 3, name: 'Ăn tối cao cấp', price: 350000, unit: 'suất', category: 'food', description: 'Menu đặc biệt' },
    { id: 4, name: 'Minibar', price: 100000, unit: 'combo', category: 'food', description: 'Đồ uống & snack' },
    { id: 5, name: 'Room service đồ uống', price: 50000, unit: 'ly', category: 'food', description: 'Nước ngọt, trà, cà phê' },
    
    // Giặt ủi
    { id: 6, name: 'Giặt thường', price: 30000, unit: 'kg', category: 'laundry', description: 'Giặt máy thường' },
    { id: 7, name: 'Giặt khô', price: 80000, unit: 'kg', category: 'laundry', description: 'Dry cleaning' },
    { id: 8, name: 'Ủi đồ', price: 20000, unit: 'bộ', category: 'laundry', description: 'Ủi phẳng phiu' },
    
    // Spa & Massage
    { id: 9, name: 'Massage body', price: 500000, unit: 'giờ', category: 'spa', description: 'Massage toàn thân' },
    { id: 10, name: 'Massage foot', price: 200000, unit: 'giờ', category: 'spa', description: 'Massage chân' },
    { id: 11, name: 'Spa chăm sóc da mặt', price: 400000, unit: 'liệu trình', category: 'spa', description: 'Facial spa' },
    
    // Vận chuyển
    { id: 12, name: 'Đưa đón sân bay', price: 300000, unit: 'lượt', category: 'transport', description: 'Xe 4-7 chỗ' },
    { id: 13, name: 'Thuê xe du lịch 4 chỗ', price: 800000, unit: 'ngày', category: 'transport', description: 'Xe sedan có tài xế' },
    { id: 14, name: 'Thuê xe du lịch 7 chỗ', price: 1200000, unit: 'ngày', category: 'transport', description: 'Xe SUV có tài xế' },
    
    // Giải trí
    { id: 15, name: 'Karaoke', price: 300000, unit: 'giờ', category: 'entertainment', description: 'Phòng karaoke VIP' },
    { id: 16, name: 'Bida', price: 100000, unit: 'giờ', category: 'entertainment', description: 'Bàn bida chuyên nghiệp' },
    { id: 17, name: 'Thuê phim', price: 50000, unit: 'bộ', category: 'entertainment', description: 'Xem phim trên TV' },
    
    // Khác
    { id: 18, name: 'Thêm giường phụ', price: 150000, unit: 'đêm', category: 'other', description: 'Giường đơn thêm' },
    { id: 19, name: 'Giữ hành lý', price: 0, unit: 'ngày', category: 'other', description: 'Miễn phí' },
    { id: 20, name: 'In ấn tài liệu', price: 5000, unit: 'trang', category: 'other', description: 'In đen trắng/màu' },
  ];

  // Lọc dịch vụ theo category và search - PHẢI GỌI HOOK TRƯỚC KHI RETURN
  const filteredServices = useMemo(() => {
    let result = availableServices;

    // Lọc theo category
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Lọc theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // Handler functions
  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        // Bỏ chọn dịch vụ
        const newQuantities = { ...serviceQuantities };
        delete newQuantities[serviceId];
        setServiceQuantities(newQuantities);
        return prev.filter(id => id !== serviceId);
      } else {
        // Chọn dịch vụ - mặc định số lượng = 1
        setServiceQuantities(prev => ({ ...prev, [serviceId]: 1 }));
        return [...prev, serviceId];
      }
    });
  };

  const handleQuantityChange = (serviceId, value) => {
    const quantity = parseInt(value) || 1;
    setServiceQuantities(prev => ({ ...prev, [serviceId]: Math.max(1, quantity) }));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      const quantity = serviceQuantities[serviceId] || 1;
      return total + (service?.price || 0) * quantity;
    }, 0);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dịch vụ!');
      return;
    }

    // TODO: Gọi API thêm dịch vụ
    // API: POST /api/rental-details/{IdCTDP}/services
    // Body: { services: [{ serviceId, quantity }] }
    // Authorization: Bearer token (kiểm tra quyền lễ tân/quản lý)
    
    const servicesData = selectedServices.map(serviceId => {
      const service = availableServices.find(s => s.id === serviceId);
      return {
        serviceId,
        quantity: serviceQuantities[serviceId] || 1,
        serviceName: service?.name,
        price: service?.price,
        unit: service?.unit,
        total: (service?.price || 0) * (serviceQuantities[serviceId] || 1)
      };
    });

    console.log('Submitting services for room:', room.name, servicesData);
    
    if (onSubmit) {
      onSubmit(room, servicesData);
    }

    // Reset form
    setSelectedServices([]);
    setServiceQuantities({});
    setSearchQuery('');
    setSelectedCategory('all');
    onClose();
  };

  const handleClose = () => {
    // Confirm nếu đã chọn dịch vụ
    if (selectedServices.length > 0) {
      if (!confirm('Bạn có chắc muốn đóng? Các dịch vụ đã chọn sẽ không được lưu.')) {
        return;
      }
    }
    
    // Reset form
    setSelectedServices([]);
    setServiceQuantities({});
    setSearchQuery('');
    setSelectedCategory('all');
    onClose();
  };

  // Early return AFTER all hooks have been called
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-surface rounded-xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="bg-primary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px]">
              room_service
            </span>
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold">
                Thêm dịch vụ cho phòng {room.name}
              </h2>
              <p className="font-body-md text-body-md opacity-90">
                {room.roomType} • Khách: {room.guestName || 'Đang cập nhật'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-space-xl py-space-md bg-surface-container-low border-b border-outline-variant">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-space-lg py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs - Fixed, không cuộn */}
        <div className="flex-shrink-0 px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant">
          <div className="flex gap-space-md overflow-x-auto scrollbar-hide pb-space-xs">
            {serviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-space-sm px-space-lg py-space-sm rounded-full whitespace-nowrap',
                  'font-label-lg text-label-lg font-semibold transition-all',
                  selectedCategory === category.id
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {category.icon}
                </span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto px-space-xl py-space-lg">
          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-space-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] mb-space-md opacity-30">
                search_off
              </span>
              <p className="font-body-lg">Không tìm thấy dịch vụ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {filteredServices.map(service => {
                const isSelected = selectedServices.includes(service.id);
                const quantity = serviceQuantities[service.id] || 1;

                return (
                  <div
                    key={service.id}
                    className={cn(
                      'p-space-lg rounded-lg border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary-container shadow-md'
                        : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-highest'
                    )}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start gap-space-md">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mt-1 w-5 h-5 rounded accent-primary cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h3 className="font-title-md text-title-md font-semibold text-on-surface mb-space-xs">
                          {service.name}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                          {service.description}
                        </p>
                        <p className="font-body-md text-body-md font-bold text-primary">
                          {service.price.toLocaleString('vi-VN')}đ / {service.unit}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div 
                        className="mt-space-md pt-space-md border-t border-outline-variant flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-label-md text-on-surface-variant">Số lượng:</span>
                        <div className="flex items-center gap-space-sm">
                          <button
                            onClick={() => handleQuantityChange(service.id, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">remove</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                            className="w-16 text-center px-space-sm py-space-xs rounded-lg border-2 border-outline bg-surface text-on-surface font-semibold"
                          />
                          <button
                            onClick={() => handleQuantityChange(service.id, quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                          <span className="ml-space-md font-body-md text-on-surface">
                            = <span className="font-bold text-primary">
                              {(service.price * quantity).toLocaleString('vi-VN')}đ
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Summary & Actions - Fixed tại đáy, không cuộn */}
        <div className="flex-shrink-0 bg-surface-container-low px-space-xl py-space-lg border-t-2 border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          {selectedServices.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-space-lg">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-space-xs">
                    Đã chọn {selectedServices.length} dịch vụ
                  </p>
                  <p className="font-headline-lg text-headline-lg font-bold text-primary">
                    Tổng: {calculateTotal().toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="flex gap-space-md">
                  <button
                    onClick={handleClose}
                    className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Xác nhận thêm dịch vụ</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-space-md">
              <p className="font-body-md text-on-surface-variant">
                Chọn dịch vụ để thêm vào phòng
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
