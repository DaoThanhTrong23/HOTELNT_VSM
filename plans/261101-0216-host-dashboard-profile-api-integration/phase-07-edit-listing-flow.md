---
phase: 7
title: "Màn 13: luồng Cập nhật theo trạng thái"
status: pending
priority: P1
effort: "4h"
dependencies: [5]
---

# Phase 7: Màn 13, luồng Cập nhật

## Goal

`EditHotelPage` tải CSLT bằng `GET /host/listings/:maCSLT` rồi hành xử đúng từng trạng thái theo Figma 13.1–13.5:
- Đã duyệt: sửa được, có cảnh báo khi lưu;
- Chờ duyệt: chỉ đọc;
- Bị từ chối / Ẩn: có banner lý do và cho gửi lại;
- Không có quyền: màn 403.

## Ràng buộc

- Chỉ sửa `EditHotelPage.jsx`, `ListingEditor.jsx` (phần `mode='edit'`) và test.
- Bỏ `window.confirm`, `alert` và dữ liệu giả hiện có.

## Scout trước khi làm

- `get_design_context` cho `72:6726` (13.1), `72:6907` (13.2), `72:7103` (13.3), `72:7276` (13.4), `72:7463` (13.5) và mobile `126:1679`, `126:1782`, `126:1888`, `126:1981`, `126:2090`.
- Xác nhận `listingActions.js` (Phase 4) và `ConfirmDialog.jsx` đã có.

## Files to Create / Modify

- Rewrite: `src/pages/host/EditHotelPage.jsx`: trang mỏng, chỉ render `<ListingEditor mode="edit" maCSLT={id} />`.
- Modify: `src/pages/host/components/listing-form/ListingEditor.jsx`
- Create: `src/pages/host/__tests__/EditHotelPage.test.jsx`

## Hành xử theo trạng thái

**Chung cho mọi trạng thái:**
- Breadcrumb "Cơ sở lưu trú / Cập nhật".
- Tiêu đề `{tenCSLT}` + `StatusBadge`.
- Cả 4 bước đều mở; trạng thái từng bước tính từ dữ liệu.

| Trạng thái | Dòng phụ | Banner | Sửa | Nút |
|---|---|---|---|---|
| APPROVED (13.1) | "Cập nhật lần cuối: {ngayCapNhat}" | — | Có | Lưu (disabled khi chưa đổi). Chân form: "Lưu thay đổi sẽ đưa cơ sở về trạng thái Chờ duyệt" |
| PENDING (13.3) | "Gửi kiểm duyệt ngày {ngayGuiDuyet ?? ngayCapNhat}" | Cảnh báo: "Cơ sở đang chờ duyệt" / "Bạn chưa thể chỉnh sửa cho đến khi Quản trị viên duyệt hoặc từ chối. Kết quả sẽ được gửi qua email." | Không (chỉ đọc, ô trống hiện "—") | "Rút lại yêu cầu" nếu `allowedActions` có WITHDRAW |
| REJECTED (13.4) | "Từ chối ngày {ngayCapNhat}" | Nguy hiểm: "Quản trị viên đã từ chối cơ sở này" / "Lý do: {lyDoTuChoi}" | Có | Lưu + Gửi kiểm duyệt lại. Chân form: "Sau khi gửi lại, cơ sở chuyển sang Chờ duyệt" |
| HIDDEN | "Cập nhật lần cuối: {ngayCapNhat}" | Nguy hiểm: "Quản trị viên đã ẩn cơ sở này" / "Lý do: {lyDoViPham}" | Có | Như REJECTED |
| DRAFT | "Cập nhật lần cuối: {ngayCapNhat}" | — | Có | Lưu + Gửi kiểm duyệt (khi 7/7), như Phase 6 |

Nút "Sửa" chỉ hiện khi `allowedActions` có EDIT; nút gửi chỉ hiện khi có SUBMIT. Dùng `resolveAllowedActions`.

### Lưu CSLT Đã duyệt (13.2, M13.2)

1. Bấm Lưu khi có thay đổi thì mở `ConfirmDialog` biến thể `warning` (bottom sheet trên mobile):
   - tiêu đề "Lưu thay đổi cho cơ sở đã duyệt?";
   - nội dung "Nếu bạn lưu, cơ sở này sẽ chuyển về trạng thái Chờ duyệt và cần Quản trị viên duyệt lại trước khi hiển thị thông tin mới."
2. Xác nhận thì gọi `updateHostListing(maCSLT, toPayload(values, 'update'))`.
3. Response có `thayDoiTrangThai: true` → toast bằng `message` API, tải lại chi tiết (lúc này PENDING, chỉ đọc). Response có `thayDoiTrangThai: false` → toast "Không có thay đổi".

### Đổi media khi CSLT Đã duyệt (red-team #3)

- Truyền `onBeforeMediaChange` vào `MediaStep`. Lần đầu đổi media thì mở cùng dialog cảnh báo; Hủy thì không upload, không xóa.
- Sau khi upload hoặc xóa xong thì tải lại chi tiết, vì server đã chuyển trạng thái sang PENDING.

### Rút lại (PENDING, nếu được phép)

`ConfirmDialog` → `withdrawListing(maCSLT)` → tải lại chi tiết (về DRAFT, sửa được). 409 thì hiện banner bằng message API và tải lại.

### Gửi kiểm duyệt lại (REJECTED / HIDDEN / DRAFT)

Giống Phase 6 bước 6: lưu trước nếu còn thay đổi, rồi `submitListingForReview`. Thành công thì toast "Đã gửi kiểm duyệt" và tải lại chi tiết (chỉ đọc).

### Lỗi khi tải

| Tình huống | Hiển thị |
|---|---|
| `id` không phải số nguyên dương | Trạng thái "Không tìm thấy cơ sở lưu trú.", không gọi API |
| 403 `NOT_OWNER` | Màn 13.5: "Bạn không có quyền truy cập" / "Bạn không có quyền chỉnh sửa cơ sở lưu trú này." + link về `/host/dashboard` |
| 404 `LISTING_NOT_FOUND` | "Không tìm thấy cơ sở lưu trú." + link về danh sách |
| Lỗi khác | `ErrorState` + Thử lại |

### Lỗi khi lưu

| Mã | Hiển thị |
|---|---|
| 409 `LISTING_LOCKED_PENDING` | Banner bằng message API + tải lại chi tiết (chỉ đọc) |
| 409 `LISTING_REMOVED` | Banner bằng message API, chuyển sang chỉ đọc |
| 403 `NOT_OWNER` / 404 | Chuyển sang màn tương ứng |
| `VALIDATION_ERROR`, `LOCATION_OUT_OF_RANGE`, lỗi mạng | Như Phase 6 |

### Toast từ điều hướng

Nếu `location.state.toast` có giá trị thì hiện toast một lần, sau đó `navigate(location.pathname, { replace: true, state: null })` để F5 không hiện lại.

## Test Matrix (`EditHotelPage.test.jsx`, mock `hostApi`)

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| EDIT-01 | 403 `NOT_OWNER` | Đúng 2 dòng chữ 13.5 + link về danh sách |
| EDIT-02 | 404 / `id='abc'` | "Không tìm thấy…"; với `id='abc'` không gọi API |
| EDIT-03 | APPROVED | Ô có dữ liệu; dòng phụ "Cập nhật lần cuối: 24/09/2026"; có chữ chân form; nút Lưu disabled khi chưa đổi |
| EDIT-04 | APPROVED → sửa → Lưu | Dialog đúng tiêu đề và nội dung 13.2. Hủy thì không gọi API. Xác nhận thì gọi `updateHostListing(12, payload)`; `thayDoiTrangThai` → toast + tải lại → chỉ đọc |
| EDIT-05 | APPROVED → upload ảnh | Dialog hiện trước; Hủy thì không gọi `uploadListingMedia` |
| EDIT-06 | PENDING | Banner đúng chữ 13.3; mọi ô `readOnly`/`disabled`; Zalo trống hiện "—"; không có nút Lưu/Gửi |
| EDIT-07 | PENDING có WITHDRAW | Có "Rút lại yêu cầu" → `withdrawListing(12)` → tải lại → sửa được |
| EDIT-08 | REJECTED | Banner có "Lý do: …" từ `lyDoTuChoi`; dòng phụ "Từ chối ngày …"; gửi lại thì gọi `submitListingForReview(12)` |
| EDIT-09 | HIDDEN | Banner có `lyDoViPham` |
| EDIT-10 | Lưu bị 409 `LISTING_LOCKED_PENDING` | Banner + gọi lại `getHostListingDetail` |
| EDIT-11 | Lưu bị 409 `LISTING_REMOVED` | Banner + chỉ đọc |
| EDIT-12 | Có `location.state.toast` | Toast "Đã gửi kiểm duyệt" hiện 1 lần; state bị xóa |

## Tasks & Steps

- [x] Viết test EDIT-01..12. Chạy, phải đỏ.
- [x] Viết lại `EditHotelPage.jsx` và phần `edit` trong `ListingEditor`.
- [x] Chạy test cho tới khi xanh.

## Verification

- `npx vitest run src/pages/host/__tests__/EditHotelPage.test.jsx` → pass.
- `grep -nE "window\.confirm|alert\(|Mường Thanh|setIsApproved" src/pages/host/EditHotelPage.jsx` → không có kết quả.
- `npx oxlint src/pages/host` → 0 cảnh báo mới (cảnh báo `set-state-in-effect` cũ ở `EditHotelPage.jsx:17` phải mất).

## Risk Assessment

- **API chi tiết không có `ngayGuiDuyet`** (câu hỏi BE #6): khi đó dùng `ngayCapNhat`; nếu ngày lệch thì chỉ lệch ở dòng phụ.
- **BE trả 403 `ACCOUNT_LOCKED`** (chứ không phải `NOT_OWNER`): hiện message API trong `ErrorState`, không hiện màn 13.5.
