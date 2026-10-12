# 🏖️ DỰ ÁN WEBAPP HOTEL NHA TRANG (HOTELNT) - FRONTEND TEAM

> Nền tảng tra cứu, định vị và kết nối trực tiếp giữa Khách du lịch (Tourist) và Chủ cơ sở lưu trú (Host) tại TP. Nha Trang.  
> Được xây dựng dựa trên đặc tả kỹ thuật **SRS_HOTELNT Version 2.0** và tài liệu nghiệp vụ **WEBAPP_HOTEL_NHA_TRANG**.

---

## 📁 1. CẤU TRÚC THƯ MỤC CHUẨN DOANH NGHIỆP

```text
HOTELNT/
├── public/                     # Static assets công khai
├── src/
│   ├── assets/                 # Hình ảnh, icons, logos dùng trong app
│   ├── components/             # Reusable UI components
│   │   └── common/             # Các components dùng chung toàn hệ thống
│   │       ├── Navbar.jsx      # Top Navigator cho Tourist (Search theo tên, nút lọc)
│   │       ├── Sidebar.jsx     # Left Sidebar cho Host & Admin (Badge đếm bài chờ duyệt)
│   │       ├── Footer.jsx      # Footer trang Tourist
│   │       ├── HotelCard.jsx   # Product Card hiển thị thông tin cơ sở
│   │       ├── StatusBadge.jsx # Badge trạng thái (Bản nháp, Chờ duyệt, Đã duyệt, Từ chối)
│   │       ├── EmptyState.jsx  # Màn hình 404 / Không tìm thấy kết quả ("Xóa bớt bộ lọc")
│   │       ├── ErrorState.jsx  # Màn hình báo lỗi (Vị trí ngoài Nha Trang, ...)
│   │       ├── SuccessState.jsx# Màn hình thông báo thành công
│   │       ├── Modal.jsx       # Popup Modal (Xác nhận, nhập lý do từ chối/khóa)
│   │       ├── LoadingSpinner.jsx # Loading hiệu ứng xoay tròn
│   │       └── AiChatbot.jsx   # Cửa sổ AI Chatbot nổi góc dưới bên phải (FR-10)
│   ├── constants/              # Biến hằng số, Enums & Routes
│   │   ├── enums.js            # Trạng thái cơ sở, Role, Tọa độ Nha Trang, Giới hạn upload
│   │   └── routes.js           # Định nghĩa tập trung toàn bộ đường dẫn URL
│   ├── context/                # Global State Contexts
│   │   └── AuthContext.jsx     # Quản lý phiên đăng nhập, JWT Token & Phân quyền User
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.js          # Hook truy xuất AuthContext tiện lợi
│   │   └── useDebounce.js      # Hook tối ưu thanh tìm kiếm (giảm tải API)
│   ├── layouts/                # Khung giao diện dùng chung theo từng vai trò
│   │   ├── TouristLayout.jsx   # Layout Khách du lịch (Navbar + Content + Footer + AI Bot)
│   │   ├── HostLayout.jsx      # Layout Chủ cơ sở (Sidebar + Workspace)
│   │   ├── AdminLayout.jsx     # Layout Quản trị viên (Sidebar + Moderation Workspace)
│   │   └── AuthLayout.jsx      # Layout Thẻ Card căn giữa cho Login / Register / OTP
│   ├── pages/                  # Các màn hình chức năng chính (Pages)
│   │   ├── tourist/
│   │   │   ├── HomePage.jsx          # Trang chủ tra cứu (FR-01)
│   │   │   ├── SearchResultsPage.jsx # Kết quả tìm kiếm & Bộ lọc đa tiêu chí (FR-02, FR-03, FR-04)
│   │   │   └── HotelDetailPage.jsx   # Chi tiết CSLT, Bản đồ, Hotline, Zalo (FR-05 -> FR-09)
│   │   ├── auth/
│   │   │   ├── HostLoginPage.jsx     # Đăng nhập Host (Khóa 15p nếu sai 5 lần - FR-12)
│   │   │   ├── HostRegisterPage.jsx  # Đăng ký Host (Họ tên, SĐT, Email, CCCD 12 số - FR-11)
│   │   │   ├── VerifyOtpPage.jsx     # Xác thực Email OTP 6 số, đếm ngược 60s (FR-11, FR-12)
│   │   │   ├── ForgotPasswordPage.jsx# Quên mật khẩu & cấp lại mã OTP (FR-13)
│   │   │   └── AdminLoginPage.jsx    # Đăng nhập Quản trị viên nội bộ (FR-19)
│   │   ├── host/
│   │   │   ├── HostDashboardPage.jsx # Quản lý danh sách CSLT theo trạng thái (FR-15)
│   │   │   ├── AddHotelPage.jsx      # Tạo mới CSLT 4 Tabs chuẩn nghiệp vụ (FR-14 -> FR-18)
│   │   │   ├── EditHotelPage.jsx     # Sửa bài (Cảnh báo hạ về Chờ duyệt nếu đã duyệt)
│   │   │   └── HostProfilePage.jsx   # Quản lý tài khoản (Khóa Read-only Email & CCCD - FR-13)
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx  # Thống kê tổng quan Quản trị
│   │   │   ├── HotelModerationPage.jsx # Duyệt / Từ chối / Ẩn bài vi phạm (FR-21 -> FR-24)
│   │   │   ├── HostManagementPage.jsx  # Khóa / Mở khóa tài khoản Host (FR-20)
│   │   │   └── SystemConfigPage.jsx    # Cấu hình SEO & Prompt AI Chatbot (FR-25, FR-26)
│   │   └── NotFoundPage.jsx          # Màn hình lỗi 404
│   ├── routes/
│   │   ├── AppRoutes.jsx       # Cấu hình toàn bộ Route Tree
│   │   └── ProtectedRoute.jsx  # Route Guard bảo vệ tài nguyên theo Role
│   ├── services/               # Tầng giao tiếp API Backend (Axios)
│   │   ├── axiosClient.js      # Cấu hình BaseURL, tự đính kèm Token, bắt lỗi 401/403
│   │   ├── authService.js      # Gọi API Xác thực, OTP, Quên mật khẩu, Profile
│   │   ├── hotelService.js     # Gọi API Khách sạn (Tìm kiếm, Đăng tin, Upload Media)
│   │   ├── adminService.js     # Gọi API Kiểm duyệt, Quản lý Host, Cấu hình SEO/AI
│   │   └── aiService.js        # Gọi API Chatbot AI
│   ├── utils/
│   │   └── formatters.js       # Hàm format VNĐ, Ngày tháng, Validate Phone/Email/Bản đồ
│   ├── App.jsx                 # Root Component
│   ├── index.css               # Cấu hình Tailwind v4 & Design System Color Tokens
│   └── main.jsx                # Entry point
├── .env.example                # File mẫu biến môi trường (Dev copy ra .env)
├── .gitignore                  # Chặn các file rác / nhạy cảm không được push lên Git
├── package.json
└── vite.config.js
```

---

## 👥 2. PHÂN CÔNG NHIỆM VỤ CHI TIẾT (TEAM 6 THÀNH VIÊN)

| Thành viên | Vai trò phụ trách | Danh sách Files cần code | Ghi chú nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Dev 1 (Lead)** | **Design System & Architecture** | `src/components/common/`, `src/layouts/`, `src/constants/`, `src/index.css` | Đảm bảo đúng chuẩn màu sắc, Master Layout và Shared Components. |
| **Dev 2** | **Phân hệ Tourist (Giao diện chính)** | `src/pages/tourist/HomePage.jsx`, `SearchResultsPage.jsx`, `HotelDetailPage.jsx` | Chỉ tìm kiếm theo TÊN (FR-02), bộ lọc Giá + Khoảng cách (FR-03), deeplink Zalo/Call (FR-08, 09). |
| **Dev 3** | **Phân hệ Host (Đăng bài & Quản lý)** | `src/pages/host/AddHotelPage.jsx`, `EditHotelPage.jsx`, `HostDashboardPage.jsx` | Quy trình 4 Tabs (FR-14 -> 18), chặn tọa độ ngoài Nha Trang, cảnh báo sửa bài đã duyệt. |
| **Dev 4** | **Phân hệ Admin (Kiểm duyệt)** | `src/pages/admin/HotelModerationPage.jsx`, `HostManagementPage.jsx`, `SystemConfigPage.jsx` | Tab Chờ duyệt & Đang live (FR-21, 24), Popup lý do từ chối (FR-23), Khóa Host (FR-20). |
| **Dev 5** | **AI Assistant & Bản đồ số** | `src/components/common/AiChatbot.jsx`, `src/services/aiService.js`, Tích hợp Map API | Chatbot trả lời kèm ProductCard (FR-10), tính khoảng cách di chuyển thực tế (FR-06). |
| **Dev 6** | **Xác thực, Onboarding & API Core** | `src/pages/auth/*`, `src/services/authService.js`, `axiosClient.js`, `AuthContext.jsx` | Email OTP 6 số (FR-11), khóa 15p khi sai 5 lần (FR-12), khóa Read-only Email & CCCD (FR-13). |

---

## 🛡️ 3. QUY ĐỊNH PUSH GIT (CHẶN & CHO PHÉP)

Để bảo đảm tính bảo mật doanh nghiệp và giữ Repo sạch sẽ, toàn bộ thành viên **bắt buộc tuân thủ**:

### ❌ CÁC FILE BỊ CHẶN TUYỆT ĐỐI (KHÔNG ĐƯỢC PUSH LÊN GIT):
1. **File môi trường & Mật mã:** `.env`, `.env.local`, `.env.*.local` (Chứa API Key Google Maps, DB connection, Zalo App ID bí mật).
2. **Thư mục thư viện cài đặt:** `node_modules/` (Gây nặng repo, ai kéo code về tự chạy `npm install`).
3. **Thư mục đóng gói thành phẩm:** `dist/`, `build/`, `dist-ssr/`.
4. **Cấu hình cá nhân IDE & Hệ điều hành:** `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`.
5. **Logs & file rác phát sinh:** `*.log`, `npm-debug.log*`, `temp_*`, `~$*` (file tạm Word).

### ✅ CÁC FILE ĐƯỢC PHÉP PUSH:
* Toàn bộ mã nguồn bên trong thư mục `src/` (`.jsx`, `.js`, `.css`).
* File tài nguyên chung trong `public/`.
* File cấu hình dự án chuẩn: `package.json`, `package-lock.json`, `vite.config.js`, `.gitignore`, `README.md`.
* File hướng dẫn môi trường mẫu: `.env.example`.

### 🌿 QUY CHUẨN ĐẶT TÊN BRANCH & COMMIT:
* **Tên nhánh (Branch):** `feature/<tên-chức-năng>` hoặc `fix/<tên-lỗi>` (VD: `feature/tourist-search`, `feature/host-add-hotel`).
* **Commit message:** Đặt theo chuẩn Conventional Commits:
  * `feat: hoàn thiện giao diện bộ lọc đa tiêu chí (FR-03)`
  * `fix: sửa lỗi validate tọa độ ngoài Nha Trang (FR-18)`
  * `refactor: tối ưu hook useAuth và axiosClient`

---

## 🎨 4. BẢNG MÀU THIẾT KẾ (DESIGN SYSTEM COLOR PALETTE)

Toàn bộ thành viên khi code giao diện sử dụng các mã màu đồng nhất sau:

| Tên biến | Mã màu HEX | Ứng dụng trong giao diện |
| :--- | :--- | :--- |
| **Background Main** | `#F8F4E8` | Màu nền chủ đạo toàn trang |
| **Surface** | `#FFFFFF` | Nền Card, Form, Sidebar, Bảng dữ liệu |
| **Text Main** | `#000000` | Tiêu đề chính, Text nổi bật, Nút bấm chính |
| **Text Muted** | `#64748B` | Text phụ, nhãn mô tả, placeholder |
| **Success** | `#15803D` | Badge "Đã duyệt", Thông báo thành công |
| **Background Success**| `#DCFCE7` | Nền nhạt cho Badge thành công |
| **Warning** | `#FFC107` | Badge "Chờ duyệt", Cảnh báo |
| **Background Warning**| `#FEE8A8` | Nền nhạt cho Badge chờ duyệt |
| **Error** | `#DC2626` | Badge "Từ chối duyệt", Thông báo lỗi, Nút gỡ bài |
| **Background Error** | `#F4A9A9` | Nền nhạt cho cảnh báo lỗi |
| **Disable** | `#CBD5E1` | Đường viền ngăn cách (Border), Nút bị khóa, Bản nháp |
| **Star (Accent)** | `#D97706` | Màu nhấn Logo, Đánh giá sao, Icon Active |

---

## 🚀 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Bước 1: Clone repo và di chuyển vào thư mục
```bash
git clone <url-repo-cong-ty>
cd Hotel_NT/HOTELNT
```

### Bước 2: Tạo file cấu hình môi trường
Sao chép từ `.env.example`:
```bash
cp .env.example .env
```
Điền `VITE_API_BASE_URL` của team Backend cung cấp.

### Bước 3: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 4: Khởi chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Trình duyệt sẽ mở tại: `http://localhost:5173`.

### Bước 5: Kiểm tra đóng gói (Production Build)
```bash
npm run build
```
Đảm bảo không có bất kỳ cảnh báo hoặc lỗi cú pháp nào trước khi tạo Pull Request (PR).
#   H O T E L N T _ V S M  
 