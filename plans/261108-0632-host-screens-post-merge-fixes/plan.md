---
title: "Sửa 4 màn Host của Quân sau khi merge deverlop (Màn 11, 12, 13 + Hồ sơ)"
description: "Gỡ chế độ báo thành công giả khi mất mạng (chỉ còn dữ liệu giả khi VITE_USE_MOCK=true), sửa lỗi bắt cứng 403/404, lý do từ chối bịa sẵn, danh mục tự đặt, chốt giá tối thiểu 50.000 theo SRS, bổ sung test còn thiếu và xuất danh sách sửa file test case."
status: completed
priority: P1
effort: 10h
branch: feature/quan-dashbds
tags: [bugfix, frontend, tdd]
blockedBy: []
blocks: []
created: 2026-11-08
---

# Sửa 4 màn Host sau khi merge `deverlop`

## Overview

Plan này sửa các vấn đề ghi trong báo cáo [`plans/reports/261108-1316-host-screens-post-merge-audit-report.md`](../reports/261108-1316-host-screens-post-merge-audit-report.md). Các vấn đề đến từ commit `a27dec5` và `eb1af0a` của Trọng, đã vào `deverlop`.

- **Phần A (code):** làm ở Phase 1–4.
- **Phần B (file test case):** Phase 5 chỉ xuất danh sách sửa, không sửa file Excel.
- **Chia phase:** theo mục 5 của báo cáo.
- **Cách làm:** TDD. Mỗi phase viết test trước, chạy thấy đỏ, rồi mới sửa code.
- **Plan trước:** [`261101-0216-host-dashboard-profile-api-integration/plan.md`](../261101-0216-host-dashboard-profile-api-integration/plan.md). Giữ D2–D5. D1 đổi một phần theo Q2 (xem bảng dưới).

## Bối cảnh (đo ngày 2026-11-08)

| Mục | Giá trị |
|---|---|
| Nhánh | `feature/quan-dashbds` ở `23ae700`, **đi trước `origin/feature/quan-dashbds` 19 commit, chưa push** |
| Backend | Chưa có (`api.hotelnt.com` NXDOMAIN, không có `.env`). Mọi lời gọi thật trả `NETWORK_ERROR` |
| `npx vitest run src/pages/host` | 133/135 qua. Fail `MODEL-05`, `MODEL-09` (A6) |
| `npx oxlint src/pages/host` | 2 warning ở `MediaStep.jsx:146` (A7) |
| `npm run build` | Qua. Dữ liệu giả `"Sea Breeze"` đang nằm trong `dist/assets/index-*.js`. Dữ liệu mock của tourist (`src/mocks/mockListings.js`, đã đặt sau `USE_MOCK`) **cũng nằm trong bundle**, nghĩa là chỉ thêm `if (USE_MOCK)` thì không loại được mock khỏi bản build |
| File chưa commit | `plans/reports/` (báo cáo), `docs/Copy of TestPlan_TestCase_HOTELNT_FE.xlsx` |
| Hai file test case | `docs/Copy of TestPlan_TestCase_HOTELNT_FE.xlsx` (chưa commit) và `docs/HOTELNT_FE_Test_Plan_and_Test_Cases.xlsx` (đã commit ở `0526433`). Tab Host và tab RTM của hai file **giống hệt nhau** (đã so bằng script) |

## Quyết định đã chốt với Quân (2026-11-08)

| # | Câu hỏi | Quân chọn | Hệ quả trong plan |
|---|---|---|---|
| Q1 | Báo thành công giả khi mất mạng (A1, A4, A5) | **(b)** Chỉ bật dữ liệu giả khi `VITE_USE_MOCK=true` | Phase 2. Dữ liệu giả chuyển xuống lớp API (D6). Không bao giờ bật theo mã lỗi |
| Q2 | Giá tối thiểu mặc định (A6) | **(b)** 50.000 theo SRS FR-17 | Phase 3. Giữ `50_000`, sửa `MODEL-05`/`MODEL-09`, ghi lại D1 trong plan 261101 |
| Q3 | Ai sửa tab Host trong file test case | **Chỉ xuất danh sách** gửi người phụ trách | Phase 5 tạo `test-case-change-list.md`. **Không mở, không sửa** file `.xlsx` |
| Q4 | Báo Trọng trước khi gỡ code của Trọng | **Chưa báo**, ghi vào plan | Bước 0 bên dưới |

### Quyết định thiết kế mới

| # | Quyết định | Lý do |
|---|---|---|
| D1′ | Thay D1 ở một điểm: giá mặc định khi `/filter-options` không gửi `priceRange` là **50.000–100.000.000** (trước là 500.000). Phần còn lại của D1 giữ nguyên: 1 ô "Giá tham khảo", giới hạn thật lấy từ `priceRange` | Q2(b) |
| D6 | Dữ liệu giả nằm ở `src/pages/host/api/hostMockApi.js`. `hostApi.js` chuyển 8 hàm của form sang mock khi `USE_MOCK` bật, nạp bằng `import()` động. `ListingEditor`/`MediaStep` không còn nhánh giả nào | Đúng cách `src/services/listingService.js` làm (rẽ nhánh ở lớp service). Q1(b) yêu cầu "không bao giờ bật theo mã lỗi", còn rẽ nhánh trong `catch` thì vẫn là bật theo mã lỗi. Dùng `import()` động vì build hiện tại cho thấy `if (USE_MOCK)` không loại được mock khỏi bundle |
| D7 | Mock theo mã CSLT: `1` Đã duyệt, `2` Bị từ chối, `3` Chờ duyệt, `4` Bị ẩn, `5` Bản nháp (giữ đúng bộ dữ liệu của Trọng); `6` thuộc Host khác (403 `NOT_OWNER`); mã khác trả 404 `LISTING_NOT_FOUND`. Bỏ `?status=` và `?mock=` | Bỏ phần đọc URL trong component (nguyên nhân của A8). Vẫn xem được màn 403/404 ở chế độ mock mà không cần bắt cứng mã |
| D8 | Mock chỉ phủ 8 endpoint mà Trọng đã làm giả: `/filter-options`, chi tiết, tạo, lưu, upload, xóa media, gửi duyệt, rút lại. Danh sách (Màn 11), xóa CSLT và Hồ sơ vẫn gọi API thật kể cả khi bật mock | Không thêm việc ngoài báo cáo. Ghi rõ trong tin nhắn cho Trọng |

## Bước 0: báo Trọng (việc của Quân, không phải code)

- [x] Gửi Trọng tin nhắn dưới đây. **Nên gửi trước Phase 1, bắt buộc trước khi push.** _(2026-11-08: Quân chọn không nhắn riêng. Nội dung tin nhắn được đưa vào mô tả PR vào `deverlop` để Trọng tự đọc.)_

> Trọng ơi, mình sắp sửa lại phần form Thêm/Cập nhật CSLT trong `src/pages/host/` mà Trọng thêm ở `a27dec5` và `eb1af0a`:
> 1. Dữ liệu giả khi mất mạng (tạo/lưu/gửi duyệt/rút lại/upload/xóa ảnh) chuyển sang `src/pages/host/api/hostMockApi.js`. Dữ liệu này **chỉ chạy khi `VITE_USE_MOCK=true`**, giống `listingService`. Khi không bật mock mà mất mạng thì form báo lỗi theo SRS, không báo "đã lưu" nữa. Bộ CSLT mẫu giữ nguyên: 1 Đã duyệt, 2 Bị từ chối, 3 Chờ duyệt, 4 Bị ẩn, 5 Bản nháp, thêm 6 là CSLT của Host khác (403). Bỏ `?status=` và `?mock=`.
> 2. Bỏ đoạn bắt cứng `id === '403'` / `'404'` trong `EditHotelPage.jsx`, vì CSLT có mã 403/404 thật sẽ không mở được. Màn 403/404 vẫn hiện đúng khi API trả `NOT_OWNER` / `LISTING_NOT_FOUND`.
> 3. Banner từ chối/ẩn hiện "Không có ghi chú." khi API không gửi lý do, không dùng câu mẫu.
> 4. Danh mục loại hình/phường/tiện ích mặc định chỉ dùng trong mock. Khi `/filter-options` lỗi thì hiện lỗi kèm nút thử lại.
> 5. Giá tối thiểu giữ 50.000 như Trọng đổi (mình chốt theo SRS).
> Ở chế độ mock, Danh sách CSLT và Hồ sơ vẫn gọi API thật. Trọng cần mock cho hai màn đó thì báo mình nhé.

## Ràng buộc phạm vi

- Chỉ sửa trong `src/pages/host/` và `plans/`. File dùng chung (`src/services`, `src/components`, `src/constants`, `src/mocks`, `src/utils`, `src/layouts`, `src/routes`, `package.json`, `.env*`) chỉ được import.
  - `src/mocks/mockListings.js`: chỉ import `USE_MOCK`.
- Không mở, không sửa file `.xlsx` (Q3).
- Không commit và không push khi Quân chưa bảo. Khi push, nhớ nhánh đang đi trước remote 19 commit.
- Không dùng subagent red-team. Soi lỗi làm trực tiếp, như plan 261101.

## Các vấn đề và phase xử lý

| # | Vấn đề (theo báo cáo) | Mức độ | Phase |
|---|---|---|---|
| A2 | `EditHotelPage.jsx:10-18` bắt cứng id `403`/`404` và `?mock=` | Nặng | 1 |
| A3 | `ListingEditor.jsx:710,716` lý do từ chối/ẩn dùng câu mẫu | Trung bình | 1 |
| A1 | 8 chỗ biến `NETWORK_ERROR`/`TIMEOUT` thành thành công (`ListingEditor.jsx:157,190,380,413,467,497`, `MediaStep.jsx:142,215`) | Nặng | 2 |
| A4 | Danh mục mặc định với mã tự đặt (`listingFormModel.js:21-64`, `:97-100`) | Trung bình | 2 |
| A5 | `getMockListingDetail` trong code chạy thật (`listingFormModel.js:372-494`) | Thấp | 2 |
| A7 | 2 warning lint `MediaStep.jsx:146` | Thấp | 2 |
| **A8** | **Mới, báo cáo chưa ghi:** `ListingEditor.jsx:209` có `location.search` trong deps của effect tải chi tiết. Ở trang Thêm mới, mỗi lần đổi bước thì `?step=` đổi, form tải lại chi tiết và `setValues()` ghi đè dữ liệu chưa lưu | Nặng | 2 |
| A6 | Giá tối thiểu 50.000, `MODEL-05`/`MODEL-09` fail | Thấp | 3 |
| B4 | Tình huống code đã hỗ trợ nhưng chưa có test | — | 4 |
| B1–B4 | Sửa file test case | — | 5 |

## Phases

| # | Phase | Status | Effort | Phụ thuộc |
|---|-------|--------|--------|-----------|
| 1 | [A2 + A3: mở đúng CSLT mã 403/404, lý do trống](./phase-01-edit-access-and-reason-fixes.md) | Pending | 1h | Bước 0 (nên) |
| 2 | [A1 + A4 + A5 + A7 + A8: dữ liệu giả chỉ khi bật `VITE_USE_MOCK`](./phase-02-mock-mode-behind-flag.md) | Pending | 4h | 1 |
| 3 | [A6: giá tối thiểu 50.000 theo SRS](./phase-03-default-min-price-srs.md) | Pending | 0.5h | — |
| 4 | [Bổ sung test cho các tình huống B4 còn thiếu](./phase-04-missing-test-coverage.md) | Pending | 2.5h | 2 |
| 5 | [Danh sách sửa file test case (chỉ xuất, không sửa xlsx)](./phase-05-test-case-change-list.md) | Pending | 2h | 1, 2, 3, 4 |

- **Phase 2 sau Phase 1:** cả hai sửa `ListingEditor.jsx` và `EditHotelPage.test.jsx`, làm tuần tự để tránh xung đột.
- **Phase 3:** không phụ thuộc phase nào, có thể làm trước.
  - Cho đến khi xong Phase 3, cổng kiểm của Phase 1 và 2 chấp nhận **đúng 2 fail đã biết** là `MODEL-05` và `MODEL-09`. Thêm fail nào khác là chặn.
- **Phase 5 làm cuối:** danh sách mô tả hành vi sau khi đã sửa, và dẫn chiếu các mã test mới.

### Deep mode: scout từng phase

Mỗi phase có mục "Scout trước khi làm" gồm lệnh `grep` để lấy lại số dòng thật. Số dòng trong plan là số đo ngày 2026-11-08, sẽ lệch sau mỗi phase.

## File Ownership (toàn bộ trong `src/pages/host/` và `plans/`)

| File | Hành động | Phase |
|---|---|---|
| `EditHotelPage.jsx` | Sửa: bỏ khối bắt cứng 403/404/`?mock=` | 1 |
| `components/listing-form/ListingEditor.jsx` | Sửa: lý do trống (1). Bỏ 6 nhánh giả, import mock, deps `location.search` (2) | 1, 2 |
| `__tests__/EditHotelPage.test.jsx` | Thêm test | 1, 2, 4 |
| `api/hostMockApi.js` | **Tạo** | 2 |
| `api/hostApi.js` | Sửa: rẽ 8 hàm sang mock khi `USE_MOCK` | 2 |
| `components/listing-form/MediaStep.jsx` | Sửa: bỏ 2 nhánh giả | 2 |
| `components/listing-form/listingFormModel.js` | Sửa: bỏ danh mục mặc định và `getMockListingDetail` | 2 |
| `__tests__/hostMockApi.test.jsx` | **Tạo** | 2 |
| `__tests__/hostApi.test.js` | Sửa: ghim `USE_MOCK=false` | 2 |
| `__tests__/AddHotelPage.test.jsx` | Thêm test | 2, 4 |
| `__tests__/MediaStep.test.jsx` | Thêm test | 2, 4 |
| `__tests__/listingFormModel.test.js` | Sửa `MODEL-05`, `MODEL-09` | 3 |
| `plans/261101-0216-host-dashboard-profile-api-integration/plan.md` | Ghi lại D1 | 3 |
| `__tests__/HostDashboardPage.test.jsx`, `__tests__/HostProfilePage.test.jsx` | Thêm test | 4 |
| `plans/261108-0632-host-screens-post-merge-fixes/test-case-change-list.md` | **Tạo** | 5 |

Không đụng: `HostDashboardPage.jsx`, `HostProfilePage.jsx`, `ListingAccessState.jsx` (báo cáo đã kiểm là đúng), cùng mọi file ngoài `src/pages/host/`.

## Non-goals

- Mock cho Danh sách CSLT, xóa CSLT, Hồ sơ (D8).
- Đổi câu báo lỗi mạng theo từng FR. Đây là đề xuất, chưa làm (xem mục cuối).
- Sửa `src/services/listingService.js` hoặc `src/mocks/mockListings.js`. Cả hai cũng đang đóng mock vào bundle, chỉ ghi chú cho team.
- Huy hiệu "Đang dùng dữ liệu mẫu" trên giao diện.
- Sửa file `.xlsx` (Q3).

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Máy dev có `.env` đặt `VITE_USE_MOCK=true` thì Vitest (mode `test`) cũng nạp `.env`, làm test hợp đồng `hostApi.test.js` đi vào mock và fail | Phase 2 ghim `vi.mock('../../../mocks/mockListings', () => ({ USE_MOCK: false }))` trong `hostApi.test.js` |
| Build production lỡ đặt `VITE_USE_MOCK=true` thì Host sẽ thấy dữ liệu giả | Chunk mock chỉ được tải khi cờ bật. Phase 2 kiểm `dist/` khi cờ tắt. Ghi trong danh sách gửi team: không bật cờ ở bản production và khi kiểm thử chính thức |
| Server giữ giá tối thiểu 500.000 trong khi FE mặc định 50.000 | Giá thật lấy từ `priceRange`. Nếu server trả 400 thì lỗi theo trường (`details[]`) hiện dưới ô Giá. Câu hỏi BE #4 được cập nhật ở Phase 3 |
| Trọng chưa biết code bị đổi | Bước 0 |

## Success Criteria

- [x] `grep -rn "=== 'NETWORK_ERROR'" src/pages/host/components src/pages/host/*.jsx` không còn kết quả.
- [x] `grep -rnE "getMockListingDetail|DEFAULT_WARDS|DEFAULT_PROPERTY_TYPES|Math\.random" src/pages/host --exclude-dir=__tests__ | grep -v hostMockApi.js` không còn kết quả.
- [x] `EditHotelPage.jsx` không còn `'403'`, `'404'`, `useSearchParams`.
- [x] Mỗi hành động (tải danh mục, tải chi tiết, tạo, lưu, gửi duyệt, rút lại, upload, xóa media) gặp `NETWORK_ERROR` thì: hiện lỗi, không có toast thành công, không đổi `trangThai`. Mỗi hành động có test (`ADD-14`, `EDIT-15`, `ADD-15`, `EDIT-16`, `EDIT-17`, `EDIT-18`, `MED-13`, `MED-14`).
- [x] Khi bật `USE_MOCK`, 8 hàm form không gọi `axiosClient`, và luồng Thêm mới chạy hết bằng mock (test `MOCK-*`).
- [x] `npx vitest run src/pages/host` qua 100%, không còn fail đã biết (163/163, 4 lần liên tiếp).
- [x] `npx oxlint src/pages/host`: 0 warning.
- [x] `npm run build` qua, và có chunk riêng `hostMockApi-*.js`. Dữ liệu mock không nằm trong `index-*.js`. _Đo bằng chuỗi chỉ có trong mock: `"Sea Breeze"` vẫn có trong `index-*.js` vì placeholder "Ví dụ: Sea Breeze Homestay" ở `BasicInfoStep.jsx` (có từ trước merge). Chi tiết ở Phase 2._
- [x] `git diff --name-only 23ae700 -- . ':!plans'` chỉ liệt kê file trong `src/pages/host/` (file mới chưa track: `api/hostMockApi.js`, `__tests__/hostMockApi.test.jsx`).
- [x] `test-case-change-list.md` phủ đủ B1, B2, B3, B4 của báo cáo, cùng các dòng RTM và dòng tiêu đề tab Host bị ảnh hưởng (27 case mới; 2 file xlsx không đổi `shasum`).
- [x] Bước 0 đã đánh dấu trước khi push (qua mô tả PR, xem ghi chú ở Bước 0).

## Lệnh kiểm sau mỗi phase

```bash
npx vitest run src/pages/host
npx oxlint src/pages/host
npm run build
git diff --name-only 23ae700 -- . ':!plans'
```

## Red Team Review

### Session — 2026-11-08 (soi trực tiếp, không dùng subagent)

| # | Phát hiện | Mức độ | Xử lý | Áp dụng vào |
|---|---|---|---|---|
| 1 | Deps `location.search` (Trọng thêm ở `eb1af0a`) khiến trang Thêm mới tải lại chi tiết mỗi lần đổi bước, ghi đè dữ liệu chưa lưu (A8) | High | Accept: bỏ cùng lúc với `?status=`, kèm test hồi quy `ADD-16` | Phase 2 |
| 2 | Rẽ nhánh mock trong `catch` vẫn là "bật theo mã lỗi" và vẫn gọi mạng trước, trái Q1(b) | High | Accept: rẽ nhánh ở `hostApi.js` (D6) | Phase 2 |
| 3 | Build hiện tại đóng cả mock tourist lẫn mock Host vào `index-*.js`, nên `if (USE_MOCK)` không đủ | Medium | Accept: `import()` động + kiểm `dist/` | Phase 2 |
| 4 | `.env` có `VITE_USE_MOCK=true` trên máy dev làm test hợp đồng đi vào mock | Medium | Accept: ghim `USE_MOCK=false` trong `hostApi.test.js` | Phase 2 |
| 5 | Upload giả dùng `entry.previewUrl`, URL này bị `removeEntry` thu hồi ngay nên ảnh giả hiện vỡ | Low | Accept: mock tự tạo URL bằng `URL.createObjectURL(file)` (có kiểm hàm tồn tại cho jsdom) | Phase 2 |
| 6 | Thiếu mock cho Màn 11/Hồ sơ nên chế độ mock không trọn vẹn | Low | Reject cho plan này (D8, ngoài báo cáo). Ghi trong tin nhắn cho Trọng | — |
| 7 | Hai file test case: sửa một file sẽ lệch file kia | Medium | Accept: danh sách áp dụng cho cả hai file, ghi rõ đã so là giống nhau | Phase 5 |

### Whole-Plan Consistency Sweep

- Files reread: `plan.md`, `phase-01` → `phase-05`.
- Decision deltas checked: 9 (Q1–Q4, D1′, D6, D7, D8, A8).
- Unresolved contradictions: 0.

## Validation Log

### Verification Results — 2026-11-08 (khi lập plan)

- Claims checked: 24
- Verified: 24 | Failed: 0 | Unverified: 0
- Tier: Full (5 phase)
- Đã kiểm:
  - Số dòng của A1–A7 trong báo cáo, và deps `location.search` (`ListingEditor.jsx:209`).
  - Nội dung diff `a27dec5` và `eb1af0a`.
  - `USE_MOCK` ở `src/mocks/mockListings.js:7` và cách `listingService.js` dùng.
  - 133/135 test qua; 2 warning oxlint.
  - Build: chuỗi `"Sea Breeze"` và `"Mường Thanh Luxury"` nằm trong `index-*.js`.
  - Các mục B4 đối chiếu với tên test hiện có (danh sách test còn thiếu ở Phase 4).
  - Thứ tự FR-13…FR-18 trong `docs/SRS_HOTELNT.md`: FR-15 Cập nhật, FR-16 Hình ảnh, FR-17 Giá & tiện ích.
  - 38 dòng tab Host và dòng RTM 17–22 trong cả hai file xlsx.

## Đề xuất ngoài phạm vi (chưa làm, chờ Quân)

- SRS có câu lỗi mạng riêng cho từng FR:
  - FR-16: "Lỗi tải tệp tin. Định dạng không được hỗ trợ hoặc kết nối bị ngắt."
  - FR-17: "Không thể kết nối máy chủ. Vui lòng thử lại sau."
  - FR-18: "Gửi yêu cầu kiểm duyệt thất bại. Vui lòng thử lại sau."
- Sau Phase 2, form sẽ dùng:
  - câu của FR-14 cho lưu và gửi duyệt;
  - câu của `hostApi` cho upload.
- Nếu muốn khớp từng câu thì làm thành một việc riêng.
