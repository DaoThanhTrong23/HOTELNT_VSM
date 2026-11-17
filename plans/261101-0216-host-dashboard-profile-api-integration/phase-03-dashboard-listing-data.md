---
phase: 3
title: "Dashboard: tải danh sách, lọc, tìm, phân trang, số đếm"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 3: Dashboard: dữ liệu danh sách

## Goal

`HostDashboardPage` lấy danh sách thật từ `GET /host/listings`:
- Lọc theo `trangThai`, tìm kiếm `keyword` và phân trang đều làm phía server.
- Trạng thái lọc được giữ trên URL.
- Số đếm theo trạng thái lấy từ `pagination.totalItems`.
- Bỏ hẳn `MOCK_HOST_HOTELS`.

## Ràng buộc

- Chỉ sửa `HostDashboardPage.jsx` và test của nó.
- Hook `useHostListings` viết ngay trong file trang, không export (tránh cảnh báo `react/only-export-components`).
- Không sửa `StatusBadge`, `enums.js`, `routes.js`, `formatters.js`; các file này chỉ được import.

## Scout trước khi làm

- Gọi `get_design_context` (Figma MCP) cho `72:4664` (11.1), `72:5237` (11.2), `126:694` (M11.1), `126:918` (M11.2). Đọc skill `/figma-design-to-code` trước.
- Đọc lại `HostDashboardPage.jsx` (942 dòng) và test hiện có.
- Xác nhận `hostApi.js` có `getHostListings` và `HOST_LISTINGS_PAGE_SIZE`.
- Xác nhận `HOTEL_STATUS` vẫn đủ 5 giá trị (`src/constants/enums.js:6-12`).

## Files to Create / Modify

- Modify: `src/pages/host/HostDashboardPage.jsx`
- Rewrite: `src/pages/host/__tests__/HostDashboardPage.test.jsx`

## Thiết kế

### Trạng thái lọc trên URL (`useSearchParams`)

| Param | Đọc | Mặc định / giá trị sai |
|---|---|---|
| `trangThai` | phải thuộc `Object.values(HOTEL_STATUS)` | `'ALL'` |
| `keyword` | chuỗi, cắt còn 100 ký tự | `''` |
| `page` | số nguyên ≥ 1 | `1` |

- Bấm tab: `setSearchParams` với `trangThai` mới, `page` về 1, giữ `keyword`. Có ghi lịch sử, để nút Back hoạt động.
- Ô tìm kiếm:
  - State cục bộ `keywordInput`, khởi tạo từ URL, `maxLength={100}`.
  - Debounce 400ms, sau đó `setSearchParams(..., { replace: true })` với `keyword` đã trim và `page` về 1.
  - Gọi `setSearchParams` trong callback của `setTimeout`, không gọi đồng bộ trong effect.
- Nút xóa từ khóa: xóa `keywordInput` và `keyword` trên URL ngay, không chờ debounce.

### Hook `useHostListings({ trangThai, keyword, page })` (trong file trang)

Trả về `{ items, pagination, counts, isInitialLoading, isRefreshing, error, refetch }`.

- **Danh sách:**
  - `queryKey = JSON.stringify({ trangThai, keyword, page, reloadKey })`.
  - State `result = { key, items, pagination, error }`, chỉ set **sau `await`**, nên không vi phạm `react(set-state-in-effect)`.
  - `isLoading = result.key !== queryKey`.
  - `isInitialLoading = isLoading && result.items === null`.
  - `isRefreshing = isLoading && result.items !== null`: giữ bảng cũ, làm mờ nhẹ và đặt `aria-busy`, không nháy trắng.
  - Effect tạo `AbortController`; cleanup gọi `abort()`. Response cũ bị hủy hoặc trả về muộn đều bị bỏ qua, vì chỉ ghi `result` khi `key` vẫn khớp.
  - Gọi `getHostListings({ trangThai, keyword, page, limit: HOST_LISTINGS_PAGE_SIZE }, { signal })`.
- **Số đếm:**
  - Effect riêng, chỉ phụ thuộc `reloadKey`. Số đếm là tổng theo trạng thái, không phụ thuộc từ khóa.
  - Dùng `Promise.allSettled` cho 5 lời gọi `getHostListings({ trangThai: S, page: 1, limit: 1 })`, lấy `pagination.totalItems` của từng cái.
  - Lời gọi nào lỗi thì trạng thái đó là `null` và hiện `—`.
  - `total` = tổng các giá trị khác `null`; nếu có giá trị `null` thì hiện `—`.
- `refetch()` tăng `reloadKey`, nên tải lại cả danh sách và số đếm. Phase 4 dùng hàm này sau mỗi thao tác.

### Hiển thị dòng (dùng thẳng tên trường API)

| Cột / vị trí | Nguồn |
|---|---|
| Ảnh | `duongDanAnh` → `<img loading="lazy" alt={tenCSLT}>`; null thì hiện ô placeholder `bg-[#CBD5E1]`. Bỏ `colorClass` |
| Tên + loại | `tenCSLT`, `tenLoai` |
| Phường/Xã | `tenPhuong ?? '—'`. Item list hiện không có `tenPhuong` (xem câu hỏi BE #2) |
| Giá tham khảo | `gia != null ? formatCurrency(gia) : 'Chưa nhập giá'` (D1: một mức giá, không có "mỗi đêm"). Bỏ `priceDisplay`, `priceUnit`, `minPrice`, `maxPrice` |
| Thẻ mobile (M11.1) | Dòng 2: `{tenLoai} · {tenPhuong}` (thiếu `tenPhuong` thì chỉ hiện `tenLoai`); dòng 3: giá |
| Ngày tạo / Cập nhật | `formatDate(ngayTao)`, `formatDate(ngayCapNhat)` |
| Trạng thái | `<StatusBadge status={trangThai} />` |
| Thao tác | Phase 4 |
| `key` / `data-testid` | dùng `maCSLT` |

### Số đếm trên tab

- Tab: Tất cả = `counts.total`, các tab còn lại = `counts[S]`. Thứ tự và nhãn đúng Figma 11.1: Tất cả, Bản nháp, Chờ duyệt, Đã duyệt, Bị từ chối, Ẩn.
- **D5:** xóa khối `sr-only` 4 thẻ thống kê và các `data-testid="stat-*"`, vì Figma không có.

### Phân trang

- Lấy từ `pagination`.
- Chữ ở chân bảng: `Hiển thị {from}–{to} trên {totalItems} cơ sở · 10 dòng mỗi trang`, với `from = (currentPage - 1) * limit + 1` và `to = from + items.length - 1`.
- Nút trang: Trước, Sau và tối đa 5 số trang quanh trang hiện tại. Nút Trước disabled ở trang 1, nút Sau disabled ở trang cuối. Trang hiện tại có `aria-current="page"`.
- Hiện cả ở dạng thẻ trên mobile, không chỉ ở bảng desktop.

### Trạng thái rỗng và lỗi

| Điều kiện | Hiển thị |
|---|---|
| `isInitialLoading` | `LoadingSpinner` |
| `error` khác `CANCELED` | `ErrorState` với message API (có `ACCOUNT_LOCKED`), nút "Thử lại" gọi `refetch` |
| Rỗng, không lọc, `page=1` | Đúng Figma 11.2: tiêu đề "Bạn chưa có cơ sở lưu trú nào", mô tả "Thêm cơ sở đầu tiên để khách du lịch tìm thấy bạn trên bản đồ.", nút dẫn tới `/host/hotels/new`. Ẩn thanh tab và ô tìm kiếm |
| Rỗng, có lọc hoặc từ khóa | "Không tìm thấy cơ sở phù hợp" + nút "Xóa bộ lọc" (đưa URL về mặc định) |
| Rỗng mà `page > 1` (ví dụ URL `?page=99`) | "Trang này không còn dữ liệu" + nút "Về trang đầu" |

### Dọn code giả

- Xóa `MOCK_HOST_HOTELS`, prop `initialHotels`, `initialLoading`, `filteredHotels` và đoạn lọc phía client.
- Checkbox chọn dòng: giữ UI, chọn theo `maCSLT`. Bỏ chọn khi đổi trang hoặc đổi bộ lọc.

## Test Matrix (viết lại, mock `hostApi`)

Cách mock: `vi.mock('../api/hostApi', async (importOriginal) => ({ ...(await importOriginal()), getHostListings: vi.fn(), ... }))`.

Cách render: `<MemoryRouter initialEntries={[url]}><Routes><Route path="/host/dashboard" element={<HostDashboardPage/>}/></Routes></MemoryRouter>`.

`mockListings(byStatus)` trả response dựa trên `params`: lời gọi `limit: 1` là gọi đếm, còn lại là gọi danh sách.

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| DASH-01 | Lần đầu vào trang | 1 lời gọi danh sách `{ page: 1, limit: 10 }` (không có `trangThai`, `keyword`) + 5 lời gọi đếm `{ trangThai: S, page: 1, limit: 1 }` |
| DASH-02 | Dòng hiển thị | Đúng `tenCSLT`, `tenLoai`, `formatCurrency(gia)`, `formatDate(ngayTao)`, nhãn trạng thái; số dòng desktop và mobile = `items.length` |
| DASH-03 | `gia: null`, `duongDanAnh: null`, thiếu `tenPhuong` | "Chưa nhập giá", có placeholder ảnh, Phường hiện "—" |
| DASH-04 | Số đếm | Số trên tab lấy từ `totalItems`; Tất cả = cộng 5 trạng thái; 1 lời gọi đếm lỗi thì hiện `—`; không còn phần tử `stat-*-count` |
| DASH-05 | Bấm tab "Chờ duyệt" | Gọi danh sách với `trangThai: 'PENDING', page: 1`; URL có `trangThai=PENDING` |
| DASH-06 | Gõ từ khóa (fake timers) | Không gọi trước 400ms; sau 400ms gọi đúng 1 lần với `keyword` đã trim, `page: 1` |
| DASH-07 | URL `?trangThai=REJECTED&page=2&keyword=sea` | Lời gọi đầu dùng đúng 3 tham số; tab "Bị từ chối" đang được chọn |
| DASH-08 | URL `?trangThai=XYZ&page=-3` | Coi như `ALL`, `page: 1` |
| DASH-09 | Phân trang (`totalItems: 25`, trang 2) | Chữ "Hiển thị 11–20 trên 25"; bấm Sau thì gọi `page: 3`; ở trang cuối nút Sau disabled |
| DASH-10 | Danh sách rỗng, không lọc | Đúng tiêu đề và mô tả Figma 11.2; có link `/host/hotels/new`; không có tab |
| DASH-11 | Rỗng khi đang lọc | "Không tìm thấy..."; bấm "Xóa bộ lọc" thì gọi lại không có `trangThai`/`keyword` |
| DASH-12 | Lỗi 500 → bấm Thử lại | `ErrorState`, sau đó gọi lại API và hiện dữ liệu |
| DASH-13 | Lỗi `ACCOUNT_LOCKED` | Hiện message API |
| DASH-14 | Race: đổi tab nhanh, response cũ về sau | Chỉ hiện dữ liệu của tab mới nhất; `signal` của lời gọi cũ đã bị abort |
| DASH-15 | Không còn dữ liệu giả | `grep MOCK_HOST_HOTELS` không ra kết quả (kiểm ở Phase 5) |

## Tasks & Steps

- [x] Viết lại test file (DASH-01..14). Chạy, phải đỏ.
- [x] Thêm `useHostListings` và phần đọc/ghi URL vào `HostDashboardPage.jsx`.
- [x] Đổi phần hiển thị dòng (desktop + mobile) sang tên trường API.
- [x] Làm phân trang thật, thêm các trạng thái rỗng và lỗi.
- [x] Xóa dữ liệu giả và lọc phía client.
- [x] Chạy test cho tới khi xanh.

## Verification

- `npx vitest run src/pages/host/__tests__/HostDashboardPage.test.jsx` → pass.
- `npx oxlint src/pages/host/HostDashboardPage.jsx` → 0 cảnh báo, kể cả `set-state-in-effect`.
- `grep -nE "MOCK_HOST_HOTELS|initialHotels|priceDisplay|colorClass" src/pages/host/HostDashboardPage.jsx` → không có kết quả.

## Risk Assessment

- **6 request mỗi lần tải** (1 danh sách + 5 đếm). Số CSLT của một Host nhỏ nên chấp nhận được. Nếu BE thêm API đếm (câu hỏi #3) thì chỉ phải sửa effect đếm.
- **BE không chấp nhận `limit=1`:** khi đó lời gọi đếm trả 400 và số đếm hiện `—`, trong khi danh sách vẫn chạy. Cách xử lý là đổi sang `limit` mà BE cho phép, chỉ cần đọc `totalItems`.
- **Debounce và fake timers trong test:** dùng `vi.useFakeTimers({ shouldAdvanceTime: true })` và `act(() => vi.advanceTimersByTime(400))` để tránh test chập chờn.
