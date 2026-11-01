---
title: "Thiết kế & Hoàn thiện Giao diện Host Dashboard & Host Profile (Mobile-First)"
description: "Kế hoạch triển khai giao diện Mobile-First cho 2 màn hình của Quân: HostDashboardPage và HostProfilePage, chuẩn hóa màu ĐEN Dev Kit và TDD test suite."
status: completed
priority: P1
effort: 6h
branch: feature/quan-dashbds
tags: [frontend, mobile-first, host, ui-ux, tdd]
blockedBy: []
blocks: []
created: 2026-10-20
---

# Kế Hoạch Triển Khai: Host Dashboard & Host Profile (Mobile-First — TDD)

## 1. Tổng quan & Phạm vi Ranh giới (Scope Boundaries)

### 1.1. Cam kết Ranh giới Tuyệt đối (0% Git Conflict)
Kế hoạch này tuân thủ nghiêm ngặt **Quy tắc phân công Sheet 1 & Quy trình Git Sheet 3** trong `docs/Copy of PhanCong_CODE.xlsx`:
- **Chỉ sửa đổi và tạo mới duy nhất 2 file trang thuộc phân công của Quân:**
  1. `src/pages/host/HostDashboardPage.jsx` (Route: `/host/dashboard`) — Trang Dashboard Danh sách CSLT (M11.1, M11.1b, M11.2, M11.3 & Frames 1–4 trong Figma).
  2. `src/pages/host/HostProfilePage.jsx` (Route: `/host/profile`) — Trang Hồ sơ Quản lý Tài khoản Host (`[Web] Quản lý tài khoản`, `[Mobile] Quản lý thông tin` trong Figma).
- **Thư mục Test TDD độc lập:**
  - `src/pages/host/__tests__/HostDashboardPage.test.jsx`
  - `src/pages/host/__tests__/HostProfilePage.test.jsx`
- **TUYỆT ĐỐI KHÔNG ĐỤNG CHẠM** tới các file trang của thành viên khác:
  - `src/pages/host/AddHotelPage.jsx` (Thanh Trọng)
  - `src/pages/host/EditHotelPage.jsx` (Thanh Trọng)
  - Các trang Auth (`HostLoginPage`, `AdminLoginPage`, `HostRegisterPage`,...) của Quỳnh.
  - Các trang Tourist (`HomePage`, `SearchResultsPage`, `HotelDetailPage`) của Thư và Giang.
  - Các trang Admin (`AdminDashboardPage`, `HotelModerationPage`,...) của Vỹ.

---

## 2. Chuẩn Hóa Màu Sắc: Quy Chuẩn Dev Kit Palette & Sửa Sai Màu Đen

Theo yêu cầu chỉnh sửa từ User và đối chiếu Sheet 2 `BẢNG MÀU CHUẨN DESIGN SYSTEM`:
> *Một số màu trong bản vẽ Figma (ví dụ màu xanh navy `#102A3A` hay các tông màu xám/xanh ngoài bảng màu) là vẽ nhầm. Toàn bộ các nút chính (Primary buttons), tiêu đề chính và văn bản quan trọng BẮT BUỘC CHUẨN HÓA VỀ MÀU ĐEN (`#000000`).*

| Token Thiết Kế | Mã HEX | Tailwind CSS Class | Ứng dụng cụ thể trong 2 màn hình của Quân |
|---|---|---|---|
| **Primary / Text Main** | `#000000` | `text-black` / `bg-black` / `hover:bg-neutral-800` | Tiêu đề H1/H2/H3, nhãn trường nhập liệu, nút bấm chính ("Thêm cơ sở mới", "Lưu thông tin liên lạc", "Đổi mật khẩu") |
| **Background Main** | `#F8F4E8` | `bg-[#F8F4E8]` | Nền tổng thể trang Dashboard và Profile |
| **Surface / Card** | `#FFFFFF` | `bg-white` | Nền thẻ thống kê (Stats card), bảng dữ liệu, form hồ sơ |
| **Text Muted** | `#64748B` | `text-[#64748B]` | Nhãn phụ, email/cccd chỉ đọc, ngày tạo, địa chỉ, icon phụ |
| **Border / Divider** | `#CBD5E1` | `border-[#CBD5E1]` | Viền card, đường ngăn cách giữa các dòng trong bảng, đường kẻ tab |
| **Success (Đã duyệt)** | `#15803D` / `#DCFCE7` | `text-[#15803D] bg-[#DCFCE7]` | Badge trạng thái `APPROVED`, thông báo cập nhật thành công |
| **Warning (Chờ duyệt)**| `#B45309` / `#FEE8A8` | `text-[#B45309] bg-[#FEE8A8]` (Icon `#FFC107`) | Badge trạng thái `PENDING`, cảnh báo khi sửa cơ sở đã duyệt |
| **Error (Từ chối)** | `#DC2626` / `#F4A9A9` | `text-[#DC2626] bg-[#F4A9A9]` | Badge trạng thái `REJECTED`, thông báo lỗi form, nút xóa |
| **Draft (Bản nháp)** | `#475569` / `#CBD5E1` | `text-[#475569] bg-[#CBD5E1]` | Badge trạng thái `DRAFT` |

---

## 3. Kiến Trúc Mobile-First UI/UX Ergonomics

Tuân thủ bộ quy chuẩn `mobile-responsive` (Apple HIG + Material Design 3):
1. **Ngân sách lề đệm (Padding Budget):**
   - Vỏ ngoài container: `px-4 sm:px-6 lg:px-8 py-4 sm:py-8`.
   - Card chính: `p-4 sm:p-6 lg:p-8`. Không dùng nested padding làm nghẹt layout.
2. **Kích thước điểm chạm (Touch Target Ergonomics):**
   - Nút hành động, icon bấm: tối thiểu `44x44px` (`min-h-[44px] min-w-[44px]`).
   - Khoảng cách an toàn giữa 2 nút: tối thiểu `gap-2` (8px).
3. **Bố cục kép thích ứng (Dual Adaptive Layout):**
   - **Màn hình Mobile (< 768px):** Chuyển bảng dữ liệu sang danh sách thẻ bài viết dạng Card (M11.1 Mobile), hiển thị thumbnail lớn, tiêu đề, trạng thái badge, cụm action bar cố định dễ bấm một tay. Form hồ sơ hiển thị 1 cột, input có font size tối thiểu 16px để tránh iOS tự zoom.
   - **Màn hình Desktop (≥ 768px):** Bảng dữ liệu Data Table hiện đại (M11.1 Desktop / Frame 1), hover row highlight, căn lề thẳng hàng. Form hồ sơ chia 2 cột song song (Thông tin liên lạc bên trái, Đổi mật khẩu bên phải).

---

## 4. Danh sách các Phase Triển khai

- [phase-01-design-tokens-and-mock-contracts.md](file:///Users/quan/HUIT_CNTT/VSM/FE_HOTELNT_VSM/plans/2026-10-20-host-dashboard-profile/phase-01-design-tokens-and-mock-contracts.md): Khảo sát chi tiết Figma, chuẩn hóa tokens và Mock Data/API contracts cho Host.
- [phase-02-host-dashboard-mobile-first.md](file:///Users/quan/HUIT_CNTT/VSM/FE_HOTELNT_VSM/plans/2026-10-20-host-dashboard-profile/phase-02-host-dashboard-mobile-first.md): Xây dựng giao diện `HostDashboardPage.jsx` chuẩn Mobile-First (4 stats cards, EmptyState, Dynamic actions theo 4 trạng thái, Quick filters).
- [phase-03-host-profile-mobile-first.md](file:///Users/quan/HUIT_CNTT/VSM/FE_HOTELNT_VSM/plans/2026-10-20-host-dashboard-profile/phase-03-host-profile-mobile-first.md): Xây dựng giao diện `HostProfilePage.jsx` chuẩn Mobile-First (Khóa trường Email & CCCD theo FR-13, form đổi mật khẩu với validate mật khẩu mạnh, toast feedback).
- [phase-04-tdd-test-suite-and-edge-cases.md](file:///Users/quan/HUIT_CNTT/VSM/FE_HOTELNT_VSM/plans/2026-10-20-host-dashboard-profile/phase-04-tdd-test-suite-and-edge-cases.md): Thiết lập Vitest + React Testing Library cho 2 trang, kiểm thử toàn diện trạng thái, touch target, và validation.
