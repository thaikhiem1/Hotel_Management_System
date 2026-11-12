import { useEffect, useMemo, useState } from 'react';
import { serviceAPI, serviceCategoryAPI, stayAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/notification';
import { cn } from '@/utils/lib/util';

const vnd = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
const ALL = 'all';

/**
 * Lỗi từ máy chủ gắn với dòng thứ i của yêu cầu ("lines[i].serviceId" / "lines[i].quantity") -> { serviceId: thông báo }
 */
const lineErrors = (error, serviceIds) => {
  const fieldErrors = error.response?.data?.fieldErrors ?? {};
  const result = {};
  Object.entries(fieldErrors).forEach(([key, message]) => {
    const match = key.match(/^lines\[(\d+)\]/);
    if (match && serviceIds[Number(match[1])] !== undefined) result[serviceIds[Number(match[1])]] = message;
  });
  return result;
};

/**
 * Form ghi nhận dịch vụ khách sử dụng (UC-SVC-005).
 * Bước 1: chọn dịch vụ đang cung cấp và số lượng. Bước 2: xem chi phí do máy chủ tính (đơn giá, thành tiền, tổng),
 * xác nhận thì máy chủ kiểm tra lại, lưu thông tin sử dụng và trừ tồn kho.
 */
const AddServiceForm = ({ room, onClose, onRecorded }) => {
  const [catalog, setCatalog] = useState({ loading: true, error: null, services: [], categories: [] });
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({}); // { serviceId: số lượng }, thứ tự chọn được giữ nguyên
  const [step, setStep] = useState('select'); // select | review
  const [estimate, setEstimate] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'error' | 'warning', message }
  const [errorsByService, setErrorsByService] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [services, categories] = await Promise.all([serviceAPI.getActive(), serviceCategoryAPI.getAll()]);
        if (!cancelled) setCatalog({ loading: false, error: null, services, categories });
      } catch (error) {
        if (!cancelled) {
          setCatalog({ loading: false, error: getErrorMessage(error, 'Không thể tải danh sách dịch vụ.'), services: [], categories: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedIds = Object.keys(quantities).map(Number);
  const byId = useMemo(() => new Map(catalog.services.map((s) => [s.serviceId, s])), [catalog.services]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.services.filter((s) => {
      if (category !== ALL && Number(s.serviceCateroriesId) !== Number(category)) return false;
      return !query || s.serviceName.toLowerCase().includes(query);
    });
  }, [catalog.services, category, search]);

  const stockOf = (service) => (service.stockQuality === null || service.stockQuality === undefined ? null : service.stockQuality);

  const toggle = (service) => {
    if (stockOf(service) === 0) return;
    setBanner(null);
    setQuantities((prev) => {
      const next = { ...prev };
      if (next[service.serviceId]) delete next[service.serviceId];
      else next[service.serviceId] = 1;
      return next;
    });
  };

  const changeQuantity = (service, value) => {
    const stock = stockOf(service);
    const parsed = Math.floor(Number(value)) || 1;
    const quantity = Math.max(1, stock === null ? parsed : Math.min(parsed, stock));
    setBanner(null);
    setErrorsByService((prev) => ({ ...prev, [service.serviceId]: undefined }));
    setQuantities((prev) => ({ ...prev, [service.serviceId]: quantity }));
  };

  const draftTotal = selectedIds.reduce((sum, id) => sum + Number(byId.get(id)?.unitPrice || 0) * quantities[id], 0);
  const lines = () => selectedIds.map((id) => ({ serviceId: id, quantity: quantities[id] }));

  const fail = (error, fallback) => {
    setErrorsByService(lineErrors(error, selectedIds));
    setBanner({ type: 'error', message: getErrorMessage(error, fallback) });
  };

  // Bước 6-11: máy chủ kiểm tra lượt lưu trú, dịch vụ, số lượng, tồn kho và tính chi phí
  const handleReview = async () => {
    setBusy(true);
    setBanner(null);
    setErrorsByService({});
    try {
      const response = await stayAPI.estimateServices(room.bookingDetailId, lines());
      setEstimate(response.data);
      setStep('review');
    } catch (error) {
      fail(error, 'Không thể kiểm tra chi phí dịch vụ. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  // Bước 12-15: xác nhận ghi nhận (máy chủ kiểm tra lại, lưu và trừ tồn kho trong một giao dịch)
  const handleConfirm = async () => {
    setBusy(true);
    setBanner(null);
    try {
      const response = await stayAPI.recordServices(room.bookingDetailId, {
        lines: lines(),
        expectedTotalAmount: estimate.totalAmount,
      });
      onRecorded?.(response.data);
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 409 && data?.data?.lines) {
        // Giá đổi: hiển thị chi phí mới để người dùng xác nhận lại
        setEstimate(data.data);
        setBanner({ type: 'warning', message: data.message });
      } else {
        fail(error, 'Ghi nhận dịch vụ thất bại. Vui lòng thử lại.');
        setStep('select'); // tồn kho hoặc dịch vụ đã đổi: quay lại chỉnh sửa
      }
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (selectedIds.length > 0 && !busy && !confirm('Bạn có chắc muốn đóng? Các dịch vụ đã chọn sẽ không được lưu.')) return;
    onClose();
  };

  const categoryTabs = [{ id: ALL, name: 'Tất cả dịch vụ', icon: 'apps' }].concat(
    catalog.categories.map((c) => ({ id: c.serviceCategoryId, name: c.serviceCategoryName, icon: 'category' })),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-surface rounded-xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="bg-primary text-on-primary px-space-xl py-space-lg flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px]">room_service</span>
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold">Thêm dịch vụ cho phòng {room.name}</h2>
              <p className="font-body-md text-body-md opacity-90">
                {room.roomType} • Khách: {room.guestName || 'Đang cập nhật'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-space-sm rounded-full hover:bg-on-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {banner && (
          <div
            className={cn(
              'mx-space-xl mt-space-lg flex items-start gap-space-sm p-space-md rounded-lg border',
              banner.type === 'warning'
                ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/30'
                : 'bg-error-container text-on-error-container border-error/30',
            )}
          >
            <span className="material-symbols-outlined">{banner.type === 'warning' ? 'warning' : 'error'}</span>
            <p className="font-body-md whitespace-pre-line">{banner.message}</p>
          </div>
        )}

        {step === 'select' ? (
          <>
            <div className="px-space-xl py-space-md bg-surface-container-low border-b border-outline-variant">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-space-lg py-space-md rounded-lg border-2 border-outline bg-surface text-on-surface font-body-md placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-shrink-0 px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant">
              <div className="flex gap-space-md overflow-x-auto pb-space-xs">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategory(tab.id)}
                    className={cn(
                      'flex items-center gap-space-sm px-space-lg py-space-sm rounded-full whitespace-nowrap',
                      'font-label-lg text-label-lg font-semibold transition-all',
                      category === tab.id
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high',
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-space-xl py-space-lg">
              {catalog.loading ? (
                <div className="flex justify-center py-space-xl">
                  <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
                </div>
              ) : catalog.error ? (
                <p className="text-center text-error font-body-lg py-space-xl">{catalog.error}</p>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-space-xl text-on-surface-variant">
                  <span className="material-symbols-outlined text-[64px] mb-space-md opacity-30">search_off</span>
                  <p className="font-body-lg">Không tìm thấy dịch vụ nào đang cung cấp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {filtered.map((service) => {
                    const stock = stockOf(service);
                    const soldOut = stock === 0;
                    const isSelected = quantities[service.serviceId] !== undefined;
                    const quantity = quantities[service.serviceId] || 1;
                    const error = errorsByService[service.serviceId];

                    return (
                      <div
                        key={service.serviceId}
                        className={cn(
                          'p-space-lg rounded-lg border-2 transition-all',
                          soldOut ? 'opacity-50 cursor-not-allowed border-outline-variant' : 'cursor-pointer',
                          error
                            ? 'border-error'
                            : isSelected
                              ? 'border-primary bg-primary-container shadow-md'
                              : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-highest',
                        )}
                        onClick={() => toggle(service)}
                      >
                        <div className="flex items-start gap-space-md">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={soldOut}
                            onChange={() => toggle(service)}
                            className="mt-1 w-5 h-5 rounded accent-primary cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <h3 className="font-title-md text-title-md font-semibold text-on-surface mb-space-xs">
                              {service.serviceName}
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                              {service.serviceCategoryName}
                              {stock !== null && (soldOut ? ' • Hết hàng' : ` • Còn ${stock} ${service.unit}`)}
                            </p>
                            <p className="font-body-md text-body-md font-bold text-primary">
                              {vnd(service.unitPrice)} / {service.unit}
                            </p>
                            {error && <p className="mt-space-xs text-error font-body-sm">{error}</p>}
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
                                onClick={() => changeQuantity(service, quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">remove</span>
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={stock ?? undefined}
                                value={quantity}
                                onChange={(e) => changeQuantity(service, e.target.value)}
                                className="w-16 text-center px-space-sm py-space-xs rounded-lg border-2 border-outline bg-surface text-on-surface font-semibold"
                              />
                              <button
                                onClick={() => changeQuantity(service, quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                              </button>
                              <span className="ml-space-md font-body-md text-on-surface">
                                = <span className="font-bold text-primary">{vnd(Number(service.unitPrice) * quantity)}</span>
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

            <div className="flex-shrink-0 bg-surface-container-low px-space-xl py-space-lg border-t-2 border-outline-variant">
              {selectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-space-md">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-space-xs">
                      Đã chọn {selectedIds.length} dịch vụ (tạm tính)
                    </p>
                    <p className="font-headline-lg text-headline-lg font-bold text-primary">Tổng: {vnd(draftTotal)}</p>
                  </div>
                  <div className="flex gap-space-md">
                    <button
                      onClick={handleClose}
                      className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleReview}
                      disabled={busy}
                      className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">{busy ? 'refresh' : 'fact_check'}</span>
                      <span>{busy ? 'Đang kiểm tra...' : 'Kiểm tra chi phí'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center font-body-md text-on-surface-variant">Chọn dịch vụ để thêm vào phòng</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Bước 11: thông tin do máy chủ xác định để lễ tân kiểm tra */}
            <div className="flex-1 overflow-y-auto px-space-xl py-space-lg space-y-space-md">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Kiểm tra thông tin trước khi ghi nhận</h3>
              <div className="rounded-lg border border-outline-variant overflow-hidden">
                {estimate.lines.map((line) => (
                  <div
                    key={line.serviceId}
                    className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant last:border-b-0"
                  >
                    <div>
                      <p className="font-title-md text-title-md font-semibold text-on-surface">{line.serviceName}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {line.quantity} {line.unit} × {vnd(line.unitPrice)}
                        {line.availableStock !== null && ` • Tồn kho hiện tại ${line.availableStock} ${line.unit}`}
                      </p>
                    </div>
                    <p className="font-title-md text-title-md font-bold text-primary">{vnd(line.amount)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-space-lg rounded-lg bg-primary-container border-2 border-primary">
                <span className="font-title-lg text-title-lg font-bold text-on-primary-container">Tổng chi phí dịch vụ</span>
                <span className="font-headline-lg text-headline-lg font-bold text-primary">{vnd(estimate.totalAmount)}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ghi nhận dịch vụ chưa phải là lập hóa đơn hay thanh toán; chi phí này sẽ được tổng hợp khi trả phòng.
              </p>
            </div>

            <div className="flex-shrink-0 bg-surface-container-low px-space-xl py-space-lg border-t-2 border-outline-variant flex justify-end gap-space-md">
              <button
                onClick={() => {
                  setBanner(null);
                  setStep('select');
                }}
                disabled={busy}
                className="px-space-lg py-space-md rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
              >
                Quay lại chỉnh sửa
              </button>
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="px-space-xl py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center gap-space-sm shadow-lg disabled:opacity-50"
              >
                <span className="material-symbols-outlined">{busy ? 'refresh' : 'check_circle'}</span>
                <span>{busy ? 'Đang ghi nhận...' : 'Xác nhận ghi nhận'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * AddServiceModal - Hộp thoại ghi nhận dịch vụ khách sử dụng cho phòng đang có khách (UC-SVC-005)
 *
 * Props:
 * - room: thẻ phòng (cần bookingDetailId của lượt đang lưu trú)
 * - isOpen
 * - onClose
 * - onRecorded(result): gọi sau khi ghi nhận thành công, result là danh sách dịch vụ vừa ghi và tổng tiền
 */
const AddServiceModal = ({ room, isOpen, onClose, onRecorded }) => {
  if (!isOpen || !room) return null;
  // key: mỗi lần mở có trạng thái form riêng
  return <AddServiceForm key={room.bookingDetailId} room={room} onClose={onClose} onRecorded={onRecorded} />;
};

export default AddServiceModal;
