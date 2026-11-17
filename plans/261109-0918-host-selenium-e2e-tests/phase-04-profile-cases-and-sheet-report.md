---
phase: 4
title: "3 case Hồ sơ và file kết quả cho sheet"
status: completed
priority: P1
effort: "3h"
dependencies: [2, 3]
---

# Phase 4: 3 case Hồ sơ (TC_PRF_01–03) và file kết quả cho sheet

## Goal

Viết `e2e/host/host-profile.e2e.js` (3 test), cùng một reporter để cuối mỗi lần chạy tạo `e2e/reports/host-results.csv`, dán được thẳng vào cột Actual Result / Status / Notes của tab "TC - Host (Chủ cơ sở)". Viết `e2e/README.md`, chạy đủ 11 case, chạy đối chứng âm, rồi báo kết quả cho Quân.

## Scout trước khi làm

```bash
grep -n "id=\"profile-\|id={\`password-\|readOnly\|Lưu thông tin\|Cập nhật mật khẩu\|showToast" src/pages/host/HostProfilePage.jsx
grep -n "user?.name\|<aside" src/components/common/Sidebar.jsx
grep -n "Sidebar\|hidden md:flex" src/layouts/HostLayout.jsx
```

Đo ngày 2026-11-09:

| Thứ cần tìm | Selector | Nguồn |
|---|---|---|
| Họ tên, SĐT | `#profile-hoTen`, `#profile-soDienThoai` | `HostProfilePage.jsx:154`, `:172` |
| CCCD, Email (chỉ đọc) | `#profile-cccd`, `#profile-email`, có thuộc tính `readOnly` | `:192-198`, `:207-213` |
| Nút lưu hồ sơ | chữ 'Lưu thông tin' | `:236` |
| Mật khẩu | `#password-oldPassword`, `#password-newPassword`, `#password-confirmPassword`, lỗi ở `#password-<tên>-error` | `:306-320` |
| Nút đổi mật khẩu | chữ 'Cập nhật mật khẩu', bị tắt khi còn lỗi | `:330` |
| Toast | `[data-testid="host-toast"]`. Thành công: 'Cập nhật thông tin thành công' | `:414`, `Toast.jsx:11` |
| Tên trên Sidebar | `aside` → chữ `user?.name`. Sidebar chỉ hiện từ `md` trở lên, nên màn 1440 có Sidebar | `Sidebar.jsx:46`, `:108`; `HostLayout.jsx:73-74` |

Dữ liệu mock (Phase 1): hồ sơ `Nguyễn Văn Host` / `0905123456` / `host.demo@hotelnt.vn` / `079******234`, mật khẩu hiện tại `MOCK_HOST_PASSWORD`. Tên trong phiên đăng nhập (Phase 2) là `Chủ cơ sở HotelNT`.

Nhập chữ vào ô React: không dùng `clear()` vì có thể không kích hoạt `onChange`. Viết helper `replaceText(el, text)`: chọn hết bằng `Keys.COMMAND` trên macOS hoặc `Keys.CONTROL` trên máy khác, bấm `BACK_SPACE`, rồi `sendKeys(text)`. Sau đó đọc lại `value` để chắc giá trị đã vào.

## Cách đọc sheet → check

### TC_PRF_01: hiển thị hồ sơ, khóa Email và CCCD

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 01.1 | "Hiển thị đầy đủ Họ tên, SĐT, Email, CCCD" | 4 ô đều có giá trị khác rỗng | Đúng |
| 01.2 | "CCCD (12 số)" | Giá trị CCCD có đúng 12 ký tự là chữ số hoặc `*`. API trả CCCD đã che (Excel dòng 25, SRS FR-13). Quân chốt cách đọc này ngày 2026-11-09 | Đúng |
| 01.3 | "BẮT BUỘC BỊ KHÓA (Read-only)" | `#profile-email` và `#profile-cccd` có `readOnly` hoặc `disabled` | Đúng |
| 01.4 | "có icon ổ khóa xám" | Trong khối của từng ô (label + input) có một `svg` là ổ khóa, và màu là xám (`#64748B` hoặc các mã slate/gray khác). `lucide-react` v1.55 không gắn class `lucide-lock` (`node_modules/lucide-react/dist/esm/Icon.mjs:51`), nên nhận diện ổ khóa bằng `path[d^="M7 11V7"]` (hình quai khóa của icon Lock, `icons/lock.mjs`, cả `lock-keyhole`), hoặc bằng `aria-label`/`title` có chữ "khóa" | Sai: không có icon |
| 01.5 | "không thể click chỉnh sửa" | Bấm vào ô rồi gõ 'x', giá trị không đổi. Nếu chromedriver ném `InvalidElementState` hoặc `ElementNotInteractable` thì cũng coi là không sửa được (đúng) | Đúng |

### TC_PRF_02: cập nhật họ tên và SĐT

Bước: thay Họ tên bằng 'Nguyễn Văn Host Mới', SĐT bằng '0905999888', bấm 'Lưu thay đổi'.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 02.1 | Bước 3 "Bấm 'Lưu thay đổi'" | Có nút chữ 'Lưu thay đổi' | Sai: nút là 'Lưu thông tin'. Bấm nút đó để kiểm tiếp |
| 02.2 | "Hệ thống lưu thành công" | Không có banner lỗi. Hai ô giữ giá trị mới | Đúng |
| 02.3 | "Toast xanh 'Cập nhật thông tin thành công'" | Toast có chữ đó, màu chữ `#15803D` | Đúng |
| 02.4 | "Tên trên thanh Sidebar/Navbar tự động cập nhật" | `aside` có chữ 'Nguyễn Văn Host Mới' | Sai: vẫn là 'Chủ cơ sở HotelNT'. `AuthContext` không có hàm cập nhật user, và Sidebar đọc `user.name`. Đây là file dùng chung, ngoài phạm vi |

### TC_PRF_03: kiểm lỗi form đổi mật khẩu

Bước và dữ liệu: mật khẩu cũ sai `'SaiMatKhau@1'`, mật khẩu mới `'Ab1@'` (dưới 8 ký tự), xác nhận `'Ab1@x'` (không khớp), bấm 'Lưu'.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 03.1 | Bước 4 "Bấm Lưu" | Trong khối đổi mật khẩu có nút chữ đúng 'Lưu' và bấm được | Sai: chỉ có 'Cập nhật mật khẩu', và nút đang tắt |
| 03.2 | "Mật khẩu cũ không chính xác" | Có câu này dưới ô mật khẩu cũ | Sai: câu này chỉ hiện sau khi gửi lên server |
| 03.3 | "Mật khẩu mới phải từ 8 ký tự trở lên" | Có câu này dưới ô mật khẩu mới | Sai: câu hiện ra là 'Còn thiếu: ít nhất 8 ký tự' |
| 03.4 | "Mật khẩu xác nhận không trùng khớp" | Có câu này dưới ô xác nhận | Sai: câu hiện ra là 'Xác nhận mật khẩu mới không trùng khớp.' |

Ghi vào notes, không tính vào kết quả:
- Post-condition "Mật khẩu mới được cập nhật, yêu cầu đăng nhập lại" mô tả trường hợp đổi thành công, không áp dụng cho dữ liệu sai của case này.
- Theo D4, test chạy thêm một lượt: mật khẩu cũ sai, mật khẩu mới hợp lệ `'Abcdefg1_'`, xác nhận khớp, bấm 'Cập nhật mật khẩu'. Ghi lại câu lỗi xuất hiện (dự đoán 'Mật khẩu cũ không chính xác.'), để người giữ sheet thấy câu này có tồn tại, chỉ là cần bước khác.

## File kết quả cho sheet

Reporter `e2e/support/sheet-reporter.js` dùng `onTestRunEnd(testModules)` của Vitest. Với mỗi test có tên bắt đầu bằng `TC_`, nó lấy `name`, `result().state`, `result().errors` và `meta()`, chuyển thành dạng đơn giản rồi gọi `buildSheetRows()` trong `e2e/support/sheet-rows.js`, sau đó ghi CSV có BOM UTF-8 (Excel và Google Sheets đều đọc đúng tiếng Việt).

| Cột CSV | Ứng với cột trong sheet | Cách điền |
|---|---|---|
| `Test Case#` | A | Mã đầu tên test |
| `Actual Result` | H | Pass: "Đúng như kỳ vọng (N/N ý)". Fail: các ý sai nối bằng "; ", dạng "<ý trong sheet>: <thực tế>". Error: dòng đầu của lỗi |
| `Status` | I | `Pass (mock)` / `Fail (mock)` khi `meta.target === 'mock'`. `Pass` / `Fail` khi `backend`. `Error` khi lỗi không phải `SoftCheckFailure`. `Not Run` khi bị bỏ qua |
| `Notes` | J | `meta.notes` + đường dẫn ảnh chụp khi không Pass |

Thứ tự dòng: TC_HDB_01…08 rồi TC_PRF_01…03, đúng thứ tự trong sheet.

## Files to Create / Modify

| File | Thao tác | Ước lượng | Ảnh hưởng test |
|---|---|---|---|
| `e2e/pages/profile-page.js` | Tạo: `open()`, `field(id)`, `replaceText()`, `button(text)`, `toast()`, `sidebarText()`, `errorOf(id)` | ~70 | — |
| `e2e/host/host-profile.e2e.js` | Tạo: 3 test `TC_PRF_0X: …` | ~150 | Spec viết trước |
| `e2e/support/sheet-rows.js` | Tạo: `buildSheetRows(cases)`, `toCsv(rows)` | ~60 | Unit test bên dưới |
| `e2e/support/__tests__/sheet-rows.test.js` | Tạo (viết trước) | ~70 | Chạy bằng config gốc |
| `e2e/support/sheet-reporter.js` | Tạo: chuyển TestCase → dạng đơn giản, ghi CSV | ~35 | — |
| `e2e/vitest.config.js` | Sửa: thêm reporter `./support/sheet-reporter.js` | 1 dòng | — |
| `e2e/README.md` | Tạo: cách chạy, biến môi trường, cách dán vào sheet, dọn cổng | ~60 | — |

## Tests Before (red)

1. `sheet-rows.test.js`:
   - Một test passed có `meta.target = 'mock'` cho ra `Pass (mock)`.
   - Một test failed có `meta.softFailed` cho ra `Fail (mock)`, và Actual Result liệt kê đủ các ý sai.
   - Một test failed vì timeout, không có `softFailed`, cho ra `Error`.
   - Target là `backend` thì không có hậu tố "(mock)".
   - Test không bắt đầu bằng `TC_` (smoke) bị bỏ ra.
   - Thứ tự dòng theo mã case.
   - `toCsv` bọc dấu `"` và xuống dòng đúng chuẩn RFC 4180, và có BOM.
2. `host-profile.e2e.js`: viết 3 test trước page object, chạy thì đỏ.

## Implementation Steps

1. Viết `sheet-rows.test.js` (đỏ), rồi `sheet-rows.js` (xanh).
2. Viết 3 test hồ sơ (đỏ), rồi `profile-page.js` cho đến khi kết quả từng ý khớp cột "Dự đoán".
3. Viết `sheet-reporter.js`, thêm vào config.
4. Chạy đủ: `npx vitest run --config e2e/vitest.config.js`. Đối chiếu `host-results.csv` với bảng dự đoán trong `plan.md`.
5. Đối chứng âm: `E2E_TARGET=backend npx vitest run --config e2e/vitest.config.js`. Khi chưa có backend thì không có case nào `Pass`.
6. Viết `e2e/README.md` (tiếng Việt):
   - lệnh chạy;
   - `E2E_BROWSER`, `E2E_HEADED=1`, `E2E_TARGET`, `E2E_HOST_TOKEN`;
   - lần đầu cần mạng để tải Chrome;
   - dán CSV vào cột H–J của tab Host;
   - chế độ mock chỉ ghi "Pass (mock)", theo quy ước 08/11;
   - danh sách dữ liệu cần chuẩn bị khi chạy với backend: tài khoản test, đủ 5 trạng thái, một cơ sở Chờ duyệt để rút lại, một Bản nháp và một Bị từ chối để xóa. Kèm cảnh báo rằng TC_HDB_06 và 08 sẽ đổi dữ liệu thật;
   - nếu báo cổng 5199 bận thì `lsof -i :5199`;
   - nếu dừng giữa chừng bằng Ctrl+C thì kiểm `pgrep -fl chromedriver`, rồi `kill <PID>` đúng tiến trình của lần chạy đó. Không dùng `pkill` theo mẫu rộng.
7. Kiểm dọn dẹp: cổng 5199 trống, không còn `chromedriver`.
8. Gửi Quân bảng kết quả 11 case, kèm đường dẫn CSV và ảnh chụp.

## Tests After

- `sheet-rows.test.js` xanh.
- 11 case: 3 `Pass (mock)` (TC_HDB_03, 04, 07), 8 `Fail (mock)`, 0 `Error`, khớp bảng trong `plan.md`.
- Đối chứng âm: 0 `Pass`.

## Regression gate

```bash
npx vitest run                                   # unit test cả repo (src + e2e/support)
npx vitest run --config e2e/vitest.config.js     # 11 case + smoke, tạo CSV
lsof -i :5199 || echo "port free"
npm run lint && npm run build
git status --short                               # chỉ có file trong phạm vi của plan.md
```

## Todo

- [x] `sheet-rows` (đỏ → xanh)
- [x] 3 test hồ sơ (đỏ), page object (xanh theo dự đoán)
- [x] Reporter tạo CSV
- [x] Chạy đủ 11 case, đối chiếu dự đoán
- [x] Đối chứng âm với `E2E_TARGET=backend`
- [x] `e2e/README.md`
- [x] Commit `test(e2e): cover host profile cases and export sheet results`
- [x] Báo kết quả cho Quân, cập nhật trạng thái plan

## Success Criteria

- Một lệnh tạo `e2e/reports/host-results.csv` có đủ 11 dòng, dán vào sheet không lỗi font.
- Mỗi dòng Fail nêu đủ ý sai, ghi bằng chữ của sheet kèm giá trị thực tế, để người giữ sheet sửa được ngay.

## Risks

| Rủi ro | Cách xử lý |
|---|---|
| `sendKeys` gõ tiếng Việt có dấu bị lỗi | Đọc lại `value` sau khi gõ. Nếu sai thì gán giá trị bằng native setter rồi phát sự kiện `input` (ghi notes) |
| Reporter chạy trước khi `meta` được ghi | `meta` được ghi trong thân test, trước khi test kết thúc. `onTestRunEnd` chạy sau tất cả test |
| Người dán nhầm "Pass (mock)" thành Pass chính thức | README và Notes đều ghi rõ. Cột Status giữ chữ "(mock)" |

## Security

Không ghi token hay mật khẩu thật vào CSV, notes hay ảnh. Mật khẩu trong test là dữ liệu mock. Ở chế độ backend, README hướng dẫn dùng tài khoản test riêng.
