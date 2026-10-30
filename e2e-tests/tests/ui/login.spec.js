import { test, expect } from "@playwright/test";

test.describe("UI - Đăng nhập", () => {
  test("vào / thì tự chuyển sang /login và thấy tiêu đề", async ({ page }) => {
    await page.goto("/"); 

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Đăng nhập hệ thống" }),
    ).toBeVisible();
  });

  test("nút 'hiện mật khẩu' đổi type password <-> text", async ({ page }) => {
    await page.goto("/login");
    const password = page.getByPlaceholder("Nhập mật khẩu quản trị");

    await password.fill("matkhau-bi-mat");
    await expect(password).toHaveAttribute("type", "password"); // đang ẩn

    await page.getByTitle("Ẩn/hiện mật khẩu").click(); // bấm con mắt
    await expect(password).toHaveAttribute("type", "text"); // đã hiện
  });

  test("đăng nhập thành công -> thấy thông báo -> vào dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Nhập tên đăng nhập").fill("admin");
    await page.getByPlaceholder("Nhập mật khẩu quản trị").fill("123456");
    await page.getByRole("button", { name: "Đăng Nhập Quản Trị" }).click();

    // Thông báo xác thực xuất hiện trước khi chuyển trang
    await expect(page.getByText('Chứng thực hợp lệ cho tài khoản "admin"')).toBeVisible();
    await page.waitForURL("**/dashboard");
  });

  test("bỏ trống tên đăng nhập -> trình duyệt chặn submit (required)", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Đăng Nhập Quản Trị" }).click();

    // Vẫn ở trang login, không điều hướng
    await expect(page).toHaveURL(/\/login$/);
  });

  test("link 'Quên mật khẩu?' mở trang reset-password", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Quên mật khẩu?" }).click();

    await expect(page).toHaveURL(/\/reset-password$/);
  });
});
