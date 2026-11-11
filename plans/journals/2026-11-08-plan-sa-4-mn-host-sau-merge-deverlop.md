---
title: Plan sửa 4 màn Host sau merge deverlop
date: 2026-11-08
summary: "Lập plan 261108-0632 (--tdd --deep): mock chỉ khi VITE_USE_MOCK, giá 50.000 theo SRS, thêm lỗi A8, chỉ xuất danh sách sửa test case"
---

# Plan sửa 4 màn Host sau merge deverlop

## What happened

- Lập plan `plans/261108-0632-host-screens-post-merge-fixes/` (5 phase, `--tdd --deep`) từ báo cáo `plans/reports/261108-1316-host-screens-post-merge-audit-report.md`.
- Không sửa code nào trong phiên này.
- Hiện trạng đo được: `npx vitest run src/pages/host` qua 133/135 (fail `MODEL-05`, `MODEL-09`); `npx oxlint src/pages/host` có 2 warning ở `MediaStep.jsx:146`; `npm run build` qua.
- Lỗi mới, báo cáo chưa ghi (A8):
  - `ListingEditor.jsx:209` có `location.search` trong deps của effect tải chi tiết (thêm ở `eb1af0a`).
  - Ở trang Thêm mới, mỗi lần đổi bước thì `?step=` đổi, effect chạy lại và `setValues()` ghi đè dữ liệu chưa lưu.
- Bằng chứng từ build: chuỗi `"Mường Thanh Luxury"` trong mock tourist (đã đặt sau `USE_MOCK` trong `listingService.js`) vẫn nằm trong `dist/assets/index-*.js`. Như vậy `if (USE_MOCK)` không loại được mock khỏi bundle.
- Hai file test case (`Copy of TestPlan_TestCase_HOTELNT_FE.xlsx` chưa commit, `HOTELNT_FE_Test_Plan_and_Test_Cases.xlsx` đã commit) có tab Host và tab RTM giống hệt nhau.

## Decision

- Q1(b): dữ liệu giả chỉ chạy khi `VITE_USE_MOCK=true`.
  - Nằm ở lớp API: tạo `src/pages/host/api/hostMockApi.js`, `hostApi.js` rẽ 8 hàm sang mock bằng `import()` động.
  - Component không còn nhánh `catch` nào biến lỗi mạng thành thành công.
- D7: mock theo mã CSLT. 1–5 là năm trạng thái, 6 là CSLT của Host khác (403), mã khác trả 404. Bỏ `?status=` và `?mock=`.
- Q2(b): giá tối thiểu mặc định 50.000 theo SRS FR-17. D1 trong plan 261101 được ghi chú lại.
- Q3: chỉ xuất `test-case-change-list.md`, không sửa file Excel.
- Q4: chưa báo Trọng. Plan có Bước 0 kèm tin nhắn mẫu.

## Next steps

- Quân gửi tin nhắn cho Trọng (Bước 0) trước khi push.
- Chạy `/ak:cook plans/261108-0632-host-screens-post-merge-fixes/plan.md`.
- Nhánh `feature/quan-dashbds` đi trước remote 19 commit. Báo cáo và plan chưa commit.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
