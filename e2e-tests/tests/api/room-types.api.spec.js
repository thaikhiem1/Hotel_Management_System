import { test, expect } from "@playwright/test";
import { API, loadCases, validRoomType } from "../helpers.js";

const createdIds = [];

// Dọn dữ liệu sau khi chạy xong
test.afterAll(async ({ request }) => {
  for (const id of createdIds) await request.delete(`${API}/roomTypes/${id}`);
});

for (const tc of loadCases("api")) {
  test(`${tc.id}: ${tc.title}`, async ({ request }) => {
    const payload = validRoomType(tc.body); // body hợp lệ + phần ghi đè của test case

    // Ca "trùng tên": tạo trước 1 bản ghi cùng tên
    if (tc.createFirst) {
      const first = await request.post(`${API}/roomTypes`, { data: payload });
      expect(first.status()).toBe(201);
      createdIds.push((await first.json()).data.roomTypeId);
    }

    const res = await request.post(`${API}/roomTypes`, { data: payload });
    expect(res.status()).toBe(tc.expectStatus);

    if (res.status() === 201) {
      const { data } = await res.json();
      createdIds.push(data.roomTypeId);
      // Dữ liệu trả về phải đúng dữ liệu gửi lên (không làm tròn giá)
      expect(Number(data.dailyRate)).toBe(payload.dailyRate);
      expect(Number(data.hourlyRate)).toBe(payload.hourlyRate);
    }
  });
}
