# Selenium E2E cho màn Host

Bộ test Selenium (JavaScript, `selenium-webdriver` + Vitest) cho 11 case trong tab "TC - Host (Chủ cơ sở)" của `docs/Test-case-HOTELNT.xlsx`:

- `host/host-dashboard.e2e.js`: TC_HDB_01 → TC_HDB_08 (`/host/dashboard`)
- `host/host-profile.e2e.js`: TC_PRF_01 → TC_PRF_03 (`/host/profile`)
- `host/smoke.e2e.js`: kiểm nhanh app mở được, không ghi vào kết quả cho sheet

Mỗi case kiểm **từng ý** trong cột Expected Result, giữ đúng chữ của sheet. Ý nào lệch với giao diện thì case Fail, và kết quả ghi rõ ý đó cùng thứ đang hiện trên màn hình.

## Chạy

```bash
npx vitest run --config e2e/vitest.config.js                                  # cả bộ
npx vitest run --config e2e/vitest.config.js e2e/host/host-profile.e2e.js     # một file
```

Không cần chạy `npm run dev` trước. Lệnh tự bật app ở cổng **5199** (chế độ mock), mở Chrome không giao diện 1440×900, chạy test, rồi tắt trình duyệt và server.

Lần chạy đầu cần mạng: Selenium Manager tự tải Chrome for Testing và chromedriver vào `~/.cache/selenium` (khoảng 1 phút).

`npx vitest run` (config gốc) **không** mở trình duyệt. Lệnh đó chỉ chạy unit test, kể cả unit test của `e2e/support/`.

## Biến môi trường

| Biến | Giá trị | Mặc định |
|---|---|---|
| `E2E_TARGET` | `mock`: dữ liệu giả trong `src/pages/host/api/hostMockApi.js`. `backend`: tắt mock, gọi API thật | `mock` |
| `VITE_API_BASE_URL` | Địa chỉ API khi `E2E_TARGET=backend` | Theo `.env` / `axiosClient` |
| `E2E_HOST_TOKEN` | JWT của tài khoản Host dùng để test, chỉ cần khi chạy với backend | Chuỗi giả `e2e-mock-token` |
| `E2E_BROWSER` | `chrome`, `firefox`, `MicrosoftEdge`, `safari` | `chrome` |
| `E2E_HEADED` | `1` để hiện cửa sổ trình duyệt khi chạy | Không hiện |

Test không đi qua màn đăng nhập và OTP. Phiên Host được ghi vào `localStorage` (`user` + `token`), giống cách `AuthContext.login` làm.

## Kết quả

Sau mỗi lần chạy, trong `e2e/reports/` (không commit):

- `host-results.csv`: 4 cột `Test Case#`, `Actual Result`, `Status`, `Notes`, mỗi case một dòng, theo thứ tự trong sheet.
- `screenshots/<mã case>.png`: ảnh màn hình lúc case không Pass.
- `results.json`: kết quả đầy đủ của Vitest, mỗi test có `meta.checks` (từng ý, đúng/sai, thực tế).

| Status | Nghĩa |
|---|---|
| `Pass (mock)` / `Fail (mock)` | Chạy trên dữ liệu mock |
| `Pass` / `Fail` | Chạy với backend (`E2E_TARGET=backend`) |
| `Error` | Không kiểm được: trình duyệt không mở được, trang báo lỗi, hết thời gian chờ… Dòng đầu của lỗi nằm ở cột Actual Result |
| `Not Run` | Case bị bỏ qua |

Theo quy ước ngày 08/11: chạy trên mock chỉ ghi `Pass (mock)`. Chỉ ghi `Pass` chính thức khi đã chạy lại với backend.

### Dán vào Google Sheet

Trong tab "TC - Host (Chủ cơ sở)", ô `Notes` của cả 11 case đã có sẵn "Mức độ | Phụ trách | Yêu cầu". **Không dán đè cột này.**

1. Mở `host-results.csv` bằng Google Sheets (File → Import) hoặc Excel. File có BOM UTF-8 nên tiếng Việt hiển thị đúng.
2. Copy hai cột `Actual Result` và `Status`, dán vào cùng tên cột, đúng dòng có mã ở cột `Test Case#`. 11 case nằm ở 2 khối dòng riêng (TC_HDB_01–08 và TC_PRF_01–03), nên phải dán 2 lần.
3. Thêm nội dung cột `Notes` của CSV vào sau nội dung có sẵn trong ô `Notes`, cách nhau bằng ` | `.

## Chạy với backend

```bash
E2E_TARGET=backend VITE_API_BASE_URL=https://<api>/api/v1 E2E_HOST_TOKEN=<jwt> \
  npx vitest run --config e2e/vitest.config.js
```

Dùng **tài khoản test riêng**, không dùng tài khoản thật. Token chỉ đặt qua biến môi trường, không ghi vào file.

Cần có trước khi chạy:

- **Địa chỉ API đang chạy**, đặt vào `VITE_API_BASE_URL`.
- **Backend cho phép CORS từ `http://localhost:5199`.** Vite không có proxy, nên trình duyệt gọi thẳng vào API. Thiếu CORS thì trang báo "Không thể kết nối tới máy chủ", giống như khi không có server.
- **Token còn hạn của tài khoản Host test.** Đăng nhập tài khoản đó trên app, rồi copy giá trị `token` trong Local Storage (DevTools → Application). Nếu token sai hoặc hết hạn, API trả 401. Khi đó app xóa phiên và chuyển về `/login` (`src/services/axiosClient.js`), nên cả 11 case báo `Error`.

Cần chuẩn bị dữ liệu:

- Ít nhất một cơ sở ở mỗi trạng thái: Bản nháp, Chờ duyệt, Đã duyệt, Bị từ chối, Ẩn. Cơ sở Bị từ chối nên có lý do từ chối.
- Ít nhất một cơ sở có chữ "Breeze" trong tên (TC_HDB_03).
- **Các case sau đổi dữ liệu thật:** TC_HDB_06 rút lại một cơ sở Chờ duyệt về Bản nháp. TC_HDB_08 xóa một cơ sở Bản nháp và một cơ sở Bị từ chối. TC_PRF_02 đổi họ tên thành "Nguyễn Văn Host Mới" và SĐT thành "0905999888". Chuẩn bị lại dữ liệu trước mỗi lần chạy.

Khi chạy với backend, test chỉ dùng số lượng tối thiểu (ví dụ "có ít nhất 1 hàng"). Số hàng chính xác (5 hàng, 3 kết quả "Breeze"…) chỉ kiểm ở chế độ mock.

## Xử lý sự cố

- **"Cổng 5199 đang bận"**: chạy `lsof -i :5199` để xem tiến trình nào giữ cổng, rồi dừng đúng tiến trình đó. Test không tự chuyển sang cổng khác.
- **Dừng giữa chừng bằng Ctrl+C**: chromedriver có thể còn chạy. Kiểm bằng `pgrep -fl chromedriver`, rồi `kill <PID>` đúng tiến trình của lần chạy đó. Không dùng `pkill` theo mẫu rộng.
- **TC_HDB_03 báo `Error` "Không đo được debounce"**: máy chậm đến mức hai lần gõ phím cách nhau ≥ 400ms, nên không phân biệt được debounce với máy chậm. Chạy lại case đó.
- Server của test dùng thư mục cache Vite riêng (`node_modules/.vite-e2e`), nên không ảnh hưởng `npm run dev` đang chạy ở cổng 5173.

## Cấu trúc

```
e2e/
├── vitest.config.js       config riêng: *.e2e.js, môi trường node, chạy lần lượt từng file
├── global-setup.js        bật/tắt Vite ở cổng 5199, chọn mock hay backend
├── host/                  spec, mỗi test đặt tên "TC_xxx: <tiêu đề case trong sheet>"
├── pages/                 page object: danh sách, trang sửa cơ sở (chỉ đọc), hồ sơ
└── support/
    ├── driver.js          tạo trình duyệt, browserSession(), chụp ảnh khi case không Pass
    ├── session.js         ghi phiên đăng nhập Host
    ├── soft-check.js      kiểm từng ý, gom hết ý sai rồi mới báo Fail
    ├── design-tokens.js   màu Figma dùng để so
    ├── sheet-rows.js      chuyển kết quả thành dòng CSV cho sheet
    └── sheet-reporter.js  reporter Vitest ghi host-results.csv
```
