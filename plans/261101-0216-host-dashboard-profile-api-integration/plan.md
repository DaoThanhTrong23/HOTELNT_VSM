---
title: "Nối API cho phần Host của Quân (Màn 11, 12, 13 + Hồ sơ) theo API_DESIGN.xlsx và Figma"
description: "Thay dữ liệu giả ở Dashboard CSLT, Thêm mới CSLT, Cập nhật CSLT và Hồ sơ Host bằng lời gọi API đúng hợp đồng trong docs/Copy of API_DESIGN.xlsx, giao diện theo Figma HotelNT_Design trang 02 — Host, phát triển theo TDD vì chưa có backend."
status: in-progress
priority: P1
effort: 28h
branch: feature/quan-dashbds
tags: [feature, frontend, api, tdd]
blockedBy: []
blocks: []
created: 2026-11-01
---

# Nối API cho phần Host của Quân

## Overview

Plan này nối API cho 4 màn của Quân. Cả 4 màn hiện chạy bằng dữ liệu giả, chưa gọi API nào.

| Màn | Figma (trang `02 — Host`, file `91utres8M8fA8jrmsbCYJi`) | File code |
|---|---|---|
| 11 · Danh sách CSLT | Frame 1–4 (11.1, 11.1b, 11.2, 11.3), M11.1–M11.3 | `HostDashboardPage.jsx` |
| 12 · Thêm mới CSLT | Frame 6–11 (12.1–12.6), M12.1–M12.6 | `AddHotelPage.jsx` |
| 13 · Cập nhật CSLT | Frame 12–16 (13.1–13.5), M13.1–M13.5 | `EditHotelPage.jsx` |
| Hồ sơ Host (#9) | `[Web] Quản lý tài khoản` (153:964 / 153:1039), `[Mobile]Quản lý thông tin` (161:1468) | `HostProfilePage.jsx` |

Chưa có backend: `api.hotelnt.com` không phân giải DNS và dự án chưa có `.env`. Vì vậy việc nối API được làm "mù", khóa bằng test hợp đồng: mỗi test kiểm đúng method, path, query, body và cách xử lý từng mã lỗi trong sheet "Error Format".

## Ràng buộc phạm vi (yêu cầu của Quân)

**Chỉ làm phần giao diện được giao, không lấn sang người khác.**

- Quân xác nhận (2026-11-01) rằng Màn 11, 12, 13 trong Figma (Frame 1–16, M11.1–M13.5) là của Quân.
  - File `docs/Copy of PhanCong_CODE.xlsx` lại ghi `AddHotelPage.jsx` / `EditHotelPage.jsx` cho Thanh Trọng. Quân nên báo Trọng để tránh hai người cùng làm.
- Mọi file mới nằm trong `src/pages/host/`. Chỉ sửa 4 trang của Quân và test của chúng.
- **Không tạo, không sửa** file trong `src/services/`, `src/hooks/`, `src/components/`, `src/context/`, `src/constants/`, `src/utils/`, `src/layouts/`, `src/routes/`, và không sửa `package.json`.
- File dùng chung chỉ được **import để dùng**: `axiosClient`, `Modal`, `ErrorState`, `LoadingSpinner`, `StatusBadge`, `formatCurrency`, `formatDate`, `HOTEL_STATUS`, `MEDIA_LIMITS`, `NHA_TRANG_MAP_BOUNDS`, `ROUTES`.
- Top bar và bottom nav mobile trong Figma thuộc layout dùng chung (`HostLayout`, `Sidebar`), nên **không làm**, chỉ ghi chú cho team (quyết định của Quân).

## Quyết định đã chốt với Quân (2026-11-01)

| # | Chỗ Figma lệch API | Quyết định |
|---|---|---|
| D1 | Giá: Figma có Giá từ / Giá đến / Chu kỳ, khoảng 50.000–100.000.000. API chỉ có `gia`, khoảng 500.000–100.000.000 | **Theo API:** form có 1 ô "Giá tham khảo", giới hạn lấy từ `priceRange` của `/filter-options` (mặc định 500.000–100.000.000). Dashboard hiện 1 mức giá |
| D2 | Hồ sơ: Figma có Giới tính, Ngày sinh. API và SRS không có | **Bỏ 2 trường này.** Phần còn lại theo Figma |
| D3 | Ảnh: Figma cho "Kéo để đổi thứ tự", API không có endpoint sắp xếp | **Kéo thả chỉ trên giao diện:** đổi thứ tự cục bộ, không lưu lên server, tải lại trang sẽ về thứ tự `thuTu`. Ghi câu hỏi gửi BE |
| D4 | Nav mobile (top bar, bottom nav) nằm trong layout dùng chung | **Để người phụ trách layout làm** |
| D5 | Figma 11.1 không có 4 thẻ thống kê, chỉ có số trên tab | **Theo Figma:** bỏ khối `sr-only` 4 thẻ, giữ số trên tab |

Các điểm Figma lệch API khác, không cần hỏi vì không mất dữ liệu:
- **Tỉnh/Thành phố, Quận/Huyện:** hiện cố định "Khánh Hòa" / "TP. Nha Trang" và khóa lại. Chỉ Phường/Xã là chọn được, lấy từ `wards`.
- **Tiện ích:** Figma có 1 nhóm. API có `amenities` và `nearbyPlaces`, đều gửi qua `maTienIch`, nên hiện 2 nhóm cùng kiểu checkbox của Figma.
- **"Xem" trên Dashboard:** CSLT Đã duyệt mở trang công khai `/hotel/:id`. CSLT Chờ duyệt mở trang Cập nhật ở chế độ chỉ đọc (13.3). Không làm modal xem trước riêng.
- **Gửi kiểm duyệt:** chỉ có trong form (12.6, 13.4). Dashboard không có nút "Gửi duyệt" (Figma 11.1 không có).
- **Cảnh báo sửa CSLT Đã duyệt:** hiện khi bấm Lưu trong trang Cập nhật (13.2), không hiện ở Dashboard.

## Hợp đồng API thuộc phạm vi (trích từ Excel)

| # | Method + Path | Màn | Mã lỗi cần xử lý |
|---|---|---|---|
| 1 | `GET /host/profile` | Hồ sơ | 401, 403 ACCOUNT_LOCKED |
| 2 | `PATCH /host/profile` (`hoTen?`, `soDienThoai?`) | Hồ sơ | 400 VALIDATION_ERROR, 409 ACCOUNT_DUPLICATED, 400 FIELD_NOT_EDITABLE |
| 3 | `POST /host/profile/change-password` (`oldPassword`, `newPassword`) | Hồ sơ | 400 OLD_PASSWORD_INCORRECT, 400 VALIDATION_ERROR |
| 4 | `GET /host/listings` (`trangThai?`, `keyword?`, `page?`, `limit?`) | 11 | 400, 403 ACCOUNT_LOCKED |
| 5 | `DELETE /host/listings/:maCSLT` | 11 | 403 NOT_OWNER, 404, 409 LISTING_NOT_DELETABLE |
| 6 | `POST /host/listings/:maCSLT/withdraw` | 11, 13 | 403, 404, 409 INVALID_STATE_TRANSITION |
| 7 | `GET /filter-options` | 12, 13 | 500 |
| 8 | `POST /host/listings` | 12 | 400 VALIDATION_ERROR (`details[]`), 400 LOCATION_OUT_OF_RANGE, 403 ACCOUNT_LOCKED |
| 9 | `GET /host/listings/:maCSLT` | 12, 13 | 403 NOT_OWNER, 404 LISTING_NOT_FOUND |
| 10 | `PUT /host/listings/:maCSLT` | 12, 13 | 400, LOCATION_OUT_OF_RANGE, 403, 404, 409 LISTING_LOCKED_PENDING, 409 LISTING_REMOVED |
| 11 | `POST /host/listings/:maCSLT/media` (multipart `file`, `type`) | 12, 13 | 400 MEDIA_LIMIT_EXCEEDED, 413 FILE_TOO_LARGE, 415 UNSUPPORTED_MEDIA_TYPE, 403, 404, 409 LISTING_LOCKED_PENDING / LISTING_REMOVED |
| 12 | `DELETE /host/listings/:maCSLT/media/:mediaId` | 12, 13 | 403, 404 MEDIA_NOT_FOUND, 409 LISTING_LOCKED_PENDING, 409 MIN_IMAGES_REQUIRED |
| 13 | `POST /host/listings/:maCSLT/submit-review` | 12, 13 | 403, 404, 409 INVALID_STATE_TRANSITION, 422 CHECKLIST_INCOMPLETE (`details[]`) |

Định dạng lỗi chung: `{ success: false, error: { code, message, details }, traceId }`. Lỗi 401 do interceptor sẵn có của `axiosClient` xử lý (chuyển về `/login`).

## Load-bearing Assumptions

| # | Giả định | Đã kiểm chứng? | Dấu hiệu sai & cách xử lý |
|---|---|---|---|
| A1 | Body thành công là object trần hoặc `{ success: true, data }` | Chưa, phụ thuộc BE | Hàm `unwrapData` xử lý cả hai dạng; nếu BE dùng dạng khác thì chỉ sửa một chỗ |
| A2 | `axiosClient` trả `response.data` và ném lại lỗi axios nguyên vẹn | Có, `src/services/axiosClient.js:26-50` | — |
| A3 | Upload qua `axiosClient` phải ghi đè `Content-Type` | Có. Instance đặt `application/json` (`axiosClient.js:5-7`), và axios 1.20 đổi FormData thành JSON khi gặp header đó (`node_modules/axios/lib/defaults/index.js:56-57`) | Test SVC kiểm header `multipart/form-data` |
| A4 | `allowedActions` có trong item list và trong chi tiết | Theo Excel | Thiếu thì suy từ `trangThai` (bảng fallback ở Phase 4) |
| A5 | Bản đồ dùng Google Maps JS qua `VITE_GOOGLE_MAPS_API_KEY` (đã có trong `.env.example:5`), nạp bằng loader động, không thêm package | Key thật chưa có | Không có key hoặc tải lỗi thì hiện thông báo và cho nhập tay vĩ độ/kinh độ (Figma 12.5 có sẵn 2 ô này) |
| A6 | App dùng `<Routes>` (chế độ component), không phải data router | Có, `src/routes/AppRoutes.jsx:39-82` | Không dùng được `useBlocker`. Chặn rời trang khi chưa lưu chỉ dùng `beforeunload` |

## Phases

| # | Phase | Status | Effort | Phụ thuộc |
|---|-------|--------|--------|-----------|
| 1 | [Lớp API: hostApi.js (13 endpoint, contract tests)](./phase-01-api-layer-contract.md) | Pending | 3h | — |
| 2 | [Hồ sơ Host theo Figma + API](./phase-02-host-profile-integration.md) | Pending | 2.5h | 1 |
| 3 | [Màn 11: dữ liệu danh sách, lọc, tìm, phân trang](./phase-03-dashboard-listing-data.md) | Pending | 3h | 1 |
| 4 | [Màn 11: thao tác, xóa 1 / xóa nhiều, rút lại](./phase-04-dashboard-actions.md) | Pending | 3h | 3 |
| 5 | [Form CSLT dùng chung: 4 bước, checklist, media, bản đồ](./phase-05-listing-form-core.md) | Pending | 8h | 1 |
| 6 | [Màn 12: luồng Thêm mới](./phase-06-add-listing-flow.md) | Pending | 3h | 5 |
| 7 | [Màn 13: luồng Cập nhật theo trạng thái](./phase-07-edit-listing-flow.md) | Pending | 4h | 5 |
| 8 | [Kiểm tra tổng & đối chiếu Excel/Figma](./phase-08-verification-and-spec-audit.md) | Pending | 1.5h | 2, 4, 6, 7 |

Phase 2, 3 và 5 độc lập với nhau, chỉ cùng phụ thuộc Phase 1. Phase 6 và 7 dùng chung form của Phase 5.

## File Ownership (toàn bộ trong `src/pages/host/`)

| File | Hành động | Phase |
|---|---|---|
| `api/hostApi.js` | Tạo | 1 |
| `__tests__/hostApi.test.js` | Tạo | 1 |
| `HostProfilePage.jsx`, `__tests__/HostProfilePage.test.jsx` | Sửa / viết lại test | 2 |
| `HostDashboardPage.jsx`, `__tests__/HostDashboardPage.test.jsx` | Sửa / viết lại test | 3, 4 |
| `components/listingActions.js` | Tạo | 4 |
| `components/ConfirmDialog.jsx` | Tạo | 4 |
| `components/listing-form/listingFormModel.js` | Tạo | 5 |
| `components/listing-form/ListingStepper.jsx` | Tạo | 5 |
| `components/listing-form/BasicInfoStep.jsx` | Tạo | 5 |
| `components/listing-form/PriceAmenitiesStep.jsx` | Tạo | 5 |
| `components/listing-form/MediaStep.jsx` | Tạo | 5 |
| `components/listing-form/MapStep.jsx`, `components/listing-form/useGoogleMaps.js` | Tạo | 5 |
| `components/listing-form/SubmitChecklist.jsx` | Tạo | 5 |
| `components/listing-form/ListingEditor.jsx` | Tạo | 5, 6, 7 |
| `__tests__/listingFormModel.test.js`, `__tests__/MediaStep.test.jsx`, `__tests__/MapStep.test.jsx` | Tạo | 5 |
| `AddHotelPage.jsx`, `__tests__/AddHotelPage.test.jsx` | Viết lại / tạo test | 6 |
| `EditHotelPage.jsx`, `__tests__/EditHotelPage.test.jsx` | Viết lại / tạo test | 7 |

Không đụng: các trang auth (Quỳnh), tourist (Thư, Giang), admin (Vỹ), `NotFoundPage`/`EmptyState` (#3), cùng toàn bộ file dùng chung đã liệt kê ở mục Ràng buộc.

## Non-goals

- Luồng đăng nhập, refresh token, đăng xuất (Quỳnh).
- Top bar và bottom nav mobile trong layout dùng chung (D4).
- Sửa đường dẫn sai trong `src/services/hotelService.js` / `authService.js` (file dùng chung).
- Đồng bộ tên trên Sidebar sau khi đổi họ tên (Sidebar, AuthContext dùng chung).
- Lưu thứ tự ảnh lên server (D3, API chưa hỗ trợ).
- Mock server cho môi trường dev. Khi chưa có BE, các trang hiện trạng thái lỗi kèm nút thử lại.

## Câu hỏi cần gửi BE

1. Body thành công có bọc `{ success, data }` không?
2. Thêm `tenPhuong` vào item của `GET /host/listings` (bảng có cột Phường/Xã).
3. Có API đếm số CSLT theo trạng thái không? Hiện phải gọi 5 lần với `limit=1`.
4. Figma và SRS dùng khoảng giá (từ–đến + chu kỳ), API chỉ có `gia`. Team có muốn bổ sung không? FE đang theo API (D1).
5. Cần API sắp xếp lại `thuTu` ảnh (D3).
6. `GET /host/listings/:maCSLT` có trả `ngayGuiDuyet` không? Figma 13.3 hiện "Gửi kiểm duyệt ngày …".
7. Quy tắc "ký tự đặc biệt" của mật khẩu: FE dùng `[^A-Za-z0-9\s]`.
8. Upload nhiều ảnh cho CSLT Đã duyệt: ảnh đầu tiên chuyển CSLT sang PENDING, nên các ảnh sau trong cùng lượt sẽ bị 409 `LISTING_LOCKED_PENDING`. BE có muốn cho upload cả lượt khi APPROVED, hoặc chỉ chuyển PENDING khi Host bấm lưu không?

## Ghi chú gửi team (không sửa)

- **Layout:** đã làm theo yêu cầu của Quân (2026-11-01, thay cho D4): `HostLayout.jsx` ẩn `Sidebar` dưới 768px, thêm top bar (LOGO, avatar) và bottom nav 3 tab theo Figma M11–M13. Trên điện thoại, nút Đăng xuất nằm cuối trang Hồ sơ như Figma mobile. `Sidebar.jsx` và `AdminLayout` không đổi. Người phụ trách layout nên xem lại.
- **Sidebar:** đang đọc `user.name`, trong khi API trả `hoTen`.
- **`src/services/`:** `hotelService.js` / `authService.js` sai path so với Excel; `axiosClient` chưa có refresh token.
- **`Modal.jsx`:** chưa có `role="dialog"` và focus trap.
- **`PRICE_LIMITS.MIN_VND = 50_000`** (`src/constants/enums.js:52`) lệch với API (500.000).

## Success Criteria

- [ ] 13 endpoint trong bảng được gọi đúng method, path, query, body. Mỗi endpoint có ít nhất 1 contract test.
- [ ] Mọi mã lỗi trong bảng có test và có thông báo đúng chỗ (dưới ô nhập, banner, modal hoặc toast).
- [ ] Giao diện 4 màn khớp chữ, nhãn và trạng thái trong Figma, trừ các điểm đã chốt D1–D5.
- [ ] Không còn dữ liệu giả, `alert`, `window.confirm` trong 4 trang.
- [ ] `git diff --name-only 2332ce8 -- . ':!plans'` chỉ liệt kê file trong `src/pages/host/`.
- [ ] `npx vitest run` qua toàn bộ, `npm run lint` không thêm cảnh báo ở `src/pages/host/**`, `npm run build` qua.

## Red Team Review

### Session — 2026-11-01

Quân từ chối chạy reviewer bằng subagent, nên phần soi lỗi được làm trực tiếp, có bằng chứng từ code:

| # | Phát hiện | Mức độ | Xử lý | Áp dụng vào |
|---|---|---|---|---|
| 1 | Upload FormData qua `axiosClient` bị đổi thành JSON vì header mặc định (A3) | Critical | Accept: ghi đè `Content-Type` + test | Phase 1 |
| 2 | Lưu nháp ở trang Thêm mới rồi tải lại trang sẽ mất `maCSLT`, dễ tạo trùng | High | Accept: sau POST thì đưa `maCSLT` lên URL (`/host/hotels/new?id=..&step=2`) | Phase 6 |
| 3 | Upload ảnh/video vào CSLT Đã duyệt làm nó chuyển ngay về Chờ duyệt (ghi chú Excel), mà cảnh báo 13.2 chỉ hiện khi bấm Lưu | High | Accept: cảnh báo trước lần đổi media đầu tiên với CSLT Đã duyệt | Phase 5, 7 |
| 4 | `useBlocker` không dùng được với `<Routes>` (A6) | Medium | Accept: chỉ dùng `beforeunload` | Phase 5 |
| 5 | Xóa nhiều mà gọi song song dễ dính rate limit hoặc hỏng một phần mà không biết | Medium | Accept: xóa tuần tự, tổng kết thành công/thất bại | Phase 4 |
| 6 | Giới hạn giá cứng 50.000 trong `enums.js` lệch API | Medium | Accept: lấy `priceRange` từ `/filter-options`, mặc định 500.000 | Phase 5 |

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01 → phase-08.
- Decision deltas checked: 11 (phạm vi thêm Màn 12/13, D1–D5, bỏ modal xem trước, bỏ nút Gửi duyệt ở Dashboard, bỏ cảnh báo ở Dashboard, 6 phát hiện trên).
- Unresolved contradictions: 0.

## Validation Log

### 2026-11-01 — `/ak:cook --auto`

- **Test:** `npx vitest run` → 8 file, 134 test qua (hostApi 30, Hồ sơ 20, Dashboard 29, model 12, MediaStep 12, MapStep 5, Thêm mới 14, Cập nhật 12).
- **Lint:** `npm run lint` → 0 cảnh báo trong `src/pages/host/**`. Toàn repo từ 20 xuống 18 (2 cảnh báo cũ của `EditHotelPage.jsx` đã mất).
- **Build:** `npm run build` qua.
- **Dữ liệu giả:** lệnh grep ở Phase 8 không còn kết quả.
- **Ranh giới file:** chỉ có thay đổi trong `src/pages/host/**` và `plans/`.
- **Đối chiếu Excel:** mọi endpoint và mã lỗi trong 2 bảng của Phase 8 đều có test cùng ID (SVC/ERR/PROF/PWD/DASH/ACT/MODEL/MED/MAP/ADD/EDIT).
- **Đối chiếu Figma:** chạy dev server với API giả tạm (để trong scratchpad, không commit), chụp headless Chrome ở 1440px và 402px cho 9 màn. Desktop khớp 11.1, 12.1, 12.3, 12.4, 13.3, 13.4 và Hồ sơ, trừ D1–D5. Chỗ lệch:
  - Mobile 402px bị `Sidebar` dùng chung chiếm chỗ (đã ghi ở "Ghi chú gửi team"). Khi ẩn sidebar, bố cục mobile của 4 màn đúng: 1 cột, thẻ, tab cuộn ngang, không tràn ngang.
  - Nút "Đặt làm ảnh bìa" (thay kéo thả cho bàn phím và mobile) không có trong Figma. Trên desktop nút chỉ hiện khi rê chuột hoặc focus.
  - Nút "Lưu & tiếp tục" / "Tiếp tục" trong thẻ ở luồng Thêm mới (theo Phase 6) không có trong Figma 12.3–12.5.
- **File thêm ngoài bảng File Ownership** (đều trong `src/pages/host/`): `components/Toast.jsx`, `components/useToast.js` (toast dùng chung), `components/listing-form/formFields.jsx`, `FormBanner.jsx`, `ListingAccessState.jsx`.
- **Còn mở:** gửi mục "Câu hỏi cần gửi BE" và "Ghi chú gửi team" cho team (việc của Quân).

### 2026-11-01 — Sửa layout mobile (Quân nhờ trực tiếp)

- `src/layouts/HostLayout.jsx`: ẩn `Sidebar` dưới 768px; thêm top bar và bottom nav 3 tab (Quản lí cơ sở, Thêm cơ sở, Tài khoản); dùng `h-dvh` để thanh dưới không bị thanh trình duyệt di động che. Trên điện thoại nút Đăng xuất nằm cuối trang Hồ sơ (đúng Figma mobile Hồ sơ); top bar chỉ có LOGO và avatar như Figma M11. Desktop vẫn đăng xuất ở `Sidebar`.
- Trang Host chỉnh theo layout mới: thanh hành động của form và thanh "Đã chọn n cơ sở" giờ nằm ngay trên bottom nav.
- Test mới `src/layouts/__tests__/HostLayout.test.jsx` (7 test) và PROF-14 (Đăng xuất ở trang Hồ sơ). Toàn bộ: 9 file, 142 test qua; lint sạch ở `src/layouts` và `src/pages/host`; build qua.
- Chụp lại ở 402px (không ẩn sidebar bằng CSS nữa): bố cục khớp Figma M11.1. Desktop 1440px không đổi.
