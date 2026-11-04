# Phase 03: Triển Khai Giao Diện HostProfilePage Chuẩn Mobile-First

## 1. File Thực Hiện
- **Duy nhất:** `src/pages/host/HostProfilePage.jsx` (Route: `/host/profile`)
- **Tập tin kiểm thử đi kèm:** `src/pages/host/__tests__/HostProfilePage.test.jsx`

---

## 2. Kiến Trúc Giao Diện & Bố Cục Mobile-First

Tuân thủ bộ quy chuẩn `mobile-responsive`:
- **Khung chứa ngoài:** `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8`.
- **Tiêu đề trang (H1):** `text-xl sm:text-2xl font-bold text-black`.
- **Mô tả phụ:** `text-xs sm:text-sm text-[#64748B]`.
- **Bố cục thích ứng (Responsive Layout):**
  - **Màn hình điện thoại (< 768px):** Bố cục 1 cột cuộn dọc tự nhiên (`flex flex-col gap-6`), các ô input có chiều cao chuẩn 44px (`h-11`) và cỡ chữ `text-base` để chống lỗi iOS Safari tự động phóng to (auto-zoom) khi gõ phím.
  - **Màn hình máy tính (≥ 768px):** Chia 2 cột song song (`grid grid-cols-1 md:grid-cols-2 gap-8`), Form thông tin liên lạc bên trái, Form đổi mật khẩu bên phải.

---

## 3. Chi Tiết Form 1: Thông Tin Liên Lạc & Định Danh Pháp Lý (FR-13)

### 3.1. Các Trường Cho Phép Chỉnh Sửa
1. **Họ và tên chủ cơ sở:**
   - Nhãn: `text-xs font-semibold text-black`.
   - Input: Nền kem nhạt `#F8F4E8`, viền `#CBD5E1`, bo góc `rounded-xl`, padding `px-4 py-2.5`.
   - Validate: Không được để trống, độ dài từ 2 đến 50 ký tự.
2. **Số điện thoại liên lạc:**
   - Nhãn: `text-xs font-semibold text-black`.
   - Input: Type `tel`, hỗ trợ bàn phím số trên mobile (`inputMode="tel"`).
   - Validate: Định dạng 10 chữ số di động Việt Nam (Bắt đầu bằng `0`, regex: `^0\d{9}$`).

### 3.2. Các Trường Khóa Cố Định (READ-ONLY) Theo SRS FR-13
> **Quy định pháp lý FR-13:** Email và Số CCCD (12 số) là thông tin định danh pháp lý gắn liền với tài khoản Host và giấy phép kinh doanh. Host **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý SỬA**. Muốn thay đổi phải gửi yêu cầu xác minh kèm giấy tờ tới Admin.

1. **Email định danh (Chỉ đọc):**
   - Trạng thái: `readOnly`, không cho phép nhập liệu hay xóa ký tự.
   - Visual: Nền xám mờ `#CBD5E1/40`, viền `#CBD5E1`, text xám `#64748B`, con trỏ chuột `cursor-not-allowed select-none`.
   - Icon: Biểu tượng ổ khóa `Lock` màu `#64748B` ở góc phải input.
   - Badge: Nhãn nhỏ `[Định danh cố định]` hoặc `[Khóa]`.
2. **Số CCCD pháp lý (Chỉ đọc & Che thông tin nhạy cảm):**
   - Dữ liệu gốc: 12 chữ số (ví dụ: `056098765432`).
   - Hiển thị bảo mật: Che 6 số ở giữa dạng `056******432` để đảm bảo an toàn thông tin cá nhân.
   - Nút bật/tắt mắt xem: Cho phép Host bấm icon con mắt (`Eye`/`EyeOff`) để kiểm tra lại đúng số CCCD của mình.
   - Visual: Nền xám mờ `#CBD5E1/40`, viền `#CBD5E1`, icon ổ khóa `Lock`.
   - Dòng ghi chú dưới trường:
     `* Email và Số CCCD là thông tin định danh pháp lý, Host không được tự ý chỉnh sửa. Muốn thay đổi vui lòng liên hệ Admin.`

### 3.3. Nút Lưu Thông Tin
- **Nút Submit Form 1:**
  - Nền ĐEN chuẩn Dev Kit: `bg-black text-white hover:bg-neutral-800`.
  - Kích thước: `w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors`.

---

## 4. Chi Tiết Form 2: Đổi Mật Khẩu & Đo Độ Mạnh (FR-11)

### 4.1. Các Trường Mật Khẩu
1. **Mật khẩu hiện tại:**
   - Input password kèm nút ẩn/hiện mắt (`Eye` / `EyeOff`), kích thước nút bấm tối thiểu 44px.
2. **Mật khẩu mới:**
   - Input password kèm nút ẩn/hiện mắt.
   - **Thanh đo độ mạnh mật khẩu (Password Strength Indicator) theo chuẩn FR-11:**
     - Điều kiện 1: Tối thiểu 8 ký tự.
     - Điều kiện 2: Có chữ hoa (`A-Z`).
     - Điều kiện 3: Có chữ thường (`a-z`).
     - Điều kiện 4: Có chữ số (`0-9`).
     - Điều kiện 5: Có ký tự đặc biệt (`!@#$%^&*...`).
     - Visual: 4 vạch màu chuyển dần từ Đỏ (`#DC2626`) $\rightarrow$ Vàng (`#B45309`) $\rightarrow$ Xanh lá (`#15803D`).
3. **Xác nhận mật khẩu mới:**
   - Input password kèm nút ẩn/hiện mắt.
   - Báo lỗi ngay lập tức (Realtime validation error) nếu không trùng khớp mật khẩu mới.

### 4.2. Nút Đổi Mật Khẩu
- **Nút Submit Form 2:**
  - Nền ĐEN chuẩn Dev Kit: `bg-black text-white hover:bg-neutral-800`.
  - Kích thước: `w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors`.

---

## 5. Thông Báo Trực Quan (Toast / Feedback Banners)
- Sau khi bấm submit thành công:
  - Hiển thị Banner/Toast thông báo thành công: Nền xanh `#DCFCE7`, chữ xanh `#15803D`, icon `CheckCircle2`.
  - Tự động tắt sau 3 giây.
- Khi có lỗi nhập liệu:
  - Hiển thị Banner/Toast cảnh báo lỗi: Nền đỏ `#F4A9A9`, chữ đỏ `#DC2626`, icon `AlertCircle`.

---

## 6. Danh Mục Kiểm Tra TDD & Nghiệm Thu
- [x] Màn hình điện thoại hiển thị 1 cột mượt mà, không bị tràn màn hình ngang.
- [x] Toàn bộ nút chính và tiêu đề tuân thủ màu ĐEN (`#000000`).
- [x] Hai trường Email và CCCD bị khóa cứng (`readOnly`), không thể chỉnh sửa từ bàn phím.
- [x] Số CCCD hiển thị định dạng ẩn `056******432` bảo mật.
- [x] Validate số điện thoại đúng 10 số di động Việt Nam.
- [x] Validate mật khẩu mới nghiêm ngặt theo 5 tiêu chí của FR-11.
