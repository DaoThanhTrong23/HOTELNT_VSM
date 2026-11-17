# Báo cáo: chạy E2E phần Host với backend Azure

Ngày kiểm: 2026-11-16 · Nhánh FE: `feature/quan-dashbds` (`e8856a6`) · Người kiểm: Claude (theo yêu cầu của Quân)

Báo cáo này nối tiếp `261112-1009-azure-backend-token-500-report.md`.

## Cập nhật 12:20: đã merge `deverlop` và sửa giao diện theo sheet

Quân chốt: làm đúng nguyên văn sheet, không tự đặt thêm. Đã merge `origin/deverlop` (`2d4f747`) vào nhánh (commit `44c5961`, chưa push), resolve như mục 3.3. Sau đó sửa giao diện (chưa commit):

| Case | Sửa | File |
|---|---|---|
| TC_HDB_01 | Thêm 4 thẻ Tổng số / Đang hiển thị / Chờ duyệt / Bị từ chối (màu, icon theo `plans/2026-10-20-host-dashboard-profile/phase-02-…md` mục 2.1). Nhãn Chờ duyệt `#D97706` → `#B45309` | `HostDashboardPage.jsx`, `src/components/common/StatusBadge.jsx` (Quân cho phép, chỉ màn Host dùng) |
| TC_HDB_02 | Bấm 'Tất cả' ghi `?trangThai=ALL` | `HostDashboardPage.jsx` |
| TC_HDB_05 | Nút 'Rút lại' màu cảnh báo `#B45309` | `HostDashboardPage.jsx` |
| TC_HDB_06, 08 | Nút xác nhận 'Xác nhận rút', 'Xác nhận xóa' | `HostDashboardPage.jsx` |
| TC_PRF_01 | Icon ổ khóa xám ở Email, CCCD | `HostProfilePage.jsx` |
| TC_PRF_02 | Nút 'Lưu thay đổi'. Lưu xong cập nhật tên trong phiên đăng nhập (qua `login()` có sẵn) nên Sidebar đổi theo | `HostProfilePage.jsx` |
| TC_PRF_03 | Nút 'Lưu' (bấm được khi đủ 3 ô, sai thì không gửi). Câu lỗi 'Mật khẩu mới phải từ 8 ký tự trở lên.', 'Mật khẩu xác nhận không trùng khớp.' | `HostProfilePage.jsx` |

Kiểm tra: unit test 211/211 (thêm 6), lint 0 lỗi, build qua. Ảnh chụp desktop 1440 và điện thoại 390: không tràn ngang.

| E2E | Kết quả |
|---|---|
| Mock | 10 Pass (mock), 1 Fail (mock) |
| Backend Azure | **10 Pass, 1 Fail, 0 Error** |

Case còn Fail là TC_PRF_03, ý "Mật khẩu cũ không chính xác". Không làm được trên giao diện vì:

- Chỉ server biết mật khẩu cũ đúng hay sai. Backend kiểm `newPassword` bằng `@Valid` (tối thiểu 8 ký tự) trước khi kiểm mật khẩu cũ (`HostService.java:113`), nên với mật khẩu mới ngắn thì backend trả `VALIDATION_ERROR`, không trả `OLD_PASSWORD_INCORRECT`.
- FE không được gửi khi ô xác nhận lệch: nếu mật khẩu cũ lại đúng thì mật khẩu bị đổi thật.
- Lượt phụ của test (mật khẩu cũ sai, mật khẩu mới hợp lệ) hiện đúng 'Mật khẩu cũ không chính xác.'.

Đề xuất sửa sheet: tách TC_PRF_03 thành hai lượt, (1) mật khẩu cũ sai + mật khẩu mới hợp lệ, (2) mật khẩu mới ngắn + xác nhận lệch.

File dán sheet đã tạo lại theo lần chạy này: `e2e/reports/sheet-paste-backend-H9-…tsv`, `sheet-paste-backend-H44-…tsv`.

Dữ liệu test còn: 9, 10 Bản nháp · 17 Chờ duyệt ("Breeze") · 13 Đã duyệt · 19 Bị từ chối · 16 Ẩn. Đủ cho đúng 1 lần chạy nữa.

## Tóm tắt

- **Backend đã hết lỗi token.** Gửi `Bearer abc` giờ nhận 401 `TOKEN_INVALID`, không còn 500. Đăng ký, OTP qua email (SMTP đã cấu hình) và refresh token đều chạy được.
- **11 case chạy được với backend thật: 3 Pass, 8 Fail, 0 Error.** Các case Fail là chỗ giao diện lệch chữ trong sheet, giống hệt trên mock. Phần gọi API (lưu hồ sơ, rút lại, xóa, báo mật khẩu cũ sai) đều đúng.
- **Lỗi thật trên nhánh của Quân:** thumbnail trên màn danh sách bị vỡ với backend thật. Bản `deverlop` đã sửa, và hết lỗi sau khi merge.
- **PR #3 đang conflict với `deverlop`** ở 3 file. Resolve theo cách ở mục 4 thì mọi kiểm tra đều qua. Nếu resolve kiểu khác, auto-merge sẽ để lại một dòng làm màn danh sách lỗi ở chế độ mock.
- **Cột "Phường/Xã" luôn hiện "—"** với backend thật, vì hợp đồng API của `GET /host/listings` không có `tenPhuong`. Cần Quân quyết định (mục 3.2).

## Cập nhật 15:10: TC_PRF_03 tách 2 lượt, kết quả lên Google Sheet

- Kết quả được ghi vào file chung trên Drive (`Test-case-HOTELNT.xlsx` của Trọng, mở bằng Google Sheets) thay cho file trong máy. Quân tự dán chữ (H, I, J) và chèn ảnh (cột K); file `docs/Test-case-HOTELNT.xlsx` trong máy đã trả về bản gốc.
- TC_PRF_03 viết lại ngay dòng 46 (giữ mã, Quân chọn): Lượt 1 mật khẩu cũ sai + mật khẩu mới hợp lệ → 'Mật khẩu cũ không chính xác'; Lượt 2 mật khẩu mới < 8 ký tự + xác nhận lệch → 2 lỗi còn lại, không gửi yêu cầu. Lý do: API đổi mật khẩu trả 1 lỗi mỗi lần (API_DESIGN.xlsx liệt kê OLD_PASSWORD_INCORRECT và VALIDATION_ERROR riêng) và backend kiểm mật khẩu mới trước, nên case cũ đòi 3 lỗi trong 1 lần bấm là không thể. Không phải lỗi FE hay backend.
- Spec `e2e/host/host-profile.e2e.js` sửa theo 2 lượt (kiểm thêm: 0 lần gọi `/change-password` ở lượt 2, không có thông báo đổi thành công). Mock và backend Azure: Pass 6/6 ý.
- Kết quả cả 11 case với backend: **11 Pass**. Nội dung dán cho D46:J46 ở `e2e/reports/sheet-evidence/paste-D46-J46.tsv`, ảnh K46 mới ở `e2e/reports/sheet-evidence/` và `sheet-evidence-large/`.

## Cập nhật 14:30: màu nhãn theo bảng màu thiết kế, soát lại Notes

- `src/components/common/StatusBadge.jsx` (Quân cho phép): Bản nháp đổi sang chữ `#475569` trên nền `#CBD5E1`, Bị từ chối nền `#F4A9A9` (trước là nền mờ 40%), đúng bảng token ở `plans/2026-10-20-host-dashboard-profile/plan.md`. Nhãn Ẩn không có trong bảng, giữ nguyên.
- Chạy lại cả 11 case với backend để ảnh có màu mới: 10 Pass, 1 Fail (TC_PRF_03). Đã dựng lại 2 cơ sở bị case xóa: Sea Breeze Homestay Trần Phú (mã 26, Chờ duyệt), Căn hộ Biển Xanh Vĩnh Nguyên (mã 27, Bị từ chối).
- Actual Result trong file Excel viết lại bằng số liệu đo được (đối chiếu từng con số với `results.json` và ảnh); Notes bỏ mã cơ sở đã xóa, trích nguyên văn SRS FR-13 cho CCCD, ghi việc khôi phục dữ liệu.

## Cập nhật 14:00: chạy chính thức, ảnh từng bước và file Excel

- Chạy cả 11 case với backend Azure (Host "Trần Minh Khoa", `E2E_HOST_NAME`): **10 Pass, 1 Fail** (TC_PRF_03, ý mật khẩu cũ). Chạy xong đã dựng lại 2 cơ sở bị case xóa: Sea Breeze Homestay Trần Phú (giờ là mã 23, Chờ duyệt) và Căn hộ Biển Xanh Vĩnh Nguyên (mã 24, Bị từ chối).
- Bộ E2E giờ chụp **toàn trang ở từng bước** (`session.shot()` trong `e2e/support/driver.js`): kéo cao cửa sổ cho vừa nội dung (layout Host cuộn trong khung riêng), chờ hết "Đang tải" và ảnh tải xong. 36 ảnh ở `e2e/reports/steps/<mã case>/`.
- `docs/Test-case-HOTELNT.xlsx` (file gốc là Excel 97 mang đuôi .xlsx) đã chuyển sang .xlsx thật, giữ nguyên 8 tab, font, viền, màu nền, ô gộp, độ rộng cột (so từng ô: 0 ô đổi ngoài ý muốn). Tab Host, chỉ dòng 9–16 và 44–46: điền Actual Result (H), Status (I), ghi thêm vào Notes (J) sau phần có sẵn; thêm cột K–R (tiêu đề gộp "Ảnh minh chứng từng bước"): mỗi bước là một ô ảnh cùng cỡ 360×260 px, có nhãn "Ảnh n" và chú thích bước, ảnh chụp đặt trọn bên dưới (không cắt), cách mép ô 8 px, neo đúng dòng của case. Status tô màu: Pass nền xanh, Fail nền đỏ nhạt. Bản gốc: `e2e/reports/backup/Test-case-HOTELNT.original.xls`.

## Cập nhật 13:30: tên, ảnh thật và lỗi đường dẫn ảnh

**Tên.** 6 cơ sở và tài khoản Host không còn chữ "E2E"/"test". Tài khoản Host: "Trần Minh Khoa" (TC_PRF_02 đổi tên khi chạy, trả lại tên này sau mỗi lần chạy). Lý do từ chối (19) và lý do ẩn (16) viết lại cho tự nhiên.

| Mã | Trạng thái | Tên | Số ảnh |
|---|---|---|---|
| 13 | Đã duyệt | Villa Hoàng Hôn Phạm Văn Đồng | 5 |
| 16 | Ẩn | Ánh Dương Resort Nha Trang | 5 |
| 17 | Chờ duyệt | Sea Breeze Homestay Trần Phú | 4 |
| 19 | Bị từ chối | Căn hộ Biển Xanh Vĩnh Nguyên | 4 |
| 10 | Bản nháp | Nhà Gỗ Hùng Vương Homestay | 4 |
| 9 | Bản nháp | Phố Biển Homestay | 4 |

**Ảnh.** Không lấy ảnh từ web khách sạn/Booking/Agoda (bản quyền, và gắn ảnh khách sạn thật vào cơ sở giả). Dùng ảnh có giấy phép tự do tìm qua Openverse (rawpixel, StockSnap, Wikimedia): villa có hồ bơi, hồ bơi vô cực nhìn ra vịnh, ban công nhìn biển, phòng ngủ, phòng khách. 25/26 ảnh là CC0, 1 ảnh CC BY 2.0 (ghi tác giả bên dưới). Ảnh JPEG cạnh dài 1600px, 210–610KB. Bộ ảnh Wikimedia đặt lúc 12:45 đã gỡ.

**Lỗi đường dẫn ảnh (FE, đính chính mục 3.1).** Mục 3.1 ghi "`deverlop` đã sửa thumbnail" là **sai**. `resolveHotelImageUrl` (`src/utils/formatters.js`) cắt `/api` khỏi `VITE_API_BASE_URL` rồi ghép `/uploads/...`, ra `<host>/uploads/...` (404). Ảnh lỗi thì `Thumbnail` đổi sang ảnh dự phòng, nên cả 6 hàng hiện cùng một ảnh. Test TC_HDB_01 vẫn Pass vì chỉ kiểm "ảnh tải được". API Admin (`/admin/listings`) cũng trả `/uploads/...` nên trang Kiểm duyệt bị y hệt. Bước Ảnh trong form Host (`MediaStep.jsx`) dùng thẳng `item.url` nên cũng vỡ.

Đã sửa (Quân cho phép sửa file chung):
- `src/utils/formatters.js`: giữ `/api` khi ghép (1 dòng). Ảnh công khai trả URL đầy đủ nên không đổi. **Ghi chú cho Trọng:** hàm này giờ ghép `<VITE_API_BASE_URL>/uploads/...`.
- `MediaStep.jsx`: ảnh và link video đi qua `resolveHotelImageUrl`.
- `HostDashboardPage.jsx`: gắn `data-fallback="true"` khi phải dùng ảnh dự phòng. `e2e/pages/dashboard-page.js`: ảnh dự phòng không tính là có ảnh. Kiểm chứng: trước khi sửa đường dẫn, TC_HDB_01 với backend báo "0/6 hàng hiện ảnh"; sau khi sửa, Pass.
- Test `DASH-03b`: đường dẫn `/uploads/...` ra `<API>/api/uploads/...`. Unit test 212/212.

Kết quả với backend sau các sửa này: **10 Pass, 1 Fail** (TC_PRF_03 như trên). TC_HDB_01 chạy lại lúc 13:25; 9 case kia lấy từ lần chạy 12:18 (không bị ảnh hưởng bởi sửa ảnh). File dán sheet đã tạo lại.

Nguồn ảnh:

| Cơ sở | Ảnh | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|
| 9 | 1 | [Free bedroom image](https://www.rawpixel.com/image/5924448/photo-image-public-domain-blue-room) (rawpixel) | (không ghi) | CC0 1.0 |
| 9 | 2 | [Interior Living Room Blue Sofa](https://www.rawpixel.com/image/5964979/photo-image-light-public-domain-tree) (rawpixel) | (không ghi) | CC0 1.0 |
| 9 | 3 | [Big And Comfortable Living Room](https://www.rawpixel.com/image/5965031/photo-image-light-public-domain-plant) (rawpixel) | (không ghi) | CC0 1.0 |
| 9 | 4 | [Sunset Infinity](https://stocksnap.io/photo/sunset-infinity-HJXKE7B6E9) (stocksnap) | Matt Bango | CC0 1.0 |
| 10 | 1 | [(không tên)](https://www.rawpixel.com/image/5944725/free-public-domain-cc0-photo) (rawpixel) | (không ghi) | CC0 1.0 |
| 10 | 2 | [Round Room is focal point](https://www.rawpixel.com/image/582766/carol-highsmiths-wyoming-photograph) (rawpixel) | Carol M Highsmith | CC0 1.0 |
| 10 | 3 | [Couch Furniture](https://stocksnap.io/photo/couch-furniture-TQNWBTLHLY) (stocksnap) | Kristin Hardwick | CC0 1.0 |
| 10 | 4 | [Furniture Patio](https://stocksnap.io/photo/furniture-patio-U9WC0VGYWB) (stocksnap) | World Travel Adventures | CC0 1.0 |
| 13 | 1 | [Pool Backyard](https://stocksnap.io/photo/pool-backyard-8512A55AD8) (stocksnap) | Vita Vilcina | CC0 1.0 |
| 13 | 2 | [round infinity pool green coast](https://www.rawpixel.com/image/3283413/free-photo-image-beach-swimming-pool) (rawpixel) | (không ghi) | CC0 1.0 |
| 13 | 3 | [Beautiful beach view room model](https://www.rawpixel.com/image/6018511/photo-image-public-domain-ocean-nature) (rawpixel) | (không ghi) | CC0 1.0 |
| 13 | 4 | [(không tên)](https://www.rawpixel.com/image/5947058/free-public-domain-cc0-photo) (rawpixel) | (không ghi) | CC0 1.0 |
| 13 | 5 | [Modern apartment interior](https://www.rawpixel.com/image/6043312/photo-image-public-domain-table-living-room) (rawpixel) | (không ghi) | CC0 1.0 |
| 16 | 1 | [Playa Tropical Resort Hotel.Currimao. quiet](https://www.rawpixel.com/image/4025167/photo-image-ocean-house-nature) (rawpixel) | (không ghi) | CC0 1.0 |
| 16 | 2 | [View from an infinity pool overlooking a lifeguard hut and the Caribbe](https://wordpress.org/photos/photo/69665c2dc0/) (wordpress) | Jeffrey Paul | CC0 1.0 |
| 16 | 3 | [Shangri La is Honolulu home](https://www.rawpixel.com/image/2362897/photo-image-cloud-palm-tree-plant) (rawpixel) | Carol M Highsmith | CC0 1.0 |
| 16 | 4 | [Bedroom decor interior](https://www.rawpixel.com/image/6036396/photo-image-public-domain-wood-house) (rawpixel) | (không ghi) | CC0 1.0 |
| 16 | 5 | [Furniture Patio](https://stocksnap.io/photo/furniture-patio-KOIAWLY3SU) (stocksnap) | World Travel Adventures | CC0 1.0 |
| 17 | 1 | [Beautiful beach view room model](https://www.rawpixel.com/image/6032322/photo-image-public-domain-ocean-nature) (rawpixel) | (không ghi) | CC0 1.0 |
| 17 | 2 | [Window View](https://stocksnap.io/photo/window-view-VTNNBQLDPH) (stocksnap) | Sergei Gussev | CC0 1.0 |
| 17 | 3 | [Elegant hotel room with dining setup and cozy ambiance near the city c](https://commons.wikimedia.org/w/index.php?curid=187101709) (wikimedia) | Shixart1985 | CC BY 2.0 |
| 17 | 4 | [(không tên)](https://www.rawpixel.com/image/6057969/free-public-domain-cc0-photo) (rawpixel) | (không ghi) | CC0 1.0 |
| 19 | 1 | [Bedroom decor interior](https://www.rawpixel.com/image/6036450/photo-image-public-domain-wood-house) (rawpixel) | (không ghi) | CC0 1.0 |
| 19 | 2 | [Free modern simple living room](https://www.rawpixel.com/image/5925553/photo-image-light-public-domain-plant) (rawpixel) | (không ghi) | CC0 1.0 |
| 19 | 3 | [Free bedroom image](https://www.rawpixel.com/image/5924372/photo-image-public-domain-wooden-room) (rawpixel) | (không ghi) | CC0 1.0 |
| 19 | 4 | [Beautiful beach view room model](https://www.rawpixel.com/image/6032325/photo-image-public-domain-ocean-nature) (rawpixel) | (không ghi) | CC0 1.0 |

### Lỗi backend: xóa ảnh của cơ sở Đã duyệt

`DELETE /host/listings/{id}/media/{mediaId}` trên cơ sở **Đã duyệt** trả 500 `INTERNAL_ERROR`. Đã thử cả 3 ảnh của cơ sở 13; cơ sở vẫn Đã duyệt và ảnh không bị xóa. Xóa ở Bản nháp, Bị từ chối, Ẩn đều 200. Riêng nhánh Đã duyệt trong `MediaService.delete` chuyển trạng thái về Chờ duyệt rồi gọi `coSoRepo.save(coSo)` sau `mediaRepo.delete(media)`; nhiều khả năng lỗi nằm ở đó (chưa xem được log Azure). Ảnh hưởng: Host không xóa được ảnh của cơ sở đang hiển thị. Đi vòng: tải thêm 1 ảnh (cơ sở về Chờ duyệt), rút lại, xóa, gửi duyệt.

## 1. Kiểm tra đã chạy

| Kiểm tra | Nhánh `feature/quan-dashbds` | Bản merge thử vào `deverlop` (`232ebe8`) |
|---|---|---|
| Unit test | `src/pages/host` + `e2e/support`: 185/185 | Cả repo: 205/205, 3 lần liền |
| `oxlint` (`src/pages/host`, `e2e`) | 0 lỗi | 0 lỗi |
| `vite build` | Qua | Qua |
| E2E mock | 3 Pass (mock), 8 Fail (mock), 0 Error | 3 Pass (mock), 8 Fail (mock), 0 Error |
| E2E backend Azure | 3 Pass, 8 Fail, 0 Error | 3 Pass, 8 Fail, 0 Error |

Ghi chú:

- Lần chạy unit test đầu tiên trên bản merge, ngay sau `npm install`, có 7 test của AddHotelPage/EditHotelPage báo đỏ. Chạy lại 3 lần đều qua 205/205, nên đó là test chập chờn khi cache còn trống, không phải lỗi code.
- Test dùng chung `StateComponents.test.jsx` bị đỏ từ `085cf27` đã được sửa trên `deverlop`.
- Sau mỗi lần chạy, cổng 5199 trống và không còn tiến trình `chromedriver`.

### Kết quả từng case với backend (nhánh của Quân)

| Case | Status | Ý không khớp |
|---|---|---|
| TC_HDB_01 | Fail | Không có 4 thẻ thống kê. Nhãn Chờ duyệt `#D97706` (Figma `#B45309`). **Thumbnail: 0/8 hàng hiện ảnh** (chỉ có trên backend, xem 3.1) |
| TC_HDB_02 | Fail | Bấm 'Tất cả': URL không có `trangThai=ALL` |
| TC_HDB_03 | Pass | |
| TC_HDB_04 | Pass | |
| TC_HDB_05 | Fail | 'Rút lại' không có màu cảnh báo |
| TC_HDB_06 | Fail | Không có nút 'Xác nhận rút'. Bấm 'Rút lại' thật: cơ sở 12 đổi từ Chờ duyệt sang Bản nháp trên backend |
| TC_HDB_07 | Pass | |
| TC_HDB_08 | Fail | Không có nút 'Xác nhận xóa'. Bấm 'Xóa cơ sở' thật: backend đã xóa một Bản nháp và một Bị từ chối |
| TC_PRF_01 | Fail | Không có icon ổ khóa. CCCD hiện `079******234` |
| TC_PRF_02 | Fail | Nút là 'Lưu thông tin'. Sidebar không đổi tên. Backend đã lưu họ tên và SĐT mới |
| TC_PRF_03 | Fail | Không có nút 'Lưu', câu lỗi khác chữ. Lượt phụ: mật khẩu cũ sai thì backend trả lỗi, màn hình hiện "Mật khẩu cũ không chính xác." |

Trên bản merge, kết quả giống hệt, trừ ý thumbnail của TC_HDB_01 là qua (TC_HDB_01 vẫn Fail vì 2 ý kia).

File dán sheet (không commit, nằm trong `e2e/reports/`):

- `host-results.csv`: lần chạy backend trên nhánh của Quân.
- `sheet-paste-backend-H9-TC_HDB_01-to-TC_HDB_08.tsv`, `sheet-paste-backend-H44-TC_PRF_01-to-TC_PRF_03.tsv`: 3 cột `Actual Result`, `Status`, `Notes`, dán từ ô H9 và H44. Cột `Notes` đã giữ sẵn phần "Mức độ | Phụ trách | Yêu cầu" của sheet.
- `host-results-merged-deverlop-backend.csv`: lần chạy backend trên bản merge.

## 2. Tài khoản và dữ liệu test trên Azure

Dữ liệu nằm trong DB dùng chung, tách riêng khỏi host1/host2 của seed.

| Mục | Giá trị |
|---|---|
| Tài khoản Host | id 7, email là alias `+e2ehost` trên Gmail của Quân (không ghi địa chỉ ở đây). Mật khẩu đã gửi riêng cho Quân, không ghi ở đây |
| Cơ sở hiện có | 9, 10 Bản nháp · 17 "E2E Sea Breeze Chờ duyệt", 20 Chờ duyệt · 13 Đã duyệt · 18, 19 Bị từ chối · 16 Ẩn |
| Đã xóa trong lúc test | 11, 12, 14, 15 (do TC_HDB_06, TC_HDB_08) |

Lưu ý: cơ sở 13 "E2E Đã duyệt" đang hiện công khai trên trang khách du lịch. Khi không cần test nữa, dùng admin ẩn hoặc gỡ (`PATCH /admin/listings/13/unpublish`, `hinhThuc` = `HIDE` hoặc `REMOVE`).

Mỗi lần chạy cả bộ sẽ rút lại 1 cơ sở Chờ duyệt, xóa 1 Bản nháp và 1 Bị từ chối, và đổi họ tên, SĐT của tài khoản. Dữ liệu hiện tại đủ cho đúng 1 lần chạy nữa. Muốn chạy thêm thì tạo lại các cơ sở đó, và trả hồ sơ về giá trị cũ bằng `PATCH /host/profile`.

## 3. Phát hiện

### 3.1 Thumbnail vỡ với backend thật (FE, nhánh của Quân)

`GET /host/listings` trả `duongDanAnh` dạng đường dẫn tương đối, ví dụ `/uploads/b7149bfa-....png`. `Thumbnail` trong `src/pages/host/HostDashboardPage.jsx` đặt giá trị này thẳng vào `<img src>`, nên trình duyệt tìm ảnh ở `http://localhost:5199/uploads/...` và nhận 404. Ảnh thật nằm ở `<API>/uploads/...`, tức `https://...azurewebsites.net/api/uploads/...`. Ảnh chụp `e2e/reports/screenshots/TC_HDB_01.png` chỉ hiện chữ alt.

**Đính chính:** `resolveHotelImageUrl` của `232ebe8` chưa sửa được, vì nó bỏ mất `/api`. Xem mục "Cập nhật 13:30".

### 3.2 Cột "Phường/Xã" luôn là "—" (cần Quân quyết định)

Màn danh sách hiện `item.tenPhuong` (`HostDashboardPage.jsx:611`, `:662`). Nhưng hợp đồng API (`docs/Copy of API_DESIGN.xlsx`) của `GET /host/listings` chỉ có `maCSLT, tenCSLT, tenLoai, gia, duongDanAnh, trangThai, lyDoTuChoi, lyDoViPham, ngayTao, ngayCapNhat, allowedActions`. Backend làm đúng hợp đồng (`HostDtos.ListingSummary`). Mock của FE thì có `tenPhuong`, nên trên mock không thấy lỗi. Có hai hướng:

- Nhờ người quản lý backend thêm `tenPhuong` vào hợp đồng và vào `ListingSummary`.
- Bỏ cột "Phường/Xã" khỏi bảng (và bỏ phần phường ở dòng phụ trên mobile).

Không case nào trong sheet kiểm cột này.

### 3.3 PR #3 conflict với `deverlop`

Commit `88f6c4b` và `232ebe8` thêm vào `hostMockApi.js` 5 hàm mock mà Quân đã viết ở `4b1212e`, và sửa test `MOCK-02`. Khi merge `feature/quan-dashbds` vào `deverlop`:

| File | Cách resolve đã kiểm |
|---|---|
| `src/pages/host/api/hostMockApi.js` | Lấy bản của Quân. Bản `deverlop` chỉ thêm 5 hàm trùng việc, và hồ sơ mock để CCCD không che |
| `src/pages/host/__tests__/hostMockApi.test.jsx` | Lấy bản của Quân (có `MOCK-10…16`) |
| `package-lock.json` | Lấy bản `deverlop` (có `leaflet`), rồi chạy `npm install` để thêm `selenium-webdriver` |
| `src/pages/host/api/hostApi.js` | Tự merge không conflict, nhưng **phải xóa** dòng `if (USE_MOCK) return viaMock('getHostListings', { trangThai, keyword, page, limit });` ở đầu `getHostListings` |

Dòng cuối kia đến từ `deverlop`. Nó chuyển nguyên `trangThai: 'ALL'` (`HostDashboardPage.jsx:38`) vào mock. Mock của Quân chỉ nhận 5 trạng thái (`hostMockApi.js:213`), nên trả `VALIDATION_ERROR`. Còn giữ dòng này thì ở chế độ mock, màn danh sách báo "Không tải được danh sách cơ sở", 8 case Danh sách báo `Error`, và `MOCK-02` đỏ. Xóa đi thì mọi kiểm tra ở mục 1 đều qua. Chế độ backend không bị ảnh hưởng.

### 3.4 Ghi chú cho backend (không chặn)

- **Giờ lệch 7 tiếng.** Tạo tài khoản lúc 11:11 (+07) nhưng `ngayTao` là `2026-11-15T21:11:39Z`, đúng ra phải là `2026-11-16T04:11Z`. Màn danh sách chỉ hiện ngày nên hiện tại vẫn đúng. Nhưng thao tác từ 00:00 đến 07:00 giờ Việt Nam sẽ hiện lùi 1 ngày.
- **URL ảnh không thống nhất.** `POST /host/listings/{id}/media` và `GET /host/listings` trả `/uploads/...` (tương đối, thiếu `/api`), còn `GET /listings` trả URL đầy đủ.

## 4. Chạy lại

1. Lấy token: `POST /auth/signin` với email ở mục 2, nhận OTP trong Gmail, rồi `POST /auth/signin/verify`. Token sống 30 phút.
2. Chạy:
   ```bash
   E2E_TARGET=backend \
   VITE_API_BASE_URL=https://hotelnt-api-e4fhhvd8bvawfdec.eastasia-01.azurewebsites.net/api \
   E2E_HOST_TOKEN=<accessToken> \
     npx vitest run --config e2e/vitest.config.js
   ```
3. Nên chạy lại sau khi resolve conflict của PR #3, để kết quả dán vào sheet khớp với code sẽ merge.

## Nguồn

- Backend `TheHungrier/hotelnt-backend`, nhánh `develop` (`88ed5e9`, deploy `43560007906` ngày 14/11). Các file đã đọc: `controller/HostSigninController.java`, `SignupController.java`, `SignupVerifyController.java`, `SigninVerifyController.java`, `AdminSigninController.java`, `AdminListingController.java`, `MediaController.java`, `HostController.java`, `dto/HostDtos.java`, `dto/AdminDtos.java`, `dto/SignupRequest.java`, `helper/OtpEmailSender.java`, `helper/AuthOtpIssuer.java`, `service/MediaService.java`, `db/changelog/changes/003-seed-demo-data.sql`
- FE: `origin/deverlop` `232ebe8`, PR #3. Hợp đồng API: `docs/Copy of API_DESIGN.xlsx`
