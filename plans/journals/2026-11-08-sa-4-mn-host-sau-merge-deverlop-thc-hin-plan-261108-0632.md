---
title: "Sửa 4 màn Host sau merge deverlop: thực hiện plan 261108-0632"
date: 2026-11-08
summary: "Gỡ báo thành công giả khi mất mạng, mock chỉ chạy khi VITE_USE_MOCK=true, sửa bắt cứng 403/404, giá 50.000 theo SRS, thêm 28 test, xuất danh sách sửa file test case"
---

# Sửa 4 màn Host sau merge deverlop: thực hiện plan 261108-0632

## What happened

Chạy `/ak-cook plans/261108-0632-host-screens-post-merge-fixes/plan.md --auto` trên `feature/quan-dashbds` (`23ae700`). Làm TDD từng phase: viết test, thấy đỏ đúng chỗ, rồi mới sửa.

- **Phase 1 (A2, A3):** `EditHotelPage.jsx` trả về đúng bản `1aa3342`, không còn bắt cứng id `403`/`404`/`?mock=`. Banner từ chối/ẩn hiện "Không có ghi chú." khi API không gửi lý do. Test mới: EDIT-13, EDIT-14.
- **Phase 2 (A1, A4, A5, A7, A8):**
  - Tạo `src/pages/host/api/hostMockApi.js`. `hostApi.js` chuyển 8 hàm của form sang mock khi `USE_MOCK` bật, nạp bằng `import()`.
  - Gỡ 8 nhánh "mất mạng thì báo thành công" trong `ListingEditor.jsx` và `MediaStep.jsx`, cùng danh mục mặc định và `getMockListingDetail` trong `listingFormModel.js`.
  - Bỏ `location.search` khỏi deps (A8: đổi bước thì ghi đè dữ liệu chưa lưu). Test ADD-16 tái hiện được lỗi này.
  - `MediaStep.jsx` giờ giống hệt bản trước merge.
- **Phase 3 (A6):** giữ 50.000 theo SRS. Sửa MODEL-05/09. Ghi 4 ghi chú vào plan 261101.
- **Phase 4:** thêm 8 test cho B4. Tất cả qua ngay, không phát hiện lỗi code.
- **Phase 5:** `test-case-change-list.md`: 50+ dòng sửa, 27 case mới, sửa RTM dòng 17–22. Hai file xlsx chỉ đọc (`shasum` không đổi).

Kết quả: 163/163 test qua, 4 lần liên tiếp. oxlint 0 warning. Build có chunk riêng `hostMockApi-*.js`. Diff chỉ nằm trong `src/pages/host/` và `plans/`.

## Bất ngờ

- **ADD-08 fail chập chờn khi chạy cả thư mục.** Không phải lỗi do plan này: chạy code ở `23ae700` 8 lần thì fail 1 lần. `setSearchParams` của React Router v7 chạy dạng transition, nên URL chậm hơn bước trên màn một lần render. Đã bọc kiểm URL trong `waitFor`; kỳ vọng giữ nguyên.
- **Cách kiểm bundle trong plan bị sai.** `grep "Sea Breeze" index-*.js` vẫn ra kết quả, vì placeholder "Ví dụ: Sea Breeze Homestay" ở `BasicInfoStep.jsx` (có từ trước merge). Kiểm lại bằng các chuỗi chỉ có trong mock: không có trong bundle chính.
- **TC_ADD_04 trong file Excel kỳ vọng "Toast thành công" khi tạo mới.** Toast đó chỉ có ở nhánh giả lúc mất mạng. Code thật không có toast; thay vào đó là dòng phụ và URL `?id=&step=2`.

## Decision

- Mock `deleteListingMedia` chặn PENDING (409), theo hợp đồng DELETE media ở plan 261101. Plan gốc không ghi điểm này.
- Không spawn subagent (simplify/review). Soi lỗi làm trực tiếp, theo ý Quân.
- Plan để `in-progress`: Bước 0 (báo Trọng) chưa làm, và bắt buộc trước khi push.

## Next steps

- Quân gửi tin nhắn Bước 0 cho Trọng trước khi push. Nhánh đang đi trước remote 19 commit.
- Gửi `test-case-change-list.md` cho người phụ trách file test case.
- Chưa commit. Chờ Quân bảo.
- Tùy chọn: chạy `VITE_USE_MOCK=true npm run dev` để xem tay mã 1–6, 999.
- Còn đề xuất ngoài phạm vi: câu lỗi mạng riêng cho từng FR (FR-16/17/18).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
