---
phase: 3
title: "A6: giá tối thiểu 50.000 theo SRS"
status: pending
priority: P2
effort: "0.5h"
dependencies: []
---

# Phase 3: giá tối thiểu mặc định 50.000 (Q2 = b)

## Goal

Test và plan 261101 khớp quyết định mới D1′: khi `/filter-options` không gửi `priceRange`, giá hợp lệ mặc định là 50.000–100.000.000 VNĐ (SRS FR-17). Giá thật vẫn lấy từ `priceRange` của API. Code đã ở `50_000` (Trọng đổi ở `a27dec5`), nên phase này chỉ sửa kỳ vọng test và ghi lại quyết định.

## Ràng buộc

- Không đổi `DEFAULT_PRICE_RANGE` (đã là `{ min: 50_000, max: 100_000_000 }`).
- Không sửa `src/constants/enums.js`. `PRICE_LIMITS.MIN_VND = 50_000` ở đó nay đã khớp.
- `FILTER_OPTIONS.priceRange.giaMin = 500000` trong `AddHotelPage.test.jsx` / `EditHotelPage.test.jsx` là dữ liệu API giả lập, **giữ nguyên**. Nó kiểm rằng giá trị API ghi đè giá trị mặc định.
- Câu `'Giá phải từ 500.000 …'` trong `hostApi.test.js` (ERR-07) là câu mẫu của server, **giữ nguyên**.

## Scout trước khi làm

```bash
grep -n "DEFAULT_PRICE_RANGE" src/pages/host/components/listing-form/listingFormModel.js
grep -rn "500000\|500_000\|500\.000" src/pages/host/__tests__
grep -n "D1\|500.000\|PRICE_LIMITS" plans/261101-0216-host-dashboard-profile-api-integration/plan.md
```

## Test matrix

Kỳ vọng mới mô tả quyết định Q2(b). Hai test đang đỏ vì còn kỳ vọng 500.000, sửa xong thì xanh mà không đụng code.

| ID | Thay đổi | Kỳ vọng mới |
|---|---|---|
| MODEL-05 | Thay dòng `gia: 400000` | `validateStep(2, filled({ gia: 40000 }), OPTIONS).gia === 'Giá phải từ 50.000 đến 100.000.000 VNĐ'`; `filled({ gia: 400000 })` hợp lệ; thêm `expect(resolveOptions().priceRange).toEqual({ min: 50_000, max: 100_000_000 })`. Giữ 2 dòng còn lại (priceRange từ API ghi đè, giá trống không báo lỗi) |
| MODEL-09 | Thay `gia: 350000` ở dòng kiểm giá sai | Dùng `gia: 40000` → `computeChecklist(...).gia === false` |

## Tasks & Steps

- [x] 1. Sửa `MODEL-05`, `MODEL-09` theo bảng. Chạy `npx vitest run src/pages/host/__tests__/listingFormModel.test.js`: 100% qua.
- [x] 2. Sửa comment ở `listingFormModel.js:12` (nếu cần) thành: mặc định theo SRS FR-17, API ghi đè bằng `priceRange`. Hiện comment đã đúng ý, nên chỉ sửa nếu còn nhắc "API_DESIGN" như nguồn của số 50.000.
- [x] 3. Ghi lại D1 trong `plans/261101-0216-host-dashboard-profile-api-integration/plan.md`. Không xóa nội dung cũ, chỉ ghi chú:
   - Bảng "Quyết định đã chốt", dòng D1: thêm câu "**Cập nhật 2026-11-08 (Q2):** giá mặc định khi `/filter-options` không gửi `priceRange` đổi thành 50.000 theo SRS FR-17. Xem plan `261108-0632-host-screens-post-merge-fixes`."
   - "Câu hỏi cần gửi BE" #4: thêm "FE mặc định 50.000 (SRS). Nếu BE giữ 500.000 thì trả `priceRange.giaMin = 500000` trong `/filter-options`."
   - "Ghi chú gửi team", dòng `PRICE_LIMITS.MIN_VND = 50_000 … lệch với API`: thêm "(2026-11-08: FE đã theo SRS 50.000, chờ BE chốt)".
   - Red Team dòng 6 ("mặc định 500.000"): thêm "(đổi thành 50.000 ngày 2026-11-08, Q2)".
- [x] 4. Chạy cổng kiểm.

## Verification

```bash
npx vitest run src/pages/host     # 0 fail (nếu Phase 1, 2 đã xong thì đây là lần đầu xanh toàn bộ)
npx oxlint src/pages/host
npm run build
grep -n "2026-11-08" plans/261101-0216-host-dashboard-profile-api-integration/plan.md   # có 4 ghi chú mới
```

## Kết quả thực hiện (2026-11-08)

- `MODEL-05` thêm một dòng kiểm `priceRange` từ API (`giaMin = 500000`) chặn giá 400.000, vì dòng cũ (350.000 với `giaMin = 50000`) không còn phân biệt được mặc định và giá trị API.
- Comment `listingFormModel.js:12` đổi thành: giá theo SRS FR-17, API ghi đè bằng `priceRange`.
- Đã thêm đủ 4 ghi chú vào plan 261101. `grep -c "2026-11-08"` ra 3, vì câu ghi chú cho câu hỏi BE #4 (theo đúng nội dung plan) không có ngày.
- `npx vitest run src/pages/host`: 155/155 qua lần đầu.

## Rủi ro / Rollback

- Rủi ro: server có thể vẫn chặn ở 500.000. Đã ghi trong câu hỏi BE và mục Rủi ro của `plan.md`.
- Rollback: `git checkout -- src/pages/host/__tests__/listingFormModel.test.js plans/261101-0216-host-dashboard-profile-api-integration/plan.md`.
