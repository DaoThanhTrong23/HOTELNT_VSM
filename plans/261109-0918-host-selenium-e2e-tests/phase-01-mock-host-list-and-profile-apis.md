---
phase: 1
title: "Mock 5 API của Danh sách và Hồ sơ"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Mock 5 API của Danh sách và Hồ sơ

## Goal

Khi `VITE_USE_MOCK=true`, 5 hàm `getHostListings`, `deleteHostListing`, `getHostProfile`, `updateHostProfile`, `changeHostPassword` trả kết quả từ `hostMockApi.js` đúng theo hợp đồng trong `docs/Copy of API_DESIGN.xlsx`, dùng chung kho dữ liệu với 8 hàm Trọng đã có. Khi cờ tắt, các hàm vẫn gọi API thật như cũ.

## Context

- Lần trước (plan 261108, quyết định D8) chỉ làm mock cho 8 API của form. Vì vậy test `MOCK-02` đang khẳng định "danh sách vẫn gọi API thật" (`src/pages/host/__tests__/hostMockApi.test.jsx:82-88`).
- Cách chuyển sang mock: `viaMock(name, ...args)` dùng `import()` động (`src/pages/host/api/hostApi.js:141`). Làm vậy để chunk mock không vào bundle chính.
- Kho dữ liệu `listings` (`hostMockApi.js`) có mã 1 Đã duyệt, 2 Bị từ chối, 3 Chờ duyệt, 4 Bị ẩn, 5 Bản nháp. Mã 6 là cơ sở của Host khác, trả 403. `resetHostMockStore()` đưa kho về ban đầu, và mỗi lần tải lại trang thì module chạy lại nên kho cũng được reset.
- Dashboard đọc các trường `maCSLT, tenCSLT, tenLoai, tenPhuong, gia, duongDanAnh, trangThai, ngayTao, ngayCapNhat, allowedActions` (`HostDashboardPage.jsx:166`, `:608-628`). Lưu ý: hợp đồng không liệt kê `tenPhuong`, nhưng code có hiển thị.

## Hợp đồng cần mock

| Hàm | Endpoint (Excel dòng) | Trả về | Lỗi |
|---|---|---|---|
| `getHostListings(params)` | `GET /host/listings` (27) | `{ items: [{ maCSLT, tenCSLT, tenLoai, tenPhuong, gia, duongDanAnh, trangThai, lyDoTuChoi, lyDoViPham, ngayTao, ngayCapNhat, allowedActions }], pagination: { totalItems, totalPages, currentPage, limit } }` | `trangThai` không thuộc 5 giá trị → 400 `VALIDATION_ERROR` |
| `deleteHostListing(id)` | `DELETE /host/listings/:id` (34) | `{ message: 'Xóa cơ sở thành công' }` | 403 `NOT_OWNER`, 404 `LISTING_NOT_FOUND`, trạng thái khác DRAFT/REJECTED → 409 `LISTING_NOT_DELETABLE` |
| `getHostProfile()` | `GET /host/profile` (25) | `{ id, vaiTro, trangThai, hoTen, soDienThoai, email, cccd, ngayTao }`, trong đó `cccd` được che một phần, ví dụ `079******234` | — |
| `updateHostProfile(body)` | `PATCH /host/profile` (26) | `{ id, hoTen, soDienThoai, email, ngayCapNhat }` | Họ tên rỗng hoặc dài quá 100 ký tự, hoặc SĐT không khớp `^0\d{9}$` → 400 `VALIDATION_ERROR`, kèm `details: [{ field, message }]` |
| `changeHostPassword(body)` | `POST /host/profile/change-password` (33) | `{ message: 'Đổi mật khẩu thành công' }` | Sai mật khẩu cũ → 400 `OLD_PASSWORD_INCORRECT`. Mật khẩu mới không đủ 8 ký tự gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt, hoặc trùng mật khẩu cũ → 400 `VALIDATION_ERROR` |

Cách lọc danh sách:
- Lọc theo `trangThai`: nhận một giá trị, hoặc nhiều giá trị (mảng hoặc chuỗi nối bằng dấu phẩy).
- `keyword`: bỏ khoảng trắng hai đầu, không phân biệt hoa thường, so `includes` với `tenCSLT`.
- `page` mặc định 1, `limit` mặc định 10, tối đa 50.
- Thứ tự giữ theo `maCSLT` tăng dần.
- `allowedActions = FALLBACK_ACTIONS[trangThai]`.
- `tenLoai` và `tenPhuong` tra từ `FILTER_OPTIONS`.
- `duongDanAnh` là URL của ảnh đầu tiên.

Dữ liệu hồ sơ mẫu: `hoTen 'Nguyễn Văn Host'`, `soDienThoai '0905123456'`, `email 'host.demo@hotelnt.vn'`, `cccd '079******234'`. Mật khẩu hiện tại của mock export thành `MOCK_HOST_PASSWORD = 'Host@12345'`, để test E2E dùng. `resetHostMockStore()` reset cả hồ sơ lẫn mật khẩu.

## Files to Create / Modify

| File | Thao tác | Ước lượng | Ảnh hưởng test |
|---|---|---|---|
| `src/pages/host/__tests__/hostMockApi.test.jsx` | Sửa `MOCK-02`, thêm `MOCK-10…16` | +150 dòng | Viết trước (đỏ) |
| `src/pages/host/api/hostMockApi.js` | Thêm 5 hàm, `profile`, `password`, `MOCK_HOST_PASSWORD` | +90 dòng | Làm các test trên xanh |
| `src/pages/host/api/hostApi.js` | 5 hàm rẽ `viaMock` khi `USE_MOCK` | ~10 dòng | `hostApi.test.js` ghim `USE_MOCK=false`, không đổi |

## Tests Before (viết trước, phải đỏ)

Thêm vào `hostMockApi.test.jsx` (file đã `vi.mock` `USE_MOCK: true` và mock `axiosClient`):

| Mã | Kiểm |
|---|---|
| MOCK-02 (đảo) | Gọi đủ 5 hàm thì `axiosClient.get/patch/post/delete` không được gọi lần nào |
| MOCK-10 | Không lọc: 5 item, `pagination = { totalItems: 5, totalPages: 1, currentPage: 1, limit: 10 }`. Mỗi item có `allowedActions` khớp `FALLBACK_ACTIONS`, có `tenLoai`, có `duongDanAnh` |
| MOCK-11 | Lọc lần lượt 5 trạng thái, mỗi lần đúng 1 item. `limit: 1` thì `totalItems` vẫn là 1. `trangThai: 'ABC'` → `VALIDATION_ERROR`, status 400 |
| MOCK-12 | `keyword: ' breeze '` → mã 1, 3, 5. Không lọc, `limit: 2, page: 2` → mã 3, 4, `currentPage 2`, `totalPages 3`. `limit: 99` → `limit` bị giới hạn còn 50 |
| MOCK-13 | Xóa được 5 (DRAFT) và 2 (REJECTED), sau đó danh sách còn 3. Xóa 1, 3, 4 → 409 `LISTING_NOT_DELETABLE`. Xóa 6 → 403. Xóa 999 → 404 |
| MOCK-14 | `withdrawListing(3)` xong thì `getHostListings({ trangThai: 'DRAFT' })` có mã 3. Kiểm chứng hai nhóm hàm dùng chung kho |
| MOCK-15 | Hồ sơ: `cccd` dài 12 ký tự và có `*`. Cập nhật họ tên + SĐT thì lần `get` sau trả giá trị mới. SĐT `'0912abc'` → `VALIDATION_ERROR` có `details[0].field === 'soDienThoai'` |
| MOCK-16 | Mật khẩu: sai mật khẩu cũ → `OLD_PASSWORD_INCORRECT`. `'abc'` → `VALIDATION_ERROR`. Đổi đúng thì thành công, và đổi lại bằng mật khẩu cũ phải báo `OLD_PASSWORD_INCORRECT` |

Lệnh đỏ: `npx vitest run src/pages/host/__tests__/hostMockApi.test.jsx`. Phải fail ở `MOCK-02` và `MOCK-10…16` vì hàm chưa có. `MOCK-01`, `MOCK-03…09` vẫn xanh.

## Refactor (phần code được bảo vệ)

1. `hostMockApi.js`:
   - Thêm `SEED_PROFILE`, `MOCK_HOST_PASSWORD`, `let profile; let password;` và reset trong `resetHostMockStore`.
   - Viết helper `toListItem(listing)` để tạo item cho danh sách.
   - Thêm 5 hàm vào `hostMockApi`, dùng lại `findOwned`, `clone`, `now`, `ApiError`.
   - Không đổi 8 hàm cũ.
2. `hostApi.js`:
   - `getHostListings`: giữ nguyên phần dựng `params`, rồi `USE_MOCK ? viaMock('getHostListings', params) : call(...)`.
   - `deleteHostListing`, `getHostProfile`, `changeHostPassword`: rẽ nhánh giống cách các hàm cũ đang làm.
   - `updateHostProfile`: chỉ rẽ nhánh sau khi đã lọc khóa và kiểm body rỗng, để lỗi "Không có thông tin nào để cập nhật" giống nhau ở cả hai chế độ.
3. Cập nhật comment đầu file `hostMockApi.js` (dòng 6), vì giờ mock phủ cả Danh sách và Hồ sơ.

## Tests After

- `MOCK-02`, `MOCK-10…16` xanh. `MOCK-01`, `MOCK-03…09` vẫn xanh, không sửa kỳ vọng.
- `hostApi.test.js` (hợp đồng `SVC-*`/`ERR-*`) không sửa và vẫn xanh. Nó ghim `USE_MOCK=false`, nên chứng minh nhánh API thật không đổi.

## Regression gate

```bash
npx vitest run src/pages/host
npm run lint
npm run build && ! grep -l "Sea Breeze" dist/assets/index-*.js   # build chạy khi KHÔNG đặt VITE_USE_MOCK; mock không được nằm trong bundle chính
```

## Todo

- [x] Viết `MOCK-02` (đảo) và `MOCK-10…16`, chạy và thấy đỏ
- [x] Thêm hồ sơ, mật khẩu và 5 hàm vào `hostMockApi.js`
- [x] Rẽ 5 hàm trong `hostApi.js`
- [x] Chạy regression gate và thấy xanh
- [x] Commit `feat(host): mock list, delete and profile endpoints behind VITE_USE_MOCK`

## Success Criteria

- Bật `VITE_USE_MOCK=true` rồi chạy `npm run dev`: `/host/dashboard` hiện 5 cơ sở, số trên các tab là 5/1/1/1/1/1, `/host/profile` hiện hồ sơ mẫu, và không có request nào tới `/host/*` trong tab Network.
- Regression gate xanh.

## Risks

| Rủi ro | Cách xử lý |
|---|---|
| Trọng đang dựa vào việc danh sách gọi API thật khi bật mock | Trong code không có chỗ nào dựa vào điều đó: chỉ `MOCK-02` khẳng định, và đã ghi trong tin nhắn gửi Trọng ngày 08/11 ("Trọng cần mock cho hai màn đó thì báo mình"). Ghi thêm vào mô tả PR |
| Kho dùng chung: test sau bị ảnh hưởng bởi test trước | Mỗi test chạy `beforeEach(resetHostMockStore)` (`hostMockApi.test.jsx:53-56`) |

## Security

Mock chỉ được tải khi bật cờ. Mật khẩu mẫu chỉ là dữ liệu giả, không phải thông tin đăng nhập thật. Không bật cờ ở bản production (đã ghi ở plan 261108).
