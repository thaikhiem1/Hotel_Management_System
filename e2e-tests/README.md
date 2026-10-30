# Demo Playwright – Hotel Management

| Phần | Thư mục | Cần backend? |
|------|---------|--------------|
| UI testing (mock API) | `tests/ui` | Không |
| API testing `/api/roomTypes` | `tests/api` | Có (:8080) |
| E2E UI + API | `tests/e2e` | Có (:8080) |

Frontend (:5173) được Playwright tự bật. Backend: bật Docker Desktop, `docker compose up -d` trong `backend/hotel`, rồi chạy Spring Boot.

```bash
npm install && npx playwright install      # lần đầu
npx playwright test --ui                   # UI Mode: bấm chạy, xem timeline từng bước
npx playwright test --headed --project=chromium
npm run test:slow                          # headed + làm chậm 700ms cho khán giả theo dõi
npx playwright test tests/ui --project=firefox --project=webkit
npx playwright test --project=api
npx playwright test --project=e2e-chromium --project=e2e-firefox --project=e2e-webkit
npx playwright show-report                 # báo cáo HTML (kèm video + trace)
npx playwright codegen http://localhost:5173   # tự ghi thao tác thành code
```
Video/ảnh/trace nằm ở `test-results/` và `playwright-report/`.
