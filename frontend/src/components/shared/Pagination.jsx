import React, { useMemo } from "react";

const Pagination = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  disabled = false,
  unit = "phòng",
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  // Tối ưu thuật toán tạo trang: Giao diện sẽ luôn cân đối và không bị dấu "…" vụn vặt
  const pages = useMemo(() => {
    const items = [];
    const siblings = 1; // Số lượng trang hiển thị xung quanh trang hiện tại

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || // Luôn hiện trang đầu
        i === totalPages - 1 || // Luôn hiện trang cuối
        (i >= page - siblings && i <= page + siblings) // Hiện các trang xung quanh trang hiện tại
      ) {
        items.push(i);
      } else if (items[items.length - 1] !== "gap") {
        items.push("gap");
      }
    }
    return items;
  }, [page, totalPages]);

  // Gom các class dùng chung để code gọn gàng, không bị dư thừa
  const baseBtnState =
    "disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center";
  const navButton = `p-space-xs rounded-lg hover:bg-surface-container-high ${baseBtnState}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-md py-space-sm bg-surface-container-low rounded-lg border border-outline-variant">
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">
        Trang {page + 1} / {totalPages} — {from}–{to} trên tổng {totalElements}{" "}
        {unit}
      </p>

      <div className="flex items-center gap-space-xs">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || disabled}
          className={navButton}
          aria-label="Trang trước"
        >
          {/* Đã bỏ text-on-surface thừa để icon tự mờ đi chuẩn xác khi disabled */}
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>

        {pages.map((p, index) =>
          p === "gap" ? (
            <span
              key={`gap-${index}`}
              className="px-space-xs text-on-surface-variant select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={disabled}
              className={`min-w-[32px] h-[32px] rounded-lg font-label-md text-label-md ${baseBtnState} ${
                p === page
                  ? "bg-primary text-on-primary font-bold"
                  : "hover:bg-surface-container-high text-on-surface"
              }`}
            >
              {p + 1}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1 || disabled}
          className={navButton}
          aria-label="Trang sau"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
