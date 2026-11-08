# Báo cáo: những chỗ cần sửa ở 4 màn Host của Quân sau khi merge `deverlop`

Ngày kiểm: 2026-11-08 · Nhánh: `feature/quan-dashbds` · Người kiểm: Claude (theo yêu cầu của Quân)

Báo cáo này là đầu vào để lập plan sửa. Chỉ ghi các vấn đề thuộc 4 màn của Quân, không ghi phần của người khác.

## 0. Bối cảnh cho phiên lập plan

| Mục | Giá trị |
|---|---|
| Màn trong phạm vi | 11 · Danh sách CSLT (`HostDashboardPage.jsx`), 12 · Thêm mới (`AddHotelPage.jsx`), 13 · Cập nhật (`EditHotelPage.jsx`), Hồ sơ Host (`HostProfilePage.jsx`) |
| Thư mục được sửa | Chỉ `src/pages/host/`. Không sửa file dùng chung (`src/services`, `src/components`, `src/constants`, `src/mocks`, …), chỉ được import |
| Plan trước | `plans/261101-0216-host-dashboard-profile-api-integration/plan.md`, có các quyết định D1–D5 |
| Trạng thái nhánh | Đã fast-forward lên `origin/deverlop` (`23ae700`), đi trước remote 19 commit, **chưa push** |
| Backend | Chưa có: `api.hotelnt.com` báo `NXDOMAIN`, repo không có `.env`, máy không chạy backend nào. Mọi lời gọi thật đều trả `NETWORK_ERROR` |
| Nguồn các thay đổi mới trong `src/pages/host/` | Commit `a27dec5`, `eb1af0a` của Trọng (nhánh `feature/trong-add-hotel`, đã vào `deverlop`) |

## 1. Hiện trạng đo được

| Kiểm tra | Kết quả |
|---|---|
| Test hợp đồng API (`__tests__/hostApi.test.js`) | **30/30 qua.** 13 endpoint đúng method, path, query, body, mã lỗi theo `API_DESIGN.xlsx`. `api/hostApi.js` không bị merge đổi |
| `npx vitest run src/pages/host` | **133/135 qua.** Fail: `MODEL-05`, `MODEL-09` trong `__tests__/listingFormModel.test.js`, cùng do mục A6 |
| `npx oxlint src/pages/host` | 2 warning ở `MediaStep.jsx:146` (`Date.now`, `Math.random`), thuộc mục A1 |
| File bị merge đổi | `EditHotelPage.jsx`, `ListingEditor.jsx`, `MediaStep.jsx`, `ListingAccessState.jsx`, `listingFormModel.js`, `EditHotelPage.test.jsx` |
| File không đổi | `HostDashboardPage.jsx`, `HostProfilePage.jsx`, `api/hostApi.js` |

## 2. Phần A: code cần sửa (theo mức độ nặng)

### A1. Mất mạng vẫn báo thành công (Màn 12, 13). Nặng

Khi lỗi là `NETWORK_ERROR` hoặc `TIMEOUT`, code không báo lỗi mà giả như thao tác đã thành công:

| Vị trí | Hành vi hiện tại |
|---|---|
| `components/listing-form/ListingEditor.jsx:157` | `/filter-options` lỗi thì dùng danh mục tự đặt (xem A4) |
| `ListingEditor.jsx:190` | Tải chi tiết lỗi thì nạp dữ liệu mẫu `getMockListingDetail`, đọc `?status=` trên URL |
| `ListingEditor.jsx:380` | Tạo mới lỗi thì sinh mã ngẫu nhiên 1000–9999 và báo "Đã lưu tạo mới" |
| `ListingEditor.jsx:413` | Lưu lỗi thì báo "Đã lưu thay đổi", đổi APPROVED sang PENDING trên giao diện |
| `ListingEditor.jsx:467` | Gửi kiểm duyệt lỗi thì báo "Đã gửi kiểm duyệt", chuyển sang PENDING |
| `ListingEditor.jsx:497` | Rút lại lỗi thì báo đã về Bản nháp |
| `components/listing-form/MediaStep.jsx:142` | Upload lỗi thì giả là ảnh/video đã tải lên |
| `MediaStep.jsx:215` | Xóa media lỗi thì vẫn gỡ khỏi danh sách |

Vì sao phải sửa:
- Trái luồng ngoại lệ trong SRS. FR-14: "Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại." FR-16: "Lỗi tải tệp tin…". FR-17: "Không thể kết nối máy chủ. Vui lòng thử lại sau." FR-18: "Gửi yêu cầu kiểm duyệt thất bại. Vui lòng thử lại sau."
- Host thấy "đã lưu" nhưng dữ liệu không lên server, tải lại trang là mất.
- Che việc backend chưa chạy, nên kiểm thử bằng tay sẽ ra kết quả "qua" sai (xem B1).

Hướng sửa, **cần Quân chốt (Q1)**:
- (a) Gỡ toàn bộ, quay về như trước merge: hiện banner/toast lỗi và nút thử lại, không đổi trạng thái.
- (b) Chỉ bật dữ liệu giả khi `VITE_USE_MOCK=true`, giống cách `src/services/listingService.js` đang làm (import `USE_MOCK` từ `src/mocks/mockListings.js`, chỉ import, không sửa file đó). Không bao giờ bật theo mã lỗi.

Test cần thêm: với mỗi hành động (tạo, lưu, gửi duyệt, rút lại, upload, xóa media), khi gặp `NETWORK_ERROR` phải hiện lỗi, không có toast thành công, không đổi `trangThai`.

### A2. Bắt cứng mã 403/404 trong `EditHotelPage.jsx` (Màn 13). Nặng, bug thật

- `EditHotelPage.jsx:10-18`: `id === '403'` thì hiện màn "không có quyền", `id === '404'` thì hiện "không tìm thấy". Thêm cả `?mock=403|forbidden|404|notfound`.
- Hậu quả: cơ sở có mã 403 hoặc 404 thật trong DB sẽ không bao giờ mở được trang Cập nhật.
- Sửa: gỡ khối này. 403/404 đã được xử lý đúng qua API (`NOT_OWNER`, `LISTING_NOT_FOUND`, `NOT_FOUND`) bằng `ACCESS_ERROR_CODES` trong `ListingEditor.jsx`.
- Test cần thêm: `/host/hotels/403/edit` phải gọi `GET /host/listings/403` như mọi id khác.

### A3. Lý do từ chối/ẩn gắn sẵn câu mẫu (Màn 13). Trung bình

- `ListingEditor.jsx:710` và `:716`: khi API không gửi `lyDoTuChoi` / `lyDoViPham`, banner hiện một lý do bịa ("Ảnh bìa không đúng với cơ sở…", "Phát hiện vi phạm tiêu chuẩn cộng đồng…").
- Sửa: trả về `'Không có ghi chú.'` như trước merge.

### A4. Danh mục mặc định với mã tự đặt (Màn 12, 13). Trung bình

- `listingFormModel.js:21-64` (`DEFAULT_PROPERTY_TYPES`, `DEFAULT_WARDS`, `DEFAULT_AMENITIES`, `DEFAULT_NEARBY_PLACES`) và `:97-100` (`resolveOptions` dùng chúng khi API trả mảng rỗng).
- Hậu quả: form cho chọn rồi gửi `maLoai`, `maPhuong`, `maTienIch` có thể không có trong DB. Server trả `VALIDATION_ERROR`, hoặc tệ hơn là lưu sai.
- Sửa: bỏ fallback danh mục. Khi `/filter-options` lỗi thì giữ trạng thái lỗi kèm nút thử lại như trước merge. Vẫn giữ `DEFAULT_PRICE_RANGE` và `DEFAULT_MAP_BOUNDS`, vì đây là giới hạn có trong Excel.

### A5. Dữ liệu mẫu nằm trong code chạy thật. Thấp, đi cùng A1

- `listingFormModel.js:374` trở đi: `getMockListingDetail` (khoảng 120 dòng).
- Sửa: gỡ cùng A1. Nếu chọn A1(b) thì chuyển ra chỗ chỉ dùng khi `USE_MOCK`.

### A6. Giá tối thiểu 50.000 ngược quyết định D1. Làm 2 test fail

- `listingFormModel.js:13`: Trọng đổi `DEFAULT_PRICE_RANGE.min` từ `500_000` thành `50_000`, ghi là theo SRS FR-17.
- Hai nguồn đang mâu thuẫn:
  - SRS FR-17 ghi 50.000–100.000.000, có Giá từ / Giá đến.
  - API ghi một ô `gia`, 500.000–100.000.000.
  - D1 (2026-11-01) đã chọn theo API.
- Đây chỉ là giá trị mặc định. Giá trị thật lấy từ `priceRange` của `/filter-options`.
- **Cần Quân chốt (Q2):**
  - (a) Giữ D1: trả lại `500_000`, `MODEL-05` và `MODEL-09` sẽ qua lại.
  - (b) Theo SRS: giữ `50_000`, sửa `MODEL-05`, `MODEL-09`, và ghi lại D1 trong plan 261101.
  - Nên hỏi BE con số cuối cùng.

### A7. Warning lint ở `MediaStep.jsx:146`

Nằm trong nhánh upload giả của A1, gỡ A1 là hết.

### Đã kiểm, không cần sửa

- `ListingAccessState.jsx`: đổi chữ và nút "← Quay lại" theo Figma Ảnh 3. `EditHotelPage.test.jsx` đã được cập nhật theo.
- Câu "Sau khi gửi lại, cơ sở sẽ chuyển sang Chờ duyệt", dòng phụ "Ẩn ngày …" cho trạng thái HIDDEN, và việc dời `reloadDetail()` trong luồng rút lại: hành vi tương đương hoặc đúng hơn.

## 3. Phần B: sửa file test case

File: `docs/Copy of TestPlan_TestCase_HOTELNT_FE.xlsx`, tab `3. TC - Host (Chủ cơ sở)`, 38 case, tất cả đang ở trạng thái "Ready" (chưa chạy). Đây là tài liệu chung, **cần chốt ai sửa (Q3)**.

### B1. Case đang kiểm dữ liệu giả, phải viết lại theo dữ liệu backend thật

| Case | Vấn đề |
|---|---|
| TC_EDT_01 | "ID = 1 (Sea Breeze Homestay)" là dữ liệu mẫu của A1/A5 |
| TC_EDT_07 | "ID = 2 hoặc ?status=rejected", lý do kỳ vọng là câu mẫu của A3 |
| TC_EDT_10 | "ID = 3 hoặc ?status=pending" chỉ đúng với dữ liệu mẫu |
| TC_EDT_12 | "ID = 4 hoặc ?status=hidden", lý do kỳ vọng là câu mẫu của A3 |
| TC_EDT_13 | "ID = 403 hoặc ?mock=forbidden" dựa vào bug A2. Đúng ra: mở cơ sở của Host khác, API trả 403 `NOT_OWNER` |
| TC_EDT_14 | "ID = 404" dựa vào bug A2. Đúng ra: id không tồn tại thì API trả 404 `LISTING_NOT_FOUND`, còn id dạng chữ thì chặn ngay ở FE |
| TC_ADD_04, ADD_13, EDT_09, EDT_11 | Hiện "qua" kể cả khi không có backend, nhờ A1. Cần chạy lại sau khi sửa A1 và có backend |

### B2. Lệch quyết định hoặc SRS

| Case / chỗ | Sửa thành |
|---|---|
| TC_HDB_01 "4 thẻ thống kê" | Bỏ. Theo D5 (Figma 11.1), chỉ có số trên từng tab |
| TC_ADD_05 giá 50.000 | Theo kết quả Q2 |
| TC_PRF_02 "Tên trên Sidebar/Navbar tự cập nhật" | Bỏ kỳ vọng này khỏi case màn Hồ sơ. Màn chỉ kiểm toast "Cập nhật thông tin thành công" và giá trị mới trên form |
| TC_PRF_01 "CCCD (12 số)" | CCCD hiển thị **che một phần**, ví dụ `079******234`, theo SRS FR-13 và API `GET /profile` |
| TC_PRF_03 "Mật khẩu mới phải từ 8 ký tự" | Theo API: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt. Lỗi hiện dạng "Còn thiếu: …" |
| Mã FR | SRS dùng FR-16 cho hình ảnh. Các case Dashboard (HDB_01–08) đang ghi FR-16 là sai: danh sách thuộc luồng FR-15 bước 1. Case media (ADD_07, ADD_08, ADD_09, EDT_06) ghi FR-17, phải là FR-16 |

### B3. Code đúng, case ghi sai chữ

| Case | Trong file | Code thực tế |
|---|---|---|
| TC_HDB_05 | Nút "Rút lại" màu cảnh báo | Nút viền thường, chỉ hộp xác nhận có màu cảnh báo |
| TC_HDB_06 | Nút "Xác nhận rút" | "Rút lại" |
| TC_HDB_08 | Nút "Xác nhận xóa" | "Xóa cơ sở". Toast lấy `message` của server, mặc định "Xóa cơ sở thành công" |
| TC_ADD_03 | "SĐT phải đủ 10 số bắt đầu bằng 0" | "Số điện thoại phải gồm đúng 10 chữ số", "Nhập số Zalo hoặc link zalo.me", "Link phải bắt đầu bằng https://facebook.com/" |
| TC_ADD_04 | "Chọn Tỉnh: Khánh Hòa, Huyện: TP. Nha Trang" | Hai ô này cố định và khóa sẵn, chỉ chọn Phường/Xã |
| TC_ADD_07 | "Định dạng không được hỗ trợ: ảnh .jpg/.png/.webp" | FE chặn trước khi gửi: "Sai định dạng (chỉ JPG, PNG, WEBP)". Câu trong file là thông báo của server (`UNSUPPORTED_MEDIA_TYPE`) |
| TC_ADD_13 | "Đang gửi..." | "Đang gửi…" (ký tự ba chấm) |
| TC_PRF_01 | Có icon ổ khóa xám | Không có icon. Ô xám, chỉ đọc, kèm ghi chú "Email và CCCD là thông tin định danh, liên hệ Admin để thay đổi." |
| TC_PRF_03 | "Mật khẩu xác nhận không trùng khớp" | "Xác nhận mật khẩu mới không trùng khớp." |

### B4. Case còn thiếu (code đã hỗ trợ, chưa có case)

- **Màn 11:**
  - Lỗi tải danh sách kèm nút thử lại.
  - Tài khoản bị khóa (`ACCOUNT_LOCKED`, không có nút thử lại).
  - Chưa có cơ sở nào: hiện nút "Thêm cơ sở".
  - Tìm không ra kết quả: hiện nút "Xóa bộ lọc".
  - Phân trang, 10 dòng mỗi trang.
  - Xóa nhiều cơ sở cùng lúc: chỉ xóa được Bản nháp và Bị từ chối, báo số thành công/thất bại.
  - Hàng Bản nháp ("Sửa", "Xóa") và hàng Bị ẩn ("Sửa & gửi lại").
  - Xóa thất bại do `409 LISTING_NOT_DELETABLE`.
- **Màn 12:**
  - Nút "Lưu nháp".
  - Tải lại trang có `?id=&step=` thì tiếp tục bản nháp cũ, không tạo trùng.
  - Lỗi theo từng trường từ server (`details[]`).
  - `LOCATION_OUT_OF_RANGE` do server trả về.
  - Vượt 100 ảnh hoặc 5 video (`MEDIA_LIMIT_EXCEEDED`).
  - Kéo thả đổi thứ tự ảnh chỉ trên giao diện, tải lại trang thì về thứ tự `thuTu` (D3).
  - `422 CHECKLIST_INCOMPLETE` kèm danh sách mục thiếu.
- **Màn 13:**
  - Sửa cơ sở ở trạng thái Bản nháp.
  - Xóa ảnh xuống dưới 3 (`MIN_IMAGES_REQUIRED`).
  - `409 LISTING_LOCKED_PENDING`, `409 LISTING_REMOVED`.
  - Lưu cơ sở Đã duyệt mà không có thay đổi thì báo "Không có thay đổi".
- **Hồ sơ:**
  - Số điện thoại sai định dạng.
  - Số điện thoại đã có người dùng (`409 ACCOUNT_DUPLICATED`).
  - `FIELD_NOT_EDITABLE`.
  - Mật khẩu mới trùng mật khẩu cũ.
  - Đổi mật khẩu thành công thì các phiên khác bị đăng xuất.

## 4. Quyết định cần chốt trước khi lập plan

| # | Câu hỏi | Lựa chọn |
|---|---|---|
| Q1 | Xử lý chế độ báo thành công giả (A1, A4, A5) | (a) gỡ hẳn · (b) chỉ bật khi `VITE_USE_MOCK=true` |
| Q2 | Giá tối thiểu mặc định (A6) | (a) 500.000 theo API/D1 · (b) 50.000 theo SRS |
| Q3 | Ai sửa tab Host trong file test case (Phần B) | Quân tự sửa · gửi danh sách cho người phụ trách file |
| Q4 | Báo Trọng trước khi gỡ code Trọng thêm vào `src/pages/host/` | Nên báo, vì A1–A5 là thay đổi có chủ ý của Trọng |

## 5. Gợi ý chia phase

1. **A2 + A3**: nhỏ, độc lập, không cần chờ quyết định. Kèm test 403/404 qua API và test lý do trống.
2. **A1 + A4 + A5 + A7** theo Q1. Kèm test `NETWORK_ERROR` cho từng hành động.
3. **A6** theo Q2.
4. **Bổ sung test tự động** cho các tình huống ở B4 mà `src/pages/host/__tests__/` chưa có.
5. **Danh sách sửa file test case** (Phần B) theo Q3.

Kiểm tra sau mỗi phase: `npx vitest run src/pages/host`, `npx oxlint src/pages/host`, `npm run build`.
