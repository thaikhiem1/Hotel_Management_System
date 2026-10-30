import { useEffect, useState } from 'react';
import { customerAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/notification';
import { toKhachHang } from '@/utils/rentalMappers';

const EMPTY_NEW_KHACH_HANG = {
  TenKH: '',
  SDT: '',
  CCCD_Passport: '',
  QuocTich: 'Việt Nam',
  GioiTinh: 'Nam'
};

/**
 * CustomerSelector - Tra cứu / chọn / tạo khách hàng đại diện cho phiếu thuê (UC-REN-008)
 *
 * Dữ liệu lấy từ API khách hàng; chỉ chọn được khách hàng có thật trong hệ thống.
 * Khách hàng mới được lưu qua API quản lý khách hàng (đúng quy tắc nhập liệu và kiểm tra trùng).
 *
 * Props:
 *   selectedKhachHang: KhachHang | null  (IdKH, TenKH, SDT, CCCD_Passport, QuocTich, GioiTinh)
 *   onSelectKhachHang(khachHang | null)
 */
const CustomerSelector = ({ selectedKhachHang, onSelectKhachHang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newKhachHang, setNewKhachHang] = useState(EMPTY_NEW_KHACH_HANG);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const keyword = searchTerm.trim();

  // Tra cứu theo mã khách hàng / họ tên / SĐT / CCCD (có chờ 350ms sau khi ngừng gõ)
  useEffect(() => {
    if (!keyword) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const page = await customerAPI.getAll({ search: keyword, size: 10 });
        if (!cancelled) setResults((page.content ?? []).map(toKhachHang));
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearchError('Không thể tra cứu khách hàng lúc này. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  const handleCreateKhachHang = async () => {
    if (!newKhachHang.TenKH.trim() || !newKhachHang.SDT.trim() || !newKhachHang.CCCD_Passport.trim()) {
      setCreateError('Vui lòng điền đầy đủ thông tin bắt buộc: Họ tên, SĐT, CCCD/Hộ chiếu');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const response = await customerAPI.create({
        fullName: newKhachHang.TenKH.trim(),
        phone: newKhachHang.SDT.trim(),
        citizenId: newKhachHang.CCCD_Passport.trim(),
        nationality: newKhachHang.QuocTich.trim(),
        gender: newKhachHang.GioiTinh
      });
      onSelectKhachHang(toKhachHang(response.data));
      setShowNewForm(false);
      setNewKhachHang(EMPTY_NEW_KHACH_HANG);
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Không thể tạo khách hàng. Vui lòng kiểm tra lại thông tin.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-space-lg rounded-lg bg-surface-container-high">
      <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-space-md">
        Thông tin khách hàng
      </h3>

      {/* Chưa chọn khách hàng và không ở form mới */}
      {!selectedKhachHang && !showNewForm && (
        <>
          {/* Tìm kiếm khách hàng cũ */}
          <div className="mb-space-md">
            <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-lg mb-space-md">
              <span className="material-symbols-outlined text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm mã KH / tên / SĐT / CCCD hoặc hộ chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent flex-1 text-on-surface placeholder:text-outline focus:outline-none font-body-md text-body-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Kết quả tra cứu */}
            {keyword && (
              <div className="max-h-60 overflow-y-auto space-y-space-xs mb-space-md">
                {searching ? (
                  <p className="text-center py-space-lg font-body-sm text-body-sm text-on-surface-variant">
                    Đang tra cứu...
                  </p>
                ) : searchError ? (
                  <p className="text-center py-space-lg font-body-sm text-body-sm text-error">
                    {searchError}
                  </p>
                ) : results.length > 0 ? (
                  results.map((kh) => (
                    <button
                      key={kh.IdKH}
                      onClick={() => {
                        onSelectKhachHang(kh);
                        setSearchTerm('');
                      }}
                      className="w-full p-space-md rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors text-left"
                    >
                      <p className="font-body-md text-body-md text-on-surface font-semibold">
                        {kh.TenKH}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Mã KH: {kh.IdKH} • {kh.SDT} • {kh.CCCD_Passport}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {kh.QuocTich} • {kh.GioiTinh}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-center py-space-lg font-body-sm text-body-sm text-on-surface-variant">
                    Không tìm thấy khách hàng phù hợp.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Nút thêm khách hàng mới */}
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-lg text-label-lg font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              person_add
            </span>
            <span>Khách hàng mới</span>
          </button>
        </>
      )}

      {/* Khách hàng đã chọn */}
      {selectedKhachHang && !showNewForm && (
        <div className="p-space-md rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start justify-between mb-space-sm">
            <div className="flex-1">
              <div className="flex items-center gap-space-sm mb-space-xs">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  person
                </span>
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                  {selectedKhachHang.TenKH}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-space-md gap-y-space-xs pl-space-lg">
                <div>
                  <p className="font-label-sm text-label-sm text-outline">SĐT</p>
                  <p className="font-body-sm text-body-sm text-on-surface">{selectedKhachHang.SDT}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline">CCCD / Hộ chiếu</p>
                  <p className="font-body-sm text-body-sm text-on-surface">{selectedKhachHang.CCCD_Passport}</p>
                </div>
                {selectedKhachHang.QuocTich && (
                  <div>
                    <p className="font-label-sm text-label-sm text-outline">Quốc tịch</p>
                    <p className="font-body-sm text-body-sm text-on-surface">{selectedKhachHang.QuocTich}</p>
                  </div>
                )}
                {selectedKhachHang.GioiTinh && (
                  <div>
                    <p className="font-label-sm text-label-sm text-outline">Giới tính</p>
                    <p className="font-body-sm text-body-sm text-on-surface">{selectedKhachHang.GioiTinh}</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelectKhachHang(null)}
              className="p-space-sm rounded-lg hover:bg-surface-container transition-colors"
              title="Chọn khách hàng khác"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Form tạo khách hàng mới — chỉ dùng field trong KhachHang */}
      {showNewForm && (
        <div className="space-y-space-md">
          {/* Họ tên */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
              Họ tên <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={newKhachHang.TenKH}
              onChange={(e) => setNewKhachHang({ ...newKhachHang, TenKH: e.target.value })}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập họ tên khách hàng"
            />
          </div>

          {/* CCCD / Hộ chiếu */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
              CCCD / Hộ chiếu <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={newKhachHang.CCCD_Passport}
              onChange={(e) => setNewKhachHang({ ...newKhachHang, CCCD_Passport: e.target.value })}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập số CCCD hoặc hộ chiếu"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              value={newKhachHang.SDT}
              onChange={(e) => setNewKhachHang({ ...newKhachHang, SDT: e.target.value })}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Quốc tịch */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
              Quốc tịch
            </label>
            <input
              type="text"
              value={newKhachHang.QuocTich}
              onChange={(e) => setNewKhachHang({ ...newKhachHang, QuocTich: e.target.value })}
              className="w-full px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ví dụ: Việt Nam, Mỹ, Nhật Bản..."
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
              Giới tính
            </label>
            <div className="flex gap-space-md">
              {['Nam', 'Nữ', 'Khác'].map((gt) => (
                <label key={gt} className="flex items-center gap-space-xs cursor-pointer">
                  <input
                    type="radio"
                    name="gioiTinh"
                    value={gt}
                    checked={newKhachHang.GioiTinh === gt}
                    onChange={(e) => setNewKhachHang({ ...newKhachHang, GioiTinh: e.target.value })}
                    className="accent-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">{gt}</span>
                </label>
              ))}
            </div>
          </div>

          {createError && (
            <p className="flex items-start gap-space-xs text-error font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{createError}</span>
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-space-sm">
            <button
              onClick={() => {
                setShowNewForm(false);
                setCreateError('');
              }}
              disabled={creating}
              className="flex-1 px-space-lg py-space-md rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateKhachHang}
              disabled={creating}
              className="flex-1 px-space-lg py-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-lg text-label-lg font-semibold transition-colors"
            >
              {creating ? 'Đang lưu...' : 'Tạo khách hàng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
