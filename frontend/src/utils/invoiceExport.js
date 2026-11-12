// Xuất hóa đơn: tải ảnh PNG, tải PDF, in. Tất cả đều lấy từ cùng một "tờ hóa đơn" (InvoicePrintSheet) để nội dung giống nhau.
// Thư viện nặng (html-to-image, jspdf) chỉ được tải khi người dùng bấm xuất.

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Tên tệp an toàn từ mã hóa đơn, ví dụ HD007 -> hoa-don-HD007 */
export const invoiceFileName = (invoiceCode) => `hoa-don-${String(invoiceCode || "").replace(/[^\w-]+/g, "")}`;

const renderPng = async (node) => {
  const { toPng } = await import("html-to-image");
  // Hai lần để font và ảnh nội tuyến kịp nạp trước khi chụp
  await toPng(node, { pixelRatio: 1, cacheBust: true, backgroundColor: "#ffffff" });
  return toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: "#ffffff" });
};

const triggerDownload = (href, fileName) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** Tải hóa đơn dạng ảnh PNG */
export const downloadInvoiceImage = async (node, baseName) => {
  const dataUrl = await renderPng(node);
  triggerDownload(dataUrl, `${baseName}.png`);
};

/** Tải hóa đơn dạng PDF khổ A4 (nội dung được chụp thành ảnh nên giữ nguyên chữ tiếng Việt) */
export const downloadInvoicePdf = async (node, baseName) => {
  const [{ jsPDF }, dataUrl] = await Promise.all([import("jspdf"), renderPng(node)]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const { width, height } = pdf.getImageProperties(dataUrl);

  // Vừa chiều ngang A4; nếu quá cao thì thu nhỏ theo chiều dọc và căn giữa
  let drawWidth = A4_WIDTH_MM;
  let drawHeight = (A4_WIDTH_MM * height) / width;
  if (drawHeight > A4_HEIGHT_MM) {
    drawHeight = A4_HEIGHT_MM;
    drawWidth = (A4_HEIGHT_MM * width) / height;
  }
  pdf.addImage(dataUrl, "PNG", (A4_WIDTH_MM - drawWidth) / 2, 0, drawWidth, drawHeight);
  pdf.save(`${baseName}.pdf`);
};

/** In hóa đơn: đưa tờ hóa đơn vào khung ẩn rồi mở hộp thoại in (có thể chọn "Lưu dưới dạng PDF") */
export const printInvoice = (node, title) =>
  new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    doc.open();
    doc.write(
      `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${title ?? "Hóa đơn"}</title>` +
        `<style>@page{size:A4;margin:10mm}html,body{margin:0;background:#fff}</style></head><body>${node.outerHTML}</body></html>`,
    );
    doc.close();

    const cleanup = () => {
      frame.remove();
      resolve();
    };
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
    // Chờ khung dựng xong rồi mới in; dọn khung nếu trình duyệt không phát sự kiện afterprint
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(cleanup, 60000);
    }, 300);
  });
