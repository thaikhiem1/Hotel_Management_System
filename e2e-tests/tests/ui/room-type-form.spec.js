import { test, expect } from "@playwright/test";
import { loadCases, fillRoomTypeForm, openForm, submitForm } from "../helpers.js";

const emptyPage = {
  status: 200,
  message: "ok",
  data: { content: [], totalElements: 0, totalPages: 1, size: 16, number: 0 },
};

for (const tc of loadCases("ui")) {
  test(`${tc.id}: ${tc.title}`, async ({ page }) => {
    const posts = []; // gom các request POST mà form đã gửi

    // Giả lập backend: GET trả danh sách rỗng, POST trả 201
    await page.route(/\/api\/roomTypes(\?.*)?$/, (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        posts.push(req.postDataJSON());
        return route.fulfill({
          status: 201,
          json: { status: 201, message: "Thêm loại phòng thành công", data: { roomTypeId: 1, ...req.postDataJSON() } },
        });
      }
      return route.fulfill({ json: emptyPage });
    });

    // Mở trang, mở form, điền dữ liệu của test case rồi bấm lưu
    await page.goto("/roomtypes");
    await openForm(page);
    await fillRoomTypeForm(page, tc.form);
    await submitForm(page);

    if (tc.expect === "success") {
      // Hợp lệ: thấy toast + form gửi đúng dữ liệu
      await expect(page.getByText("Thêm loại phòng thành công")).toBeVisible();
      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject(tc.sentPayload);
    } else {
      // Không hợp lệ: hiện lỗi đúng trường và KHÔNG gọi API
      await expect(page.locator(`#${tc.errorField}-error`)).toBeVisible();
      expect(posts).toHaveLength(0);
    }
  });
}
