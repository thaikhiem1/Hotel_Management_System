import { test, expect } from "@playwright/test";
import { API, login, loadCases, fillRand, fillRoomTypeForm, openForm, submitForm } from "../helpers.js";

// Backend lưu tên dạng chữ thường -> so sánh không phân biệt hoa/thường
const findByName = async (request, name) => {
  const res = await request.get(`${API}/roomTypes`, { params: { page: 0, size: 500 } });
  return (await res.json()).data.content.find(
    (r) => r.roomTypeName.toLowerCase() === name.toLowerCase(),
  );
};

for (const tc of loadCases("e2e")) {
  test(`${tc.id}: ${tc.title}`, async ({ page, request }) => {
    const form = { ...tc.form, name: fillRand(tc.form.name) };
    const expectedName = form.name.trim(); // backend lưu tên đã trim

    // BƯỚC 1 (UI): đăng nhập -> trang Loại phòng -> điền form -> lưu
    await login(page);
    await page.goto("/roomtypes");
    await openForm(page);
    await fillRoomTypeForm(page, form);
    await submitForm(page);

    if (tc.expect === "saved") {
      // BƯỚC 2 (UI): thông báo thành công
      await expect(page.getByText("Thêm loại phòng thành công")).toBeVisible();

      // BƯỚC 3 (API): dữ liệu thật sự đã nằm trong DB
      const saved = await findByName(request, expectedName);
      expect(saved).toBeDefined();
      for (const [key, value] of Object.entries(tc.saved)) {
        expect(Number(saved[key])).toBe(value);
      }
      await request.delete(`${API}/roomTypes/${saved.roomTypeId}`); // dọn dữ liệu
    } else {
      // BƯỚC 2 (UI): form báo lỗi, không có toast thành công
      await expect(page.locator(`#${tc.errorField}-error`)).toBeVisible();

      // BƯỚC 3 (API): backend không có bản ghi nào được tạo
      expect(await findByName(request, expectedName)).toBeUndefined();
    }
  });
}
