---
title: Nối API phần Host của Quân theo plan 261101
date: 2026-11-01
summary: "Làm xong Phase 1–7 và kiểm tra Phase 8: 13 endpoint, 134 test, lint/build sạch, đối chiếu Figma bằng ảnh chụp; còn gửi câu hỏi BE và ghi chú team."
---

# Nối API phần Host của Quân theo plan 261101

# Nối API phần Host của Quân theo plan 261101

## What happened
- Chạy `/ak:cook plans/261101-0216-host-dashboard-profile-api-integration/plan.md --auto`. Làm hết Phase 1–7 theo TDD (viết test trước, chạy đỏ, rồi viết code).
- Lớp API riêng `src/pages/host/api/hostApi.js`: 13 endpoint, chuẩn hóa lỗi theo sheet "Error Format", upload ghi đè `Content-Type: multipart/form-data`.
- 4 trang viết lại trên API: Hồ sơ, Dashboard (lọc/tìm/phân trang trên server, xóa 1/xóa nhiều tuần tự, rút lại), Thêm mới và Cập nhật dùng chung `ListingEditor` (4 bước, checklist 7 mục, upload tuần tự, bản đồ Google Maps có fallback nhập tay).
- Kết quả: 134 test qua, 0 cảnh báo lint trong `src/pages/host`, build qua, không còn dữ liệu giả, chỉ đụng `src/pages/host/`.
- Đối chiếu Figma: dựng API giả tạm trong scratchpad (không commit), chụp headless Chrome 1440px và 402px. Desktop khớp Figma. Ở 402px, `Sidebar` dùng chung (w-64) vẫn hiện nên nội dung chỉ còn khoảng 146px; khi ẩn sidebar thì bố cục mobile của 4 màn đúng.

## Decision
- Thêm vài file nhỏ ngoài bảng File Ownership nhưng vẫn trong `src/pages/host/` (toast dùng chung, primitive form, banner, màn 403/404) để tránh lặp code giữa 4 trang.
- Nút "Đặt làm ảnh bìa" chỉ hiện khi rê chuột/focus trên desktop cho gần Figma, luôn hiện trên mobile vì không có hover.
- Không sửa bảng trạng thái phase trong `plan.md` bằng tay; trạng thái lấy theo `ak plan` (33/34 task).

## Next steps
- Gửi 8 câu hỏi BE (thêm câu 8: upload nhiều ảnh cho CSLT Đã duyệt sẽ bị 409 từ ảnh thứ hai) và ghi chú team (thêm: Sidebar chiếm chỗ trên mobile).
- Khi có BE thật: smoke test theo mục Risk của Phase 8, thêm key Google Maps vào `.env` và Map ID thật.
- Commit khi Quân đồng ý.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
