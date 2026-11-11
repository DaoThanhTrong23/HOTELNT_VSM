---
phase: 2
title: "Bộ khung Selenium và smoke test"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Bộ khung Selenium và smoke test

## Goal

Lệnh `npx vitest run --config e2e/vitest.config.js` phải tự làm đủ các bước: bật app ở chế độ mock trên cổng 5199, mở Chrome, ghi phiên đăng nhập Host, chạy smoke test, rồi tắt trình duyệt và server. Kèm theo là page object, soft-check và các helper mà Phase 3 và 4 sẽ dùng.

## Scout trước khi làm

```bash
npm view selenium-webdriver version                     # 2026-11-09: 4.52.0
ls ~/.cache/selenium 2>/dev/null                         # Selenium Manager chưa tải gì
lsof -i :5199                                            # cổng phải trống
grep -n "provide\|inject" node_modules/vitest/dist/index.d.ts | head
```

Đo ngày 2026-11-09:
- Node v26.13.0, Vite 8.3.4, Vitest 5.0.5.
- Máy **chưa cài Google Chrome**. Có `/usr/bin/safaridriver`, và có Chromium của Playwright trong `~/Library/Caches/ms-playwright`, nhưng không dùng.
- Selenium Manager (có sẵn trong `selenium-webdriver` 4.x) tự tải Chrome for Testing và chromedriver vào `~/.cache/selenium` ở lần chạy đầu, nên **cần mạng** ở lần đó.

## Kiến trúc

```
npx vitest run --config e2e/vitest.config.js
 └─ global-setup.js ─ createServer(vite.config.js, port 5199, strictPort)  VITE_USE_MOCK=true|false
      │  provide('baseUrl'), provide('target')
      ▼
    *.e2e.js (chạy lần lượt, mỗi file một driver)
      ├─ support/driver.js     buildDriver(): Chrome headless 1440×900 (E2E_BROWSER, E2E_HEADED)
      ├─ support/session.js    seedHostSession(): /login → localStorage user+token → trang cần test
      ├─ support/soft-check.js check(label, fn) → task.meta.checks; assertAll() ném SoftCheckFailure
      └─ pages/*.js            page object (selector: data-testid, id, role)
      ▼
    reporter json → e2e/reports/results.json  (meta.checks, meta.notes, meta.target)
 └─ teardown: server.close()
```

- **Mỗi lần `driver.get` là một lần tải lại trang.** Module mock chạy lại nên kho mock trở về dữ liệu ban đầu. Mỗi case bắt đầu bằng `driver.get`, nhờ vậy các case không ảnh hưởng nhau. Trong một case, chỉ bấm link trong app (SPA) nên dữ liệu vẫn giữ.
- **Phiên đăng nhập**: `user = { id: 'host-e2e', name: 'Chủ cơ sở HotelNT', email: 'host.demo@hotelnt.vn', phone: '', role: 'HOST' }`. `token` lấy từ `E2E_HOST_TOKEN`, nếu không có thì là `'e2e-mock-token'`. Tên `'Chủ cơ sở HotelNT'` giống tên mặc định của luồng OTP (`VerifyOtpPage.jsx:246`).
- **`E2E_TARGET`**: mặc định là `mock`. Đặt `backend` thì bật `VITE_USE_MOCK=false` và dùng `VITE_API_BASE_URL` có sẵn trong môi trường. Với giá trị khác thì dừng ngay, báo lỗi rõ ràng.
- **Cổng bận** thì `strictPort` làm server không khởi động. `global-setup` ném lỗi kèm gợi ý `lsof -i :5199`, không tự chuyển sang cổng khác.

## Files to Create / Modify

| File | Thao tác | Ước lượng | Ảnh hưởng test |
|---|---|---|---|
| `package.json`, `package-lock.json` | `npm install -D selenium-webdriver@^4.52.0`, chỉ thêm 1 dòng devDependency | 1 dòng + lock | — |
| `e2e/vitest.config.js` | Tạo: `root` = gốc repo, `include: ['e2e/host/**/*.e2e.js']`, `environment: 'node'`, `globalSetup`, `fileParallelism: false`, `testTimeout: 60000`, `hookTimeout: 180000` (lần đầu phải tải Chrome), reporter `default` + `json` → `e2e/reports/results.json` | ~25 | — |
| `e2e/global-setup.js` | Tạo: như kiến trúc. Thêm `server.warmup.clientFiles: ['./src/main.jsx', './src/pages/host/**/*.jsx']` | ~45 | — |
| `e2e/support/driver.js` | Tạo: `buildDriver()`, `waitFor(locator)`, `waitForUrl(predicate)`, `useDriver()` (beforeAll, afterAll `quit`, `onTestFailed` chụp màn hình vào `e2e/reports/screenshots/<mã case>.png`) | ~80 | — |
| `e2e/support/session.js` | Tạo: `seedHostSession(driver, baseUrl, path)` | ~25 | — |
| `e2e/support/soft-check.js` | Tạo: `createSoftCheck(task, { target })`, `normalizeText()`, `toHex(cssColor)` | ~70 | Unit test bên dưới |
| `e2e/support/design-tokens.js` | Tạo: màu Figma (D7): Đã duyệt `#15803D`, Chờ duyệt `#B45309`, Bị từ chối `#DC2626`, chữ phụ `#64748B`, cảnh báo `#B45309`, nguy hiểm `#DC2626`, thành công `#15803D`. Ghi nguồn trong comment | ~15 | — |
| `e2e/support/__tests__/soft-check.test.js` | Tạo (viết trước) | ~60 | Chạy bằng `npx vitest run e2e/support` (config gốc) |
| `e2e/pages/dashboard-page.js` | Tạo khung: `open(query)`, `rows()`, `waitLoaded()` | ~30 (Phase 3 thêm) | — |
| `e2e/host/smoke.e2e.js` | Tạo (viết trước): mở `/host/dashboard`, bảng có 5 hàng | ~20 | — |
| `e2e/.gitignore` | Tạo: `reports/` | 1 | — |

`package.json` không thêm script, vì Q1 chỉ đồng ý thêm 1 devDependency. Lệnh chạy sẽ ghi trong README ở Phase 4.

## Tests Before (viết trước, phải đỏ)

1. `e2e/support/__tests__/soft-check.test.js`:
   - `createSoftCheck(task, { target })` ghi `task.meta.target`.
   - `check()` ghi `{ label, ok, actual }` vào `task.meta.checks`.
   - `note(text)` thêm vào `task.meta.notes` (mảng).
   - `assertAll()` không ném lỗi khi mọi ý đều đúng.
   - Có 2 ý sai thì `assertAll()` đặt `task.meta.softFailed = true` rồi ném `SoftCheckFailure`, và message chứa đủ cả 2 nhãn cùng 2 giá trị thực tế. Reporter ở Phase 4 dựa vào cờ này để phân biệt Fail với Error.
   - Một ý tự ném lỗi (ví dụ không tìm thấy phần tử) thì ý đó được ghi là sai kèm message, các ý sau vẫn chạy.
   - `toHex('rgb(180, 83, 9)') === '#B45309'`. `toHex('rgba(220, 38, 38, 1)') === '#DC2626'`.
   - `normalizeText('  Xóa\n cơ sở. ')` trả về `'Xóa cơ sở'`: gộp khoảng trắng và bỏ dấu chấm cuối.
2. `e2e/host/smoke.e2e.js`: chạy khi chưa có `global-setup.js` thì phải fail vì không có `baseUrl`.

Lệnh đỏ:
```bash
npx vitest run e2e/support                                   # soft-check chưa có → đỏ
npx vitest run --config e2e/vitest.config.js                 # chưa có global-setup → đỏ
```

## Implementation Steps

1. Cài `selenium-webdriver`. Spike: một script ngắn mở `about:blank` để xác nhận Selenium Manager tải được Chrome trên máy này. Nếu không tải được vì mạng hay chính sách công ty, **dừng lại và báo Quân**. Phương án thay thế là cài Chrome, không tự chuyển sang Safari.
2. Viết `soft-check.js` và `design-tokens.js` cho đến khi unit test xanh.
3. Viết `vitest.config.js`, `global-setup.js`, `driver.js`, `session.js`, `pages/dashboard-page.js`.
4. Chạy smoke và thấy xanh. Chạy lần hai để chắc lần đầu không phải chỉ qua nhờ may.
5. Kiểm dọn dẹp: sau khi chạy, `lsof -i :5199` không còn gì. `pgrep -fl chromedriver` không còn tiến trình do lần chạy này tạo ra.

## Tests After

- Unit test soft-check xanh. Smoke `smoke.e2e.js` xanh.
- `npx vitest run` (config gốc) vẫn xanh và **không** kéo `*.e2e.js` vào.

## Regression gate

```bash
npx vitest run                                   # unit test của cả repo, kể cả e2e/support/__tests__
npx vitest run --config e2e/vitest.config.js     # smoke xanh
lsof -i :5199 || echo "port free"
npm run lint
```

## Todo

- [x] Cài `selenium-webdriver`, spike mở được Chrome
- [x] Viết unit test soft-check (đỏ), rồi viết `soft-check.js`, `design-tokens.js` (xanh)
- [x] Viết config, global setup, driver, session, khung page object
- [x] Smoke xanh 2 lần liên tiếp, cổng và driver được dọn sạch
- [x] Commit `test(e2e): add selenium harness for host screens`

## Success Criteria

- Một lệnh chạy smoke từ đầu đến cuối, không cần chạy `npm run dev` trước.
- Sau khi chạy xong không còn server hay driver nào.
- `e2e/reports/results.json` có `meta.checks` của smoke.

## Risks

| Rủi ro | Cách xử lý |
|---|---|
| Lần mở trang đầu tiên Vite tối ưu lại dependency rồi tự tải lại trang, làm hỏng case đang chạy | Dùng `server.warmup` trong global setup. Smoke chạy trước, đóng vai làm nóng server. Nếu vẫn xảy ra thì trong global setup gọi `server.warmupRequest('/src/main.jsx')` rồi chờ Vite báo xong |
| `selenium-webdriver` là gói CommonJS, import theo cú pháp ESM có thể không lấy được named export | Spike ở bước 1 kiểm `import { Builder, By, until } from 'selenium-webdriver'`. Nếu lỗi thì dùng `createRequire` |
| Đặt `root` sai làm Vitest không tìm thấy spec | Đặt `root` tuyệt đối bằng `fileURLToPath(new URL('..', import.meta.url))` |
| Máy Quân đang chạy dev server ở 5173 | Dùng cổng riêng 5199, không đụng 5173 |

## Security

Token mặc định chỉ là chuỗi giả. Ở chế độ backend, `E2E_HOST_TOKEN` chỉ đọc từ biến môi trường, không ghi ra file hay báo cáo. `e2e/reports/` nằm trong `.gitignore`.
