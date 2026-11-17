# Danh sách sửa file test case: tab Host và RTM

Ngày lập: 2026-11-08 · Người lập: Quân (Claude soạn) · Gửi: người phụ trách file test case

## 0. Áp dụng cho

| Mục | Giá trị |
|---|---|
| File | `docs/Copy of TestPlan_TestCase_HOTELNT_FE.xlsx` **và** `docs/HOTELNT_FE_Test_Plan_and_Test_Cases.xlsx` |
| Tab | `3. TC - Host (Chủ cơ sở)` và `6. Ma trận RTM (Traceability)` |
| Hai file giống nhau? | Có. Đã dump hai tab này của cả hai file ngày 2026-11-08 và so bằng `diff`: giống hệt nhau. **Sửa file nào thì sửa luôn file kia** |
| Nguồn | Báo cáo `plans/reports/261108-1316-host-screens-post-merge-audit-report.md` (mục B1–B4) và plan `plans/261108-0632-host-screens-post-merge-fixes/plan.md` |
| Chữ "Sửa thành" | Lấy từ code và test ở nhánh `feature/quan-dashbds` sau khi sửa (Phase 1–4). Cột "Nguồn" ghi `file:dòng` (đường dẫn tính từ `src/pages/host/`) hoặc mã test tự động |

### Ghi chú khi chạy kiểm thử

- Chỉ đánh **Pass** khi chạy với **backend thật**.
- Không đánh Pass khi backend không chạy. Trước đây form báo "đã lưu" giả khi mất mạng, nên nhiều case trông như qua dù không có backend. Lỗi này đã sửa: giờ mất mạng là báo lỗi.
- `VITE_USE_MOCK=true` chỉ để dev xem giao diện (xem Phụ lục). Không dùng khi kiểm thử chính thức, và không bật ở bản production.

## 1. Sửa case hiện có

Số "Dòng" là số dòng trong tab Host (dòng 4 là tiêu đề cột, dòng 5–42 là 38 case). Cột: E = Yêu cầu SRS, F = Mục tiêu, G = Điều kiện tiên quyết, H = Các bước, I = Dữ liệu, J = Kết quả mong đợi, M = Ghi chú.

### 1.1 B1: case đang dựa vào dữ liệu giả hoặc lỗi đã sửa

| Dòng | Mã case | Cột | Hiện tại | Sửa thành | Lý do | Nguồn |
|---|---|---|---|---|---|---|
| 26 | TC_EDT_01 | G | "Truy cập trang chỉnh sửa cơ sở hợp lệ (ví dụ ID = 1)" | "CSLT Đã duyệt có sẵn của tài khoản Host kiểm thử (lấy mã từ Danh sách CSLT)" | ID = 1 là dữ liệu mẫu trong code, đã gỡ | plan D7, `EDIT-15` |
| 26 | TC_EDT_01 | H | "1. Truy cập /host/hotels/1/edit …" | "1. Từ Danh sách CSLT bấm 'Sửa' ở cơ sở Đã duyệt (hoặc mở /host/hotels/<mã>/edit) …" | Như trên | — |
| 26 | TC_EDT_01 | I | "ID = 1 (Sea Breeze Homestay)" | "Mã CSLT Đã duyệt của tài khoản kiểm thử" | Như trên | — |
| 32 | TC_EDT_07 | G | "… (ví dụ ID = 2 hoặc ?status=rejected)" | "Truy cập một CSLT Bị từ chối của tài khoản Host kiểm thử (Admin đã từ chối kèm lý do)" | `?status=` đã bỏ | `components/listing-form/ListingEditor.jsx` (effect tải chi tiết) |
| 32 | TC_EDT_07 | H, I | "Mở trang /host/hotels/2/edit"; "ID = 2 (Trần Phú Central Hotel)" | "Mở trang /host/hotels/<mã>/edit"; "Mã CSLT Bị từ chối" | Như trên | — |
| 32 | TC_EDT_07 | J | "… Lý do: Ảnh bìa không đúng với cơ sở và địa chỉ chưa khớp… Vui lòng sửa rồi gửi kiểm duyệt lại.' (Ảnh 1 & 2)." | "Header: badge '• Bị từ chối' và dòng 'Từ chối ngày …'. Banner đỏ: 'Quản trị viên đã từ chối cơ sở này' và 'Lý do: <lý do Admin nhập>'. Nếu API không gửi lý do thì hiện 'Lý do: Không có ghi chú.'" | Câu lý do cũ là câu mẫu gắn cứng trong code (A3), đã gỡ | `ListingEditor.jsx:631-632`, `EDIT-08`, `EDIT-14` |
| 35 | TC_EDT_10 | G | "… (ví dụ ID = 3 hoặc ?status=pending)" | "Truy cập một CSLT Chờ duyệt của tài khoản Host kiểm thử" | `?status=` đã bỏ | — |
| 35 | TC_EDT_10 | H, I | "Mở trang /host/hotels/3/edit"; "ID = 3 (Sea Breeze Homestay)" | "Mở trang /host/hotels/<mã>/edit"; "Mã CSLT Chờ duyệt" | Như trên | — |
| 37 | TC_EDT_12 | G | "Truy cập cơ sở bị ẩn (ID = 4 hoặc ?status=hidden)" | "Truy cập một CSLT bị Admin ẩn của tài khoản Host kiểm thử" | `?status=` đã bỏ | — |
| 37 | TC_EDT_12 | H | "1. Mở trang /host/hotels/4/edit …" | "1. Mở trang /host/hotels/<mã>/edit …" | Như trên | — |
| 37 | TC_EDT_12 | J | "Hiển thị badge đỏ '• Bị ẩn'; Banner đỏ: '… Lý do: Phát hiện vi phạm tiêu chuẩn cộng đồng về thông tin liên hệ...'; …" | "Badge xám '• Ẩn' và dòng 'Ẩn ngày …'. Banner đỏ: 'Quản trị viên đã ẩn cơ sở này' và 'Lý do: <lý do vi phạm>'; API không gửi lý do thì 'Lý do: Không có ghi chú.' Cho phép Host sửa và gửi kiểm duyệt lại (Ảnh 4)." | Lý do cũ là câu mẫu (A3). Nhãn và màu badge lấy từ `StatusBadge` dùng chung (nhãn 'Ẩn', màu xám) | `ListingEditor.jsx:105`, `:637-638`; `src/constants/enums.js:19`; `EDIT-09`, `EDIT-14` |
| 38 | TC_EDT_13 | G | "Host truy cập cơ sở thuộc về Host khác (ví dụ ID = 403 hoặc ?mock=forbidden)" | "Host truy cập CSLT thuộc Host khác. API trả 403 `NOT_OWNER`" | Code cũ bắt cứng mã 403 và `?mock=` (A2), nên CSLT có mã 403 thật không mở được. Đã gỡ | `EditHotelPage.jsx`, `EDIT-01`, `EDIT-13` |
| 38 | TC_EDT_13 | H, I | "1. Nhập URL /host/hotels/403/edit …"; "Lỗi 403" | "1. Nhập URL /host/hotels/<mã CSLT của Host khác>/edit …"; "Mã CSLT của tài khoản Host khác" | Như trên | — |
| 39 | TC_EDT_14 | G | "Nhập ID cơ sở không tồn tại trong hệ thống (ID = 404 hoặc ID chữ)" | Tách 2 ý: (a) mã số không tồn tại → API trả 404 `LISTING_NOT_FOUND`; (b) mã dạng chữ (`/host/hotels/abc/edit`) → FE chặn ngay, không gọi API | Mã 404 không còn bị bắt cứng (A2) | `EditHotelPage.jsx:9-11`, `EDIT-02`, `EDIT-13` |
| 39 | TC_EDT_14 | H, I | "1. Truy cập /host/hotels/404/edit"; "Lỗi 404" | "1. Truy cập /host/hotels/999999/edit (mã chưa có). 2. Truy cập /host/hotels/abc/edit"; "Mã không tồn tại; mã dạng chữ" | Như trên | — |
| 16 | TC_ADD_04 | M | "FR-14 Sinh Listing_ID" | "FR-14 Sinh Listing_ID. Chạy lại sau khi sửa A1 (plan 261108-0632) và khi có backend. Kết quả trước đó không tính, vì form từng báo thành công giả khi mất mạng" | Code cũ sinh mã ngẫu nhiên khi mất mạng (A1) | `ADD-15` |
| 25 | TC_ADD_13 | M | "FR-18 Submit Review" | "FR-18 Submit Review. Chạy lại sau khi sửa A1 (plan 261108-0632) và khi có backend. Kết quả trước đó không tính, …" (như trên) | Như trên | `EDIT-17` |
| 34 | TC_EDT_09 | M | "FR-15 Gửi duyệt lại" | "FR-15 Gửi duyệt lại. Chạy lại sau khi sửa A1 …" (như trên) | Như trên | `EDIT-17` |
| 36 | TC_EDT_11 | M | "FR-15 Rút về DRAFT" | "FR-15 Rút về DRAFT. Chạy lại sau khi sửa A1 …" (như trên) | Như trên | `EDIT-18` |

### 1.2 B2: lệch quyết định hoặc SRS

| Dòng | Mã case | Cột | Hiện tại | Sửa thành | Lý do | Nguồn |
|---|---|---|---|---|---|---|
| 5 | TC_HDB_01 | E | "FR-16" | "FR-15" | SRS: FR-16 là Hình ảnh. Danh sách CSLT là bước 1 của FR-15 ("Host mở danh sách cơ sở lưu trú của mình") | `docs/SRS_HOTELNT.md:503-511`, `:519` |
| 5 | TC_HDB_01 | F | "Hiển thị bảng danh sách cơ sở lưu trú và 4 thẻ thống kê" | "Hiển thị bảng danh sách cơ sở lưu trú và số lượng trên từng tab trạng thái" | Theo D5 (Figma 11.1): không có 4 thẻ thống kê | plan 261101 D5, `HostDashboardPage.jsx:710-735` |
| 5 | TC_HDB_01 | H | "… 2. Quan sát 4 thẻ thống kê số liệu và bảng dữ liệu Data Table." | "… 2. Quan sát số trên từng tab trạng thái và bảng dữ liệu." | Như trên | — |
| 5 | TC_HDB_01 | J | "Hiển thị 4 thẻ thống kê (Tổng số, Đang hiển thị, Chờ duyệt, Bị từ chối); Bảng hiển thị thumbnail, tên CSLT, ngày tạo, StatusBadge …" | "Mỗi tab 'Tất cả', 'Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Bị từ chối', 'Ẩn' có số lượng. Bảng có các cột: ảnh, 'Tên cơ sở', 'Phường/Xã', 'Giá tham khảo', 'Ngày tạo', 'Cập nhật', 'Trạng thái', 'Thao tác'; StatusBadge đúng màu Figma." | Như trên; cột bảng lấy theo code | `HostDashboardPage.jsx:18-23`, `:565-582`; `DASH-01`, `DASH-02` |
| 5, 6, 7 | TC_HDB_01, TC_HDB_02, TC_HDB_03 | E | "FR-16" | "FR-15" | Như dòng 5 | SRS FR-15 |
| 5, 6 | TC_HDB_01, TC_HDB_02 | M | "FR-16 Dashboard"; "FR-16 Tab Status" | "FR-15 Dashboard"; "FR-15 Tab Status" | Khớp cột E | — |
| 12 | TC_HDB_08 | E, M | "FR-15, FR-16"; "FR-16 Xóa CSLT" | "FR-15"; "FR-15 Xóa CSLT" | Như dòng 5 | SRS FR-15 |
| 17 | TC_ADD_05 | F | "Validate khoảng giá tham khảo tại Bước 2 (50.000đ - 100.000.000đ)" | Giữ khoảng 50.000–100.000.000 | Q2 = theo SRS FR-17 | plan Q2, `components/listing-form/listingFormModel.js:13` |
| 17 | TC_ADD_05 | J | "Báo lỗi validation: 'Giá phải từ 50.000đ đến 100.000.000đ' (theo quy định nghiệp vụ SRS FR-17)." | "Báo lỗi dưới ô Giá: 'Giá phải từ 50.000 đến 100.000.000 VNĐ'." | Chữ theo code (không có "đ") | `listingFormModel.js:180`, `MODEL-05` |
| 17 | TC_ADD_05 | M | "FR-17 Giới hạn giá" | "FR-17 Giới hạn giá. Giới hạn thật lấy từ `priceRange` của `/filter-options`; nếu backend trả `giaMin = 500000` thì câu báo là 'Giá phải từ 500.000 …'" | FE chỉ dùng 50.000 khi API không gửi `priceRange` (D1′) | plan D1′, `MODEL-05` |
| 19, 20, 21 | TC_ADD_07, TC_ADD_08, TC_ADD_09 | E | "FR-17" | "FR-16" | SRS: hình ảnh/video là FR-16 | `docs/SRS_HOTELNT.md:519-533` |
| 19, 20, 21 | TC_ADD_07, TC_ADD_08, TC_ADD_09 | M | "FR-17 Upload Media"; "FR-17 Dung lượng file"; "FR-17 Tối thiểu 3 ảnh" | "FR-16 Upload Media"; "FR-16 Dung lượng file"; "FR-16 Tối thiểu 3 ảnh" | Khớp cột E | — |
| 31 | TC_EDT_06 | E, M | "FR-15, FR-17"; "FR-15, FR-17 Bảo vệ Media" | "FR-15, FR-16"; "FR-15, FR-16 Bảo vệ Media" | Như trên | SRS FR-16 |
| 40 | TC_PRF_01 | J | "… Trường Email và CCCD (12 số) BẮT BUỘC BỊ KHÓA (Read-only) có icon ổ khóa xám …" | "Hiển thị Họ tên, SĐT, 'Địa chỉ Email', 'Căn cước công dân'. CCCD hiển thị **che một phần** (ví dụ `079******234`) đúng như API trả về. Email và CCCD là ô xám chỉ đọc, không có icon, kèm ghi chú 'Email và CCCD là thông tin định danh, liên hệ Admin để thay đổi.'" | SRS FR-13 quy tắc 3: CCCD "hiển thị ở chế độ ẩn một phần số". Code không có icon ổ khóa (B3) | SRS FR-13; `HostProfilePage.jsx:189-217`; `PROF-02` |
| 41 | TC_PRF_02 | H | "… 3. Bấm 'Lưu thay đổi'." | "… 3. Bấm 'Lưu thông tin'." | Chữ nút theo code | `HostProfilePage.jsx:236` |
| 41 | TC_PRF_02 | J | "Hệ thống lưu thành công; Toast xanh 'Cập nhật thông tin thành công'; Tên trên thanh Sidebar/Navbar tự động cập nhật." | "Hệ thống lưu thành công; Toast xanh 'Cập nhật thông tin thành công'; Form hiện giá trị mới; nút 'Lưu thông tin' tắt lại." | Sidebar/Navbar không thuộc màn Hồ sơ | `HostProfilePage.jsx:414`; `PROF-09` |
| 42 | TC_PRF_03 | H | "1. Nhập mật khẩu cũ sai. 2. Nhập mật khẩu mới < 8 ký tự. 3. Nhập mật khẩu xác nhận không khớp. 4. Bấm Lưu." | Tách 2 lượt: (a) "1. Nhập mật khẩu mới 'abc'. 2. Nhập xác nhận khác mật khẩu mới. 3. Quan sát lỗi và nút 'Cập nhật mật khẩu'." (b) "1. Nhập mật khẩu hiện tại sai, mật khẩu mới hợp lệ (ví dụ 'Abcdefg1_') và xác nhận khớp. 2. Bấm 'Cập nhật mật khẩu'." | Nút 'Cập nhật mật khẩu' bị tắt khi còn lỗi phía FE. Lỗi "mật khẩu cũ sai" chỉ có sau khi gửi lên server, nên không kiểm chung một lượt được | `HostProfilePage.jsx:260-265`, `:330`; `PWD-01`, `PWD-03`, `PWD-06` |
| 42 | TC_PRF_03 | J | "… Mật khẩu cũ không chính xác; Mật khẩu mới phải từ 8 ký tự trở lên; Mật khẩu xác nhận không trùng khớp." | (a) "Dưới ô mật khẩu mới: 'Còn thiếu: ít nhất 8 ký tự, chữ in hoa, chữ số, ký tự đặc biệt' (liệt kê các tiêu chí còn thiếu). Dưới ô xác nhận: 'Xác nhận mật khẩu mới không trùng khớp.' Nút 'Cập nhật mật khẩu' bị tắt." (b) "Dưới ô mật khẩu hiện tại: 'Mật khẩu cũ không chính xác.'" | SRS FR-13 quy tắc 4: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt | SRS FR-13; `HostProfilePage.jsx:16-22`, `:254-257`; `api/hostApi.js:15` |

### 1.3 B3: code đúng, case ghi sai chữ

| Dòng | Mã case | Cột | Hiện tại | Sửa thành | Lý do | Nguồn |
|---|---|---|---|---|---|---|
| 9 | TC_HDB_05 | J | "… và nút 'Rút lại' (màu cảnh báo)." | "… và nút 'Rút lại' (viền thường, chỉ hiện khi API cho phép `WITHDRAW`). Chỉ hộp xác nhận có màu cảnh báo." | Theo code | `HostDashboardPage.jsx:135`, `:442-446` |
| 10 | TC_HDB_06 | H | "… 3. Click 'Xác nhận rút'." | "… 3. Click 'Rút lại'." | Chữ nút xác nhận theo code. Tiêu đề hộp: 'Rút lại yêu cầu kiểm duyệt?' | `HostDashboardPage.jsx:444-446` |
| 12 | TC_HDB_08 | H | "… 3. Bấm 'Xác nhận xóa'." | "… 3. Bấm 'Xóa cơ sở'." | Theo code. Tiêu đề hộp: 'Xóa “<tên cơ sở>”?' | `HostDashboardPage.jsx:261-264` |
| 12 | TC_HDB_08 | J | "… toast thông báo xanh." | "… toast xanh hiện `message` của server, mặc định 'Xóa cơ sở thành công'." | Theo code | `HostDashboardPage.jsx:375` |
| 15 | TC_ADD_03 | J | "Báo lỗi: SĐT phải đủ 10 số bắt đầu bằng 0; Zalo phải là SĐT hoặc link zalo.me; Facebook phải là link https://facebook.com/..." | "Báo lỗi dưới từng ô: 'Số điện thoại phải gồm đúng 10 chữ số'; 'Nhập số Zalo hoặc link zalo.me'; 'Link phải bắt đầu bằng https://facebook.com/'." | Chữ theo code | `listingFormModel.js:209`, `:213`, `:217`; `ADD-03`, `MODEL-04` |
| 16 | TC_ADD_04 | H | "… 3. Chọn Tỉnh: Khánh Hòa, Huyện: TP. Nha Trang, Phường: Lộc Thọ. …" | "… 3. Kiểm tra Tỉnh/Thành phố 'Khánh Hòa' và Quận/Huyện 'TP. Nha Trang' đã cố định và khóa sẵn; chọn Phường/Xã. …" | Hai ô Tỉnh/Huyện không chọn được | `components/listing-form/BasicInfoStep.jsx:4-5`, `:77-83`; `ADD-01` |
| 19 | TC_ADD_07 | J | "… File không đúng định dạng bị từ chối với thông báo 'Định dạng không được hỗ trợ: ảnh .jpg/.png/.webp'." | "… File không đúng định dạng bị FE chặn trước khi gửi, thẻ file báo 'Sai định dạng (chỉ JPG, PNG, WEBP)'." | Câu trong file là thông báo của server (`UNSUPPORTED_MEDIA_TYPE`), chỉ hiện nếu file lọt qua FE | `components/listing-form/MediaStep.jsx:46`; `api/hostApi.js:32`; `MED-01` |
| 25 | TC_ADD_13 | J | "Nút chuyển sang trạng thái loading 'Đang gửi...'; …" | "Nút chuyển sang 'Đang gửi…' (một ký tự ba chấm) và bị tắt; …" | Chữ theo code | `ListingEditor.jsx:555`; `ADD-11` |
| 40 | TC_PRF_01 | J | (xem dòng 40 ở mục 1.2) | Bỏ "có icon ổ khóa xám" | Code không có icon | `HostProfilePage.jsx:189-217` |
| 42 | TC_PRF_03 | J | "Mật khẩu xác nhận không trùng khớp" | "Xác nhận mật khẩu mới không trùng khớp." | Chữ theo code (đã gộp vào dòng 42 ở mục 1.2) | `HostProfilePage.jsx:257` |

### 1.4 Rà thêm 38 dòng: lệch mà báo cáo chưa ghi

| Dòng | Mã case | Cột | Hiện tại | Sửa thành | Lý do | Nguồn |
|---|---|---|---|---|---|---|
| 6 | TC_HDB_02 | J | "URL cập nhật query param ?trangThai=...; …" | "URL cập nhật `?trangThai=<mã>`; tab 'Tất cả' bỏ tham số này khỏi URL; …" | Theo code | `HostDashboardPage.jsx:331-332` |
| 16 | TC_ADD_04 | J | "… nhận Listing_ID (ví dụ #1001); Tự động mở khóa các Bước 2, 3, 4; Chuyển sang Bước 2; Hiển thị Toast thành công." | "… nhận mã CSLT do server cấp (URL đổi thành `/host/hotels/new?id=<mã>&step=2`); header hiện badge 'Bản nháp' và dòng 'Mã cơ sở đã được tạo — bạn có thể nhập tiếp các bước còn lại'; mở khóa Bước 2–4; chuyển sang Bước 2." | Không có toast khi tạo thành công. Toast "Đã lưu tạo mới" chỉ có ở nhánh giả lúc mất mạng, đã gỡ (A1) | `ListingEditor.jsx:505`; `AddHotelPage.jsx:21`; `ADD-04` |
| 19 | TC_ADD_07 | H, J | "2. Kiểm tra thanh tiến trình upload."; "File ảnh upload thành công với progress bar; …" | "2. Kiểm tra tiến độ tải."; "Ảnh đang tải hiện chữ 'Đang tải N%' trên thẻ ảnh (video mới có thanh tiến trình); tải xong thì ảnh vào danh sách; …" | Ảnh không có thanh tiến trình | `MediaStep.jsx:359`, `:431-435`; `MED-02`, `MED-12` |
| 20 | TC_ADD_08 | J | "Thẻ file báo đỏ 'Vượt quá 10MB' hoặc 'Tệp quá lớn: ảnh tối đa 10MB, video tối đa 100MB' (Figma 12.3)." | "Ảnh 15MB: thẻ file báo đỏ 'Vượt quá 10MB'. Video 120MB: thẻ file báo đỏ 'Vượt quá 100MB'. FE chặn cả hai trước khi gửi (Figma 12.3)." | 'Tệp quá lớn: …' là câu của server (`FILE_TOO_LARGE`), chỉ hiện khi file lọt qua FE | `MediaStep.jsx:48`; `api/hostApi.js:31`; `MED-01`, `MED-04` |
| 23 | TC_ADD_11 | J | "Hệ thống báo đỏ: 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang' …" | "Hệ thống báo đỏ: 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.' …" (thêm dấu chấm cuối câu) | Chữ theo code | `listingFormModel.js:23`; `MODEL-06` |
| 30 | TC_EDT_05 | J | "… Toast thông báo chuyển Chờ duyệt." | "… Toast xanh hiện `message` của server (mặc định 'Đã lưu thay đổi')." | Chữ toast do server quyết định | `ListingEditor.jsx:365`; `EDIT-04` |
| 31 | TC_EDT_06 | J | "Popup cảnh báo xuất hiện: 'Thay đổi ảnh/video của cơ sở đã duyệt? Nếu bạn tiếp tục, cơ sở sẽ chuyển về trạng thái Chờ duyệt...'; …" | "Popup cảnh báo: tiêu đề 'Thay đổi ảnh/video của cơ sở đã duyệt?', mô tả 'Nếu bạn tiếp tục, cơ sở này sẽ chuyển về trạng thái Chờ duyệt …', nút 'Quay lại' / 'Vẫn tiếp tục'. Popup chỉ hỏi một lần mỗi lần mở trang; …" | Chữ theo code ("cơ sở này"); sau khi bấm 'Vẫn tiếp tục' thì lần đổi media sau không hỏi lại | `ListingEditor.jsx:67-74`, `:448`; `EDIT-05` |
| 35 | TC_EDT_10 | J | "… Tất cả input bị vô hiệu hóa (Read-only); Nút Lưu nháp / Gửi duyệt biến mất (Ảnh 5)." | "… Form hiện giá trị dạng chữ, không còn ô nhập; Nút Lưu nháp / Gửi kiểm duyệt biến mất; nếu API cho phép `WITHDRAW` thì có nút 'Rút lại yêu cầu' (Ảnh 5)." | Chế độ chỉ đọc thay ô nhập bằng chữ, không chỉ tắt ô | `ListingEditor.jsx:522`; `EDIT-06`, `EDIT-07` |
| 38 | TC_EDT_13 | E | "Global" | "FR-15" | SRS FR-15, luồng ngoại lệ E1: truy cập CSLT không thuộc quyền sở hữu → 403 | `docs/SRS_HOTELNT.md` (FR-15, mục "Luồng ngoại lệ") |

### 1.5 Đã đối chiếu, không cần sửa

TC_HDB_03 (debounce 400ms, `HostDashboardPage.jsx:26`), TC_HDB_04 ('Xem' mở /hotel/:id, 'Sửa'; `:116-117`), TC_HDB_07 ('Xem & sửa', 'Xóa' đỏ; `:124`, `:136`), TC_ADD_01 ('Đang nhập', 'Mở sau khi lưu bước 1', icon khóa; `ListingStepper.jsx:4-7`, `:53`), TC_ADD_02 (banner 'Chưa lưu được — có N trường cần sửa'; `ListingEditor.jsx:301`), TC_ADD_06 ('Ít nhất 1 tiện ích' → 'Đã xong'; tên tiện ích lấy từ `/filter-options`), TC_ADD_09 ('Còn thiếu' / 'Đã xong'; `SubmitChecklist.jsx:45`), TC_ADD_10 ('Vị trí hợp lệ — nằm trong khu vực Nha Trang'; `MapStep.jsx:231`), TC_ADD_12 ('7/7 đã hoàn thành', thanh xanh, câu 'Đã đủ điều kiện — sau khi gửi, bạn không thể chỉnh sửa cho đến khi có kết quả duyệt'; `SubmitChecklist.jsx:17-28`, `listingFormModel.js:263`), TC_EDT_02 (`EDIT-03`), TC_EDT_03 (hộp 'Lưu thay đổi cho cơ sở đã duyệt?'; `ListingEditor.jsx:58-65`), TC_EDT_04 (`EDIT-04`), TC_EDT_08 ('Sau khi gửi lại, cơ sở sẽ chuyển sang Chờ duyệt'; `:539`), TC_EDT_09 (J), TC_EDT_11 (toast 'Đã rút lại yêu cầu kiểm duyệt. Cơ sở đã về Bản nháp.'; `:422`), TC_EDT_14 (J: 'Không tìm thấy cơ sở lưu trú.', 'Cơ sở có thể đã bị xóa hoặc đường dẫn không đúng.', '← Quay lại'; `ListingAccessState.jsx:11-15`), TC_EDT_13 (J: tiêu đề, mô tả, nút '← Quay lại'; `ListingAccessState.jsx:6-10`).

## 2. Case mới (B4)

- Thêm sau dòng 42, nối tiếp STT (39 → 65) và mã theo từng màn.
- Mọi case mới: cột C = "Host (Chủ cơ sở)", cột L = "Ready". Bảng dưới ghi các cột còn lại (D–K, M).
- Cột M ghi mã test tự động trong `src/pages/host/__tests__/`.

### 2.1 Màn 11: Danh sách CSLT (`/host/dashboard`)

| Mã case | E | F (Mục tiêu) | G (Điều kiện) | H (Các bước) | I (Dữ liệu) | J (Kết quả mong đợi) | K | M |
|---|---|---|---|---|---|---|---|---|
| TC_HDB_09 | FR-15 | Lỗi tải danh sách và nút thử lại | Backend trả lỗi 500 khi gọi danh sách | 1. Mở /host/dashboard. 2. Bấm 'Thử lại'. | Lỗi 500 | Hiện 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.' kèm nút 'Thử lại'; bấm thì tải lại danh sách | High | `DASH-12` |
| TC_HDB_10 | FR-15 | Tài khoản bị khóa | Tài khoản Host bị Admin khóa | 1. Mở /host/dashboard. | `ACCOUNT_LOCKED` | Hiện 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'; **không** có nút 'Thử lại' | High | `DASH-13` |
| TC_HDB_11 | FR-15 | Chưa có cơ sở nào | Tài khoản Host chưa có CSLT | 1. Mở /host/dashboard. | Tài khoản mới | Hiện 'Bạn chưa có cơ sở lưu trú nào' và 'Thêm cơ sở đầu tiên để khách du lịch tìm thấy bạn trên bản đồ.'; nút 'Thêm cơ sở' mở /host/hotels/new; không hiện tab và ô tìm kiếm | Medium | `DASH-10` |
| TC_HDB_12 | FR-15 | Tìm không ra và xóa bộ lọc | Có CSLT | 1. Gõ từ khóa không khớp cơ sở nào. 2. Bấm 'Xóa bộ lọc'. | Keyword: 'zzz' | Hiện 'Không tìm thấy cơ sở phù hợp'; bấm 'Xóa bộ lọc' thì về /host/dashboard, ô tìm kiếm trống, danh sách đầy đủ | Medium | `DASH-11` |
| TC_HDB_13 | FR-15 | Phân trang 10 dòng mỗi trang | Có 25 CSLT | 1. Bấm 'Trang sau' đến trang cuối. | 25 CSLT | Dòng 'Hiển thị 11–20 trên 25 cơ sở · 10 dòng mỗi trang' ở trang 2; trang 3 hiện 21–25; nút 'Trang sau' tắt ở trang cuối | Medium | `DASH-09` |
| TC_HDB_14 | FR-15 | Xóa nhiều cơ sở cùng lúc | Có CSLT Bản nháp, Bị từ chối và trạng thái khác | 1. Tick chọn nhiều hàng, có cả hàng không xóa được. 2. Bấm 'Xóa N cơ sở'. 3. Xác nhận. | 1 Bản nháp + 1 Đã duyệt | Thanh chọn hiện 'Đã chọn N cơ sở · chỉ xóa được Bản nháp và Bị từ chối'; hộp xác nhận chỉ đếm hàng xóa được ('Xóa 1 cơ sở?'); xóa xong toast 'Đã xóa N cơ sở'; nếu có cơ sở lỗi: 'Đã xóa x/y cơ sở. z cơ sở không xóa được: <tên>' | High | `ACT-09`, `ACT-10`, `ACT-11`; `HostDashboardPage.jsx:396-400` |
| TC_HDB_15 | FR-15 | Nút thao tác của hàng Bản nháp và Bị ẩn | Có CSLT Bản nháp và Bị ẩn | 1. Quan sát cột Thao tác. | DRAFT, HIDDEN | Bản nháp: 'Sửa', 'Xóa'. Bị ẩn: 'Sửa & gửi lại'. Không hàng nào có nút 'Gửi duyệt' | High | `ACT-01`; `HostDashboardPage.jsx:127`, `:131`, `:136` |
| TC_HDB_16 | FR-15 | Xóa thất bại do trạng thái đã đổi | CSLT vừa được gửi duyệt ở tab khác nhưng danh sách chưa tải lại | 1. Bấm 'Xóa' ở hàng đó. 2. Bấm 'Xóa cơ sở'. | 409 `LISTING_NOT_DELETABLE` | Toast đỏ 'Không thể xóa cơ sở ở trạng thái hiện tại.' (hoặc câu của server); cơ sở vẫn còn | Medium | `ACT-08`; `api/hostApi.js:28` |

### 2.2 Màn 12: Thêm mới (`/host/hotels/new`)

| Mã case | E | F (Mục tiêu) | G (Điều kiện) | H (Các bước) | I (Dữ liệu) | J (Kết quả mong đợi) | K | M |
|---|---|---|---|---|---|---|---|---|
| TC_ADD_14 | FR-14, FR-17 | Nút 'Lưu nháp' | Đã có mã CSLT, đang ở Bước 2 | 1. Nhập giá. 2. Bấm 'Lưu nháp' ở thanh dưới. | Giá 700.000 | Toast xanh 'Đã lưu thay đổi' (hoặc `message` của server); vẫn ở Bước 2 (URL giữ `step=2`); không có banner lỗi | High | `ADD-17` |
| TC_ADD_15 | FR-14 | Tải lại trang tiếp tục bản nháp cũ | Đã lưu Bước 1 | 1. Tải lại trang `/host/hotels/new?id=<mã>&step=3`. 2. Nhập giá ở Bước 2 (chưa lưu), chuyển sang Bước 1 rồi quay lại Bước 2. | `?id=&step=` | Mở đúng bản nháp ở Bước 3, không tạo cơ sở mới. Đổi bước không làm mất giá vừa nhập | High | `ADD-06`, `ADD-16` |
| TC_ADD_16 | FR-14 | Lỗi theo từng trường từ server | Server trả `VALIDATION_ERROR` kèm `details[]` | 1. Nhập Bước 1 hợp lệ phía FE. 2. Bấm 'Lưu tạo mới'. | Ví dụ tên đã tồn tại | Câu lỗi của server hiện dưới đúng ô (viền đỏ); banner 'Chưa lưu được — có 1 trường cần sửa' | Medium | `ADD-05` |
| TC_ADD_17 | FR-18 | `LOCATION_OUT_OF_RANGE` do server trả về | Server từ chối tọa độ | 1. Ở Bước 4 nhập tọa độ. 2. Bấm 'Lưu nháp'. | Tọa độ server không nhận | Dưới ô tọa độ hiện 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.'; ô Vĩ độ báo lỗi | Medium | `ADD-09` |
| TC_ADD_18 | FR-16 | Vượt 100 ảnh hoặc 5 video | CSLT đã có 100 ảnh hoặc 5 video (hoặc 4 video) | 1. Thử tải thêm ảnh/video. 2. Với 4 video, chọn cùng lúc 2 file mp4. | 100 ảnh; 5 video; 4 + 2 video | 100 ảnh: nút 'Chọn tệp từ máy' tắt. 5 video: nút '+ Tải video lên' tắt. 4 + 2 video: file thứ hai báo 'Vượt quá giới hạn 5 video'. Server trả `MEDIA_LIMIT_EXCEEDED`: file đó báo 'Vượt quá số lượng cho phép: tối đa 100 ảnh và 5 video cho mỗi cơ sở.', các file sau vẫn tải tiếp | Medium | `MED-08`, `MED-15`, `MED-16` |
| TC_ADD_19 | FR-16 | Kéo thả đổi thứ tự ảnh chỉ trên giao diện | CSLT có ≥ 3 ảnh | 1. Kéo ảnh thứ 3 thả vào vị trí đầu. 2. Tải lại trang. | 3 ảnh | Sau bước 1: ảnh vừa kéo lên đầu có nhãn 'Ảnh bìa', không gửi request nào. Sau bước 2: thứ tự về như server (`thuTu`), vì API chưa có endpoint lưu thứ tự (D3) | Low | `MED-09`, `MED-17`, `EDIT-21` |
| TC_ADD_20 | FR-18 | Server trả `422 CHECKLIST_INCOMPLETE` | FE thấy đủ 7/7 nhưng server thấy thiếu | 1. Bấm 'Gửi kiểm duyệt'. | 422 kèm `details[]` | Banner đỏ hiện câu của server (mặc định 'Vui lòng hoàn thiện các trường bắt buộc trước khi gửi/duyệt.'); dưới checklist hiện 'Máy chủ báo còn thiếu:' và danh sách mục thiếu; mục đó chuyển 'Còn thiếu' | High | `ADD-12`; `SubmitChecklist.jsx:53-54` |
| TC_ADD_21 | FR-14, FR-15 | Mất mạng khi tạo/lưu: báo lỗi, không báo đã lưu | Ngắt mạng hoặc tắt backend | 1. Nhập Bước 1 hợp lệ, bấm 'Lưu tạo mới'. 2. Ở trang Cập nhật của CSLT Đã duyệt: sửa tên, 'Lưu thay đổi' → 'Vẫn lưu'. | Không có kết nối | Bước 1: banner 'Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại.'; không có toast; URL không có `id`; Bước 2–4 vẫn khóa. Bước 2: cùng banner; badge vẫn 'Đã duyệt'; nút 'Lưu thay đổi' vẫn bật | Critical | `ADD-15`, `EDIT-16`. Kiểm thêm: tải danh mục (`ADD-14`), tải chi tiết (`EDIT-15`), tải/xóa ảnh (`MED-13`, `MED-14`) |

### 2.3 Màn 13: Cập nhật (`/host/hotels/:id/edit`)

| Mã case | E | F (Mục tiêu) | G (Điều kiện) | H (Các bước) | I (Dữ liệu) | J (Kết quả mong đợi) | K | M |
|---|---|---|---|---|---|---|---|---|
| TC_EDT_15 | FR-15 | Sửa CSLT Bản nháp | Có CSLT Bản nháp đủ thông tin | 1. Mở trang Cập nhật. 2. Sửa tên. 3. Bấm 'Lưu nháp'. | Status: DRAFT | Header: badge 'Bản nháp', dòng 'Cập nhật lần cuối: …', không có banner. Thanh dưới có 'Lưu nháp' và 'Gửi kiểm duyệt'. Bấm 'Lưu nháp' thì lưu luôn, không hỏi xác nhận; toast 'Đã lưu thay đổi' | High | `EDIT-19` |
| TC_EDT_16 | FR-16 | Xóa ảnh xuống dưới 3 | CSLT có đúng 3 ảnh | 1. Ở Bước 3 bấm xóa 1 ảnh. | 3 ảnh | Toast đỏ 'Cơ sở cần có tối thiểu 3 ảnh.'; ảnh vẫn còn | Medium | `MED-07`; `MediaStep.jsx:205` |
| TC_EDT_17 | FR-15 | Lưu khi CSLT đã chuyển Chờ duyệt (`409 LISTING_LOCKED_PENDING`) | Mở trang Cập nhật của CSLT Bản nháp ở tab A; gửi duyệt CSLT đó ở tab B | 1. Ở tab A sửa tên, bấm 'Lưu nháp'. | 409 | Banner 'Cơ sở đang chờ duyệt nên không thể chỉnh sửa. Hãy rút lại yêu cầu duyệt trước.'; trang tải lại và chuyển sang chế độ chỉ đọc | Medium | `EDIT-10` |
| TC_EDT_18 | FR-15 | CSLT bị gỡ (`409 LISTING_REMOVED`) | Admin đã gỡ CSLT trong lúc Host đang sửa | 1. Sửa và bấm lưu. | 409 | Banner 'Cơ sở đã bị gỡ khỏi hệ thống.'; form chuyển chỉ đọc; không còn nút 'Gửi kiểm duyệt' | Medium | `EDIT-11` |
| TC_EDT_19 | FR-15 | Lưu CSLT Đã duyệt mà server báo không có thay đổi | CSLT Đã duyệt; server trả `thayDoiTrangThai: false` | 1. Sửa tên, 'Lưu thay đổi' → 'Vẫn lưu'. | Status: APPROVED | Toast 'Không có thay đổi'; CSLT giữ 'Đã duyệt' | Low | `EDIT-20`; `ListingEditor.jsx:366` |
| TC_EDT_20 | FR-15, FR-18 | Mất mạng khi gửi kiểm duyệt lại / rút lại | Ngắt mạng hoặc tắt backend | 1. CSLT Bị từ chối: bấm 'Gửi kiểm duyệt lại'. 2. CSLT Chờ duyệt: 'Rút lại yêu cầu' → 'Rút lại'. | Không có kết nối | Bước 1: banner 'Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại.'; không có toast 'Đã gửi kiểm duyệt'; badge vẫn 'Bị từ chối'. Bước 2: banner 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.'; badge vẫn 'Chờ duyệt'; không có toast rút lại | Critical | `EDIT-17`, `EDIT-18`. SRS FR-18 ghi câu khác ('Gửi yêu cầu kiểm duyệt thất bại. Vui lòng thử lại sau.'), đang chờ Quân chốt có đổi không |

### 2.4 Hồ sơ Host (`/host/profile`)

| Mã case | E | F (Mục tiêu) | G (Điều kiện) | H (Các bước) | I (Dữ liệu) | J (Kết quả mong đợi) | K | M |
|---|---|---|---|---|---|---|---|---|
| TC_PRF_04 | FR-13 | Số điện thoại sai định dạng | Đang ở trang Hồ sơ | 1. Nhập SĐT '0912abc'. | SĐT '0912abc' | Chữ cái bị bỏ (ô còn '0912'); hiện 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng số 0.'; nút 'Lưu thông tin' tắt | High | `PROF-07`; `HostProfilePage.jsx:47` |
| TC_PRF_05 | FR-13 | Số điện thoại đã có người dùng | SĐT đã thuộc tài khoản khác | 1. Nhập SĐT đó. 2. Bấm 'Lưu thông tin'. | 409 `ACCOUNT_DUPLICATED` | Dưới ô SĐT hiện 'Email, số điện thoại hoặc CCCD đã được sử dụng.' (hoặc câu của server); ô SĐT viền đỏ | High | `PROF-10` |
| TC_PRF_06 | FR-13 | Server từ chối sửa trường định danh (`FIELD_NOT_EDITABLE`) | Server trả `FIELD_NOT_EDITABLE` (giao diện không cho sửa Email/CCCD, nên cần backend giả lập lỗi này) | 1. Sửa họ tên. 2. Bấm 'Lưu thông tin'. | 400 `FIELD_NOT_EDITABLE` | Banner hiện câu của server (ví dụ 'Email và CCCD không thể tự chỉnh sửa. Vui lòng liên hệ quản trị viên.'); giá trị đang nhập giữ nguyên; không có toast thành công | Low | `PROF-15` |
| TC_PRF_07 | FR-13 | Mật khẩu mới trùng mật khẩu hiện tại | Đang ở khối Thay đổi mật khẩu | 1. Nhập mật khẩu mới giống mật khẩu hiện tại. | Old = New | Hiện 'Mật khẩu mới phải khác mật khẩu hiện tại.'; nút 'Cập nhật mật khẩu' tắt | Medium | `PWD-04`; `HostProfilePage.jsx:255` |
| TC_PRF_08 | FR-13 | Đổi mật khẩu thành công thì các phiên khác bị đăng xuất | Đăng nhập cùng tài khoản trên 2 trình duyệt A và B | 1. Ở A đổi mật khẩu hợp lệ. 2. Ở B thao tác bất kỳ cần gọi API. | Mật khẩu mới hợp lệ | A: toast 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất.', 3 ô mật khẩu được xóa trống. B: bị yêu cầu đăng nhập lại | High | `PWD-05` (chỉ kiểm toast và ô trống; phần phiên B do backend xử lý, cần kiểm tay) |

## 3. Dòng tiêu đề tab Host và RTM

### 3.1 Tab Host, dòng 2 (ô A2)

| Hiện tại | Sửa thành |
|---|---|
| "Kiểm thử Host Dashboard (FR-16), Thêm mới 4 bước (FR-14, FR-17, FR-18), Chỉnh sửa 5 trạng thái & Modal cảnh báo (FR-15), Hồ sơ Host (FR-13)" | "Kiểm thử Host Dashboard (FR-15), Thêm mới 4 bước (FR-14, FR-16, FR-17, FR-18), Chỉnh sửa 5 trạng thái & Modal cảnh báo (FR-15), Hồ sơ Host (FR-13)" |

### 3.2 Tab RTM

| Dòng | FR | Cột | Hiện tại | Sửa thành |
|---|---|---|---|---|
| 17 | FR-13 | G | "TC_PRF_01, TC_PRF_02, TC_PRF_03, TC_AUT_09" | "TC_PRF_01 -> TC_PRF_08, TC_AUT_09" |
| 17 | FR-13 | I | "Khóa Read-only Email và CCCD 12 số, đổi MK" | "Khóa Read-only Email và CCCD (che một phần), đổi MK" |
| 18 | FR-14 | G | "TC_ADD_01, TC_ADD_02, TC_ADD_03, TC_ADD_04" | "TC_ADD_01, TC_ADD_02, TC_ADD_03, TC_ADD_04, TC_ADD_14, TC_ADD_15, TC_ADD_16, TC_ADD_21" |
| 19 | FR-15 | E | "/host/hotels/:id/edit" | "/host/dashboard, /host/hotels/:id/edit" |
| 19 | FR-15 | F | "src/pages/host/EditHotelPage.jsx, ListingEditor.jsx" | "src/pages/host/HostDashboardPage.jsx, EditHotelPage.jsx, ListingEditor.jsx" |
| 19 | FR-15 | G | "TC_EDT_01 -> TC_EDT_12, TC_HDB_04 -> TC_HDB_07" | "TC_HDB_01 -> TC_HDB_16, TC_EDT_01 -> TC_EDT_15, TC_EDT_17 -> TC_EDT_20" |
| 20 | FR-16 | C | "Quản lý danh sách cơ sở lưu trú của tôi (Host Dashboard)" | "Quản lý hình ảnh cơ sở lưu trú" |
| 20 | FR-16 | D | "Chủ cơ sở (Host)" | Giữ nguyên |
| 20 | FR-16 | E | "/host/dashboard" | "/host/hotels/new, /host/hotels/:id/edit (Bước 3)" |
| 20 | FR-16 | F | "src/pages/host/HostDashboardPage.jsx" | "src/pages/host/components/listing-form/MediaStep.jsx" |
| 20 | FR-16 | G | "TC_HDB_01, TC_HDB_02, TC_HDB_03, TC_HDB_08" | "TC_ADD_07, TC_ADD_08, TC_ADD_09, TC_EDT_06, TC_ADD_18, TC_ADD_19, TC_EDT_16" |
| 20 | FR-16 | I | "4 thẻ thống kê, lọc tab trạng thái, phân trang" | "Ảnh .jpg/.png/.webp ≤ 10MB, 3–100 ảnh; video .mp4 ≤ 100MB, tối đa 5; thứ tự ảnh chỉ đổi trên giao diện (D3)" |
| 21 | FR-17 | C | "Quản lý hình ảnh, video và khoảng giá CSLT" | "Quản lý giá và tiện ích cơ sở lưu trú" |
| 21 | FR-17 | F | "src/pages/host/components/listing-form/MediaStep.jsx, PriceAmenitiesStep.jsx" | "src/pages/host/components/listing-form/PriceAmenitiesStep.jsx" |
| 21 | FR-17 | G | "TC_ADD_05, TC_ADD_06, TC_ADD_07, TC_ADD_08, TC_ADD_09, TC_EDT_03, TC_EDT_06" | "TC_ADD_05, TC_ADD_06, TC_EDT_03, TC_ADD_14" |
| 21 | FR-17 | I | "Giá 50k-100tr, tối thiểu 3 ảnh, max 100 ảnh, 5 video" | "Giá 50k–100tr (Q2), tối thiểu 1 tiện ích" |
| 22 | FR-18 | G | "TC_ADD_10, TC_ADD_11, TC_ADD_12, TC_ADD_13, TC_GLB_06" | "TC_ADD_10, TC_ADD_11, TC_ADD_12, TC_ADD_13, TC_ADD_17, TC_ADD_20, TC_EDT_20, TC_GLB_06" |
| 17–22 | FR-13 → FR-18 | H | "100% (Pass)" | "Chưa chạy" |

Lý do đổi cột H: tab Host ghi mọi case là "Ready" (chưa chạy), và các lần "qua" trước đây có thể nhờ lỗi báo thành công giả khi mất mạng (A1). Chạy lại với backend thật rồi mới ghi tỷ lệ.

Đã đối chiếu từng ô RTM ở trên với bản dump ngày 2026-11-08.

## 4. Phụ lục: dữ liệu ở chế độ mock (chỉ cho dev)

Khi chạy `VITE_USE_MOCK=true`, form Thêm mới / Cập nhật dùng dữ liệu trong `src/pages/host/api/hostMockApi.js`:

| Mã CSLT | Trạng thái |
|---|---|
| 1 | Đã duyệt |
| 2 | Bị từ chối (có lý do) |
| 3 | Chờ duyệt |
| 4 | Bị ẩn (có lý do) |
| 5 | Bản nháp |
| 6 | Thuộc Host khác (403) |
| Mã khác | Không tìm thấy (404) |
| Tạo mới | Mã từ 1000 trở lên |

- Ở chế độ mock, Danh sách CSLT, Xóa CSLT và Hồ sơ vẫn gọi API thật.
- Dữ liệu mock chỉ nằm trong bộ nhớ, tải lại trang là về như ban đầu.
- **Chỉ dùng để xem giao diện. Không dùng làm dữ liệu cho case chính thức** và không đánh Pass dựa trên chế độ này.
