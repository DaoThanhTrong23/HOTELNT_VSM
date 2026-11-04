# Phase 01: Chuẩn Hóa Design Tokens, Khảo Sát Figma & Thiết Lập Mock API Contracts

## 1. Mục Tiêu Phase
- Khảo sát và đối chiếu trực quan các frame thiết kế của Quân trong Figma:
  - M11.1, M11.1b, M11.2, M11.3 & Frame 1–4: Giao diện Quản lý danh sách CSLT (Desktop & Mobile).
  - `[Web] Quản lý tài khoản` & `[Mobile] Quản lý thông tin`: Giao diện Quản lý hồ sơ Host.
- Chuẩn hóa toàn bộ màu sắc bị sai trên Figma thành **Màu Đen chuẩn Dev Kit Palette** (`#000000`, `text-black`, `bg-black text-white`).
- Xây dựng hợp đồng dữ liệu giả lập (Mock Data Contracts) bám sát tài liệu đặc tả `docs/Copy of API_DESIGN.xlsx` và SRS v2.0 `docs/SRS_HOTELNT.md`.

---

## 2. Chi Tiết Khảo Sát Thiết Kế Figma Của Quân

### 2.1. Phân hệ Danh sách CSLT (Host Dashboard - M11 & Frame 1–4)
- **Frame 1 (Desktop Data Table):**
  - Thanh tiêu đề trang: Tiêu đề `Bảng Điều Khiển Host` + Nút `+ Thêm cơ sở mới` (Nền Đen `#000000`, chữ trắng, bo góc `rounded-xl`).
  - Hàng 4 Thẻ Thống Kê (Overview Stat Cards):
    1. Tổng số cơ sở: Icon `Hotel`, chữ số đen lớn.
    2. Đang hiển thị (`APPROVED`): Icon `CheckCircle2`, màu xanh `#15803D`.
    3. Chờ duyệt (`PENDING`): Icon `Clock`, màu vàng hổ phách `#B45309`.
    4. Bị từ chối (`REJECTED`): Icon `AlertTriangle`, màu đỏ `#DC2626`.
  - Bảng dữ liệu cơ sở lưu trú:
    - Cột 1: Thumbnail ảnh (bo góc, fallback placeholder khi chưa có ảnh) + Tên cơ sở (in đậm, đen) + Địa chỉ (chữ nhỏ, màu xám `#64748B`).
    - Cột 2: Ngày tạo (định dạng `YYYY-MM-DD`).
    - Cột 3: Trạng thái (Render `StatusBadge` theo mã màu Dev Kit).
    - Cột 4: Thao tác (Action buttons động dựa trên trạng thái).
- **M11.1 (Mobile Card View):**
  - Trên màn hình điện thoại (< 768px), bảng chuyển đổi sang dạng thẻ Card độc lập:
    - Ảnh thumbnail nằm bên trái hoặc trên cùng.
    - StatusBadge nằm ở góc phải trên.
    - Cụm nút thao tác (Xem, Sửa, Gửi duyệt, Rút lại, Xóa) dàn hàng ngang ở đáy card, chiều cao tối thiểu 44px để dễ chạm bằng ngón tay cái.
- **M11.2 (Empty State):**
  - Hiển thị khi Host chưa có cơ sở nào hoặc tìm kiếm lọc không có kết quả:
    - Minh họa icon khách sạn rỗng.
    - Tiêu đề: "Bạn chưa có cơ sở lưu trú nào".
    - Mô tả: "Hãy bắt đầu đăng ký cơ sở đầu tiên để tiếp cận hàng ngàn du khách tại Nha Trang."
    - Nút CTA Đen: `+ Đăng ký cơ sở ngay` dẫn đến `/host/hotels/new`.
- **Frame 4 / M11.3 (Modal xác nhận):**
  - Modal xác nhận khi bấm Xóa cơ sở (DRAFT / REJECTED) hoặc Rút lại yêu cầu (PENDING).
  - Modal cảnh báo khi bấm Sửa cơ sở đã duyệt (APPROVED -> cảnh báo sẽ chuyển về PENDING).

### 2.2. Phân hệ Quản Lý Hồ Sơ (Host Profile - `[Web] Quản lý tài khoản`)
- **Khối thông tin cá nhân:**
  - Tiêu đề H1 đen `Quản Lý Tài Khoản Host`.
  - Form 1 (Thông tin liên lạc):
    - Họ và tên (editable input, viền `#CBD5E1`, nền `#F8F4E8`).
    - Số điện thoại (editable input, validate 10 số di động VN).
    - Email định danh (READ-ONLY, icon ổ khóa, nền xám mờ `#CBD5E1/40`, có tooltip/ghi chú giải thích thông tin pháp lý theo FR-13).
    - Số CCCD pháp lý (READ-ONLY, che 6 số ở giữa dạng `056******432`, icon ổ khóa, nền `#CBD5E1/40`).
    - Nút Submit: Nền Đen `#000000`, chữ trắng, bo góc `rounded-xl`, hover `bg-neutral-800`.
  - Form 2 (Đổi mật khẩu):
    - Mật khẩu hiện tại (input password + nút ẩn/hiện mắt).
    - Mật khẩu mới (input password + thanh đo độ mạnh mật khẩu theo FR-11: tối thiểu 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt).
    - Xác nhận mật khẩu mới (kiểm tra khớp với mật khẩu mới).
    - Nút Submit: Nền Đen `#000000`, chữ trắng, bo góc `rounded-xl`.

---

## 3. Quy Chuẩn Màu Đen Thay Thế Màu Sai Trên Figma

| Thành phần giao diện | Màu vẽ nhầm trên Figma | Màu chuẩn hóa BẮT BUỘC | Tailwind CSS Class |
|---|---|---|---|
| Nút "Thêm cơ sở mới" | Xanh navy / xám `#102A3A` | **Màu ĐEN (#000000)** | `bg-black text-white hover:bg-neutral-800` |
| Nút "Lưu thông tin liên lạc" | Xanh navy `#102A3A` | **Màu ĐEN (#000000)** | `bg-black text-white hover:bg-neutral-800` |
| Nút "Đổi mật khẩu" | Xanh navy `#102A3A` | **Màu ĐEN (#000000)** | `bg-black text-white hover:bg-neutral-800` |
| Tiêu đề chính H1/H2 | Tông xám đậm hoặc xanh | **Màu ĐEN (#000000)** | `text-black` |
| Nhãn trường Form (Labels) | Tông xám đậm | **Màu ĐEN (#000000)** | `text-black font-semibold` |
| Nút CTA Empty State | Xanh / Nâu | **Màu ĐEN (#000000)** | `bg-black text-white hover:bg-neutral-800` |

---

## 4. Hợp Đồng Dữ Liệu Giả Lập (Mock Data Contracts)

### 4.1. Danh Sách Khách Sạn Của Host (`/host/listings`)
```javascript
export const MOCK_HOST_HOTELS = [
  {
    id: 'h-101',
    name: 'Khách sạn Mường Thanh Luxury Nha Trang',
    address: '60 Trần Phú, Phường Lộc Thọ, TP. Nha Trang',
    status: 'APPROVED',
    createdAt: '2026-09-15',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80',
    minPrice: 1200000,
    viewsCount: 1420,
  },
  {
    id: 'h-102',
    name: 'Nha Trang Chill House Homestay',
    address: '18/4 Hoàng Hoa Thám, Phường Vạn Thắng, TP. Nha Trang',
    status: 'PENDING',
    createdAt: '2026-10-02',
    thumbnail: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=300&auto=format&fit=crop&q=80',
    minPrice: 450000,
    viewsCount: 0,
  },
  {
    id: 'h-103',
    name: 'Villa Biển Gọi Bãi Tiên',
    address: 'Đường Phạm Văn Đồng, Phường Vĩnh Hòa, TP. Nha Trang',
    status: 'REJECTED',
    rejectReason: 'Ảnh giấy phép kinh doanh bị mờ, không rõ số hiệu đăng ký và dấu mộc đỏ pháp lý.',
    createdAt: '2026-09-28',
    thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80',
    minPrice: 3500000,
    viewsCount: 0,
  },
  {
    id: 'h-104',
    name: 'Căn hộ view biển Mường Thanh Viễn Triều',
    address: '03-05 Phạm Văn Đồng, Phường Vĩnh Phước, TP. Nha Trang',
    status: 'DRAFT',
    createdAt: '2026-10-10',
    thumbnail: null,
    minPrice: 650000,
    viewsCount: 0,
  },
];
```

### 4.2. Hồ Sơ Host (`/host/profile`)
```javascript
export const MOCK_HOST_PROFILE = {
  id: 'usr-host-01',
  fullName: 'Nguyễn Văn Quân',
  phone: '0905123456',
  email: 'quan.host@nhatranghotels.vn', // READ-ONLY FR-13
  cccd: '056098765432',                 // READ-ONLY FR-13 (12 số)
  role: 'HOST',
  joinedDate: '2026-08-10',
  totalHotels: 4,
  activeHotels: 1,
};
```

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] Bảng màu Dev Kit Palette được ánh xạ đầy đủ, các nút và text chính đều dùng `bg-black` / `text-black`.
- [x] Mock contracts cung cấp đủ 4 trạng thái (`APPROVED`, `PENDING`, `REJECTED`, `DRAFT`) kèm lý do từ chối mẫu.
- [x] Dữ liệu hồ sơ mô phỏng đủ trường khóa Email & CCCD và trường cập nhật Họ tên & SĐT.
