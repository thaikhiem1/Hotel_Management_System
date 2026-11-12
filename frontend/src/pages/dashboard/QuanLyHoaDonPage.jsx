import { useEffect, useState } from 'react';
import { InvoiceCard, InvoiceDetailModal } from '@/components/invoice';
import { Pagination } from '@/components/shared';
import { invoiceAPI } from '@/services/api';
import { cn } from '@/utils/lib/util';
import { formatPrice } from '@/utils/format';
import { getErrorMessage } from '@/utils/notification';

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 400;

/** Date -> "yyyy-MM-dd" theo ngày địa phương */
const toIsoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Khoảng ngày lập theo lựa chọn nhanh; toDate bao gồm cả ngày đó */
const dateRange = (preset) => {
  const today = new Date();
  const back = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return toIsoDate(d);
  };
  if (preset === 'today') return { fromDate: toIsoDate(today), toDate: toIsoDate(today) };
  if (preset === 'week') return { fromDate: back(6), toDate: toIsoDate(today) };
  if (preset === 'month') return { fromDate: back(29), toDate: toIsoDate(today) };
  return {};
};

const StatCard = ({ icon, label, value, sub, tone }) => (
  <div className={cn('p-space-lg rounded-lg bg-gradient-to-br border', tone.box)}>
    <div className="flex items-center gap-space-md">
      <span className={cn('material-symbols-outlined text-[32px]', tone.icon)}>{icon}</span>
      <div className="min-w-0">
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
        <p className="font-headline-md text-headline-md font-bold text-on-surface truncate">{value}</p>
        {sub && <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{sub}</p>}
      </div>
    </div>
  </div>
);

const TONES = {
  primary: { box: 'from-primary/10 to-primary/5 border-primary/20', icon: 'text-primary' },
  tertiary: { box: 'from-tertiary/10 to-tertiary/5 border-tertiary/20', icon: 'text-tertiary' },
  error: { box: 'from-error/10 to-error/5 border-error/20', icon: 'text-error' },
  secondary: { box: 'from-secondary/10 to-secondary/5 border-secondary/20', icon: 'text-secondary' },
};

/**
 * QuanLyHoaDonPage - Quản lý hóa đơn trả phòng
 * Danh sách phân trang từ máy chủ, lọc theo trạng thái/thời gian, tìm kiếm; xem chi tiết, thanh toán, in/tải ảnh/PDF.
 * API: GET /api/invoices, GET /api/invoices/stats, GET/POST /api/invoices/{id}[/pay]
 */
const QuanLyHoaDonPage = () => {
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all'); // all | PAID | UNPAID
  const [datePreset, setDatePreset] = useState('all'); // all | today | week | month
  const [page, setPage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [stats, setStats] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Tìm kiếm áp dụng sau khi ngừng gõ một lúc, và đưa về trang đầu
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput.trim());
      setPage(0);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const queryKey = JSON.stringify({ page, keyword, status, datePreset, reloadToken });
  const loading = result.key !== queryKey;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await invoiceAPI.getAll({
          page,
          size: PAGE_SIZE,
          keyword,
          status: status === 'all' ? undefined : status,
          ...dateRange(datePreset),
        });
        if (!cancelled) setResult({ key: queryKey, data: response.data, error: null });
      } catch (error) {
        if (!cancelled) {
          setResult({ key: queryKey, data: null, error: getErrorMessage(error, 'Không thể tải danh sách hóa đơn.') });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey, page, keyword, status, datePreset]);

  // Thẻ thống kê: toàn hệ thống, tải lại khi làm mới hoặc có thanh toán
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await invoiceAPI.getStats();
        if (!cancelled) setStats(response.data);
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = () => setReloadToken((t) => t + 1);
  const data = result.data;
  const invoices = data?.content ?? [];
  const hasFilter = keyword || status !== 'all' || datePreset !== 'all';

  const selectClass =
    'w-full px-space-md py-space-md rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-colors';

  return (
    <div className="w-full space-y-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-xs">Quản lý Hóa đơn</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Quản lý, thanh toán và in các hóa đơn trả phòng</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50"
        >
          <span className={cn('material-symbols-outlined', loading && 'animate-spin')}>refresh</span>
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <StatCard icon="receipt_long" label="Tổng hóa đơn" value={stats ? stats.totalInvoices : '—'} tone={TONES.primary} />
        <StatCard icon="check_circle" label="Đã thanh toán" value={stats ? stats.paidInvoices : '—'} tone={TONES.tertiary} />
        <StatCard
          icon="pending"
          label="Chưa thanh toán"
          value={stats ? stats.unpaidInvoices : '—'}
          sub={stats ? `Còn phải thu ${formatPrice(stats.unpaidAmount)}` : undefined}
          tone={TONES.error}
        />
        <StatCard
          icon="payments"
          label="Đã thu"
          value={stats ? formatPrice(stats.paidAmount) : '—'}
          tone={TONES.secondary}
        />
      </div>

      <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          <div>
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">Tìm kiếm</label>
            <div className="relative">
              <span className="absolute left-space-md top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Mã hóa đơn, phiếu thuê, khách hàng, phòng..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="w-full pl-12 pr-space-md py-space-md rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">
              Trạng thái thanh toán
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className={selectClass}
            >
              <option value="all">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
            </select>
          </div>
          <div>
            <label className="block mb-space-sm font-label-md text-label-md text-on-surface font-semibold">Ngày lập</label>
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setPage(0);
              }}
              className={selectClass}
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant">
        Tìm thấy <span className="font-semibold text-primary">{data ? data.totalElements : 0}</span> hóa đơn
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-space-xl">
          <div className="flex flex-col items-center gap-space-md">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin">refresh</span>
            <p className="font-body-lg text-on-surface-variant">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : result.error ? (
        <div className="p-space-lg rounded-lg bg-error-container text-on-error-container border border-error/30">
          {result.error}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-space-xl">
          <span className="material-symbols-outlined text-[72px] text-on-surface-variant/30 mb-space-md">receipt_long</span>
          <h3 className="font-title-lg text-title-lg font-semibold text-on-surface mb-space-sm">Không tìm thấy hóa đơn</h3>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
            {hasFilter ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Hóa đơn được tạo khi khách trả phòng'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.invoiceId} invoice={invoice} onView={(i) => setSelectedInvoiceId(i.invoiceId)} />
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.number}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={setPage}
          disabled={loading}
          unit="hóa đơn"
        />
      )}

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        onPaid={refresh}
      />
    </div>
  );
};

export default QuanLyHoaDonPage;
