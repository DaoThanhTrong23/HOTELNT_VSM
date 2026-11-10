---
phase: 3
title: "8 case Danh sách CSLT"
status: completed
priority: P1
effort: "4h"
dependencies: [2]
---

# Phase 3: 8 case Danh sách CSLT (TC_HDB_01–08)

## Goal

Viết `e2e/host/host-dashboard.e2e.js` gồm 8 test, mỗi test kiểm **từng ý** trong cột Expected Result (và Post-condition khi có ý kiểm được) của sheet, giữ nguyên văn (Q2). Mỗi ý là một `check()`. Kết quả từng ý ghi vào `task.meta.checks`.

## Scout trước khi làm (bắt buộc với `--deep`)

```bash
grep -n "data-testid\|aria-label\|type=\"search\"\|<th" src/pages/host/HostDashboardPage.jsx
grep -n "role=\|confirmLabel\|cancelLabel\|VARIANTS" -A2 src/pages/host/components/ConfirmDialog.jsx
grep -n "HOTEL_STATUS_LABELS" -A7 src/constants/enums.js
grep -n "toLocaleDateString" -A5 src/utils/formatters.js
```

Đo ngày 2026-11-09 (dòng có thể lệch nếu code đổi):

| Thứ cần tìm | Selector | Nguồn |
|---|---|---|
| Bảng, hàng | `[data-testid="desktop-data-table"]`, `[data-testid="desktop-table-row"]` | `HostDashboardPage.jsx` |
| Tab trạng thái | `[data-testid="filter-chip-<ALL\|DRAFT\|PENDING\|APPROVED\|REJECTED\|HIDDEN>"]` | `:720` |
| Ô tìm kiếm | `input[type="search"]` (placeholder "Tìm theo tên cơ sở") | `:744-748` |
| Cụm nút của hàng | `[data-testid="actions-<maCSLT>"]`, gồm các `<a>` (Xem, Sửa) và `<button>` (Rút lại, Xóa) | `:140-160`, `:627` |
| Nhãn trạng thái | `span` bo tròn có chữ trong hàng: 'Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Bị từ chối', 'Ẩn' | `src/constants/enums.js:14-20`, `StatusBadge.jsx` |
| Hộp xác nhận | `[role="alertdialog"]`. Nút hủy 'Hủy', nút xác nhận là nút cuối | `ConfirmDialog.jsx:35`, `:90`, `:143` |
| Toast | `[data-testid="host-toast"]` (`role="status"` khi thành công) | `Toast.jsx:10-11` |
| Tiêu đề cột | 'Tên cơ sở', 'Phường/Xã', 'Giá tham khảo', 'Ngày tạo', 'Cập nhật', 'Trạng thái', 'Thao tác' | `:576-582` |

Dữ liệu mock (Phase 1): mã 1 Đã duyệt, 2 Bị từ chối, 3 Chờ duyệt, 4 Ẩn, 5 Bản nháp. Mã 1, 3, 5 cùng tên "Sea Breeze Homestay", nên luôn tìm hàng theo nhãn trạng thái (D8) và lấy mã từ `data-testid="actions-<mã>"`.

## Cách đọc sheet → check

Quy ước:
- So chữ dùng `normalizeText()`: gộp khoảng trắng, bỏ dấu chấm cuối, so `includes` (nguyên văn nhưng không bắt lỗi khoảng trắng).
- So màu so mã hex sau khi chuyển từ `getComputedStyle`.
- "Nút X" là phần tử bấm được (`a` hoặc `button`) có chữ X.
- Khi sheet bảo bấm một nút không tồn tại: ghi check sai "Không có nút 'X' (nút hiện có: …)". Sau đó bấm nút thật theo danh sách sửa ngày 08/11 để kiểm tiếp các ý sau (D4), và ghi vào `meta.notes`.

### TC_HDB_01: bảng danh sách và 4 thẻ thống kê

Bước: mở `/host/dashboard`, chờ bảng có hàng.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 01.1 | "Hiển thị 4 thẻ thống kê (Tổng số, Đang hiển thị, Chờ duyệt, Bị từ chối)" | Với từng nhãn, tìm phần tử có chữ đúng bằng nhãn, nằm **ngoài** `filter-chip-*` và ngoài bảng. Phải đủ 4 | Sai: không có thẻ nào, không có chữ 'Tổng số', 'Đang hiển thị' |
| 01.2 | "Bảng hiển thị thumbnail" | Mỗi hàng có `img` hoặc `[data-testid="thumbnail-placeholder"]` | Đúng |
| 01.3 | "tên CSLT" | Mỗi hàng có tên khác rỗng | Đúng |
| 01.4 | "ngày tạo" | Có cột 'Ngày tạo', mỗi hàng có ngày dạng `dd/mm/yyyy` | Đúng |
| 01.5 | "StatusBadge đúng màu sắc Figma" | Màu chữ của nhãn: Đã duyệt `#15803D`, Chờ duyệt `#B45309`, Bị từ chối `#DC2626` (D7). Bản nháp và Ẩn không có token Figma nên không kiểm, ghi vào notes | Sai: Chờ duyệt là `#D97706` |

### TC_HDB_02: chuyển 6 tab trạng thái

Bước: mở `/host/dashboard`, bấm lần lượt 'Tất cả', 'Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Bị từ chối', 'Ẩn'.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 02.1–02.6 | "URL cập nhật query param ?trangThai=..." | Sau mỗi lần bấm, URL có `trangThai=<mã tab>`. Tiêu đề case liệt kê `ALL`, nên tab 'Tất cả' cần `trangThai=ALL` | Sai ở 'Tất cả': URL không có `trangThai`. 5 tab còn lại đúng |
| 02.7–02.12 | "Bảng lọc chính xác các cơ sở theo đúng trạng thái đã chọn" | Mọi hàng có nhãn đúng trạng thái của tab. 'Tất cả' có đủ 5 trạng thái. Ở chế độ mock: 'Tất cả' có 5 hàng, mỗi tab còn lại 1 hàng | Đúng |

### TC_HDB_03: tìm kiếm có debounce

Dữ liệu: 'Breeze'.

Bước:
1. Mở trang. Chạy script để: đặt `window.__e2e = { marker: true, inputs: [], urlChanges: [] }`, nghe sự kiện `input` của ô tìm kiếm, bọc `history.pushState`/`replaceState` để ghi thời điểm và URL.
2. `sendKeys('Breeze')`.
3. Chờ tối đa 3 giây đến khi URL có `keyword=Breeze`.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 03.1 | "chờ 400ms sau khi người dùng ngừng gõ mới gửi request" | (thời điểm URL đổi sang có keyword) − (thời điểm `input` cuối) ≥ 395ms. Cho lệch 5ms vì bộ đếm giờ. Chỉ có **một** lần đổi URL kèm keyword, tức không gửi theo từng ký tự. Nếu khoảng cách giữa hai lần gõ liên tiếp đã ≥ 400ms (máy chậm) thì không đo được: ném lỗi thường để case thành `Error`, không ghi `Fail` | Đúng |
| 03.2 | "không … reload cả trang" | `window.__e2e.marker` vẫn còn | Đúng |
| 03.3 | "URL cập nhật query params" (Post-condition) | URL có `keyword=Breeze` | Đúng |
| 03.4 | "Danh sách kết quả hiển thị đúng theo tiêu chí lọc" (Post-condition) | Mọi hàng có tên chứa 'breeze' (không phân biệt hoa thường), có ít nhất 1 hàng. Ở chế độ mock thì đúng 3 hàng | Đúng |

Notes: ở chế độ mock không có request mạng. App gọi API danh sách ngay khi `keyword` trên URL đổi (`HostDashboardPage.jsx:276-279` đọc bộ lọc từ URL, `:289-303` đẩy từ khóa lên URL sau 400ms, `:48-71` gọi API theo bộ lọc), nên đo thời điểm URL đổi.

### TC_HDB_04: nút của cơ sở Đã duyệt

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 04.1 | "Hiển thị 2 nút: 'Xem' … và 'Sửa' …" | Cụm nút của hàng Đã duyệt có đúng 2 phần tử, chữ là {'Xem', 'Sửa'} | Đúng |
| 04.2 | "'Xem' (mở /hotel/:id)" | Bấm 'Xem' thì path là `/hotel/<mã>`. Quay lại | Đúng |
| 04.3 | "'Sửa' (mở /host/hotels/:id/edit)" | Bấm 'Sửa' thì path là `/host/hotels/<mã>/edit` | Đúng |

### TC_HDB_05: nút của cơ sở Chờ duyệt

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 05.1 | "Hiển thị nút 'Xem' … và nút 'Rút lại'" | Chữ các nút là {'Xem', 'Rút lại'} | Đúng |
| 05.2 | "'Rút lại' (màu cảnh báo)" | Màu chữ, viền hoặc nền của nút bằng `#B45309` | Sai: chữ `#000000`, viền `#CBD5E1` |
| 05.3 | "'Xem' (dẫn đến trang edit …)" | Bấm 'Xem' thì path là `/host/hotels/<mã>/edit` | Đúng |
| 05.4 | "… ở chế độ Read-only" | Trên trang edit, không còn ô nào sửa được: mọi `input`, `textarea`, `select` đang hiện trong `main` đều `disabled` hoặc `readOnly`. Ở chế độ chỉ đọc, `BasicInfoStep` hiện chữ thay cho ô nhập (`BasicInfoStep.jsx:14-30`) và checkbox tiện ích bị `disabled` (`PriceAmenitiesStep.jsx:13`). Phải có ít nhất tên cơ sở hiện ra, để không kết luận đúng chỉ vì trang trống | Đúng (trang của Trọng, TC_EDT_10) |

### TC_HDB_06: rút lại yêu cầu kiểm duyệt

Dữ liệu sheet: "Mã cơ sở = 12". Mock không có mã 12, nên dùng hàng Chờ duyệt (mã 3) và ghi vào notes.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 06.1 | "Popup ConfirmDialog hiển thị cảnh báo" | Bấm 'Rút lại' thì có `[role="alertdialog"]`, có tiêu đề và icon cảnh báo (`svg` trong khối icon) | Đúng |
| 06.2 | Bước 3 "Click 'Xác nhận rút'" | Trong hộp có nút chữ 'Xác nhận rút' | Sai: chỉ có 'Hủy', 'Rút lại'. Bấm 'Rút lại' để kiểm tiếp |
| 06.3 | "cơ sở chuyển trạng thái từ PENDING về BẢN NHÁP (DRAFT)" | Hàng `actions-<mã>` có nhãn 'Bản nháp'. Số trên tab 'Chờ duyệt' giảm 1, 'Bản nháp' tăng 1 | Đúng |

### TC_HDB_07: nút của cơ sở Bị từ chối

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 07.1 | "nút 'Xem & sửa' … và nút 'Xóa'" | Chữ các nút là {'Xem & sửa', 'Xóa'} | Đúng |
| 07.2 | "'Xóa' (màu đỏ)" | Màu chữ của 'Xóa' là `#DC2626` | Đúng |
| 07.3 | "'Xem & sửa' (mở trang edit …)" | Bấm thì path là `/host/hotels/<mã>/edit` | Đúng |
| 07.4 | "… để sửa theo lý do từ chối" | Trang edit có banner `Lý do: <lyDoTuChoi>` (`ListingEditor.jsx:632`; ở chế độ mock là câu của mã 2), và ô 'Tên cơ sở lưu trú' là `input` sửa được | Đúng |

### TC_HDB_08: xóa cơ sở Bản nháp và Bị từ chối

Chạy 2 lượt trong cùng một test, mỗi lượt bắt đầu bằng `driver.get` (kho mock reset): lượt 1 với hàng Bản nháp, lượt 2 với hàng Bị từ chối. Check ghi kèm hậu tố `[DRAFT]` hoặc `[REJECTED]`.

| Check | Ý trong sheet | Cách kiểm | Dự đoán |
|---|---|---|---|
| 08.1 | "Bật ConfirmDialog màu đỏ" | Bấm 'Xóa' thì có `[role="alertdialog"]`, nút xác nhận có nền `#DC2626` | Đúng |
| 08.2 | "cảnh báo xóa vĩnh viễn cơ sở cùng toàn bộ ảnh/video" | Mô tả chứa 'xóa vĩnh viễn', 'toàn bộ ảnh' và 'video' | Đúng |
| 08.3 | Bước 3 "Bấm 'Xác nhận xóa'" | Có nút chữ 'Xác nhận xóa' | Sai: nút là 'Xóa cơ sở'. Bấm nút đó để kiểm tiếp |
| 08.4 | "cơ sở bị xóa khỏi danh sách" | Không còn `actions-<mã>`. Số trên tab 'Tất cả' giảm 1 | Đúng |
| 08.5 | "toast thông báo xanh" | Toast hiện, màu chữ `#15803D` | Đúng |

## Files to Create / Modify

| File | Thao tác | Ước lượng | Ảnh hưởng test |
|---|---|---|---|
| `e2e/pages/dashboard-page.js` | Thêm: `tab(key)`, `rowByStatus(label)` → `{ el, id }`, `actionsOf(id)`, `statusLabelOf(id)`, `tabCount(key)`, `search()`, `dialog()`, `toast()`, `columnHeaders()` | ~90 | — |
| `e2e/host/host-dashboard.e2e.js` | Tạo: 8 test `TC_HDB_0X: <tên case trong sheet>` | ~260 | Spec viết trước |

## Tests Before (red)

Viết cả 8 test trước khi thêm hàm vào page object, rồi chạy thì đỏ vì thiếu hàm. Sau đó viết page object cho đến khi **kết quả từng ý khớp cột "Dự đoán"** ở trên. "Xanh" ở phase này nghĩa là test cho kết luận đúng, không phải mọi case đều Pass.

## Tests After

- 3 case Pass (mock) (TC_HDB_03, 04, 07). 5 case Fail (TC_HDB_01, 02, 05, 06, 08), với `meta.checks` khớp các ô "Sai" ở trên. Không case nào `Error`.
- Đối chứng âm (dùng ở Phase 4): chạy `E2E_TARGET=backend` khi chưa có backend thì cả 8 case Fail hoặc Error, không case nào Pass.
- Chạy 3 lần liên tiếp, kết quả giống nhau (TC_HDB_03 đo thời gian nên cần kiểm độ ổn định).

## Regression gate

```bash
npx vitest run --config e2e/vitest.config.js e2e/host/host-dashboard.e2e.js
npx vitest run src/pages/host
npm run lint
```

## Todo

- [x] Chạy lệnh scout, cập nhật bảng selector nếu code đã đổi
- [x] Viết 8 test theo bảng check (đỏ)
- [x] Bổ sung page object cho đến khi kết quả khớp dự đoán
- [x] Chạy 3 lần liên tiếp, kết quả ổn định
- [x] Commit `test(e2e): cover host dashboard cases TC_HDB_01-08`

## Success Criteria

- `e2e/reports/results.json` có 8 test `TC_HDB_*`, mỗi test có `meta.checks` với nhãn như trên.
- Kết quả từng ý trùng cột "Dự đoán". Nếu khác thì dừng lại, ghi vào báo cáo kèm ảnh chụp màn hình, **không sửa kỳ vọng để test xanh**.

## Risks

| Rủi ro | Cách xử lý |
|---|---|
| Đo debounce sai vì máy chậm | Đo ngay trong trình duyệt bằng `performance.now()`, không đo bằng thời gian của Selenium. Chỉ kiểm cận dưới (≥395ms) và số lần đổi URL |
| Trang `/hotel/:id` (Tourist) hay trang edit (Trọng) lỗi ở chế độ mock | Chỉ kiểm path, cùng các ý sheet nêu rõ (Read-only, lý do từ chối). Nếu trang của người khác lỗi thì ghi Fail kèm ảnh, báo đúng người phụ trách |
| Toast tự tắt trước khi kịp đọc màu | Đọc toast ngay sau khi bấm xác nhận, chờ hiện tối đa 3 giây |
| Hiểu `trangThai=ALL` theo nghĩa chặt quá | Quân đã chốt đọc chặt (`plan.md`, mục "Cách đọc sheet"). Check 02.1 và notes ghi rõ cách đọc, để người giữ sheet thấy |
