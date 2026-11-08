---
phase: 5
title: "Danh sách sửa file test case (chỉ xuất, không sửa xlsx)"
status: pending
priority: P2
effort: "2h"
dependencies: [1, 2, 3, 4]
---

# Phase 5: danh sách sửa file test case (Q3 = chỉ xuất danh sách)

## Goal

Tạo `plans/261108-0632-host-screens-post-merge-fixes/test-case-change-list.md` để Quân gửi người phụ trách file test case. Người nhận phải sửa được tab `3. TC - Host (Chủ cơ sở)` (và các dòng RTM liên quan) mà không cần đọc code: mỗi thay đổi ghi dòng, mã case, cột, chữ hiện tại, chữ mới, lý do và nguồn.

## Ràng buộc

- **Không mở để ghi, không sửa** `docs/Copy of TestPlan_TestCase_HOTELNT_FE.xlsx` hay `docs/HOTELNT_FE_Test_Plan_and_Test_Cases.xlsx`. Chỉ đọc.
- Hai file có tab Host và tab RTM giống hệt nhau (đã so ngày 2026-11-08), nên danh sách áp dụng cho cả hai. Ghi rõ điều này ở đầu danh sách.
- Mọi chữ "Sửa thành" phải lấy đúng từ code hoặc test sau Phase 1–4, không viết theo trí nhớ.

## Scout trước khi làm

Máy không có `openpyxl`/`pandas`. Đọc xlsx bằng thư viện chuẩn: giải nén rồi đọc XML.

1. Tạo script `dump_sheet.py` trong scratchpad của phiên (không để trong repo).
2. Chạy bằng `python3 -I`.
3. Xuất tab Host và tab RTM ra file text trong scratchpad.
4. Xác nhận lại số dòng:
   - dòng 4: tiêu đề cột A–M;
   - dòng 5–42: 38 case;
   - dòng 2: mô tả có mã FR;
   - RTM dòng 17–22: FR-13…FR-18.

Cột dùng trong danh sách:

| Cột | Ý nghĩa |
|---|---|
| E | Yêu cầu SRS (FR) |
| F | Mục tiêu |
| G | Điều kiện tiên quyết |
| H | Các bước |
| I | Dữ liệu |
| J | Kết quả mong đợi |
| L | Trạng thái |
| M | Ghi chú |

## Nội dung bắt buộc của `test-case-change-list.md`

### 0. Đầu file

- File và tab áp dụng; hai file giống nhau.
- Ngày; nguồn: báo cáo 261108-1316 và plan này.
- Ghi chú chạy kiểm thử:
  - chỉ đánh Pass khi chạy với backend thật;
  - `VITE_USE_MOCK=true` chỉ dùng khi dev;
  - không đánh Pass khi backend không chạy.

### 1. Sửa case hiện có

Một bảng: `Dòng | Mã case | Cột | Hiện tại | Sửa thành | Lý do | Nguồn`. Ít nhất các mục sau.

**B1, case dựa vào dữ liệu giả:**

| Dòng | Case | Sửa |
|---|---|---|
| 26 | TC_EDT_01 | G/I: bỏ "ID = 1 (Sea Breeze Homestay)". Dùng "CSLT Đã duyệt có sẵn của tài khoản Host kiểm thử (lấy mã từ Danh sách CSLT)" |
| 32 | TC_EDT_07 | G/I: bỏ "ID = 2 hoặc ?status=rejected". J: lý do lấy từ `lyDoTuChoi` của API; API không gửi lý do thì hiện "Lý do: Không có ghi chú." (A3) |
| 35 | TC_EDT_10 | G/I: bỏ "ID = 3 hoặc ?status=pending" |
| 37 | TC_EDT_12 | G/I: bỏ "ID = 4 hoặc ?status=hidden". J: lý do lấy từ `lyDoViPham`, mặc định "Không có ghi chú." |
| 38 | TC_EDT_13 | G/H/I: "Mở CSLT thuộc Host khác, API trả 403 `NOT_OWNER`". Bỏ "ID = 403", "?mock=forbidden" |
| 39 | TC_EDT_14 | G/H/I: tách 2 ý: (a) mã số không tồn tại → API trả 404 `LISTING_NOT_FOUND`; (b) mã dạng chữ (`/host/hotels/abc/edit`) → FE chặn ngay, không gọi API. Bỏ "ID = 404" |
| 16, 25, 34, 36 | TC_ADD_04, TC_ADD_13, TC_EDT_09, TC_EDT_11 | M: thêm "Chạy lại sau khi sửa A1 (plan 261108-0632) và khi có backend. Kết quả trước đó không tính, vì form từng báo thành công giả khi mất mạng" |

**B2, lệch quyết định hoặc SRS:**

| Dòng | Case | Sửa |
|---|---|---|
| 5 | TC_HDB_01 | F/H/J: bỏ "4 thẻ thống kê" (D5, Figma 11.1). Kỳ vọng: số trên từng tab trạng thái |
| 17 | TC_ADD_05 | Giữ khoảng 50.000–100.000.000 (Q2). J sửa chữ theo code: "Giá phải từ 50.000 đến 100.000.000 VNĐ" (không có "đ") |
| 41 | TC_PRF_02 | J: bỏ "Tên trên thanh Sidebar/Navbar tự động cập nhật". Giữ toast "Cập nhật thông tin thành công" và giá trị mới trên form. Lấy đúng chữ toast từ `HostProfilePage.jsx` |
| 40 | TC_PRF_01 | J: CCCD hiện **che một phần** (ví dụ `079******234`) theo SRS FR-13 và `GET /profile` |
| 42 | TC_PRF_03 | J: mật khẩu mới tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số, ký tự đặc biệt; lỗi hiện dạng "Còn thiếu: …". Lấy đúng chữ từ code |

Mã FR:
- HDB_01, HDB_02, HDB_03: E `FR-16` → `FR-15`.
- HDB_08: E `FR-15, FR-16` → `FR-15`.
- ADD_07, ADD_08, ADD_09: E `FR-17` → `FR-16`.
- EDT_06: E `FR-15, FR-17` → `FR-15, FR-16`.
- Cột M của các dòng này sửa theo cho khớp.

**B3, code đúng nhưng case ghi sai chữ:**

| Dòng | Case | Sửa |
|---|---|---|
| 9 | TC_HDB_05 | Nút "Rút lại" viền thường; chỉ hộp xác nhận có màu cảnh báo |
| 10 | TC_HDB_06 | "Xác nhận rút" → "Rút lại" |
| 12 | TC_HDB_08 | "Xác nhận xóa" → "Xóa cơ sở"; toast lấy `message` của server, mặc định "Xóa cơ sở thành công" |
| 15 | TC_ADD_03 | "Số điện thoại phải gồm đúng 10 chữ số", "Nhập số Zalo hoặc link zalo.me", "Link phải bắt đầu bằng https://facebook.com/" |
| 16 | TC_ADD_04 | Tỉnh/Huyện cố định và khóa sẵn; chỉ chọn Phường/Xã |
| 19 | TC_ADD_07 | FE chặn trước khi gửi: "Sai định dạng (chỉ JPG, PNG, WEBP)". Câu trong file là câu của server (`UNSUPPORTED_MEDIA_TYPE`) |
| 25 | TC_ADD_13 | "Đang gửi..." → "Đang gửi…" (một ký tự ba chấm) |
| 40 | TC_PRF_01 | Bỏ "icon ổ khóa xám". Ô xám chỉ đọc + ghi chú "Email và CCCD là thông tin định danh, liên hệ Admin để thay đổi." |
| 42 | TC_PRF_03 | "Mật khẩu xác nhận không trùng khớp" → "Xác nhận mật khẩu mới không trùng khớp." |

**Rà toàn bộ 38 dòng:** ngoài danh sách của báo cáo, đối chiếu từng dòng với code và test. Ví dụ:
- nhãn stepper "Đang nhập" / "Mở sau khi lưu bước 1" (ADD_01);
- "Vượt quá 10MB" (ADD_08);
- "Còn thiếu" / "Đã xong" (ADD_09);
- "Vị trí hợp lệ — nằm trong khu vực Nha Trang" (ADD_10);
- tham số URL `?trangThai=` và debounce 400ms (HDB_02, HDB_03);
- toast sau "Vẫn lưu" (EDT_05).

Lệch nào cũng thêm vào bảng. Dòng đã khớp ghi gọn trong một dòng "Đã đối chiếu, không cần sửa: …".

### 2. Case mới (B4)

- Đề xuất mã nối tiếp: `TC_HDB_09…`, `TC_ADD_14…`, `TC_EDT_15…`, `TC_PRF_04…`, thêm sau dòng 42.
- Mỗi case có đủ cột C–M theo mẫu của tab. Cột M ghi mã test tự động tương ứng.
- Các case:
  - **Màn 11:**
    - lỗi tải danh sách + thử lại (DASH-12);
    - `ACCOUNT_LOCKED` không có thử lại (DASH-13);
    - chưa có cơ sở (DASH-10);
    - tìm không ra + "Xóa bộ lọc" (DASH-11);
    - phân trang 10 dòng (DASH-09);
    - xóa nhiều (ACT-10, ACT-11);
    - hàng Bản nháp / Bị ẩn (ACT-01);
    - `409 LISTING_NOT_DELETABLE` (ACT-08).
  - **Màn 12:**
    - "Lưu nháp" (ADD-17);
    - tiếp tục nháp bằng `?id=&step=` (ADD-06);
    - lỗi theo trường từ server (ADD-05);
    - `LOCATION_OUT_OF_RANGE` từ server (ADD-09);
    - vượt 100 ảnh / 5 video (MED-08, MED-15, MED-16);
    - kéo thả chỉ trên giao diện, tải lại về `thuTu` (MED-17, EDIT-21);
    - `422 CHECKLIST_INCOMPLETE` (ADD-12);
    - mất mạng khi tạo/lưu: hiện lỗi, không báo đã lưu (ADD-15, EDIT-16).
  - **Màn 13:**
    - sửa Bản nháp (EDIT-19);
    - xóa ảnh xuống dưới 3 (MED-07);
    - `409 LISTING_LOCKED_PENDING` (EDIT-10);
    - `409 LISTING_REMOVED` (EDIT-11);
    - "Không có thay đổi" (EDIT-20);
    - mất mạng khi gửi duyệt / rút lại (EDIT-17, EDIT-18).
  - **Hồ sơ:**
    - SĐT sai định dạng (PROF-07);
    - `409 ACCOUNT_DUPLICATED` (PROF-10);
    - `FIELD_NOT_EDITABLE` (PROF-15);
    - mật khẩu mới trùng mật khẩu cũ (PWD-04);
    - đổi mật khẩu xong, phiên khác bị đăng xuất (PWD-05).

### 3. Dòng tiêu đề và RTM

- **Tab Host, dòng 2 (A2):**
  - "Host Dashboard (FR-16)" → "(FR-15)";
  - "Thêm mới 4 bước (FR-14, FR-17, FR-18)" → "(FR-14, FR-16, FR-17, FR-18)".
- **RTM dòng 19 (FR-15):** cột G thêm `TC_HDB_01`, `TC_HDB_02`, `TC_HDB_03`, `TC_HDB_08` và case mới của Màn 11, 13. Cột I bỏ "4 thẻ thống kê" nếu có.
- **RTM dòng 20 (FR-16):**
  - C/D/E/F đổi sang "Quản lý hình ảnh cơ sở lưu trú", file `MediaStep.jsx`;
  - G = `TC_ADD_07`, `TC_ADD_08`, `TC_ADD_09`, `TC_EDT_06` + case media mới;
  - I bỏ "4 thẻ thống kê…".
- **RTM dòng 21 (FR-17):**
  - tên "Quản lý giá và tiện ích";
  - G = `TC_ADD_05`, `TC_ADD_06`, `TC_EDT_03`;
  - I "Giá 50k–100tr (Q2), tối thiểu 1 tiện ích".
- **Cột H "100% (Pass)" ở RTM dòng 17–22:** đề xuất đổi về "Chưa chạy". Lý do: tab Host đang ghi mọi case là "Ready", và các lần "qua" trước đây có thể nhờ A1.
- Xác nhận lại nội dung từng ô bằng bản dump trước khi ghi đề xuất.

### 4. Phụ lục: dữ liệu ở chế độ mock (chỉ cho dev)

- Mã 1 Đã duyệt, 2 Bị từ chối, 3 Chờ duyệt, 4 Bị ẩn, 5 Bản nháp, 6 thuộc Host khác (403); mã khác trả 404.
- Ghi rõ: chỉ dùng để xem giao diện, **không** dùng làm dữ liệu cho case chính thức.

## Tasks & Steps

- [x] 1. Ghi `shasum docs/*.xlsx` để so ở cuối phase. Dump tab Host và RTM của **cả hai** file ra scratchpad. `diff` lại để chắc vẫn giống nhau. Nếu khác: ghi rõ dòng nào khác, và tách danh sách theo từng file.
- [x] 2. Với mỗi mục ở phần 1, lấy chữ "Sửa thành" bằng `grep` trong `src/pages/host/` (hoặc test tương ứng). Ghi kèm `file:line` làm nguồn.
- [x] 3. Rà 38 dòng như mô tả.
- [x] 4. Viết phần 2 (case mới), phần 3 (tiêu đề và RTM) và phần 4 (phụ lục).
- [x] 5. Tự kiểm:
   - mọi mục B1/B2/B3/B4 của báo cáo đều có trong danh sách (đếm và đối chiếu);
   - không có chữ nào không có nguồn.

## Verification

```bash
F=plans/261108-0632-host-screens-post-merge-fixes/test-case-change-list.md
test -f "$F"
for id in HDB_01 HDB_05 HDB_06 HDB_08 ADD_03 ADD_04 ADD_05 ADD_07 ADD_08 ADD_09 ADD_13 EDT_01 EDT_06 EDT_07 EDT_09 EDT_10 EDT_11 EDT_12 EDT_13 EDT_14 PRF_01 PRF_02 PRF_03; do grep -q "TC_$id" "$F" || echo "THIẾU TC_$id"; done   # không in gì
shasum docs/*.xlsx   # so với giá trị ghi ở bước 1: hai file Excel không đổi
git diff --quiet -- docs/ && echo "docs/ tracked không đổi"
```

## Rủi ro / Rollback

- Rủi ro: người phụ trách sửa một file mà quên file kia. Danh sách ghi rõ cả hai đường dẫn.
- Rollback: xóa `test-case-change-list.md`.
