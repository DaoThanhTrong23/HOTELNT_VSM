---
title: Lập plan nối API phần Host của Quân theo Excel và Figma
date: 2026-11-01
summary: Plan 8 phase nối 13 endpoint cho Màn 11/12/13 và Hồ sơ; phạm vi mở rộng sau khi đọc Figma; chưa có backend nên làm theo TDD hợp đồng.
---

# Lập plan nối API phần Host của Quân theo Excel và Figma

## What happened
- Kiểm tra API trong `docs/Copy of API_DESIGN.xlsx`: chưa gọi được endpoint nào vì `api.hotelnt.com` không phân giải DNS (NXDOMAIN) và dự án chưa có `.env`. Cổng 3000 trên máy là web Next.js của dự án EduTalk, không phải BE HOTELNT.
- 4 file `src/services/*.js` gọi sai toàn bộ path so với Excel; các trang Host chạy dữ liệu giả (`MOCK_HOST_HOTELS`, CCCD/tên cứng, `alert`, `window.confirm`).
- Lỗi phát hiện khi rà: form đổi mật khẩu cho qua mức "Trung bình" (`HostProfilePage.jsx:111`); nút "Xem" của CSLT chờ duyệt dẫn tới trang công khai, nơi API trả 404; có nút hiện CCCD đầy đủ trong khi API chỉ trả số đã che.
- Đọc Figma `91utres8M8fA8jrmsbCYJi`, trang "02 — Host", qua MCP. Quân xác nhận Màn 11, 12, 13 (Frame 1–16, M11.1–M13.5) là của mình, nên phạm vi mở rộng từ 2 màn lên 4 màn.
- Phát hiện kỹ thuật: `axiosClient` đặt sẵn `Content-Type: application/json`, mà axios 1.20 khi gặp header này sẽ đổi FormData thành JSON (`node_modules/axios/lib/defaults/index.js:56-57`), làm mất file khi upload. Lời gọi upload phải tự ghi đè header `multipart/form-data`.

## Decision
- Ràng buộc: mọi file mới nằm trong `src/pages/host/`; không sửa file dùng chung.
- D1: giá theo API, 1 ô `gia`. D2: bỏ Giới tính, Ngày sinh ở Hồ sơ. D3: kéo thả ảnh chỉ đổi thứ tự trên giao diện. D4: nav mobile để người phụ trách layout làm. D5: bỏ 4 thẻ thống kê vì Figma không có.
- Plan: `plans/261101-0216-host-dashboard-profile-api-integration/` gồm 8 phase, khoảng 28h, có test matrix cho mọi endpoint và mã lỗi.
- Quân từ chối chạy red-team bằng subagent; phần soi lỗi làm trực tiếp, được 6 phát hiện và đã đưa vào plan.

## Next steps
- Quân báo Thanh Trọng về việc Màn 12/13 (AddHotelPage/EditHotelPage), vì file phân công đang ghi tên Trọng.
- Gửi 7 câu hỏi cho BE (body bọc `{success,data}`, `tenPhuong`, API đếm, khoảng giá, sắp xếp ảnh, `ngayGuiDuyet`, quy tắc ký tự đặc biệt).
- Bắt đầu bằng `/ak:cook plans/261101-0216-host-dashboard-profile-api-integration/plan.md`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
