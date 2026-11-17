# Phase 04: Bộ Kiểm Thử TDD & Xử Lý Các Trường Hợp Biên (Edge Cases)

## 1. Mục Tiêu Kiểm Thử TDD
Thiết lập bộ kiểm thử tự động toàn diện theo phương pháp TDD (Test-Driven Development) nhằm xác minh tính đúng đắn của logic phân quyền trạng thái, tính bảo mật dữ liệu định danh, chuẩn màu sắc Dev Kit Palette và trải nghiệm Mobile-First.

- **Vị trí file kiểm thử:**
  - `src/pages/host/__tests__/HostDashboardPage.test.jsx`
  - `src/pages/host/__tests__/HostProfilePage.test.jsx`

---

## 2. Ma Trận Ca Kiểm Thử (Test Case Matrix)

### 2.1. Kiểm Thử HostDashboardPage (`HostDashboardPage.test.jsx`)

| Mã Test | Mô tả Ca Kiểm Thử | Điều Kiện Đầu Vào | Kết Quả Mong Đợi |
|---|---|---|---|
| **DASH-01** | Render đầy đủ 4 thẻ thống kê số liệu | Mock 4 khách sạn (1 Approved, 1 Pending, 1 Rejected, 1 Draft) | 4 thẻ hiển thị đúng: Tổng (4), Đang hiển thị (1), Chờ duyệt (1), Bị từ chối (1). Icon và màu sắc đúng Dev Kit token. |
| **DASH-02** | Render danh sách thẻ bài viết trên Mobile (< 768px) | Viewport 375x667 (iPhone SE) | Hiển thị các khối thẻ card có thumbnail, tên, địa chỉ, badge trạng thái và thanh nút bấm ngang. |
| **DASH-03** | Render bảng Data Table trên Desktop (≥ 768px) | Viewport 1280x800 | Bảng hiển thị đầy đủ các cột: Cơ sở lưu trú, Ngày tạo, Trạng thái, Thao tác. |
| **DASH-04** | Phân quyền nút bấm trạng thái `DRAFT` | Khách sạn có `status: DRAFT` | Hiển thị 3 nút: Chỉnh sửa (`Edit3`), Gửi duyệt (`Send`), Xóa bài (`Trash2`). Không hiển thị nút Rút lại. |
| **DASH-05** | Phân quyền nút bấm trạng thái `PENDING` | Khách sạn có `status: PENDING` | Hiển thị nút Xem trước (`Eye`) và nút Rút lại (`RotateCcw`). Không hiển thị nút Xóa trực tiếp. |
| **DASH-06** | Cảnh báo hạ trạng thái khi sửa cơ sở `APPROVED` | Click nút Chỉnh sửa của cơ sở `APPROVED` | Mở Modal Cảnh Báo theo SRS FR-15: "Cơ sở đang hiển thị khi lưu thay đổi sẽ tự động chuyển về trạng thái Chờ duyệt để Admin kiểm duyệt lại". |
| **DASH-07** | Xem lý do từ chối của cơ sở `REJECTED` | Click nút Xem lý do của cơ sở `REJECTED` | Mở Modal hiển thị chính xác chuỗi `rejectReason` phản hồi từ Admin. |
| **DASH-08** | Lọc danh sách theo Tab trạng thái | Click tab "Chờ duyệt" trên dải Chip Strip | Danh sách chỉ còn 1 khách sạn trạng thái `PENDING`. |
| **DASH-09** | Hiển thị EmptyState khi danh sách rỗng | Mock danh sách rỗng `[]` hoặc lọc không kết quả | Render khối EmptyState kèm nút CTA Đen `+ Đăng ký cơ sở ngay` dẫn tới `/host/hotels/new`. |
| **DASH-10** | Kiểm tra màu chuẩn Dev Kit (Màu Đen) | Query nút "Thêm cơ sở mới" và nút CTA Empty State | Class chứa `bg-black text-white`, không chứa màu xanh navy `#102A3A`. |

---

### 2.2. Kiểm Thử HostProfilePage (`HostProfilePage.test.jsx`)

| Mã Test | Mô tả Ca Kiểm Thử | Điều Kiện Đầu Vào | Kết Quả Mong Đợi |
|---|---|---|---|
| **PROF-01** | Khóa trường Email định danh theo FR-13 | Render form thông tin cá nhân | Ô Email có thuộc tính `readOnly`, không thể gõ chữ, hiển thị icon `Lock`, nền `#CBD5E1/40`. |
| **PROF-02** | Khóa và che ẩn số CCCD theo FR-13 | Render form với CCCD `056098765432` | Ô CCCD có thuộc tính `readOnly`, hiển thị dạng che `056******432` và icon `Lock`. |
| **PROF-03** | Bật/Tắt hiển thị đầy đủ số CCCD | Click icon con mắt mở xem | Chuyển hiển thị từ `056******432` sang số đầy đủ `056098765432`. Click lần nữa thì che lại. |
| **PROF-04** | Validate số điện thoại di động Việt Nam | Nhập `012345678` (9 số) hoặc `1234567890` (không bắt đầu bằng 0) | Báo lỗi định dạng: "Số điện thoại phải gồm 10 chữ số bắt đầu bằng số 0". Ngăn submit form. |
| **PROF-05** | Submit cập nhật Họ tên và SĐT thành công | Nhập tên hợp lệ và SĐT `0905123456` | Hiển thị Toast thông báo thành công màu xanh (`#15803D`, `#DCFCE7`), dữ liệu được cập nhật. |
| **PROF-06** | Kiểm tra độ mạnh mật khẩu mới (FR-11) | Nhập `123456` | Thanh đo độ mạnh hiển thị yếu (Đỏ), báo lỗi mật khẩu chưa đủ 8 ký tự kèm hoa, thường, số, ký tự đặc biệt. |
| **PROF-07** | Báo lỗi khi Xác nhận mật khẩu không khớp | Mật khẩu mới: `Abcd@1234`, Xác nhận: `Abcd@1235` | Báo lỗi realtime: "Xác nhận mật khẩu mới không trùng khớp". Ngăn submit đổi mật khẩu. |
| **PROF-08** | Đổi mật khẩu thành công | Nhập đúng mật khẩu cũ và mật khẩu mới hợp lệ | Hiển thị Toast thành công, reset các ô input mật khẩu về rỗng. |
| **PROF-09** | Kiểm tra màu chuẩn Dev Kit (Màu Đen) | Query 2 nút "Lưu thông tin liên lạc" và "Đổi mật khẩu" | Cả 2 nút đều có class `bg-black text-white`. |
| **PROF-10** | Kiểm tra Touch Target Ergonomics | Kiểm tra chiều cao các nút bấm trên form | Nút submit có `min-h-[44px]`, các icon mắt ẩn/hiện có vùng bấm tối thiểu 44x44px. |

---

## 3. Lệnh Chạy Kiểm Thử & Xác Minh Code (Verification Commands)

Khi bước vào giai đoạn implementation (`/ak:cook`), các lệnh sau sẽ được thực thi để xác minh:
```bash
# 1. Kiểm tra cú pháp và quy chuẩn Lint
npm run lint

# 2. Chạy bộ unit tests
npx vitest run src/pages/host/__tests__/

# 3. Chạy build kiểm tra bundle
npm run build
```

---

## 4. Danh Mục Nghiệm Thu Tổng Thể (Definition of Done)
- [x] Tất cả 20 ca kiểm thử trong ma trận (DASH-01 đến DASH-10 và PROF-01 đến PROF-10) vượt qua 100%.
- [x] Không có bất kỳ cảnh báo Lint hoặc lỗi TypeScript/JSX nào.
- [x] Không sửa đổi hay gây xung đột với bất kỳ file nào ngoài 2 file phân công của Quân.
- [x] Toàn bộ các màu sai trên bản vẽ Figma đã được thay thế triệt để bằng màu ĐEN (`#000000`, `bg-black`, `text-black`) theo Dev Kit Palette.
- [x] Giao diện responsive mượt mà từ 360px đến màn hình máy tính lớn.
