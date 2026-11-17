---
title: Plan Selenium E2E cho màn Host của Quân
date: 2026-11-09
summary: "Lập plan 4 phase: mock 5 API còn thiếu, khung Selenium JS, 11 case theo nguyên văn sheet, file CSV cho Google Sheet"
---

# Plan Selenium E2E cho màn Host của Quân

## What happened
- Lập plan `plans/261109-0918-host-selenium-e2e-tests` (--tdd --deep) cho 11 case của Quân trong `docs/Test-case-HOTELNT.xlsx`: TC_HDB_01–08 và TC_PRF_01–03.
- File `.xlsx` thực chất là Excel 97, nội dung giống `Test-case-HOTELNT.xls`. Sheet chưa áp danh sách sửa ngày 08/11.
- Chưa có backend. Ở chế độ mock, 5 API (danh sách, xóa, hồ sơ, sửa hồ sơ, đổi mật khẩu) vẫn gọi API thật (D8 của plan 261108), nên phải làm mock trước.
- Máy chưa cài Chrome, Selenium Manager sẽ tự tải ở lần chạy đầu.
- `lucide-react` 1.55 không gắn class `lucide-lock`: tìm icon ổ khóa bằng path của svg.

## Decision
- JavaScript (`selenium-webdriver` + Vitest có sẵn), spec `*.e2e.js` trong `e2e/`, config riêng, Vite chạy ngay trong tiến trình test ở cổng 5199.
- Kiểm đúng nguyên văn sheet: dự đoán 3 Pass (mock), 8 Fail. Tab 'Tất cả' đòi `?trangThai=ALL`. CCCD chấp nhận 12 ký tự đã che.
- Chạy trên mock, ghi "Pass (mock)". Giữ quy ước 08/11: Pass chính thức chỉ khi có backend.

## Next steps
- `/ak:cook plans/261109-0918-host-selenium-e2e-tests/plan.md`, bắt đầu từ Phase 1 (mock 5 API, TDD).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
