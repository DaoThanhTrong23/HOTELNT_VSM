---
phase: 4
title: "Bổ sung test cho các tình huống B4 còn thiếu"
status: pending
priority: P2
effort: "2.5h"
dependencies: [2]
---

# Phase 4: bổ sung test tự động cho mục B4

## Goal

Mọi tình huống ở mục B4 của báo cáo đều có ít nhất một test tự động trong `src/pages/host/__tests__/`. Phase 5 dẫn chiếu các mã test này khi đề xuất case mới cho file Excel.

## Ràng buộc

- Đây là test cho hành vi đã có. Test viết đúng mà đỏ nghĩa là code có lỗi:
  - sửa tối thiểu trong `src/pages/host/`;
  - ghi lỗi vào mục "Lỗi phát hiện" ở cuối file này;
  - không nới lỏng test.
- Dùng helper sẵn có trong từng file test (`renderPage`, `renderAdd`, `renderEdit`, `Harness`, `listing()`, `draft()`, `image()`…). Không tạo helper dùng chung mới.

## Đối chiếu B4 với test hiện có (đo ngày 2026-11-08)

| Màn | Tình huống B4 | Test đã có | Còn thiếu |
|---|---|---|---|
| 11 | Lỗi tải danh sách + thử lại | DASH-12 | — |
| 11 | `ACCOUNT_LOCKED`, không có nút thử lại | DASH-13 (chỉ kiểm câu báo) | Kiểm **không có** nút "Thử lại" |
| 11 | Chưa có cơ sở → nút "Thêm cơ sở" | DASH-10 | — |
| 11 | Tìm không ra → "Xóa bộ lọc" | DASH-11 | — |
| 11 | Phân trang 10 dòng | DASH-09 | — |
| 11 | Xóa nhiều chỉ Bản nháp/Bị từ chối, báo số thành công/thất bại | ACT-10, ACT-11 | — |
| 11 | Hàng Bản nháp ("Sửa", "Xóa"), Bị ẩn ("Sửa & gửi lại") | ACT-01 | — |
| 11 | `409 LISTING_NOT_DELETABLE` | ACT-08 | — |
| 12 | Nút "Lưu nháp" | ADD-09 (chỉ nhánh lỗi) | Nhánh thành công |
| 12 | Tải lại với `?id=&step=` | ADD-06 | — |
| 12 | Lỗi theo trường `details[]` | ADD-05 | — |
| 12 | `LOCATION_OUT_OF_RANGE` | ADD-09 | — |
| 12 | Vượt 100 ảnh / 5 video (`MEDIA_LIMIT_EXCEEDED`) | MED-08 (chỉ 100 ảnh phía FE) | Giới hạn 5 video phía FE; `MEDIA_LIMIT_EXCEEDED` từ server |
| 12 | Kéo thả đổi thứ tự chỉ trên giao diện, tải lại thì về `thuTu` (D3) | MED-09 (chỉ nút "Đặt làm ảnh bìa") | Kéo thả; sắp xếp theo `thuTu` khi tải |
| 12 | `422 CHECKLIST_INCOMPLETE` | ADD-12 | — |
| 13 | Sửa CSLT Bản nháp | — | Có |
| 13 | Xóa ảnh xuống dưới 3 | MED-07 | — |
| 13 | `409 LISTING_LOCKED_PENDING`, `LISTING_REMOVED` | EDIT-10, EDIT-11 | — |
| 13 | Lưu CSLT Đã duyệt không có thay đổi → "Không có thay đổi" | — | Có |
| Hồ sơ | SĐT sai định dạng | PROF-07 | — |
| Hồ sơ | `409 ACCOUNT_DUPLICATED` | PROF-10 | — |
| Hồ sơ | `FIELD_NOT_EDITABLE` | — | Có |
| Hồ sơ | Mật khẩu mới trùng mật khẩu cũ | PWD-04 | — |
| Hồ sơ | Đổi mật khẩu → phiên khác bị đăng xuất | PWD-05 (kiểm câu toast) | — |

## Scout trước khi làm

```bash
grep -n "^\s*it('" src/pages/host/__tests__/*.test.* | grep -E "DASH-13|ADD-09|MED-0[789]|EDIT-0[34]|PROF-1[0-4]"
grep -n "onDragStart\|onDrop\|draggable" src/pages/host/components/listing-form/MediaStep.jsx
grep -n "Không có thay đổi\|thayDoiTrangThai" src/pages/host/components/listing-form/ListingEditor.jsx
grep -n "aria-label=\"Chọn video từ máy\"\|videoLimitReached\|VIDEO" src/pages/host/components/listing-form/MediaStep.jsx
grep -n "setBanner\|role=\"alert\"" src/pages/host/HostProfilePage.jsx
```

## Test matrix

| ID | File | Tình huống | Kỳ vọng |
|---|---|---|---|
| DASH-13 (bổ sung) | `HostDashboardPage.test.jsx` | `ACCOUNT_LOCKED` | Thêm `expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument()` |
| ADD-17 | `AddHotelPage.test.jsx` | `?id=12&step=2`, sửa Giá, bấm "Lưu nháp"; `updateHostListing` trả `{ maCSLT: 12, trangThai: 'DRAFT', thayDoiTrangThai: false }` | Gọi PUT 1 lần; toast "Đã lưu thay đổi"; vẫn ở bước 2 (URL `step=2`); không có banner |
| MED-15 | `MediaStep.test.jsx` | Upload, server trả `400 MEDIA_LIMIT_EXCEEDED` | Mục tải lên hiện câu của server; mục sau trong hàng đợi vẫn tiếp tục (không phải lỗi chặn) |
| MED-16 | `MediaStep.test.jsx` | `initialCounts={{ soAnh: 3, soVideo: 5 }}` | Nút "Chọn video từ máy" bị tắt (hoặc chọn file mp4 bị từ chối ngay ở FE, theo đúng cách code đang làm; đọc code trước khi viết) |
| MED-17 | `MediaStep.test.jsx` | Kéo ảnh 3 thả vào ảnh 1 (`dragStart` → `dragOver` → `drop`) | Thứ tự ô ảnh đổi; ảnh đầu có nhãn "Ảnh bìa"; `uploadListingMedia`/`deleteListingMedia` không được gọi |
| EDIT-19 | `EditHotelPage.test.jsx` | CSLT DRAFT (`allowedActions` có EDIT, SUBMIT, DELETE) | Có dòng "Cập nhật lần cuối: …"; không banner; nút "Lưu nháp" và "Gửi kiểm duyệt"; sửa tên rồi "Lưu nháp" thì gọi PUT **không** mở hộp xác nhận, toast thành công |
| EDIT-20 | `EditHotelPage.test.jsx` | APPROVED, sửa tên, "Vẫn lưu"; server trả `{ thayDoiTrangThai: false }` | Toast "Không có thay đổi" |
| EDIT-21 | `EditHotelPage.test.jsx` | Chi tiết có `media` theo thứ tự `thuTu` 3, 1, 2 | Ô ảnh hiện theo `thuTu` 1, 2, 3 (D3: tải lại thì về thứ tự server) |
| PROF-15 | `HostProfilePage.test.jsx` | `updateHostProfile` ném `400 FIELD_NOT_EDITABLE` | Banner hiện câu của server; giá trị form giữ nguyên; không có toast thành công |

## Tasks & Steps

- [x] 1. Viết các test theo bảng, mỗi file một lượt. Chạy riêng file đó sau mỗi lượt.
- [x] 2. Test nào đỏ:
   - đọc code để phân biệt test sai hay code sai;
   - test sai (chọn sai phần tử, sai chữ) thì sửa test cho khớp hành vi đúng theo Figma/Excel;
   - code sai thì sửa tối thiểu trong `src/pages/host/` và ghi vào "Lỗi phát hiện".
- [x] 3. Chạy cổng kiểm.

## Verification

```bash
npx vitest run src/pages/host     # 0 fail
npx oxlint src/pages/host         # 0 warning
npm run build
git diff --name-only 23ae700 -- . ':!plans'   # chỉ src/pages/host/**
```

## Lỗi phát hiện

2026-11-08: 8 test mới (DASH-13 bổ sung, ADD-17, MED-15/16/17, EDIT-19/20/21, PROF-15) qua ngay lần đầu. **Không có lỗi code.**

Một lỗi ở test (có từ trước, không do plan này):

- **ADD-08** (`__tests__/AddHotelPage.test.jsx`): thỉnh thoảng fail khi chạy cả thư mục (`step=2` thay vì `step=3`).
  - Nguyên nhân: `setSearchParams` của React Router v7 chạy dạng transition, nên URL có thể chậm hơn bước hiện trên màn một lần render. Test kiểm URL ngay sau khi thấy heading "Hình ảnh", không chờ.
  - Bằng chứng: chạy code ở `23ae700` (chưa sửa gì) 8 lần thì fail 1 lần.
  - Sửa: bọc kiểm URL trong `waitFor`, giống ADD-04. Kỳ vọng giữ nguyên `step=3`. Sau khi sửa: 14 lần chạy cả thư mục đều qua.

## Rủi ro / Rollback

- Rủi ro thấp: chủ yếu thêm test.
- Rollback: bỏ các test mới. Nếu có sửa code ở bước 2, bỏ thêm thay đổi đó.
