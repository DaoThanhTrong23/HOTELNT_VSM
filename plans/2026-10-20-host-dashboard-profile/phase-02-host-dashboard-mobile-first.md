# Phase 02: Triển Khai Giao Diện HostDashboardPage Chuẩn Mobile-First

## 1. File Thực Hiện
- **Duy nhất:** `src/pages/host/HostDashboardPage.jsx` (Route: `/host/dashboard`)
- **Tập tin kiểm thử đi kèm:** `src/pages/host/__tests__/HostDashboardPage.test.jsx`

---

## 2. Kiến Trúc Giao Diện & Bố Cục Mobile-First

Tuân thủ hướng dẫn từ kỹ năng `mobile-responsive`:
- **Ngân sách lề đệm:** `px-4 sm:px-6 lg:px-8 py-4 sm:py-8` cho khung ngoài.
- **Tiêu đề trang (H1):** `text-xl sm:text-2xl font-bold text-black`.
- **Nút CTA chính ("Thêm cơ sở mới"):** Nền đen (`bg-black text-white hover:bg-neutral-800`), bo góc `rounded-xl`, chiều cao tối thiểu 44px (`min-h-[44px]`), hỗ trợ co giãn toàn chiều ngang trên mobile (`w-full sm:w-auto`).

### 2.1. Hàng 4 Thẻ Thống Kê (Overview Stat Cards)
- **Grid Layout:** `grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`.
- **Thẻ Card:** Nền trắng (`bg-white`), viền `#CBD5E1` (`border border-[#CBD5E1]`), bo góc `rounded-2xl`, lề trong `p-4 sm:p-5`.
- **Màu sắc số liệu & Icon:**
  1. Tổng số cơ sở: Số đen `text-black`, icon `Hotel` `text-black`.
  2. Đang hiển thị (`APPROVED`): Số xanh `#15803D`, icon `CheckCircle2` `#15803D`.
  3. Chờ duyệt (`PENDING`): Số vàng hổ phách `#B45309`, icon `Clock` `#B45309`.
  4. Bị từ chối (`REJECTED`): Số đỏ `#DC2626`, icon `AlertTriangle` `#DC2626`.

### 2.2. Dải Lọc Nhanh Trạng Thái Dạng Chip (Horizontal Chip Strip)
- Phục vụ người dùng điện thoại lướt xem danh sách theo trạng thái mà không bị gãy dòng:
  - Class: `flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:pb-0`
  - Các tab: Tất cả (All), Đang hiển thị, Chờ duyệt, Bị từ chối, Bản nháp.
  - Tab đang chọn: `bg-black text-white font-semibold`.
  - Tab không chọn: `bg-white text-[#64748B] border border-[#CBD5E1] hover:text-black`.

### 2.3. Bố Cục Kép: Mobile Card View (< 768px) & Desktop Table View (≥ 768px)

#### A. Mobile Card View (Màn hình điện thoại `< 768px` — Theo Frame M11.1 Figma)
- Bảng table truyền thống thường bị méo mó khi xem trên mobile. Vì vậy giao diện sẽ render danh sách thẻ Card độc lập trên mobile:
  - Khối thẻ Card: `bg-white rounded-2xl border border-[#CBD5E1] p-4 space-y-3`.
  - Hàng trên:
    - Ảnh thumbnail khách sạn: `w-16 h-16 rounded-xl object-cover bg-[#CBD5E1] shrink-0`.
    - Thông tin: Tên khách sạn (`text-sm font-bold text-black line-clamp-1`), Địa chỉ (`text-xs text-[#64748B] line-clamp-1`), Giá tham khảo (`text-xs font-semibold text-black`).
    - StatusBadge nằm ở góc phải hoặc ngay dưới tên khách sạn.
  - Hàng dưới: Cụm thanh thao tác (Action Bar) dàn đều với nút bấm to rõ:
    - Nút Xem chi tiết: `min-h-[40px] px-3 bg-[#F8F4E8] text-black rounded-lg text-xs font-semibold flex items-center justify-center gap-1`.
    - Nút Chỉnh sửa: `min-h-[40px] px-3 bg-[#F8F4E8] text-black rounded-lg text-xs font-semibold flex items-center justify-center gap-1`.
    - Nút Thao tác phụ (Gửi duyệt, Rút lại, Xóa, Xem lý do): Icon với kích thước điểm chạm chuẩn `min-h-[40px] min-w-[40px]`.

#### B. Desktop Data Table (Màn hình máy tính `≥ 768px` — Theo Frame 1 Figma)
- Container: `hidden md:block bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-xs`.
- Header: Nền `#FAFAFA`, viền đáy `#CBD5E1`, text uppercase nhỏ `text-xs text-[#64748B] font-semibold`.
- Rows: Hover highlight `hover:bg-[#F8F4E8]/50`, đường phân cách `divide-y divide-[#CBD5E1]/60`.
- Cột thao tác: Căn phải, các nút icon bọc trong tooltip trợ năng, hover chuyển màu mượt mà.

---

## 3. Quản Lý Phân Quyền Thao Tác Theo Trạng Thái (SRS FR-15)

| Trạng thái | Nút thao tác hiển thị | Hành vi tương tác |
|---|---|---|
| **Bản nháp (`DRAFT`)** | 1. Sửa (`Edit3`)<br>2. Gửi duyệt (`Send`)<br>3. Xóa (`Trash2`) | - Sửa: Chuyển tới `/host/hotels/:id/edit`.<br>- Gửi duyệt: Cập nhật trạng thái sang `PENDING`, hiển thị toast thông báo thành công.<br>- Xóa: Mở modal xác nhận xóa bài nháp. |
| **Chờ duyệt (`PENDING`)** | 1. Xem trước (`Eye`)<br>2. Rút lại yêu cầu (`RotateCcw`) | - Xem trước: Mở modal xem trước hoặc điều hướng tới `/hotel/:id`.<br>- Rút lại: Mở modal xác nhận đưa cơ sở về trạng thái `DRAFT` để bổ sung thông tin. |
| **Đang hiển thị (`APPROVED`)** | 1. Xem trang live (`Eye`)<br>2. Chỉnh sửa (`Edit3`)<br>3. Tạm ẩn | - Chỉnh sửa: **Hiển thị Modal Cảnh Báo theo chuẩn SRS FR-15 & Figma Frame 13**: Thông báo cơ sở đang live khi lưu thay đổi sẽ tự động chuyển về `PENDING` để kiểm duyệt lại. |
| **Bị từ chối (`REJECTED`)** | 1. Xem lý do từ chối (`AlertCircle`)<br>2. Sửa lại bài viết (`Edit3`)<br>3. Xóa bài (`Trash2`) | - Xem lý do: Mở modal hiển thị nội dung phản hồi từ Admin (`rejectReason`).<br>- Sửa lại: Chuyển tới `/host/hotels/:id/edit` để khắc phục lỗi. |

---

## 4. Các Trạng Thái Trực Quan (Edge States)

### 4.1. Empty State (Khi danh sách rỗng — M11.2)
- Khi `hotels.length === 0` hoặc kết quả lọc không tìm thấy:
  - Render khối EmptyState:
    - Nền trắng `bg-white`, bo góc `rounded-2xl`, viền `#CBD5E1`, căn giữa `p-8 sm:p-12 text-center space-y-4`.
    - Icon minh họa: Khách sạn rỗng với vòng tròn nền kem `#F8F4E8`.
    - Tiêu đề: "Bạn chưa có cơ sở lưu trú nào" hoặc "Không tìm thấy cơ sở phù hợp".
    - Nút CTA Đen: `bg-black text-white hover:bg-neutral-800 px-6 py-3 rounded-xl font-semibold`.

### 4.2. Loading State (Đang tải dữ liệu)
- Hiển thị Skeleton loader dạng hàng thẻ trên mobile và Skeleton table rows trên desktop để tránh giật giao diện (Cumulative Layout Shift - CLS).

---

## 5. Danh Mục Kiểm Tra TDD & Nghiệm Thu
- [x] Giao diện co giãn hoàn hảo từ 360px (iPhone SE, Galaxy S) đến 1440px (MacBook, Desktop).
- [x] Mọi nút chính, tiêu đề và CTA đều tuân thủ màu ĐEN (`#000000`).
- [x] Thao tác tương ứng với từng trạng thái hiển thị chính xác theo ma trận FR-15.
- [x] Modal cảnh báo khi sửa cơ sở `APPROVED` hiển thị đầy đủ nội dung cảnh báo.
- [x] Modal hiển thị lý do từ chối của Admin khi click vào bài `REJECTED`.
