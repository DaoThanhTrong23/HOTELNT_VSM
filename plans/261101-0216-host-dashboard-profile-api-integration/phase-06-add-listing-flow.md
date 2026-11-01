---
phase: 6
title: "Màn 12: luồng Thêm mới"
status: pending
priority: P1
effort: "3h"
dependencies: [5]
---

# Phase 6: Màn 12, luồng Thêm mới

## Goal

`AddHotelPage` chạy đúng luồng Figma 12.1 → 12.6:
1. lưu bước 1 bằng `POST /host/listings` để nhận `maCSLT` và mở khóa bước 2–4;
2. lưu các bước sau bằng `PUT`;
3. upload media;
4. gửi kiểm duyệt bằng `submit-review`.

Tải lại trang giữa chừng không tạo bản nháp trùng.

## Ràng buộc

- Chỉ sửa `AddHotelPage.jsx`, `ListingEditor.jsx` (phần `mode='create'`) và test.
- Bỏ toàn bộ dữ liệu giả, `alert`, `setTimeout` giả lập trong `AddHotelPage.jsx`.

## Scout trước khi làm

- Xác nhận Phase 5 đã xanh.
- Đọc lại nhãn nút action bar đã ghi ở Phase 5.

## Files to Create / Modify

- Rewrite: `src/pages/host/AddHotelPage.jsx`: trang mỏng, chỉ render `<ListingEditor mode="create" … />`.
- Modify: `src/pages/host/components/listing-form/ListingEditor.jsx`
- Create: `src/pages/host/__tests__/AddHotelPage.test.jsx`

## Luồng

1. **Vào `/host/hotels/new`:**
   - breadcrumb "Cơ sở lưu trú / Thêm mới", tiêu đề "Thêm cơ sở lưu trú";
   - chỉ mở bước 1, bước 2–4 hiện "Mở sau khi lưu bước 1";
   - nút lưu kèm chữ "Lưu để nhận mã cơ sở và mở khóa bước 2–4".
2. **Lưu bước 1:**
   - Chạy `validateStep(1)`. Có lỗi thì hiện banner "Chưa lưu được — có {n} trường cần sửa", không gọi API.
   - Hợp lệ thì gọi `createHostListing(toPayload(values, 'create'))`. Payload gồm mọi trường đã nhập, không chỉ bước 1.
3. **Thành công (`{ maCSLT, trangThai: 'DRAFT' }`):**
   - `setSearchParams({ id: maCSLT, step: 2 }, { replace: true })` (red-team #2);
   - tải chi tiết bằng `getHostListingDetail` để lấy `checklistGuiDuyet` và `allowedActions`;
   - dòng tiêu đề đổi thành `{tenCSLT}` + badge "Bản nháp" + "Mã cơ sở đã được tạo — bạn có thể nhập tiếp các bước còn lại" (12.3).
4. **Tải lại trang có `?id=12&step=n`:**
   - tải chi tiết, đổ dữ liệu, mở đúng bước;
   - nếu `trangThai !== 'DRAFT'` thì `navigate('/host/hotels/12/edit', { replace: true })`;
   - `id` sai → trạng thái không tìm thấy.
5. **Bước 2–4 "Lưu & tiếp tục":**
   - gọi `updateHostListing(maCSLT, toPayload(values, 'update'))`;
   - thành công thì cập nhật `baseline` và sang bước kế;
   - media (bước 3) upload ngay, không cần bấm lưu.
6. **Gửi kiểm duyệt** (chỉ bật khi checklist 7/7):
   - còn thay đổi chưa lưu thì `PUT` trước, rồi mới `submitListingForReview(maCSLT)`;
   - đang gửi: chữ "Đang gửi yêu cầu kiểm duyệt…", nút "Đang gửi…" disabled.
   - Thành công: `navigate('/host/hotels/12/edit', { replace: true, state: { toast: { title: 'Đã gửi kiểm duyệt', message: 'Cơ sở chuyển sang Chờ duyệt. Kết quả sẽ được gửi qua email.' } } })`. Trang sửa hiển thị toast (12.6) và chế độ chỉ đọc (13.3).

### Ánh xạ lỗi

| Mã | Hiển thị |
|---|---|
| `VALIDATION_ERROR` có `details[]` | Lỗi dưới từng ô (qua `fieldPathFromServer`), banner tổng, tự chuyển tới bước có lỗi đầu tiên |
| `LOCATION_OUT_OF_RANGE` | Lỗi ở ô tọa độ bước 4 |
| `CHECKLIST_INCOMPLETE` (422) | Danh sách `details[]` dưới panel checklist |
| `INVALID_STATE_TRANSITION` (409) | Banner bằng message API + tải lại chi tiết |
| `ACCOUNT_LOCKED` | Banner bằng message API |
| `NETWORK_ERROR` / `INTERNAL_ERROR` | Banner: "Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại." (SRS FR-14) |

## Test Matrix (`AddHotelPage.test.jsx`, mock `hostApi`)

Cách render: `MemoryRouter` + `Routes` có route stub `/host/hotels/:id/edit` để kiểm điều hướng.

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| ADD-01 | Vào trang | Gọi `getFilterOptions`; select loại hình và phường có dữ liệu; bước 2–4 hiện "Mở sau khi lưu bước 1" và bị khóa |
| ADD-02 | `/filter-options` lỗi | `ErrorState`; Thử lại thì gọi lại |
| ADD-03 | Lưu khi trống, SĐT `09051234`, Facebook `facebook.com/x` | Đúng các câu lỗi của 12.2; banner "Chưa lưu được — có 4 trường cần sửa"; không gọi `createHostListing` |
| ADD-04 | Lưu bước 1 hợp lệ | `createHostListing` nhận payload đúng kiểu (số cho `maLoai`, `maPhuong`), không có trường rỗng; URL có `?id=12&step=2`; tiêu đề đổi thành tên + "Bản nháp"; bước 2–4 mở khóa |
| ADD-05 | Server trả `VALIDATION_ERROR` có `details[{ field: 'tenCSLT' }]` | Lỗi dưới ô tên |
| ADD-06 | Vào `?id=12&step=3` | Gọi `getHostListingDetail(12)`, mở bước 3, **không** gọi `createHostListing` |
| ADD-07 | `?id=12` nhưng chi tiết là PENDING | Điều hướng tới `/host/hotels/12/edit` |
| ADD-08 | Lưu bước 2 | `updateHostListing(12, payload)` có `gia` là số và `maTienIch`; sang bước 3 |
| ADD-09 | Bước 4 nhận `LOCATION_OUT_OF_RANGE` | Lỗi ở ô tọa độ |
| ADD-10 | Checklist 6/7 | Nút gửi disabled, chữ "Còn 1 điều kiện chưa hoàn thành" |
| ADD-11 | Checklist 7/7, còn thay đổi chưa lưu, bấm gửi | Gọi `updateHostListing` **rồi mới** `submitListingForReview`; khi đang gửi có chữ "Đang gửi…"; thành công thì tới trang sửa kèm toast state |
| ADD-12 | Gửi bị 422 | Liệt kê `details[]` dưới panel |
| ADD-13 | Đang có thay đổi chưa lưu | Có listener `beforeunload`; lưu xong thì gỡ |

## Tasks & Steps

- [x] Viết test ADD-01..13. Chạy, phải đỏ.
- [x] Viết lại `AddHotelPage.jsx` và phần `create` trong `ListingEditor`.
- [x] Chạy test cho tới khi xanh.

## Verification

- `npx vitest run src/pages/host/__tests__/AddHotelPage.test.jsx` → pass.
- `grep -nE "alert\(|handleAddSampleImage|unsplash|setTimeout" src/pages/host/AddHotelPage.jsx` → không có kết quả.

## Risk Assessment

- **POST thành công nhưng mạng rớt trước khi nhận response:** có thể sinh bản nháp mồ côi. Host sẽ thấy nó ở Dashboard và có thể xóa. FE không tự gửi lại POST.
