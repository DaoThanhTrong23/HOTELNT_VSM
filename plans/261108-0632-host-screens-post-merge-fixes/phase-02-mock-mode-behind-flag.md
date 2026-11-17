---
phase: 2
title: "A1 + A4 + A5 + A7 + A8: dữ liệu giả chỉ khi bật VITE_USE_MOCK"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: dữ liệu giả chỉ khi bật `VITE_USE_MOCK`

## Goal

Khi không bật mock, mọi lỗi mạng ở form Thêm mới/Cập nhật hiện lỗi đúng chỗ, không báo thành công, không đổi trạng thái. Khi `VITE_USE_MOCK=true`, form chạy hết bằng dữ liệu giả ở lớp API (D6, D7, D8 trong `plan.md`). Chunk mock không nằm trong bundle chính.

## Ràng buộc

- File được sửa:
  - `api/hostApi.js`
  - `api/hostMockApi.js` (tạo mới)
  - `components/listing-form/ListingEditor.jsx`
  - `components/listing-form/MediaStep.jsx`
  - `components/listing-form/listingFormModel.js`
  - các test: `hostApi.test.js`, `hostMockApi.test.jsx` (tạo mới), `AddHotelPage.test.jsx`, `EditHotelPage.test.jsx`, `MediaStep.test.jsx`
- `src/mocks/mockListings.js`: chỉ `import { USE_MOCK }`, không sửa.
- Giữ nguyên hành vi Trọng sửa mà báo cáo đã kiểm là đúng: vị trí `reloadDetail()` trong luồng rút lại, dòng phụ "Ẩn ngày …", câu "Sau khi gửi lại, cơ sở sẽ chuyển sang Chờ duyệt".
- Các test hợp đồng `SVC-*`/`ERR-*` hiện có không được sửa kỳ vọng.

## Scout trước khi làm

```bash
grep -n "NETWORK_ERROR\|TIMEOUT\|getMockListingDetail\|location.search\|requestedStatus" src/pages/host/components/listing-form/ListingEditor.jsx
grep -n "NETWORK_ERROR\|TIMEOUT\|mockMedia\|Date.now\|Math.random" src/pages/host/components/listing-form/MediaStep.jsx
grep -n "DEFAULT_\|resolveOptions = \|getMockListingDetail" src/pages/host/components/listing-form/listingFormModel.js
grep -rn "DEFAULT_PROPERTY_TYPES\|DEFAULT_WARDS\|DEFAULT_AMENITIES\|DEFAULT_NEARBY_PLACES\|getMockListingDetail" src --include="*.js" --include="*.jsx"
grep -n "export const resolveAllowedActions\|FALLBACK_ACTIONS" src/pages/host/components/listingActions.js
git show a27dec5 eb1af0a -- src/pages/host/components/listing-form/   # xem đúng các chỗ cần gỡ
```

Đo ngày 2026-11-08:
- `ListingEditor.jsx`: nhánh giả ở `157` (danh mục), `190–205` (chi tiết, đọc `?status=`), `380–395` (tạo), `413–433` (lưu), `467–473` (gửi duyệt), `497–506` (rút lại). Deps `location.search` ở `209`. Import `getMockListingDetail` ở `48`.
- `MediaStep.jsx`: `142–152` (upload giả), `215–216` (xóa giả).
- `listingFormModel.js`: `21–64` (danh mục mặc định), `88–112` (`resolveOptions` dùng danh mục mặc định), `372–494` (`getMockListingDetail`).
- Chỉ `ListingEditor.jsx` import `getMockListingDetail`. Không file nào ngoài `listingFormModel.js` dùng `DEFAULT_*` danh mục.

## Thiết kế

### `api/hostApi.js`

```js
import { USE_MOCK } from '../../../mocks/mockListings';

// VITE_USE_MOCK=true: the listing form runs on in-memory data (hostMockApi.js).
// Loaded with import() so the mock stays out of the main bundle.
const viaMock = (name, ...args) => import('./hostMockApi').then(({ hostMockApi }) => hostMockApi[name](...args));
```

Rẽ nhánh trong 8 hàm. Luật kiểm id và body vẫn chạy trước khi rẽ:

| Hàm | Khi `USE_MOCK` |
|---|---|
| `getFilterOptions({ signal })` | `viaMock('getFilterOptions')` |
| `getHostListingDetail(maCSLT)` | trong `withListingId`: `viaMock('getHostListingDetail', id)` |
| `createHostListing(payload)` | `viaMock('createHostListing', pickListingBody(payload))` |
| `updateHostListing(maCSLT, payload)` | trong `withListingId`: `viaMock('updateHostListing', id, pickListingBody(payload))` |
| `uploadListingMedia(maCSLT, { file, type }, { onProgress })` | sau khi kiểm `type`: `viaMock('uploadListingMedia', id, { file, type }, { onProgress })` |
| `deleteListingMedia(maCSLT, mediaId)` | sau `requireId(mediaId)`: `viaMock('deleteListingMedia', id, media)` |
| `submitListingForReview(maCSLT)` | `viaMock('submitListingForReview', id)` |
| `withdrawListing(maCSLT)` | `viaMock('withdrawListing', id)` |

Không đổi: `getHostProfile`, `updateHostProfile`, `changeHostPassword`, `getHostListings`, `deleteHostListing` (D8).

### `api/hostMockApi.js` (tạo mới)

- Đầu file có comment một dòng: chỉ được nạp khi `VITE_USE_MOCK=true` (qua `hostApi.js`). Mã 1–5 theo trạng thái, 6 là CSLT của Host khác.
- Import:
  - `ApiError` từ `./hostApi`. Không tạo vòng import tĩnh, vì `hostApi` nạp file này bằng `import()`.
  - `DEFAULT_PRICE_RANGE` từ `../components/listing-form/listingFormModel`.
  - `FALLBACK_ACTIONS` (hoặc `resolveAllowedActions`) từ `../components/listingActions`, để tính `allowedActions` theo trạng thái. Không lặp lại bảng này.
- `FILTER_OPTIONS`:
  - chuyển nguyên `DEFAULT_PROPERTY_TYPES`, `DEFAULT_WARDS`, `DEFAULT_AMENITIES`, `DEFAULT_NEARBY_PLACES` từ `listingFormModel.js` sang đây, dưới dạng `propertyTypes`, `wards`, `amenities`, `nearbyPlaces`;
  - `priceRange: { giaMin: DEFAULT_PRICE_RANGE.min, giaMax: DEFAULT_PRICE_RANGE.max }`.
- `seedListings()`:
  - chuyển dữ liệu của `getMockListingDetail` sang đây thành 5 bản ghi tĩnh: `1` APPROVED, `2` REJECTED (có `lyDoTuChoi`), `3` PENDING (có `ngayGuiDuyet`), `4` HIDDEN (có `lyDoViPham`), `5` DRAFT;
  - giữ tên, giá, ảnh như Trọng viết.
- Trạng thái trong module: `let listings` (Map theo `maCSLT`) và `let nextId = 1000`. Export `resetHostMockStore()` để test dùng.
- Mọi giá trị trả ra là bản sao (`structuredClone`), để component không sửa được dữ liệu trong mock.
- Hành vi (theo hợp đồng ở plan 261101, đủ để thay đúng các nhánh giả của Trọng):

| Hàm | Hành vi |
|---|---|
| `getFilterOptions()` | Trả `FILTER_OPTIONS` |
| `getHostListingDetail(id)` | `6` → `ApiError` 403 `NOT_OWNER`. Không có → 404 `LISTING_NOT_FOUND`. Có → bản sao kèm `allowedActions`, `soAnh`, `soVideo`, `checklistGuiDuyet` (tính bằng `computeChecklist(toFormValues(listing), counts, resolveOptions(FILTER_OPTIONS))`) |
| `createHostListing(body)` | Tạo `{ ...body, maCSLT: nextId++, trangThai: 'DRAFT', media: [], ngayTao, ngayCapNhat }`. Trả `{ maCSLT, trangThai }` |
| `updateHostListing(id, body)` | PENDING → 409 `LISTING_LOCKED_PENDING`. APPROVED → chuyển PENDING, trả `{ maCSLT, trangThai: 'PENDING', thayDoiTrangThai: true, message: 'Đã lưu thay đổi. Cơ sở chuyển sang Chờ duyệt.' }`. Trạng thái khác giữ nguyên, trả `thayDoiTrangThai: false` |
| `uploadListingMedia(id, { file, type }, { onProgress })` | PENDING → 409 `LISTING_LOCKED_PENDING`. Thêm `{ mediaId, type, url, thuTu }`, trong đó `url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''`. Gọi `onProgress?.(100)`. APPROVED → PENDING. Trả media kèm `soAnh`, `soVideo`, `thayDoiTrangThai` |
| `deleteListingMedia(id, mediaId)` | Không có → 404 `MEDIA_NOT_FOUND`. Có → gỡ, APPROVED → PENDING, trả `{ soAnh, soVideo, thayDoiTrangThai }` |
| `submitListingForReview(id)` | Trạng thái không có `SUBMIT` → 409 `INVALID_STATE_TRANSITION`. Có → PENDING, `ngayGuiDuyet = now`, trả `{ maCSLT, trangThai: 'PENDING' }` |
| `withdrawListing(id)` | Không phải PENDING → 409 `INVALID_STATE_TRANSITION`. PENDING → DRAFT |

`mediaId` và `maCSLT` tăng dần, không dùng `Math.random`/`Date.now` để sinh mã (A7).

### `ListingEditor.jsx`

- Bỏ import `getMockListingDetail`.
- Effect danh mục: lỗi nào cũng `setOptionsState({ status: 'error', data: null, error })`, như trước `a27dec5`.
- Effect chi tiết:
  - bỏ nhánh mạng giả (190–205) và biến `requestedStatus`;
  - deps trở về `[listingId, detailReloadKey]`. Điều này sửa luôn A8.
- `save()`: bỏ hai nhánh giả (tạo 380–395, lưu 413–433). Lỗi đi vào `handleActionError`, và `SYSTEM_ERROR_CODES` cho ra `SAVE_SYSTEM_ERROR`.
- `handleSubmit`: bỏ nhánh giả 467–473.
- `handleWithdraw`: bỏ nhánh giả 497–506. Giữ thứ tự Trọng đặt: lỗi quyền thì `setAccessError` và dừng; lỗi khác thì banner + `reloadDetail()`.
- `useLocation()` vẫn dùng cho toast qua điều hướng (không đổi).

### `MediaStep.jsx`

- Bỏ nhánh upload giả (142–152). Lỗi mạng đi vào nhánh `else`: mục tải lên hiện `err.message`.
- Bỏ nhánh xóa giả (215–216). Lỗi mạng đi vào nhánh `else`: `onNotify` toast lỗi.
- Xong hai việc trên thì hết 2 warning A7.

### `listingFormModel.js`

- Xóa `DEFAULT_PROPERTY_TYPES`, `DEFAULT_WARDS`, `DEFAULT_AMENITIES`, `DEFAULT_NEARBY_PLACES` (đã chuyển sang mock).
- `resolveOptions` trả lại `list(...)` thô cho 4 danh mục, như trước `a27dec5`.
- Xóa `getMockListingDetail`.
- Giữ `DEFAULT_PRICE_RANGE` (giá trị do Phase 3 chốt) và `DEFAULT_MAP_BOUNDS`.

## Test matrix (viết trước, phải đỏ trước khi sửa)

### Khi không bật mock (lỗi mạng phải là lỗi)

Dùng `new ApiError({ code: 'NETWORK_ERROR' })`. Với mỗi test: không có toast thành công, không đổi badge trạng thái.

| ID | File | Tình huống | Kỳ vọng | Đỏ vì |
|---|---|---|---|---|
| ADD-14 | `AddHotelPage.test.jsx` | `/filter-options` lỗi mạng | `ErrorState` "Không tải được dữ liệu" + nút "Thử lại"; không có lựa chọn "Lộc Thọ"; bấm "Thử lại" gọi lại `getFilterOptions` | Đang dùng danh mục tự đặt (A4) |
| ADD-15 | `AddHotelPage.test.jsx` | Bước 1 hợp lệ, `createHostListing` lỗi mạng | Banner "Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại."; không có "Đã lưu tạo mới"; URL không có `id`; bước 2–4 vẫn khóa | Đang sinh mã ngẫu nhiên (A1) |
| ADD-16 | `AddHotelPage.test.jsx` | `?id=12&step=2`, sửa Giá chưa lưu, bấm bước 1 rồi quay lại bước 2 | Ô Giá giữ giá trị vừa nhập; `getHostListingDetail` chỉ được gọi 1 lần | Deps `location.search` tải lại và ghi đè (A8) |
| EDIT-15 | `EditHotelPage.test.jsx` | Chi tiết lỗi mạng | `ErrorState` + "Thử lại"; không có tiêu đề dữ liệu mẫu "Sea Breeze Homestay"; "Thử lại" gọi lại API | Đang nạp `getMockListingDetail` (A1, A5) |
| EDIT-16 | `EditHotelPage.test.jsx` | APPROVED, sửa tên, "Lưu thay đổi" → "Vẫn lưu", `updateHostListing` lỗi mạng | Banner lỗi lưu như ADD-15; badge vẫn "Đã duyệt"; nút "Lưu thay đổi" vẫn bật | Đang giả PENDING (A1) |
| EDIT-17 | `EditHotelPage.test.jsx` | REJECTED đủ 7/7, "Gửi kiểm duyệt lại", `submitListingForReview` lỗi mạng | Banner lỗi; không có "Đã gửi kiểm duyệt"; badge vẫn "Bị từ chối" | Đang giả PENDING (A1) |
| EDIT-18 | `EditHotelPage.test.jsx` | PENDING có WITHDRAW, "Rút lại yêu cầu" → "Rút lại", `withdrawListing` lỗi mạng | Banner hiện `error.message`; badge vẫn "Chờ duyệt"; không có toast "Đã rút lại…" | Đang giả DRAFT (A1) |
| MED-13 | `MediaStep.test.jsx` | Upload lỗi mạng | Mục tải lên hiện "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại."; `onUploaded` không được gọi | Đang giả đã tải lên (A1) |
| MED-14 | `MediaStep.test.jsx` | Xóa ảnh lỗi mạng | `onDeleted` không được gọi; `onNotify` nhận `{ type: 'error' }` | Đang giả đã xóa (A1) |

### Khi bật mock (`__tests__/hostMockApi.test.jsx`, tạo mới)

Ở đầu file:
- `vi.mock('../../../mocks/mockListings', () => ({ USE_MOCK: true }))`;
- `vi.mock('../../../services/axiosClient', …)`, trong đó mọi method ném lỗi để chứng minh không gọi mạng;
- `beforeEach(resetHostMockStore)`.

| ID | Tình huống | Kỳ vọng |
|---|---|---|
| MOCK-01 | Gọi 8 hàm form qua `hostApi` | Có kết quả từ mock; `axiosClient` không được gọi |
| MOCK-02 | `getHostListings()` khi bật mock | Vẫn gọi `axiosClient.get('/host/listings', …)` (ranh giới D8) |
| MOCK-03 | `getFilterOptions()` | Có 4 danh mục và `priceRange` bằng `DEFAULT_PRICE_RANGE` |
| MOCK-04 | Chi tiết mã 1–5, 6, 999 | Đúng 5 trạng thái, có `lyDoTuChoi`/`lyDoViPham` ở 2/4; mã 6 ném `NOT_OWNER`; mã 999 ném `LISTING_NOT_FOUND` |
| MOCK-05 | Tạo rồi đọc lại; sửa object trả về | Mã ≥ 1000, tăng dần, `DRAFT`; đọc lại thấy giá trị vừa tạo; sửa object trả về không làm đổi dữ liệu trong mock |
| MOCK-06 | Lưu DRAFT / APPROVED / PENDING | DRAFT giữ, `thayDoiTrangThai: false`; APPROVED → PENDING, `true`; PENDING ném `LISTING_LOCKED_PENDING` |
| MOCK-07 | Gửi duyệt và rút lại | DRAFT → PENDING; PENDING → DRAFT; rút lại từ DRAFT ném `INVALID_STATE_TRANSITION` |
| MOCK-08 | Upload rồi xóa media | Upload tăng `soAnh`, APPROVED → PENDING; xóa giảm `soAnh`; xóa mã lạ ném `MEDIA_NOT_FOUND` |
| MOCK-09 | Render `AddHotelPage` (dùng `hostApi` thật) ở chế độ mock: chọn loại hình, phường, nhập tên và địa chỉ, "Lưu tạo mới" | Không có banner lỗi; URL có `?id=1000&step=2`; bước 2 mở |

### Ghim chế độ thật cho test hợp đồng

- `hostApi.test.js`: thêm `vi.mock('../../../mocks/mockListings', () => ({ USE_MOCK: false }))`. Không đổi kỳ vọng nào.

## Tasks & Steps

- [x] 1. **Red.**
   - Viết ADD-14/15/16, EDIT-15/16/17/18, MED-13/14 vào các file hiện có.
   - Tạo `hostMockApi.test.jsx` với MOCK-01…09.
   - Ghim `USE_MOCK: false` trong `hostApi.test.js`.
   - Chạy `npx vitest run src/pages/host` và ghi lại: 9 test mới đỏ, file `hostMockApi.test.jsx` đỏ (thiếu module), `MODEL-05`/`MODEL-09` đỏ nếu Phase 3 chưa làm. Không test cũ nào khác đỏ.
- [x] 2. **Green: mock.**
   - Tạo `api/hostMockApi.js`, chuyển danh mục và bản ghi mẫu từ `listingFormModel.js` sang theo bảng thiết kế.
   - Thêm `USE_MOCK` + `viaMock` vào 8 hàm trong `hostApi.js`.
   - Chạy `hostMockApi.test.jsx` và `hostApi.test.js` → xanh.
- [x] 3. **Green: gỡ nhánh giả.** Sửa `ListingEditor.jsx`, `MediaStep.jsx`, `listingFormModel.js` theo thiết kế. Chạy toàn bộ `src/pages/host` → xanh (trừ MODEL-05/09 nếu Phase 3 chưa làm).
- [x] 4. **Refactor.**
   - Đọc lại diff, so với `git show 1aa3342:<file>` để chắc phần gỡ đưa code về đúng dạng trước merge, trừ các chỗ Trọng sửa mà báo cáo giữ lại.
   - Không thêm comment ngoài comment đầu file mock và comment trên `viaMock`.
- [x] 5. **Bundle.**
   - Chạy `npm run build` khi không có `.env`.
   - `grep -l "Sea Breeze" dist/assets/index-*.js` phải không ra kết quả.
   - `ls dist/assets | grep -i mock` phải có chunk riêng.
- [ ] 6. **Chạy tay ở chế độ mock (tùy chọn, không commit `.env`).** _(2026-11-08: chưa chạy. `MOCK-09` đã chạy luồng Thêm mới bằng mock qua `import()` thật; mở dev server là việc tùy chọn của Quân.)_
   - Chạy `VITE_USE_MOCK=true npm run dev` (port mặc định 5173; nếu port đang bận thì dừng tiến trình cũ, không đổi port).
   - Mở `/host/hotels/new`, `/host/hotels/1/edit` … `/host/hotels/6/edit`, `/host/hotels/999/edit`.
   - Dừng dev server khi xong.

## Verification

```bash
npx vitest run src/pages/host            # 100% qua (trừ MODEL-05/09 nếu Phase 3 chưa làm)
npx oxlint src/pages/host                # 0 warning
grep -rn "=== 'NETWORK_ERROR'" src/pages/host/components src/pages/host/*.jsx            # không có kết quả
grep -rnE "getMockListingDetail|DEFAULT_WARDS|DEFAULT_PROPERTY_TYPES|Math\.random|requestedStatus" src/pages/host --exclude-dir=__tests__ | grep -v hostMockApi.js   # không có kết quả
npm run build && ! grep -l "Sea Breeze" dist/assets/index-*.js && ls dist/assets | grep -i mock
git diff --name-only 23ae700 -- . ':!plans'   # chỉ src/pages/host/**
```

## Kết quả thực hiện (2026-11-08)

- Red: đúng 9 test mới đỏ + `hostMockApi.test.jsx` đỏ (thiếu module) + `MODEL-05/09`. Không test cũ nào đỏ thêm.
- `MediaStep.jsx` sau khi gỡ giống hệt `1aa3342`. `ListingEditor.jsx` chỉ còn các chỗ Trọng sửa mà báo cáo giữ lại.
- Lệch so với thiết kế:
  - `deleteListingMedia` của mock thêm chặn PENDING (409 `LISTING_LOCKED_PENDING`), theo hợp đồng DELETE media ở plan 261101 (dòng API #12), cho giống `uploadListingMedia`.
  - Mock gán `kichThuoc` cho video mẫu và file tải lên, vì `MediaStep` đọc `kichThuoc` (Trọng ghi `dungLuong`). Bỏ `isCover`, `tenFile` vì FE không đọc.
  - Kiểm bundle: `"Sea Breeze"` vẫn có trong `index-*.js` vì placeholder `"Ví dụ: Sea Breeze Homestay"` ở `BasicInfoStep.jsx` (có từ `1aa3342`, không phải dữ liệu giả). Đã kiểm bằng các chuỗi chỉ có trong mock (`Trần Phú Central Hotel`, `seabreezehomestay`, `Phát hiện vi phạm tiêu chuẩn`, `Phước Tiến`, `Gần Tháp Bà Ponagar`): không có trong `index-*.js`, có trong `hostMockApi-*.js`.
- Bước 6 (chạy tay ở chế độ mock): chưa làm, xem ghi chú ở bước 6.
- Bản lưu trước phase: `<scratchpad>/before-phase-02.patch`.

## Rủi ro / Rollback

- **`import()` động trong Vitest:** chạy được sẵn. Nếu `vi.mock` của `mockListings` không áp vào `hostApi` do khác đường dẫn, dùng đúng chuỗi `'../../../mocks/mockListings'` tính từ `__tests__/`. Hai đường dẫn cùng trỏ về `src/mocks/mockListings.js`.
- **`structuredClone` không có trong jsdom cũ:** dùng `JSON.parse(JSON.stringify(...))`. Dữ liệu mock chỉ là JSON, nên cách này đủ.
- **Rollback:**
  - Trước khi bắt đầu phase, lưu phần đã sửa của Phase 1 (nếu chưa commit) bằng `git diff -- src/pages/host > <scratchpad>/before-phase-02.patch`.
  - Khi cần quay lại:
    1. `git checkout -- src/pages/host`;
    2. xóa `api/hostMockApi.js` và `__tests__/hostMockApi.test.jsx`;
    3. `git apply <scratchpad>/before-phase-02.patch`.
