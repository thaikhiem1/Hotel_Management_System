
const QuickActions = ({ onRefresh, onFilterAvailableNow }) => {
  return (
    <div className="flex flex-col gap-space-md p-space-lg rounded-lg bg-surface-container-low h-full">
      <div className="flex items-center gap-space-sm mb-space-sm">
        <span className="material-symbols-outlined text-primary text-[24px]">
          bolt
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Thao tác nhanh
        </h3>
      </div>

      <div className="flex flex-col gap-space-sm flex-1">
        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-lg bg-primary-container hover:bg-primary transition-colors group w-full"
        >
          <span className="material-symbols-outlined text-[20px] text-on-primary-container group-hover:text-on-primary">
            refresh
          </span>
          <span className="font-label-lg text-label-lg font-semibold text-on-primary-container group-hover:text-on-primary">
            Làm mới hồ sơ
          </span>
        </button>

        <button
          onClick={onFilterAvailableNow}
          className="flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-lg bg-tertiary-container hover:bg-tertiary transition-colors group w-full"
        >
          <span className="material-symbols-outlined text-[20px] text-on-tertiary-container group-hover:text-on-tertiary">
            filter_alt
          </span>
          <span className="font-label-lg text-label-lg font-semibold text-on-tertiary-container group-hover:text-on-tertiary">
            Lọc phòng trống tức thì
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
