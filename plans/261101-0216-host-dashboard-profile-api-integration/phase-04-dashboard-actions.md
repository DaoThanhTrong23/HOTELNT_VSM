---
phase: 4
title: "Màn 11: thao tác, xóa 1 / xóa nhiều, rút lại"
status: pending
priority: P1
effort: "3h"
dependencies: [3]
---

# Phase 4: Màn 11, thao tác trên từng cơ sở

## Goal

Các nút trên mỗi dòng có đúng nhãn như Figma 11.1, hiện theo `allowedActions`, và gọi đúng API:
- xóa một cơ sở (11.3, M11.3), xóa nhiều (11.1b, M11.1b) → `DELETE /host/listings/:maCSLT`;
- rút lại yêu cầu duyệt → `withdraw`, chỉ khi API cho phép.

Các nút còn lại chỉ điều hướng.

## Ràng buộc

- Chỉ sửa `HostDashboardPage.jsx` và test của nó, cộng thêm 2 file mới trong `src/pages/host/components/`.
- Không sửa `Modal.jsx` (dùng chung). Dialog xác nhận responsive là component riêng của Quân.

## Scout trước khi làm

- `get_design_context` cho `72:4946` (11.1b), `72:5274` (11.3), `126:810` (M11.1b), `126:947` (M11.3).
- Xác nhận Phase 3 đã xong: có `refetch` và test DASH đang xanh.
- Xác nhận `ROUTES.HOST.EDIT_HOTEL = '/host/hotels/:id/edit'` và `ROUTES.HOTEL_DETAIL = '/hotel/:id'`; dựng URL bằng `generatePath`.

## Files to Create / Modify

- Modify: `src/pages/host/HostDashboardPage.jsx`
- Modify: `src/pages/host/__tests__/HostDashboardPage.test.jsx` (thêm nhóm ACT)
- Create: `src/pages/host/components/listingActions.js`
- Create: `src/pages/host/components/ConfirmDialog.jsx`

## Thiết kế

### `listingActions.js` (dùng chung với Phase 7)

```js
export const ACTION_ORDER = ['PREVIEW', 'EDIT', 'SUBMIT', 'WITHDRAW', 'DELETE'];

// Chỉ dùng khi API không trả allowedActions. Suy ra từ ghi chú Excel:
// PUT sửa được DRAFT/REJECTED/HIDDEN/APPROVED và khóa PENDING; submit-review từ DRAFT/REJECTED/HIDDEN;
// DELETE cho DRAFT/REJECTED; withdraw cho PENDING; xem được mọi trạng thái của chính mình.
export const FALLBACK_ACTIONS = {
  DRAFT: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
  PENDING: ['PREVIEW', 'WITHDRAW'],
  APPROVED: ['PREVIEW', 'EDIT'],
  REJECTED: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
  HIDDEN: ['PREVIEW', 'EDIT', 'SUBMIT'],
};

export const resolveAllowedActions = (item) => { /* allowedActions hợp lệ → lọc theo ACTION_ORDER; thiếu → FALLBACK */ };
```

### Nút trên mỗi dòng (khớp Figma 11.1)

| Trạng thái | Figma | Ánh xạ |
|---|---|---|
| APPROVED | Xem · Sửa | PREVIEW → `Link` tới `/hotel/:id` (trang công khai). EDIT → `Link` tới trang sửa |
| PENDING | Xem (+ Rút lại) | PREVIEW → `Link` tới trang sửa (13.3 chỉ đọc). WITHDRAW, nếu có trong `allowedActions` → nút "Rút lại" |
| DRAFT | Sửa · Xóa | EDIT → trang sửa. DELETE → "Xóa" |
| REJECTED | Xem & sửa · Xóa | EDIT (hoặc PREVIEW) → một nút "Xem & sửa" tới trang sửa (13.4 có banner lý do). DELETE → "Xóa" |
| HIDDEN | Sửa & gửi lại | EDIT → trang sửa (banner `lyDoViPham`) |

- **Không** hiện nút cho `SUBMIT` (Figma 11.1 không có; gửi duyệt nằm trong form).
- **Không** có modal cảnh báo khi sửa CSLT Đã duyệt; cảnh báo nằm ở trang sửa (13.2).
- **Không** có modal lý do từ chối; lý do nằm ở banner trang sửa (13.4).
- Xóa khỏi file: modal cảnh báo APPROVED, modal lý do từ chối, `handleSubmitModeration`, link `/hotel/${id}` cho CSLT chưa duyệt.
- Nút nào không có trong `allowedActions` thì không render.

### Xóa một cơ sở (11.3, M11.3)

`ConfirmDialog` responsive, theo biến thể `danger`:
- **Desktop:** modal giữa màn hình. **Dưới 768px:** bottom sheet bám đáy.
- **Tiêu đề:** `Xóa “{tenCSLT}”?`
- **Nội dung:**
  - desktop: "Bản nháp này cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này.";
  - mobile: "Bản nháp cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Không thể hoàn tác.".
- Đặt `role="alertdialog"`, `aria-modal`, `aria-labelledby`. Đóng bằng phím Esc. Lúc mở thì focus vào nút Hủy, lúc đóng thì trả focus về nút đã mở dialog.
- **Luồng:**
  1. Bấm xác nhận thì gọi `deleteHostListing(maCSLT)`.
  2. Thành công: toast bằng `message` API (mặc định "Xóa cơ sở thành công"). Nếu đây là dòng cuối ở `page > 1` thì lùi một trang; còn lại gọi `refetch()`.
  3. 409 `LISTING_NOT_DELETABLE` / 404 / 403: toast lỗi bằng message API, rồi `refetch()`.

### Xóa nhiều (11.1b, M11.1b)

- Checkbox đầu bảng có 3 trạng thái: tắt, chọn một phần (`indeterminate`), chọn hết theo trang hiện tại.
- Khi có dòng được chọn, hiện thanh hành động (bulk action bar).
  - Desktop: "Đã chọn {n} cơ sở · chỉ xóa được Bản nháp và Bị từ chối" + nút "Bỏ chọn" + nút "Xóa".
  - Mobile (M11.1b): thanh bám đáy, "Đã chọn {n} cơ sở" + nút "Xóa".
- Chỉ những dòng có `DELETE` trong `allowedActions` mới được xóa. Nếu không dòng nào xóa được thì nút "Xóa" disabled.
- `ConfirmDialog` với tiêu đề "Xóa {k} cơ sở?", nội dung cùng ý với 11.3.
- **Xóa tuần tự** từng cơ sở bằng `deleteHostListing` (Excel không có API xóa hàng loạt). Không gọi song song, để tránh `RATE_LIMITED` và để biết rõ từng kết quả.
- Xong thì toast tổng kết:
  - đủ: "Đã xóa {k} cơ sở";
  - lỗi một phần: "Đã xóa {ok}/{k} cơ sở. {fail} cơ sở không xóa được: {tên…}" (`role="alert"`).
- Sau đó bỏ chọn và `refetch()`. Nếu trang hiện tại trống mà `page > 1` thì lùi một trang.

### Rút lại (khi `allowedActions` có WITHDRAW)

- `ConfirmDialog` biến thể `warning`:
  - tiêu đề "Rút lại yêu cầu kiểm duyệt?";
  - nội dung: cơ sở sẽ về Bản nháp để tiếp tục chỉnh sửa.
- Thành công: toast + `refetch()`.
- 409 `INVALID_STATE_TRANSITION` (Admin vừa xử lý xong): toast lỗi bằng message API + `refetch()`.

### Chặn bấm 2 lần và toast

- `pendingIds` (Set): các dòng đang xử lý có nút disabled kèm `aria-busy`. Nút xác nhận trong dialog hiện "Đang xử lý..." và disabled.
- **Toast:**
  - Lỗi dùng `role="alert"`, thành công dùng `role="status"`.
  - Timer lưu trong `useRef`, xóa khi unmount hoặc khi có toast mới, để không rò timer như `setTimeout` hiện tại (`HostDashboardPage.jsx:158`).

## Test Matrix (nhóm ACT trong `HostDashboardPage.test.jsx`)

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| ACT-01 | Nhãn nút theo trạng thái (dữ liệu có đủ `allowedActions`) | APPROVED: Xem, Sửa. PENDING: Xem. DRAFT: Sửa, Xóa. REJECTED: Xem & sửa, Xóa. HIDDEN: Sửa & gửi lại. Không có "Gửi duyệt" ở trạng thái nào |
| ACT-02 | Đích của link | APPROVED "Xem" → `/hotel/12`; PENDING "Xem" → `/host/hotels/12/edit`; mọi nút sửa → `/host/hotels/12/edit` |
| ACT-03 | Thiếu `allowedActions` | Dùng `FALLBACK_ACTIONS`; `allowedActions` có giá trị lạ thì bỏ qua |
| ACT-04 | PENDING có WITHDRAW | Có nút "Rút lại"; xác nhận thì gọi `withdrawListing(12)`, có toast, tải lại |
| ACT-05 | Rút lại bị 409 | Toast lỗi `role="alert"`, tải lại |
| ACT-06 | Xóa một | Dialog có tiêu đề `Xóa “Nhà Biển Xanh”?`. Hủy thì không gọi API. Xác nhận thì gọi `deleteHostListing(12)`, toast hiện `message` API, tải lại |
| ACT-07 | Xóa dòng cuối ở `page=2` | Lời gọi danh sách tiếp theo có `page: 1` |
| ACT-08 | Xóa bị 409 `LISTING_NOT_DELETABLE` | Toast lỗi bằng message API |
| ACT-09 | Chọn 2 dòng | Thanh hành động hiện "Đã chọn 2 cơ sở · chỉ xóa được Bản nháp và Bị từ chối"; checkbox đầu bảng ở trạng thái `indeterminate`; "Bỏ chọn" xóa lựa chọn |
| ACT-10 | Xóa nhiều: chọn 1 DRAFT + 1 APPROVED | Dialog "Xóa 1 cơ sở?"; chỉ gọi `deleteHostListing` cho DRAFT |
| ACT-11 | Xóa nhiều: lần 1 thành công, lần 2 bị 409 | Gọi tuần tự (lời gọi 2 bắt đầu sau khi lời gọi 1 xong); toast "Đã xóa 1/2 cơ sở…" kèm tên cơ sở lỗi |
| ACT-12 | Bấm xác nhận 2 lần | API gọi 1 lần |
| ACT-13 | Dialog trên mobile (`matchMedia` < 768px) | Có class bottom sheet; Esc đóng dialog; focus trả về nút đã mở |

## Tasks & Steps

- [x] Viết test ACT-01..13. Chạy, phải đỏ.
- [x] Tạo `listingActions.js`, `ConfirmDialog.jsx`.
- [x] Sửa phần nút, xóa một, xóa nhiều, rút lại trong `HostDashboardPage.jsx`; xóa modal không có trong Figma.
- [x] Chạy test cho tới khi xanh.

## Verification

- `npx vitest run src/pages/host/__tests__/HostDashboardPage.test.jsx` → pass.
- `npx oxlint src/pages/host` → 0 cảnh báo mới.
- `grep -nE "approved-edit-warning-modal|rejection-reason-modal|submit-moderation" src/pages/host/HostDashboardPage.jsx` → không có kết quả.

## Risk Assessment

- **BA bỏ WITHDRAW hoặc không cho xóa REJECTED** (cả hai đang "chờ BA chốt"): FE theo `allowedActions` của API nên không phải sửa.
- **Xóa nhiều quá lâu khi chọn nhiều:** một trang có tối đa 10 dòng, và xóa tuần tự 10 lời gọi là chấp nhận được.
