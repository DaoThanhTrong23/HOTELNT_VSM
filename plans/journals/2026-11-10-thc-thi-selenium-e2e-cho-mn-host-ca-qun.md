---
title: Thực thi Selenium E2E cho màn Host của Quân
date: 2026-11-10
summary: "4 phase xong: mock 5 API, khung Selenium, 11 case theo nguyên văn sheet, CSV cho Google Sheet; 3 Pass (mock), 8 Fail (mock), 0 Error đúng dự đoán"
---

# Thực thi Selenium E2E cho màn Host của Quân

## What happened
- Thực thi `plans/261109-0918-host-selenium-e2e-tests` bằng `/ak:cook --auto`. 4 commit: `4b1212e` (mock 5 API), `2ebd54d` (khung Selenium), `6f60e77` (TC_HDB_01–08), `a19ee2a` (TC_PRF_01–03, reporter CSV, README).
- `src/pages/host`: 170/170 test qua (trước là 163). Cả bộ E2E chạy khoảng 23 giây. Lần đầu Selenium Manager tải Chrome for Testing 157 mất khoảng 66 giây.
- Kết quả 11 case: 3 Pass (mock) (TC_HDB_03, 04, 07), 8 Fail (mock), 0 Error. Khớp bảng dự đoán đến từng ý. Giống nhau qua 8 lần chạy. Debounce đo được 423–430ms.
- Đối chứng âm (`E2E_TARGET=backend`, API trỏ vào `127.0.0.1:9`): 0 Pass, 11 Error do lỗi mạng. Đã kiểm thêm: trình duyệt không mở được thì ghi Error (không phải Not Run); cổng 5199 bận thì báo lỗi rõ ràng, không đổi sang cổng khác.

## Decision
- `useDriver()` đổi tên thành `browserSession()`, vì oxlint báo `rules-of-hooks` với tên bắt đầu bằng `use`.
- Tách `e2e/support/paths.js`, vì global setup và reporter chạy ngoài worker nên không import được file có API test của Vitest.
- Dùng cache Vite riêng `node_modules/.vite-e2e`, để không đụng `npm run dev` ở cổng 5173.
- Check thumbnail đòi ảnh tải xong (`naturalWidth > 0`). Lúc chụp màn hình đầu tiên, ảnh Unsplash vẫn còn là ô xám.
- Đối chứng âm không gửi token giả tới domain API mặc định `api.hotelnt.com`.
- Plan có vài chỗ sai, đã ghi trong `plan.md`: `lock-keyhole` bắt đầu bằng `M7 10V7`; chuỗi "Sea Breeze" trong bundle là placeholder có từ trước; số dòng trong Excel lệch 1.

## Next steps
- Dán `e2e/reports/host-results.csv` vào các cột Actual Result, Status, Notes của tab "TC - Host (Chủ cơ sở)".
- Khi có backend: chuẩn bị dữ liệu theo `e2e/README.md`, rồi chạy `E2E_TARGET=backend` để đánh Pass chính thức.
- `StateComponents.test.jsx` (file dùng chung) đã đỏ từ trước. Báo người phụ trách.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
