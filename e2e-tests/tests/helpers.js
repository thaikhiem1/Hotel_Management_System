import { readFileSync } from "node:fs";

// Hàm dùng chung cho các kịch bản

export const API = "http://localhost:8080/api";

/** Chuỗi CHỮ CÁI ngẫu nhiên, đúng `n` ký tự (rule backend: tên chỉ gồm chữ + khoảng trắng) */
export function letters(n) {
  const a = "abcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * 26)];
  return s;
}

/** Tên duy nhất, ví dụ "Demo qwezxc" */
export function randomName(prefix = "Demo") {
  return `${prefix} ${letters(6)}`;
}

/** Payload hợp lệ cho POST /api/roomTypes; `over` để ghi đè từng trường */
export function validRoomType(over = {}) {
  return {
    roomTypeName: randomName(),
    numberOfBeds: 2,
    maximumOccupancy: 4,
    dailyRate: 800000,
    hourlyRate: 100000,
    ...over,
  };
}

/** Đăng nhập bằng UI (form login của app đang giả lập, nhận mọi tài khoản) */
export async function login(page, username = "admin", password = "123456") {
  await page.goto("/login");
  await page.getByPlaceholder("Nhập tên đăng nhập").fill(username);
  await page.getByPlaceholder("Nhập mật khẩu quản trị").fill(password);
  await page.getByRole("button", { name: "Đăng Nhập Quản Trị" }).click();
  await page.waitForURL("**/dashboard", { waitUntil: "commit" });
}

/** Điền form "Thêm loại phòng"; trường nào không truyền thì dùng giá trị hợp lệ */
export async function fillRoomTypeForm(page, v = {}) {
  const d = { name: randomName("Ui"), beds: "2", occ: "4", daily: "800000", hourly: "100000", ...v };
  await page.locator("#roomTypeName").fill(d.name);
  await page.locator("#numberOfBeds").fill(String(d.beds));
  await page.locator("#maximumOccupancy").fill(String(d.occ));
  await page.locator("#dailyRate").fill(String(d.daily));
  await page.locator("#hourlyRate").fill(String(d.hourly));
}

export const openForm = (page) =>
  page.getByRole("button", { name: "Thêm loại phòng" }).first().click();
export const submitForm = (page) => page.locator("form button[type=submit]").click();

// ---------- Đọc test case từ testcases.json ----------
/** Lấy danh sách test case của 1 phần: "ui" | "api" | "e2e" */
export function loadCases(section) {
  const file = new URL("./testcases.json", import.meta.url);
  return JSON.parse(readFileSync(file, "utf-8"))[section];
}

/** Thay {rand} trong chuỗi bằng 6 chữ cái ngẫu nhiên -> tên luôn duy nhất */
export const fillRand = (s) => (typeof s === "string" ? s.replace("{rand}", letters(6)) : s);
