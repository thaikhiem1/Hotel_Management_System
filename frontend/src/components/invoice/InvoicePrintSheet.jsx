import { forwardRef } from "react";
import { formatDateTime, PAYMENT_METHOD_LABELS } from "@/utils/format";

const money = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")}đ`;

const UNIT_LABELS = { NGAY: "đêm", GIO: "giờ" };
const PRICING_LABELS = { NGAY: "Theo ngày", GIO: "Theo giờ" };

// Toàn bộ kiểu dáng là inline để tờ hóa đơn in và xuất ảnh/PDF giống hệt nhau, không phụ thuộc giao diện sáng/tối
const page = {
  width: 794,
  boxSizing: "border-box",
  padding: "40px 48px",
  background: "#ffffff",
  color: "#1c1c1c",
  fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
  fontSize: 14,
  lineHeight: 1.45,
};
const cell = { padding: "8px 10px", borderBottom: "1px solid #e3ddd0" };
const label = { color: "#6b6558", width: 150, padding: "3px 0", verticalAlign: "top" };
const value = { fontWeight: 600, padding: "3px 0" };

/**
 * InvoicePrintSheet - Tờ hóa đơn thanh toán dùng để in, tải ảnh và tải PDF (khổ A4).
 * Nhận dữ liệu từ GET /api/invoices/{id}.
 */
const InvoicePrintSheet = forwardRef(({ invoice }, ref) => {
  const paid = invoice.invoiceStatus === "PAID";
  const unitLabel = UNIT_LABELS[invoice.pricingMethod] ?? "";

  return (
    <div ref={ref} style={page}>
      {/* Đầu hóa đơn */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #8a6a1d", paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#6b4f10", letterSpacing: 0.5 }}>GRAND PALACE</div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#6b6558" }}>RESORT &amp; SPA</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>HÓA ĐƠN THANH TOÁN</div>
          <div style={{ marginTop: 4 }}>
            Số: <strong>{invoice.invoiceCode}</strong>
          </div>
          <div>Ngày lập: {formatDateTime(invoice.issuedAt)}</div>
        </div>
      </div>

      {/* Khách hàng và lưu trú */}
      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: 16 }}>
              <div style={{ fontWeight: 700, color: "#6b4f10", marginBottom: 4 }}>THÔNG TIN KHÁCH HÀNG</div>
              <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={label}>Họ và tên</td><td style={value}>{invoice.customerName}</td></tr>
                  <tr><td style={label}>Điện thoại</td><td style={value}>{invoice.customerPhone}</td></tr>
                  <tr><td style={label}>CCCD/Passport</td><td style={value}>{invoice.customerCitizenId}</td></tr>
                  <tr><td style={label}>Quốc tịch</td><td style={value}>{invoice.customerNationality}</td></tr>
                </tbody>
              </table>
            </td>
            <td style={{ width: "50%", verticalAlign: "top", paddingLeft: 16 }}>
              <div style={{ fontWeight: 700, color: "#6b4f10", marginBottom: 4 }}>THÔNG TIN LƯU TRÚ</div>
              <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={label}>Phiếu thuê</td><td style={value}>{invoice.receiptCode}</td></tr>
                  <tr><td style={label}>Phòng</td><td style={value}>{invoice.roomCode} - {invoice.roomTypeName}</td></tr>
                  <tr><td style={label}>Nhận phòng</td><td style={value}>{formatDateTime(invoice.actualCheckIn)}</td></tr>
                  <tr><td style={label}>Trả phòng</td><td style={value}>{formatDateTime(invoice.actualCheckOut)}</td></tr>
                  <tr><td style={label}>Số khách</td><td style={value}>{invoice.actualGuests} người</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Chi tiết chi phí */}
      <table style={{ width: "100%", marginTop: 22, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f4e7c3" }}>
            <th style={{ ...cell, textAlign: "left" }}>Khoản mục</th>
            <th style={{ ...cell, textAlign: "right" }}>Đơn giá</th>
            <th style={{ ...cell, textAlign: "center" }}>Số lượng</th>
            <th style={{ ...cell, textAlign: "right" }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cell}>
              Tiền phòng {invoice.roomCode} ({(PRICING_LABELS[invoice.pricingMethod] ?? "").toLowerCase()})
            </td>
            <td style={{ ...cell, textAlign: "right" }}>{money(invoice.unitPrice)}/{unitLabel}</td>
            <td style={{ ...cell, textAlign: "center" }}>{invoice.billedUnits} {unitLabel}</td>
            <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{money(invoice.roomAmount)}</td>
          </tr>
          {(invoice.services ?? []).map((s) => (
            <tr key={s.serviceUsageId}>
              <td style={cell}>{s.serviceName}</td>
              <td style={{ ...cell, textAlign: "right" }}>{money(s.unitPrice)}/{s.unit}</td>
              <td style={{ ...cell, textAlign: "center" }}>{s.quantity} {s.unit}</td>
              <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{money(s.amount)}</td>
            </tr>
          ))}
          {(invoice.services ?? []).length === 0 && (
            <tr>
              <td colSpan={4} style={{ ...cell, textAlign: "center", color: "#6b6558" }}>Không sử dụng dịch vụ</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tổng kết */}
      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "55%" }} />
            <td style={{ padding: "4px 10px", textAlign: "right" }}>Tiền phòng</td>
            <td style={{ padding: "4px 10px", textAlign: "right", width: 150 }}>{money(invoice.roomAmount)}</td>
          </tr>
          <tr>
            <td />
            <td style={{ padding: "4px 10px", textAlign: "right" }}>Tiền dịch vụ</td>
            <td style={{ padding: "4px 10px", textAlign: "right" }}>{money(invoice.serviceAmount)}</td>
          </tr>
          <tr>
            <td />
            <td style={{ padding: "10px", textAlign: "right", fontSize: 16, fontWeight: 700, borderTop: "2px solid #8a6a1d" }}>
              TỔNG THANH TOÁN
            </td>
            <td style={{ padding: "10px", textAlign: "right", fontSize: 18, fontWeight: 700, color: "#6b4f10", borderTop: "2px solid #8a6a1d" }}>
              {money(invoice.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Trạng thái thanh toán */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            border: `2px solid ${paid ? "#2e7d4f" : "#b3261e"}`,
            color: paid ? "#2e7d4f" : "#b3261e",
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 6,
            transform: "rotate(-3deg)",
          }}
        >
          {paid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
        </span>
        {paid && (
          <span style={{ color: "#4a463d" }}>
            {PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}
            {" · "}
            {formatDateTime(invoice.paidAt)}
            {invoice.paidBy ? ` · Thu bởi ${invoice.paidBy}` : ""}
          </span>
        )}
      </div>

      {/* Chữ ký */}
      <table style={{ width: "100%", marginTop: 40, textAlign: "center", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%" }}>
              <div style={{ fontWeight: 700 }}>Khách hàng</div>
              <div style={{ color: "#6b6558", fontSize: 12 }}>(Ký, ghi rõ họ tên)</div>
            </td>
            <td style={{ width: "50%" }}>
              <div style={{ fontWeight: 700 }}>Nhân viên lập hóa đơn</div>
              <div style={{ color: "#6b6558", fontSize: 12 }}>(Ký, ghi rõ họ tên)</div>
            </td>
          </tr>
          <tr>
            <td style={{ height: 70 }} />
            <td style={{ height: 70, verticalAlign: "bottom", fontWeight: 600 }}>{invoice.issuedBy}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 24, textAlign: "center", color: "#6b6558", fontSize: 12 }}>
        Cảm ơn Quý khách đã lựa chọn Grand Palace Resort &amp; Spa. Hẹn gặp lại Quý khách!
      </div>
    </div>
  );
});

InvoicePrintSheet.displayName = "InvoicePrintSheet";

export default InvoicePrintSheet;
