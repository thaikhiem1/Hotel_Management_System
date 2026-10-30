
/**
 * InfoCard - Khối thông tin có tiêu đề và danh sách "nhãn: giá trị"
 * (cùng kiểu thẻ thông tin trong RoomDetailModal / InvoiceModal).
 *
 * Props:
 * - icon, title: tiêu đề khối
 * - rows: [{ label, value, highlight }]
 */
const InfoCard = ({ icon, title, rows = [] }) => (
  <div className="p-space-lg rounded-lg bg-surface-container-low border border-outline-variant">
    <div className="flex items-center gap-space-sm mb-space-md">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h3 className="font-title-lg text-title-lg font-semibold text-on-surface">
        {title}
      </h3>
    </div>
    <div className="space-y-space-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-space-md">
          <span className="text-on-surface-variant">{row.label}:</span>
          <span
            className={`font-semibold text-right ${row.highlight ? "text-primary" : "text-on-surface"}`}
          >
            {row.value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default InfoCard;
