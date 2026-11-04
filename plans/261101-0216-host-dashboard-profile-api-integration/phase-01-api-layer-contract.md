---
phase: 1
title: "Lớp API: hostApi.js (13 endpoint, contract tests)"
status: pending
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Lớp API (`hostApi.js`)

## Goal

Tạo một file API riêng cho phần Host của Quân. File chứa 13 endpoint thuộc phạm vi cùng bộ chuẩn hóa lỗi, và có test viết trước để khóa đúng hợp đồng trong `docs/Copy of API_DESIGN.xlsx`.

## Ràng buộc

- File nằm trong `src/pages/host/api/`, chỉ chứa endpoint mà 4 màn của Quân dùng.
- Không tạo, không sửa gì trong `src/services/`; `axiosClient` chỉ được import.
- Không thêm thư viện, không sửa `package.json`.

## Scout trước khi làm

- Đọc lại `src/services/axiosClient.js`. Xác nhận:
  - header mặc định `Content-Type: application/json` (dòng 5-7);
  - interceptor trả `response.data` (dòng 26-28) và ném lại lỗi nguyên vẹn (dòng 49).
- Chạy `git log -3 -- src/services/axiosClient.js` để chắc không ai vừa đổi file này.

## Files to Create / Modify

- Create: `src/pages/host/api/hostApi.js`
- Create: `src/pages/host/__tests__/hostApi.test.js`

## Thiết kế `hostApi.js`

### Phần lỗi (export để các trang dùng)

```js
export class ApiError extends Error {
  // name = 'ApiError'; status (number|null); code (string); details (array|object|null); traceId (string|null)
}

export const unwrapData = (body) =>
  body && typeof body === 'object' && body.success === true && 'data' in body ? body.data : body;

export const toApiError = (err) => { /* trả ApiError */ };

export const getFieldErrors = (apiError) => { /* details[] → { [field]: message } */ };

export const isCanceled = (err) => err?.code === 'CANCELED';
```

Quy tắc của `toApiError(err)`:

| Đầu vào | Kết quả |
|---|---|
| `err` đã là `ApiError` | giữ nguyên |
| `axios.isCancel(err)` hoặc `err.name === 'CanceledError'` | `code: 'CANCELED'` |
| `err.response.data.error.code` có | `status`, `code`, `message`, `details` (giữ nguyên dạng mảng hoặc object), `traceId` lấy từ body |
| Có `response` nhưng body lạ | `code` suy từ status: 400 → `VALIDATION_ERROR`, 401 → `TOKEN_INVALID`, 403 → `FORBIDDEN_ROLE`, 404 → `NOT_FOUND`, 409 → `CONFLICT`, 413 → `FILE_TOO_LARGE`, 415 → `UNSUPPORTED_MEDIA_TYPE`, 422 → `CHECKLIST_INCOMPLETE`, 429 → `RATE_LIMITED`, ≥500 → `INTERNAL_ERROR` |
| `err.code === 'ECONNABORTED'` | `code: 'TIMEOUT'`, `"Máy chủ phản hồi quá lâu. Vui lòng thử lại."` |
| Không có `response` | `code: 'NETWORK_ERROR'`, `"Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại."` |

Message mặc định lấy đúng sheet Error Format, ví dụ 500: `"Hệ thống đang gặp sự cố. Vui lòng thử lại sau."`

### Phần endpoint

Mỗi hàm gọi `axiosClient`, trả `unwrapData(body)`, và bắt lỗi rồi ném lại `toApiError(err)`. Mọi hàm nhận `maCSLT` hoặc `mediaId` đều kiểm tra số nguyên dương; sai thì ném `ApiError VALIDATION_ERROR` và không gọi mạng.

| Hàm | Lời gọi |
|---|---|
| `getHostProfile({ signal } = {})` | `GET /host/profile` |
| `updateHostProfile(changes)` | `PATCH /host/profile`. Body chỉ gồm `hoTen` / `soDienThoai` có trong `changes`, bỏ mọi khóa khác. Rỗng thì ném `VALIDATION_ERROR`, không gọi mạng |
| `changeHostPassword({ oldPassword, newPassword })` | `POST /host/profile/change-password`, body đúng 2 khóa |
| `getHostListings({ trangThai, keyword, page, limit } = {}, { signal } = {})` | `GET /host/listings`. `params` bỏ `undefined`, `null`, `''`; trim `keyword`; bỏ `trangThai === 'ALL'` |
| `getHostListingDetail(maCSLT, { signal } = {})` | `GET /host/listings/${maCSLT}` |
| `createHostListing(payload)` | `POST /host/listings` với `pickListingBody(payload)` |
| `updateHostListing(maCSLT, payload)` | `PUT /host/listings/${maCSLT}` với `pickListingBody(payload)` |
| `uploadListingMedia(maCSLT, { file, type }, { onProgress, signal } = {})` | `POST /host/listings/${maCSLT}/media`. `FormData` gồm field `file` và `type` (`'IMAGE'`/`'VIDEO'`). **Bắt buộc** truyền `headers: { 'Content-Type': 'multipart/form-data' }`, vì header JSON mặc định khiến axios đổi FormData thành JSON (`node_modules/axios/lib/defaults/index.js:56-57`). `onUploadProgress` → `onProgress(percent 0-100)` |
| `deleteListingMedia(maCSLT, mediaId)` | `DELETE /host/listings/${maCSLT}/media/${mediaId}` |
| `submitListingForReview(maCSLT)` | `POST /host/listings/${maCSLT}/submit-review` |
| `withdrawListing(maCSLT)` | `POST /host/listings/${maCSLT}/withdraw` |
| `deleteHostListing(maCSLT)` | `DELETE /host/listings/${maCSLT}` |
| `getFilterOptions({ signal } = {})` | `GET /filter-options` |

`pickListingBody(payload)` chỉ giữ các khóa trong Excel: `tenCSLT`, `maLoai`, `maPhuong`, `diaChiChiTiet`, `moTa`, `lienHe` (chỉ `soDienThoai`, `zalo`, `facebook`), `gia`, `maTienIch`, `latitude`, `longitude`.
- Bỏ khóa có giá trị `undefined`.
- Giữ `null` để xóa giá trị, ví dụ xóa `moTa` hoặc liên hệ.

Hằng số export: `HOST_LISTINGS_PAGE_SIZE = 10`.

## Test Matrix (viết trước)

`src/pages/host/__tests__/hostApi.test.js` dùng `vi.mock('../../../services/axiosClient')` với `get`, `post`, `put`, `patch`, `delete` là `vi.fn()`.

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| ERR-01 | Body lỗi chuẩn 409 `ACCOUNT_DUPLICATED` có `details[]` và `traceId` | `ApiError` đủ `status`, `code`, `message`, `details`, `traceId` |
| ERR-02 | 500 với body HTML/rỗng | `INTERNAL_ERROR` + message đúng sheet |
| ERR-03 | Không có response | `NETWORK_ERROR` |
| ERR-04 | `ECONNABORTED` | `TIMEOUT` |
| ERR-05 | `CanceledError` | `CANCELED`, `isCanceled()` trả true |
| ERR-06 | `unwrapData` với 2 dạng body | cả hai trả data |
| ERR-07 | `getFieldErrors` với `details[]` / object / null | map field→message / `{}` / `{}` |
| SVC-01 | `getHostProfile` | `get('/host/profile', { signal })` |
| SVC-02 | `updateHostProfile({ hoTen: 'A', email: 'x', cccd: 'y' })` | `patch('/host/profile', { hoTen: 'A' })` |
| SVC-03 | `updateHostProfile({})` | ném `VALIDATION_ERROR`, không gọi `patch` |
| SVC-04 | `changeHostPassword` | `post('/host/profile/change-password', { oldPassword, newPassword })` |
| SVC-05 | `getHostListings({ trangThai: 'PENDING', keyword: '  sea ', page: 2, limit: 10 })` | `params` đúng 4 khóa, `keyword: 'sea'` |
| SVC-06 | `getHostListings({ trangThai: 'ALL', keyword: '' })` | `params` không có `trangThai`, `keyword` |
| SVC-07 | `getHostListingDetail(12)` | `get('/host/listings/12', { signal })` |
| SVC-08 | `createHostListing({ ...đủ trường, foo: 1, lienHe: { soDienThoai: '0905123456', x: 1 } })` | `post('/host/listings', body)`; body không có `foo` và `lienHe.x` |
| SVC-09 | `updateHostListing(12, { moTa: null, tenCSLT: 'A', ... })` | `put('/host/listings/12', body)` vẫn giữ `moTa: null` |
| SVC-10 | `uploadListingMedia(12, { file, type: 'IMAGE' }, { onProgress })` | `post('/host/listings/12/media', FormData)`, FormData có `file` và `type`; config có header `multipart/form-data` và `signal`; gọi `onUploadProgress({ loaded: 50, total: 100 })` thì `onProgress(50)` |
| SVC-11 | `deleteListingMedia(12, 7)` | `delete('/host/listings/12/media/7')` |
| SVC-12 | `submitListingForReview(12)` | `post('/host/listings/12/submit-review')` |
| SVC-13 | `withdrawListing(12)` | `post('/host/listings/12/withdraw')` |
| SVC-14 | `deleteHostListing(12)` | `delete('/host/listings/12')` |
| SVC-15 | `getFilterOptions` | `get('/filter-options', { signal })` |
| SVC-16 | `maCSLT` / `mediaId` = `undefined`, `0`, `'abc'` | ném `VALIDATION_ERROR`, không gọi mạng |
| SVC-17 | axios ném 422 `CHECKLIST_INCOMPLETE` / 413 / 415 | reject với `ApiError` đúng `code` |

## Tasks & Steps

- [x] Viết `hostApi.test.js` (ERR-01..07, SVC-01..17). Chạy, phải đỏ.
- [x] Viết `hostApi.js` cho tới khi xanh.
- [x] Rà lại từng dòng bảng hợp đồng trong `plan.md` với test tương ứng.

## Verification

- `npx vitest run src/pages/host/__tests__/hostApi.test.js` → pass.
- `npx oxlint src/pages/host/api` → 0 cảnh báo.
- `git status --short` → chỉ có file mới trong `src/pages/host/`.

## Risk Assessment

- **A1 sai (body dạng khác):** khi có BE, giá trị trả về bị `undefined`. Chỉ cần sửa `unwrapData`.
- **Header upload:** nếu bỏ phần ghi đè header thì ảnh sẽ gửi đi dưới dạng JSON rỗng. Test SVC-10 chặn hồi quy này.
