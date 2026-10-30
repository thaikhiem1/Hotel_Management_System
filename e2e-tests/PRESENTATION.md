# Playwright – Demo Seminar: Hotel Management

> Kiểm thử **UI + API + E2E**, chạy **đa trình duyệt**, **song song**, **ghi lại thao tác** trên hệ thống quản lý khách sạn (React + Spring Boot).

---

## 1. Mở đầu: Playwright là gì?

Playwright là framework kiểm thử tự động của Microsoft:

| Điểm mạnh | Ý nghĩa |
|---|---|
| Đa trình duyệt | Một bộ test chạy trên Chromium (Chrome/Edge), Firefox, WebKit (Safari) |
| Auto-wait | Tự chờ phần tử sẵn sàng, không cần `sleep()` |
| Web-first assertions | `expect(...)` tự thử lại đến khi đúng hoặc hết thời gian |
| Một công cụ cho cả UI và API | `page` cho giao diện, `request` cho HTTP |
| Cô lập | Mỗi test có một browser context riêng (như hồ sơ trình duyệt mới) |
| Công cụ gỡ lỗi mạnh | UI Mode, Trace Viewer, Codegen, video, ảnh chụp |

**Đối tượng được test:** chức năng *Thêm loại phòng* (`/roomtypes`) và endpoint `POST /api/roomTypes`.

---

## 2. Kiến trúc dự án

```
e2e-tests/
├── playwright.config.js        # cấu hình: trình duyệt, song song, ghi video/trace
├── package.json                # script chạy nhanh ("type": "module")
└── tests/
    ├── testcases.json          # DỮ LIỆU test (15 ca: ui / api / e2e, mỗi loại 5)
    ├── helpers.js              # hàm dùng chung: login, điền form, đọc JSON, tên ngẫu nhiên
    ├── ui/
    │   ├── login.spec.js           # UI: đăng nhập (5 test)
    │   └── room-type-form.spec.js  # UI: form loại phòng, API bị mock
    ├── api/
    │   └── room-types.api.spec.js  # API: gọi thẳng backend
    └── e2e/
        └── room-type-flow.spec.js  # E2E: thao tác UI rồi xác nhận bằng API
```

**Ba lớp kiểm thử (tháp kiểm thử):**

| Lớp | Cần backend? | Cần trình duyệt? | Tốc độ | Dùng để |
|---|---|---|---|---|
| API | Có | Không | Rất nhanh (~100 ms/ca) | Kiểm tra luật nghiệp vụ, mã trạng thái |
| UI (mock API) | Không | Có | Nhanh | Kiểm tra giao diện, validate phía client |
| E2E (UI + API) | Có | Có | Chậm nhất | Kiểm tra cả hệ thống nối với nhau |

---

## 3. Chuẩn bị và chạy

```bash
# 1) Backend: bật Docker Desktop, rồi
cd backend/hotel && docker compose up -d      # Postgres + Redis
./mvnw spring-boot:run                         # API ở :8080

# 2) Frontend (cấu hình hiện tại KHÔNG tự bật frontend)
cd frontend && npm run dev                     # UI ở :5173

# 3) Test
cd e2e-tests
npm install && npx playwright install          # lần đầu: tải 3 trình duyệt
npx playwright test
```

> **Lưu ý:** `playwright.config.js` hiện không có khối `webServer`, nên cần tự bật frontend ở bước 2.
> Nếu muốn Playwright tự bật, thêm lại khối `webServer` (xem mục 8).

---

## 4. Tính năng nổi bật và nơi dùng trong code

### 4.1 Cấu hình đa trình duyệt – `projects`
`playwright.config.js`

```js
projects: [
  { name: "chromium", testDir: "./tests/ui",  use: { ...devices["Desktop Chrome"] } },
  { name: "firefox",  testDir: "./tests/ui",  use: { ...devices["Desktop Firefox"] } },
  { name: "webkit",   testDir: "./tests/ui",  use: { ...devices["Desktop Safari"] } },
  { name: "e2e-chromium", testDir: "./tests/e2e", ... },   // E2E trên 3 trình duyệt
  { name: "api", testDir: "./tests/api", use: { baseURL: BACKEND_URL } },
]
```

- Mỗi `project` là một "cấu hình chạy". Cùng một file test chạy lại cho từng trình duyệt.
- `devices[...]` mô phỏng đúng viewport, user-agent của thiết bị thật.
- Project `api` không có trình duyệt, chỉ trỏ `baseURL` về backend.
- **Demo:** `npx playwright test --project=firefox` hoặc gộp `--project=chromium --project=webkit`.

### 4.2 Chạy song song – `workers` và `fullyParallel`
```js
fullyParallel: true,
workers: process.env.CI ? 2 : "50%",
```
- `workers`: số tiến trình chạy cùng lúc. `"50%"` nghĩa là một nửa số nhân CPU.
- `fullyParallel: true`: ngay cả các test trong cùng một file cũng chạy song song.
- Test an toàn khi song song vì: UI dùng API giả, tên bản ghi có hậu tố ngẫu nhiên (`{rand}`), mỗi test tự xóa dữ liệu của nó.
- **Demo so sánh tốc độ:**
  ```bash
  npx playwright test tests/ui --project=chromium --workers=1
  npx playwright test tests/ui --project=chromium --workers=4
  ```
- **Cảnh báo thực tế:** frontend chạy bằng Vite dev server, mở nhiều trình duyệt cùng lúc có thể làm nó quá tải (xem mục 7).

### 4.3 Ghi lại thao tác – video, trace, ảnh chụp
```js
use: {
  video: "on",         // quay video từng test
  trace: "on",         // trace viewer: DOM, network, console ở từng bước
  screenshot: "on",    // ảnh chụp cuối mỗi test
  launchOptions: { slowMo },   // làm chậm thao tác (ms)
}
```
- File được lưu ở `test-results/` và báo cáo HTML ở `playwright-report/`.
- `slowMo` đọc từ biến môi trường `SLOWMO`, hữu ích khi trình chiếu cho khán giả theo dõi.
- **Demo:** `SLOWMO=700 npx playwright test --headed --project=chromium --workers=1`, sau đó `npx playwright show-report`.

### 4.4 Locator theo ngữ nghĩa và Auto-wait
`helpers.js`, `login.spec.js`

```js
page.getByPlaceholder("Nhập tên đăng nhập").fill(username);
page.getByRole("button", { name: "Đăng Nhập Quản Trị" }).click();
page.getByRole("link", { name: "Quên mật khẩu?" }).click();
page.getByTitle("Ẩn/hiện mật khẩu").click();
page.locator("#roomTypeName")          // id khi không có role rõ ràng
```
- Ưu tiên locator giống cách **người dùng nhìn thấy** (`getByRole`, `getByPlaceholder`, `getByText`) thay vì CSS dài dòng; test bền hơn khi giao diện đổi class.
- **Auto-wait:** `click()`, `fill()` tự chờ phần tử hiện ra, bật được, ổn định. Không có `sleep` nào trong toàn bộ bộ test.

### 4.5 Web-first assertions – tự thử lại
```js
await expect(page.getByText("Thêm loại phòng thành công")).toBeVisible();
await expect(page).toHaveURL(/\/login$/);
await expect(page.locator("#numberOfBeds-error")).toBeVisible();
```
- `expect` chờ tới `expect.timeout` (7 giây trong config) rồi mới kết luận fail.
- Đây là lý do test Playwright ít "flaky" hơn so với `sleep` cố định.

### 4.6 Mock mạng – `page.route()` (UI độc lập backend)
`ui/room-type-form.spec.js`

```js
await page.route(/\/api\/roomTypes(\?.*)?$/, (route) => {
  const req = route.request();
  if (req.method() === "POST") {
    posts.push(req.postDataJSON());                 // BẮT dữ liệu form đã gửi
    return route.fulfill({ status: 201, json: {...} });   // trả 201 giả
  }
  return route.fulfill({ json: emptyPage });        // GET trả danh sách rỗng
});
```
- Chặn request ở tầng trình duyệt, trả dữ liệu giả → **không cần backend, không làm bẩn DB, chạy nhanh**.
- Mảng `posts` cho phép kiểm tra: ca hợp lệ gửi đúng 1 request với đúng body; ca không hợp lệ **không gửi request nào**.

### 4.7 API testing – fixture `request`
`api/room-types.api.spec.js`

```js
const res = await request.post(`${API}/roomTypes`, { data: payload });
expect(res.status()).toBe(tc.expectStatus);     // 201 / 400 / 409
```
- Không mở trình duyệt, gọi HTTP trực tiếp, mỗi ca vài chục đến vài trăm mili giây.
- Kiểm tra: tạo thành công (201), dữ liệu sai (400), trùng tên (409), giá thập phân không bị làm tròn.
- `test.afterAll` xóa các bản ghi đã tạo (dọn dữ liệu).

### 4.8 E2E – kết hợp `page` và `request` trong cùng một test
`e2e/room-type-flow.spec.js`

```
BƯỚC 1 (UI)  : đăng nhập → /roomtypes → điền form → lưu
BƯỚC 2 (UI)  : thấy thông báo "Thêm loại phòng thành công"
BƯỚC 3 (API) : GET /api/roomTypes → bản ghi thật sự nằm trong DB, đúng từng trường
DỌN DẸP      : DELETE bản ghi vừa tạo
```
- Chứng minh dữ liệu đi hết chuỗi: **form → React → axios → Spring Boot → PostgreSQL**.
- Ca ngược (`blocked`): UI chặn dữ liệu sai **và** API xác nhận backend không tạo gì.

### 4.9 Data-driven testing – test case nằm trong JSON
`testcases.json` + vòng `for` trong từng spec

```js
for (const tc of loadCases("api")) {
  test(`${tc.id}: ${tc.title}`, async ({ request }) => { ... });
}
```
- Thêm hoặc bớt test case chỉ cần sửa JSON, không đụng code.
- Mã `TC-RTY-xxx` đi thẳng vào tên test và báo cáo, bám sát tài liệu test case.
- `{rand}` trong tên được thay bằng chuỗi chữ cái ngẫu nhiên để mỗi lần chạy đều duy nhất.

### 4.10 Cô lập test – browser context

**Cô lập là gì?** Mỗi test nhận `page` (và `request`) mới tinh. Playwright tạo một *browser context* riêng cho từng test, như một hồ sơ trình duyệt ẩn danh vừa mở: cookie, `localStorage`, cache và mock mạng đều trống. Test xong thì context bị đóng và mọi dữ liệu biến mất.

**Trong code không có dòng nào "bật" cô lập.** Nó là hành vi mặc định, thể hiện ở chỗ test khai báo fixture:
```js
test("...", async ({ page }) => { ... });          // ui
test("...", async ({ request }) => { ... });       // api
test("...", async ({ page, request }) => { ... }); // e2e
```

**Vì sao phải cô lập?**

| # | Lý do | Ví dụ trong dự án |
|---|---|---|
| 1 | **Kết quả không phụ thuộc thứ tự chạy.** Test này pass hay fail không phụ thuộc test trước đó | `TC-RTY-010` chạy trước hay sau `TC-RTY-001` đều cho cùng kết quả |
| 2 | **Chạy song song được.** Nếu các test dùng chung cookie hoặc trạng thái, chạy cùng lúc sẽ đạp lên nhau | `fullyParallel: true` chỉ an toàn nhờ cô lập |
| 3 | **Không bị "nhiễm" trạng thái cũ.** Đăng nhập, token, dữ liệu form của test trước không rò sang test sau | Token trong `localStorage` (axios đọc `accessToken`) của test này không tới test khác |
| 4 | **Mock không rò rỉ.** `page.route()` chỉ có tác dụng trên `page` của test đó | Mỗi test UI có mock và mảng `posts` riêng, nên test "POST trả 201" không ảnh hưởng test khác |
| 5 | **Dễ tìm lỗi.** Test fail thì nguyên nhân nằm trong chính test đó, chạy lại một mình vẫn tái hiện | `--last-failed` hoặc `-g "TC-RTY-024"` chạy lẻ vẫn cho kết quả như trong cả bộ |
| 6 | **Nhanh.** Tạo context chỉ mất vài mili giây, trong khi mở trình duyệt mới tốn vài trăm mili giây | Một worker mở 1 trình duyệt rồi cấp context mới cho từng test |

**Ghi chú (giới hạn của cô lập):**

> **Ghi chú 1 – Chỉ cô lập phía trình duyệt.** Database và backend vẫn dùng chung. Hai test cùng tạo một tên loại phòng sẽ gặp `409 Conflict`. Dự án xử lý bằng tên có hậu tố ngẫu nhiên `{rand}` (tên chỉ gồm chữ cái nên hậu tố cũng toàn chữ cái) và mỗi test tự `DELETE` bản ghi của nó.
>
> **Ghi chú 2 – Một browser mỗi worker, một context mỗi test.** Trình duyệt được dùng chung giữa các test của cùng một worker; thứ được tạo mới cho mỗi test là *context*. Khi chạy `--headed`, mỗi context hiện thành một cửa sổ riêng nên trông như có nhiều trình duyệt.
>
> **Ghi chú 3 – `page` và `request` không chia sẻ cookie.** Trong test E2E, `request` (gọi HTTP) là ngữ cảnh riêng so với `page`. Hệ thống hiện không có xác thực thật nên chưa gây vấn đề; nếu sau này thêm đăng nhập thật, cần truyền token cho `request` một cách tường minh.
>
> **Ghi chú 4 – Biến cấp module không bị lẫn giữa worker.** Mỗi worker là một tiến trình riêng nên mảng `createdIds` ở file API là bản riêng của từng worker. Nhưng trong cùng một worker, các test chạy nối tiếp vẫn dùng chung biến này.
>
> **Ghi chú 5 – Tài nguyên dùng chung có thể quá tải.** Frontend (Vite dev server) là một tiến trình duy nhất mà mọi worker cùng truy cập. Chạy nhiều worker với nhiều trình duyệt từng làm Firefox/WebKit báo `NS_ERROR_CONNECTION_REFUSED`. Giải pháp: giảm `workers`, hoặc chạy frontend bản build (`npm run build && npm run preview`).
>
> **Ghi chú 6 – Test cần chạy theo thứ tự thì phải khai báo rõ.** Nếu một nhóm test phụ thuộc nhau (tạo → sửa → xóa cùng một bản ghi), dùng `test.describe.configure({ mode: "serial" })` thay vì cố chia sẻ trạng thái.

**Một câu để nhớ:** *cô lập giúp test độc lập về trình duyệt; còn dữ liệu dùng chung ở phía server thì chúng ta tự chịu trách nhiệm.*

---

## 5. Bảng test case đang có (15 ca, mỗi loại 5)

| Loại | Mã TC | Nội dung |
|---|---|---|
| **UI** | TC-RTY-001 | Dữ liệu hợp lệ → gửi POST + toast thành công |
| | TC-RTY-010 | Tên chứa chữ số → lỗi tên |
| | TC-RTY-024 | Số giường = 11 → lỗi số giường |
| | TC-RTY-033 | Sức chứa = 21 → lỗi sức chứa |
| | TC-RTY-037 | Giá ngày = -0.01 → lỗi giá |
| **API** | TC-RTY-001 | Hợp lệ → 201 |
| | TC-RTY-005 | Giá 2 chữ số thập phân → 201, không làm tròn |
| | TC-RTY-010 | Tên có số → 400 |
| | TC-RTY-016 | Tên trùng → 409 |
| | TC-RTY-024 | Số giường = 11 → 400 |
| **E2E** | TC-RTY-001 | Tạo bằng UI → API xác nhận đã lưu |
| | TC-RTY-002 | Tên có khoảng trắng đầu/cuối → DB lưu tên đã trim |
| | TC-RTY-005 | Giá thập phân lưu chính xác |
| | TC-RTY-006 | Tên tiếng Việt có dấu lưu đúng |
| | TC-RTY-024 | UI chặn, DB không có bản ghi |

Ngoài ra `login.spec.js` có thêm 5 test UI đăng nhập.

---

## 6. Kịch bản trình diễn gợi ý (≈ 15 phút)

| Phút | Việc làm | Lệnh |
|---|---|---|
| 0–2 | Giới thiệu kiến trúc, chỉ vào `testcases.json` | – |
| 2–5 | **UI Mode** – chọn test, xem timeline, DOM từng bước, mock API | `npx playwright test --ui` |
| 5–7 | **Headed + slowMo** – khán giả thấy thao tác thật | `SLOWMO=700 npx playwright test --headed --project=chromium --workers=1` |
| 7–9 | **API test** – nhanh, không có trình duyệt | `npx playwright test --project=api` |
| 9–11 | **E2E** – UI rồi xác nhận qua API | `npx playwright test --project=e2e-chromium --headed` |
| 11–13 | **Đa trình duyệt + song song** | `npx playwright test tests/ui --workers=3` |
| 13–15 | **Báo cáo + Trace Viewer** – xem lại video, từng bước | `npx playwright show-report` |

**Mẹo trình diễn:** tạo một lỗi cố ý (ví dụ sửa `expectStatus` thành 200 trong JSON), chạy để thấy test fail cùng ảnh, video và trace, rồi mở `show-trace` để chỉ ra chính xác bước nào hỏng.

---

## 7. Lưu ý khi chạy thực tế (nên nói thẳng với khán giả)

- **Frontend dev server có thể quá tải khi chạy song song nhiều trình duyệt.** Khi chạy với `fullyParallel: true` và nhiều worker, đã có lúc Firefox/WebKit báo `NS_ERROR_CONNECTION_REFUSED` do Vite không phục vụ kịp. Khi chạy `--workers=1` thì bộ test pass đầy đủ. Cách khắc phục: giảm `workers` xuống 2–3, hoặc chạy frontend bằng bản build (`npm run build && npm run preview`).
- **Lần chạy đầu chậm** vì Vite biên dịch theo yêu cầu, do đó `timeout` được đặt 60 giây. Nên chạy thử một lượt trước khi lên sân khấu.
- **Backend lưu tên dạng chữ thường** (`Phòng Deluxe` → `phòng deluxe`), nên test E2E so tên không phân biệt hoa/thường.
- **Tên loại phòng chỉ cho chữ cái và khoảng trắng** (không số, không ký tự đặc biệt), do đó dữ liệu ngẫu nhiên dùng toàn chữ cái.
- **Test E2E ghi vào DB thật.** Mỗi test tự xóa bản ghi của nó, nhưng nếu một ca fail giữa chừng có thể còn sót bản ghi cần dọn thủ công.
- **TC-RTY-015 (tên 101 ký tự)** từng fail ở UI: form không hiện lỗi cho tên quá dài, nên không đưa vào bộ demo.
- Form đăng nhập hiện chỉ giả lập (nhận mọi tài khoản) nên test đăng nhập chưa kiểm tra xác thực thật.

---

## 8. Mở rộng gợi ý (chưa có trong code)

Tự bật frontend khi chạy test, thêm vào `defineConfig`:
```js
webServer: {
  command: "npm run dev -- --port 5173 --strictPort",
  cwd: "../frontend",
  url: "http://localhost:5173",
  reuseExistingServer: true,
  timeout: 60_000,
},
```
Các ý khác: `retries: 2` cho CI, tag `@smoke` kèm `--grep`, chạy trên CI bằng GitHub Actions, thêm visual testing bằng `toHaveScreenshot()`, lưu đăng nhập bằng `storageState` khi ứng dụng có xác thực thật.

---

## 9. Cheat sheet – các lệnh Playwright quan trọng

### Cài đặt
```bash
npm init playwright@latest              # khởi tạo project mới
npm install -D @playwright/test
npx playwright install                  # tải mọi trình duyệt
npx playwright install chromium         # chỉ tải 1 trình duyệt
npx playwright install --with-deps      # kèm thư viện hệ thống (Linux/CI)
npx playwright --version
```

### Chạy test
```bash
npx playwright test                              # chạy tất cả
npx playwright test tests/ui                     # chạy 1 thư mục
npx playwright test login.spec.js                # chạy 1 file
npx playwright test login.spec.js:9              # chạy test ở dòng 9
npx playwright test -g "TC-RTY-001"              # lọc theo tên (grep)
npx playwright test --grep-invert "login"        # loại trừ theo tên
npx playwright test --project=chromium           # chọn trình duyệt/project
npx playwright test --project=firefox --project=webkit
```

### Chế độ hiển thị và gỡ lỗi
```bash
npx playwright test --ui                         # UI Mode: timeline, DOM từng bước, watch
npx playwright test --headed                     # mở cửa sổ trình duyệt thật
npx playwright test --debug                      # Inspector: chạy từng bước
npx playwright test --headed --workers=1         # xem lần lượt từng test
SLOWMO=700 npx playwright test --headed          # làm chậm thao tác (dùng biến của dự án)
PWDEBUG=1 npx playwright test                    # bật Inspector bằng biến môi trường
```

### Song song, lặp lại, thử lại
```bash
npx playwright test --workers=4                  # số worker
npx playwright test --workers=1                  # tuần tự
npx playwright test --fully-parallel             # song song cả trong 1 file
npx playwright test --retries=2                  # thử lại test fail
npx playwright test --repeat-each=5              # lặp mỗi test 5 lần (tìm flaky)
npx playwright test --last-failed                # chỉ chạy lại test vừa fail
npx playwright test --max-failures=1             # dừng sau lỗi đầu tiên
npx playwright test --timeout=90000              # đổi timeout mỗi test
npx playwright test --list                       # liệt kê test, không chạy
```

### Ghi lại và xem kết quả
```bash
npx playwright test --reporter=line              # in gọn từng dòng
npx playwright test --reporter=list              # danh sách chi tiết
npx playwright test --reporter=html              # tạo báo cáo HTML
npx playwright show-report                       # mở báo cáo HTML
npx playwright test --trace on                   # ghi trace mọi test
npx playwright show-trace test-results/<thư-mục>/trace.zip
npx playwright test --update-snapshots           # cập nhật ảnh chuẩn (visual test)
```

### Tự sinh code và chọn locator
```bash
npx playwright codegen http://localhost:5173     # ghi thao tác thành code
npx playwright codegen --browser=firefox <url>
npx playwright codegen --device="iPhone 13" <url>
npx playwright codegen --save-storage=auth.json <url>   # lưu phiên đăng nhập
```

### Scripts đã khai báo trong `package.json`
```bash
npm test               # playwright test
npm run test:ui-mode   # playwright test --ui
npm run test:headed    # headed trên chromium
npm run test:slow      # headed + SLOWMO=700 + 1 worker
npm run test:api       # chỉ project api
npm run test:e2e       # chỉ thư mục E2E
npm run report         # mở báo cáo HTML
npm run codegen        # codegen trang frontend
```

---

## 10. Từ khóa nên nhớ khi thuyết trình

`auto-wait` · `web-first assertion` · `locator theo vai trò` · `browser context cô lập` · `project đa trình duyệt` · `workers / fullyParallel` · `page.route (mock)` · `request (API)` · `trace viewer` · `UI Mode` · `codegen` · `data-driven`
