---
title: "Selenium E2E cho Danh sách CSLT và Hồ sơ Host"
description: "Viết 11 test Selenium (JavaScript) cho TC_HDB_01–08 và TC_PRF_01–03, kiểm đúng nguyên văn sheet test case, chạy trên mock và xuất kết quả để dán vào Google Sheet."
status: completed
priority: P1
effort: 14h
branch: feature/quan-dashbds
tags: [frontend, testing, e2e]
blockedBy: []
blocks: []
created: 2026-11-09
---

# Selenium E2E cho Danh sách CSLT và Hồ sơ Host

## Overview

Nguồn yêu cầu: `docs/Test-case-HOTELNT.xlsx`, tab "TC - Host (Chủ cơ sở)". Phần của Quân gồm 11 case: TC_HDB_01–08 (Màn 11, `/host/dashboard`) và TC_PRF_01–03 (`/host/profile`). File `.xlsx` này thực chất là file Excel 97 (`.xls`), nội dung giống hệt `docs/Test-case-HOTELNT.xls` đã đọc trước đó.

Kết quả bàn giao: 11 test Selenium chạy bằng một lệnh, tự bật app ở chế độ mock, và tạo file CSV gồm `Test Case#`, `Actual Result`, `Status`, `Notes` để dán vào sheet.

## Quyết định của Quân (2026-11-09)

| # | Câu hỏi | Chốt |
|---|---|---|
| Q1 | Ngôn ngữ | JavaScript: `selenium-webdriver` + Vitest có sẵn. Được thêm 1 devDependency vào `package.json` |
| Q2 | Sheet lệch code | Kiểm **đúng nguyên văn sheet**. Ý nào lệch thì case Fail |
| Q3 | Dữ liệu | Chạy trên mock, ghi "Pass (mock)". Khi có backend thì chạy lại để đánh Pass chính thức. Giữ quy ước ngày 08/11 |

## Thiết kế

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Spec đặt tên `*.e2e.js` trong `e2e/host/`, chạy bằng config riêng `e2e/vitest.config.js` | Lệnh `npx vitest run` mặc định chỉ nhận `*.test.*`/`*.spec.*`, nên unit test hiện có không bị kéo theo trình duyệt |
| D2 | `globalSetup` bật Vite ngay trong tiến trình test, cổng cố định 5199 (`strictPort`), đặt `VITE_USE_MOCK=true`, tắt server ở teardown | Không có tiến trình nền bị bỏ lại. Vite ưu tiên biến `VITE_*` có sẵn trong `process.env` hơn file `.env` (`node_modules/vite/dist/node/chunks/node.js:6091`) |
| D3 | Đăng nhập bằng cách ghi `user` + `token` vào `localStorage`, giống `AuthContext.login` (`src/context/AuthContext.jsx:19-24`) | Màn đăng nhập và OTP là của Quỳnh. Luồng OTP thật cần email. Điều kiện tiên quyết của sheet chỉ là "Host đã đăng nhập" |
| D4 | Mỗi case kiểm **từng ý** trong cột Expected Result bằng soft-check. Ghi hết các ý sai, không dừng ở ý đầu tiên. Nếu sheet nêu một nút không tồn tại thì ghi Fail cho ý đó, rồi bấm nút thật để kiểm tiếp các ý còn lại | Q2: Fail phải chỉ rõ lệch ở đâu, để người giữ sheet sửa |
| D5 | Ở chế độ mock, trạng thái ghi `Pass (mock)` / `Fail (mock)`. Khi `E2E_TARGET=backend` thì ghi `Pass` / `Fail`. Lỗi hạ tầng (không mở được trình duyệt, không tìm thấy trang) ghi `Error` | Q3 |
| D6 | Thêm mock cho 5 API vào `hostMockApi.js`, dùng chung kho dữ liệu với 8 hàm của Trọng | Rút lại hay xóa trên danh sách sẽ đổi dữ liệu thật trong kho. Hiện test `MOCK-02` đang khẳng định danh sách vẫn gọi API thật nên sẽ phải đổi |
| D7 | Màu "đúng Figma" lấy từ bảng token trong `plans/2026-10-20-host-dashboard-profile/plan.md:45-49` và bảng màu ở test plan (dòng "UI / UX Pixel-Perfect") | Không có file Figma trong repo. Hai nguồn này cùng ghi Chờ duyệt = `#B45309` |
| D8 | Tìm hàng theo nhãn trạng thái, không theo tên | Mock có 3 cơ sở cùng tên "Sea Breeze Homestay" (mã 1, 3, 5) |
| D9 | Trình duyệt mặc định là Chrome, do Selenium Manager tự tải vì máy chưa cài Chrome. `E2E_BROWSER` đổi sang `firefox`, `MicrosoftEdge` hoặc `safari`. Cửa sổ 1440×900 | Sheet không ghi kích thước màn hình cho 11 case này |

## Dự đoán kết quả trên code hiện tại

| Case | Ý trong sheet không khớp code | Dự đoán |
|---|---|---|
| TC_HDB_01 | Không có 4 thẻ "Tổng số / Đang hiển thị / Chờ duyệt / Bị từ chối". Nhãn Chờ duyệt màu `#D97706`, Figma ghi `#B45309` | Fail |
| TC_HDB_02 | Bấm "Tất cả" thì `trangThai` bị xóa khỏi URL, trong khi sheet ghi `?trangThai=...` (hiểu là `ALL`) | Fail |
| TC_HDB_03 | — | Pass (mock) |
| TC_HDB_04 | — | Pass (mock) |
| TC_HDB_05 | Nút "Rút lại" có viền thường, chữ đen, không phải màu cảnh báo | Fail |
| TC_HDB_06 | Hộp xác nhận không có nút "Xác nhận rút" (nút thật là "Rút lại") | Fail |
| TC_HDB_07 | — | Pass (mock) |
| TC_HDB_08 | Không có nút "Xác nhận xóa" (nút thật là "Xóa cơ sở") | Fail |
| TC_PRF_01 | Cạnh Email và CCCD không có icon ổ khóa | Fail |
| TC_PRF_02 | Nút là "Lưu thông tin", không phải "Lưu thay đổi". Tên trên Sidebar không đổi | Fail |
| TC_PRF_03 | Không có nút "Lưu". Nút "Cập nhật mật khẩu" bị tắt khi còn lỗi. Hai câu lỗi khác chữ. Lỗi "mật khẩu cũ" chỉ hiện sau khi gửi | Fail |

Dự đoán là 3 Pass (mock) và 8 Fail. Các chỗ lệch này đã ghi trong `plans/261108-0632-host-screens-post-merge-fixes/test-case-change-list.md`. Plan này **không sửa giao diện** cho khớp sheet.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Mock 5 API của Danh sách và Hồ sơ](./phase-01-mock-host-list-and-profile-apis.md) | Done |
| 2 | [Bộ khung Selenium và smoke test](./phase-02-selenium-harness.md) | Done |
| 3 | [8 case Danh sách CSLT](./phase-03-dashboard-selenium-cases.md) | Done |
| 4 | [3 case Hồ sơ và file kết quả cho sheet](./phase-04-profile-cases-and-sheet-report.md) | Done |

Thứ tự phụ thuộc: 1 → 2 → 3 → 4. Phase 2 cần mock của Phase 1 cho smoke test. Phase 3 và 4 dùng page object và soft-check của Phase 2.

## Phạm vi file

| File | Thao tác | Phase |
|---|---|---|
| `src/pages/host/api/hostMockApi.js` | Sửa: thêm 5 hàm, kho hồ sơ và mật khẩu | 1 |
| `src/pages/host/api/hostApi.js` | Sửa: chuyển 5 hàm sang mock khi `USE_MOCK` | 1 |
| `src/pages/host/__tests__/hostMockApi.test.jsx` | Sửa: đảo `MOCK-02`, thêm `MOCK-10…16` | 1 |
| `package.json`, `package-lock.json` | Sửa: chỉ thêm devDependency `selenium-webdriver` | 2 |
| `e2e/**` | Tạo: config, global setup, support, page object, spec, script, README | 2–4 |

Không đụng: `src/components/**` (kể cả `Sidebar.jsx`, `StatusBadge.jsx`), `src/context/**`, `src/services/**`, trang của thành viên khác, `.gitignore` gốc, `vitest.config.js` gốc.

## Không làm

- Sửa giao diện cho khớp sheet, sửa sheet, sửa danh sách sửa ngày 08/11.
- Viết test cho các case đề xuất thêm (TC_HDB_09–16, TC_PRF_04–08), vì chưa có trong sheet.
- Test giao diện mobile, test trên nhiều trình duyệt cùng lúc, chạy CI.
- Đăng nhập thật qua OTP.

## Cách đọc sheet (Quân chốt 2026-11-09)

| Case | Câu trong sheet | Test đọc là | Ảnh hưởng |
|---|---|---|---|
| TC_HDB_02 | "URL cập nhật query param ?trangThai=..." khi bấm 'Tất cả' | Phải có `trangThai=ALL`, vì tiêu đề case liệt kê `ALL` | Fail ở ý 'Tất cả' |
| TC_HDB_06 | Dữ liệu "Mã cơ sở = 12" | Dùng cơ sở Chờ duyệt có sẵn (mock: mã 3), ghi vào Notes | Không đổi kết quả |
| TC_PRF_01 | "CCCD (12 số)" | 12 ký tự đã che một phần (`079******234`), theo API và SRS FR-13 | Pass ở ý này |

## Success Criteria

- [x] `npx vitest run src/pages/host` qua hết, kể cả các test mock mới. _170/170 (trước plan là 163)._
- [x] `npx vitest run --config e2e/vitest.config.js` chạy đủ 11 case, 0 case `Error`, sau đó cổng 5199 được giải phóng. _Cả bộ (11 case + smoke) chạy khoảng 23 giây. Sau mỗi lần chạy `lsof -i :5199` trống, `pgrep chromedriver` không còn gì._
- [x] Kết quả từng case khớp bảng dự đoán ở trên. Case nào khác thì có giải thích trong báo cáo. _Khớp cả 11 case và từng ý "Sai" trong Phase 3, 4. Xem mục Kết quả._
- [x] Có `e2e/reports/host-results.csv` với đủ 11 dòng, cột `Actual Result` nêu từng ý sai.
- [x] Chạy lại với `VITE_USE_MOCK=false` thì các case không vượt qua được, vì trang hiện lỗi mạng (kiểm chứng test không qua "cho có"). _Chạy `E2E_TARGET=backend` với API trỏ vào `http://127.0.0.1:9` (cổng đóng, để không gửi token giả ra domain mặc định): 0 Pass, 11 `Error` "Không thể kết nối tới máy chủ"._
- [x] Không có file nào ngoài phạm vi ở trên bị sửa (`git status`). _`git diff --name-only 8e42daa..HEAD`: chỉ `e2e/**`, `package.json`, `package-lock.json` và 3 file trong `src/pages/host/`._

## Kết quả (2026-11-10)

Commit: `4b1212e` (Phase 1), `2ebd54d` (Phase 2), `6f60e77` (Phase 3), `a19ee2a` (Phase 4).

| Case | Status | Ý không khớp sheet (cột Actual Result) |
|---|---|---|
| TC_HDB_01 | Fail (mock) | Không có thẻ 'Tổng số', 'Đang hiển thị', 'Chờ duyệt', 'Bị từ chối'. Nhãn Chờ duyệt `#D97706` (Figma `#B45309`) |
| TC_HDB_02 | Fail (mock) | Bấm 'Tất cả': URL là `/host/dashboard`, không có `trangThai=ALL` |
| TC_HDB_03 | Pass (mock) | 4/4 ý. Tìm kiếm 1 lần sau 423–430ms kể từ phím cuối |
| TC_HDB_04 | Pass (mock) | 3/3 ý |
| TC_HDB_05 | Fail (mock) | 'Rút lại': chữ `#000000`, viền `#CBD5E1`, nền `#FFFFFF` |
| TC_HDB_06 | Fail (mock) | Không có nút 'Xác nhận rút' (có 'Hủy', 'Rút lại') |
| TC_HDB_07 | Pass (mock) | 4/4 ý |
| TC_HDB_08 | Fail (mock) | Không có nút 'Xác nhận xóa' (có 'Hủy', 'Xóa cơ sở'), ở cả lượt Bản nháp và Bị từ chối |
| TC_PRF_01 | Fail (mock) | Email và CCCD không có icon ổ khóa |
| TC_PRF_02 | Fail (mock) | Không có nút 'Lưu thay đổi' (có 'Lưu thông tin'). Sidebar vẫn hiện 'Chủ cơ sở HotelNT' |
| TC_PRF_03 | Fail (mock) | Không có nút 'Lưu' ('Cập nhật mật khẩu' đang tắt). Không có lỗi mật khẩu cũ. Hai câu lỗi khác chữ: 'Còn thiếu: ít nhất 8 ký tự', 'Xác nhận mật khẩu mới không trùng khớp.' |

Tổng: 3 Pass (mock), 8 Fail (mock), 0 Error. Giống nhau qua mọi lần chạy: 4 lần riêng 8 case Danh sách, 1 lần riêng 3 case Hồ sơ, 3 lần cả bộ.

### Khác với plan

- **Gate "Sea Breeze" của Phase 1**: chuỗi này vẫn có trong `index-*.js` vì placeholder "Ví dụ: Sea Breeze Homestay" ở `BasicInfoStep.jsx` (có từ trước, plan 261108 đã ghi). Đo bằng chuỗi chỉ có trong mock (`Host@12345`, `host.demo@hotelnt.vn`): 0 lần trong bundle chính, mock nằm ở chunk `hostMockApi-*.js`.
- **Icon ổ khóa**: `lock-keyhole` bắt đầu bằng `M7 10V7`, không phải `M7 11V7` như R1 ghi. Selector nhận cả hai.
- **Số dòng Excel**: API Hồ sơ ở dòng 26–27, danh sách ở 28, đổi mật khẩu ở 34, xóa CSLT ở 35 (plan ghi lệch 1 dòng). Nội dung hợp đồng không đổi.
- **File thêm ngoài danh sách của plan** (đều trong `e2e/`): `support/paths.js` (đường dẫn dùng chung cho spec, global setup và reporter, vì hai nơi sau chạy ngoài worker nên không import được `driver.js`), `pages/listing-edit-page.js` (đọc trang sửa cơ sở cho TC_HDB_05, 07).
- `useDriver()` đổi tên thành `browserSession()`: oxlint coi tên `use*` là React Hook và báo lỗi `rules-of-hooks`.
- Server của test dùng cache Vite riêng `node_modules/.vite-e2e`, để không đụng cache của `npm run dev` nếu đang chạy.
- Check "thumbnail" (TC_HDB_01) chờ ảnh tải xong (`naturalWidth > 0`), không chỉ có thẻ `<img>`.
- Reporter không ghi đè CSV khi lần chạy không có case `TC_` nào (ví dụ chỉ chạy smoke).
- Hai unit test trong `e2e/support/__tests__/` chạy ở môi trường `node` (`// @vitest-environment node`), vì config gốc dùng jsdom và `import.meta.url` không phải `file:`.
- TDD: unit test soft-check và 8 spec Danh sách được viết trước, nhưng lần chạy đỏ chỉ làm cho Phase 1, smoke (thiếu `baseUrl`) và `sheet-rows`. Soft-check và page object Danh sách được viết ngay sau test, không chạy bước đỏ riêng.

### Còn lại

- `npx vitest run` (config gốc) có 1 test đỏ: `src/components/common/__tests__/StateComponents.test.jsx` ("renders ErrorModal popup…"). Test này đã đỏ trước plan (kiểm bằng `git stash`). File dùng chung, ngoài phạm vi nên không sửa.
- Chưa chạy với backend thật (chưa có backend). Khi có, chạy lại theo `e2e/README.md` để đánh Pass chính thức.

## Red Team Review

Rà soát ngay trong phiên, không dùng subagent (theo yêu cầu cũ của Quân). Xét 3 góc: giả định sai, lỗi khi chạy, bảo mật.

| # | Mức | Phát hiện | Bằng chứng | Kết luận |
|---|---|---|---|---|
| R1 | Trung bình | `lucide-react` v1 không gắn class `lucide-lock`, nên tìm icon bằng class sẽ luôn báo "không có icon", kể cả khi sau này có icon | `node_modules/lucide-react/dist/esm/Icon.mjs:51` | Nhận. Phase 4 check 01.4 tìm icon theo hình vẽ (path) |
| R2 | Trung bình | Trang edit ở chế độ chỉ đọc hiện chữ thay cho ô nhập, nên check "không ô nào sửa được" sẽ đúng ngay cả khi trang trống | `BasicInfoStep.jsx:14-30` | Nhận. Phase 3 check 05.4 thêm điều kiện phải thấy tên cơ sở |
| R3 | Trung bình | Máy chậm thì khoảng cách giữa 2 lần gõ có thể ≥400ms, làm TC_HDB_03 Fail oan | `HostDashboardPage.jsx:26`, `:289-303` | Nhận. Phase 3 check 03.1: không đo được thì ghi `Error`, không ghi `Fail` |
| R4 | Trung bình | Gõ phím vào ô `readOnly` có thể làm chromedriver ném lỗi, thành `Error` oan | `HostProfilePage.jsx:194`, `:209` | Nhận. Phase 4 check 01.5 coi lỗi đó là "không sửa được" |
| R5 | Thấp | Dừng bằng Ctrl+C có thể bỏ lại `chromedriver` | Phase 2 `useDriver()` chỉ `quit` ở `afterAll` | Nhận. README hướng dẫn `pgrep`, rồi `kill` đúng PID |
| R6 | Thấp | Danh sách mobile có trùng `data-testid` với bảng desktop không | Mobile dùng `mobile-actions-<mã>` (`HostDashboardPage.jsx:674`), desktop dùng `actions-<mã>` (`:627`) | Bỏ: không trùng |
| R7 | Thấp | Token có lộ qua ảnh chụp màn hình không | Token chỉ nằm trong `localStorage`, không hiện trên giao diện | Bỏ |

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01…04
- Decision deltas checked: 6 (R1–R5, cách đọc sheet đã chốt)
- Reconciled stale references: 3 (chữ "câu hỏi mở" ở Phase 3 và 4, selector `svg.lucide-lock`)
- Unresolved contradictions: 0

## Validation Log

### Verification Results
- Tier: Standard (4 phase): Fact Checker + Contract Verifier
- Claims checked: 38. Verified: 37. Failed: 1. Unverified: 0
- Failed (đã sửa): selector `svg.lucide-lock` không tồn tại ở `lucide-react` 1.55 (R1)
- Mẫu đã kiểm: số dòng trong `HostDashboardPage.jsx` (`:26`, `:140`, `:166`, `:276-279`, `:289-303`, `:576-582`, `:627`, `:720`, `:744`), `HostProfilePage.jsx` (`:154`, `:172`, `:192-213`, `:236`, `:306-330`, `:414`), `ConfirmDialog.jsx:16-25`, `:35`, `:90`, `:143`, `Toast.jsx:10-15`, `enums.js:14-20`, `ListingEditor.jsx:197`, `:632`, `Sidebar.jsx:46`, `:108`, `HostLayout.jsx:73-74`, `hostMockApi.test.jsx:53-56`, `:82-88`, Excel API dòng 25–27, 33–35; `vite` ưu tiên `process.env` (`node.js:6091`); Vitest có `inject`, `project.provide`, `onTestRunEnd`, `TestCase.meta()`; Vite có `server.warmup`, `warmupRequest`

### Câu hỏi đã hỏi
| Câu | Trả lời |
|---|---|
| Ngôn ngữ | JavaScript |
| Sheet lệch code | Đúng nguyên văn sheet |
| Dữ liệu | Mock, ghi "Pass (mock)" |
| Tab 'Tất cả' | Đòi `?trangThai=ALL` |
| CCCD | 12 ký tự đã che |
