---
phase: 1
title: "A2 + A3: mở đúng CSLT mã 403/404, lý do trống"
status: pending
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: A2 + A3

## Goal

Trang Cập nhật mở mọi mã CSLT hợp lệ qua API, kể cả mã 403 và 404. Banner từ chối/ẩn không bịa lý do khi API không gửi lý do.

## Ràng buộc

- Chỉ sửa `EditHotelPage.jsx`, 2 dòng banner trong `ListingEditor.jsx` và `__tests__/EditHotelPage.test.jsx`.
- Không đụng `ListingAccessState.jsx` (chữ và nút "← Quay lại" theo Figma Ảnh 3 là đúng, báo cáo đã kiểm).

## Scout trước khi làm

```bash
grep -n "403\|404\|mock\|useSearchParams" src/pages/host/EditHotelPage.jsx
grep -n "lyDoTuChoi\|lyDoViPham" src/pages/host/components/listing-form/ListingEditor.jsx
grep -n "const renderEdit" -A12 src/pages/host/__tests__/EditHotelPage.test.jsx
```

Đo ngày 2026-11-08:
- `EditHotelPage.jsx:9-18`: khối bắt cứng.
- `ListingEditor.jsx:710`, `:716`: câu mẫu.
- `renderEdit` nhận `{ id, state }` và chưa có `search`.

## Test matrix (viết trước, phải đỏ trước khi sửa)

| ID | File | Tình huống | Kỳ vọng | Đỏ vì |
|---|---|---|---|---|
| EDIT-13 | `EditHotelPage.test.jsx` | Mở `/host/hotels/403/edit`, `/host/hotels/404/edit` và `/host/hotels/12/edit?mock=forbidden`. API trả CSLT bình thường | `getHostListingDetail` được gọi với `403` / `404` / `12`; hiện tiêu đề `Sea Breeze Homestay`; không hiện "Bạn không có quyền quản lí cơ sở này" | Hiện tại trả `ListingAccessState` mà không gọi API |
| EDIT-14 | `EditHotelPage.test.jsx` | REJECTED với `lyDoTuChoi: null`; HIDDEN với `lyDoViPham: null` | Cả hai banner hiện `Lý do: Không có ghi chú.` | Hiện tại hiện câu mẫu |

Giữ nguyên, phải vẫn xanh:
- `EDIT-01`: `NOT_OWNER` → màn 403.
- `EDIT-02`: 404 và id dạng chữ → màn không tìm thấy, id dạng chữ không gọi API.

## Tasks & Steps

- [x] 1. **Red.** Sửa helper `renderEdit` nhận thêm `search` (mặc định `''`) và truyền vào `initialEntries: [{ pathname, search, state }]`. Viết `EDIT-13`, `EDIT-14`. Chạy `npx vitest run src/pages/host/__tests__/EditHotelPage.test.jsx`. Ghi lại: đúng 2 test mới đỏ.
- [x] 2. **Green A2.** Trong `EditHotelPage.jsx`:
   - bỏ `useSearchParams`, biến `mock` và hai khối `if` (dòng 9–18);
   - trả file về đúng dạng trước `eb1af0a`: `useParams` → `toPositiveInt(id)` → `null` thì not-found → `<ListingEditor key={maCSLT} mode="edit" maCSLT={maCSLT} />`;
   - đối chiếu bằng `git show 1aa3342:src/pages/host/EditHotelPage.jsx`.
- [x] 3. **Green A3.** Trong `ListingEditor.jsx`, hai `FormBanner` REJECTED/HIDDEN dùng `detail?.lyDoTuChoi || 'Không có ghi chú.'` và `detail?.lyDoViPham || 'Không có ghi chú.'`. Giữ cách xuống dòng JSX nhiều dòng hiện tại.
- [x] 4. **Refactor.** Không có gì thêm. Không đổi chữ khác trong banner.
- [x] 5. Chạy cổng kiểm.

## Verification

```bash
npx vitest run src/pages/host/__tests__/EditHotelPage.test.jsx   # 100% qua
npx vitest run src/pages/host                                      # chỉ còn MODEL-05, MODEL-09 fail (nếu Phase 3 chưa làm)
npx oxlint src/pages/host                                          # không thêm warning (vẫn 2 warning A7 cho đến Phase 2)
grep -n "'403'\|'404'\|useSearchParams" src/pages/host/EditHotelPage.jsx   # không có kết quả
npm run build
```

## Rủi ro / Rollback

- Rủi ro thấp: chỉ bỏ code. Hành vi 403/404 vẫn đi qua `ACCESS_ERROR_CODES` trong `ListingEditor.jsx` (được `EDIT-01`, `EDIT-02` giữ).
- Rollback: `git checkout -- src/pages/host/EditHotelPage.jsx src/pages/host/components/listing-form/ListingEditor.jsx src/pages/host/__tests__/EditHotelPage.test.jsx`.
