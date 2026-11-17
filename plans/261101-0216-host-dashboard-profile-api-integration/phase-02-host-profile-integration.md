---
phase: 2
title: "Hồ sơ Host theo Figma + API"
status: pending
priority: P1
effort: "2.5h"
dependencies: [1]
---

# Phase 2: Hồ sơ Host

## Goal

`HostProfilePage` hiển thị đúng bố cục Figma `[Web] Quản lý tài khoản` (node `153:1039`) và `[Mobile]Quản lý thông tin` (`161:1468`). Trang dùng 3 API:
- `GET /host/profile` để tải hồ sơ;
- `PATCH /host/profile` để lưu, chỉ gửi trường đã đổi;
- `POST /host/profile/change-password` để đổi mật khẩu.

## Ràng buộc

- Chỉ sửa `HostProfilePage.jsx` và test của nó.
- Không sửa `AuthContext`, `useAuth`, `Sidebar` hay bất kỳ file dùng chung nào.
- **D2:** không có Giới tính, Ngày sinh.

## Scout trước khi làm

- Gọi `get_design_context` (Figma MCP, file `91utres8M8fA8jrmsbCYJi`) cho node `153:1039` và `161:1468` để lấy spacing và typography. Đọc skill `/figma-design-to-code` trước.
- Đọc lại `HostProfilePage.jsx` và test hiện có.
- Xác nhận `hostApi.js` đã có `getHostProfile`, `updateHostProfile`, `changeHostPassword`.

## Files to Create / Modify

- Modify: `src/pages/host/HostProfilePage.jsx`
- Rewrite: `src/pages/host/__tests__/HostProfilePage.test.jsx`

## Thiết kế theo Figma

### Khối 1: Hồ sơ cá nhân

- **Đầu khối:**
  - Avatar tròn nền tối, hiện chữ cái đầu của **tên** (từ cuối của `hoTen`).
  - Bên cạnh là `hoTen` và nhãn "Host" (theo `vaiTro`).
- **Tiêu đề:** "Hồ sơ cá nhân". Mô tả: "Cập nhật thông tin tài khoản của bạn để nhận những ưu đãi cá nhân hóa".
- **Lưới 2 cột** (mobile còn 1 cột):

  | Trái | Phải |
  |---|---|
  | Họ và tên (sửa được) | Căn cước công dân (chỉ đọc, nền `#CBD5E1`) |
  | Số điện thoại di động (sửa được) | Địa chỉ Email (chỉ đọc, nền `#CBD5E1`) |

- CCCD hiển thị nguyên giá trị API trả về (đã che). Bỏ nút con mắt.
- **Nút:**
  - "Hủy thay đổi" (viền): đưa form về giá trị server; disabled khi chưa đổi gì.
  - "Lưu thông tin" (nền đen): disabled khi chưa đổi gì, có lỗi hoặc đang gửi.

### Khối 2: Thay đổi mật khẩu

- **Tiêu đề:** "Thay đổi mật khẩu". Mô tả: "Bảo vệ tài khoản bằng cách thay đổi mật khẩu định kỳ".
- **3 ô trên một hàng** (mobile xếp dọc): Mật khẩu hiện tại, Mật khẩu mới (placeholder "Nhập mật khẩu mới"), Xác nhận mật khẩu mới (placeholder "Xác nhận mật khẩu mới").
- **Nút** "Cập nhật mật khẩu" (nền đen).
- Figma không có thanh đo độ mạnh, nên **bỏ thanh đo**. Mật khẩu chưa đạt thì hiện lỗi dưới ô "Mật khẩu mới", liệt kê tiêu chí còn thiếu, ví dụ "Còn thiếu: chữ in hoa, ký tự đặc biệt".

## Logic

### Tải hồ sơ

- `status`: `'loading' | 'error' | 'ready'`.
- Effect phụ thuộc `reloadKey`, có `AbortController`; state chỉ set sau `await` (tránh `react(set-state-in-effect)`).
- Nút "Thử lại" đặt `status='loading'` trong event handler rồi tăng `reloadKey`.
- `CANCELED` bị bỏ qua. `ACCOUNT_LOCKED` hiện message API trong `ErrorState`.
- Bỏ `useAuth`, các fallback cứng và `rawCccd`.

### Lưu hồ sơ

- `serverValues` lấy từ API; `form` là bản đang sửa.
- Ô `soDienThoai`: chỉ nhận chữ số, cắt còn 10 ký tự. Ô `hoTen`: `maxLength=100`.
- Validate: `hoTen.trim()` từ 1–100 ký tự; `soDienThoai` khớp `^0\d{9}$`.
- `changes` = các trường có giá trị trim khác `serverValues`. Gọi `updateHostProfile(changes)`.
- Thành công: cập nhật `serverValues` và `form` theo response, hiện toast "Cập nhật thông tin thành công".
- Ánh xạ lỗi:

  | Mã | Hiển thị |
  |---|---|
  | `VALIDATION_ERROR` có `details[]` | lỗi dưới từng ô |
  | `VALIDATION_ERROR` không có `details` | banner, message API |
  | `ACCOUNT_DUPLICATED` | lỗi dưới ô SĐT, message API |
  | `FIELD_NOT_EDITABLE` | banner, message API |
  | `INTERNAL_ERROR`, `NETWORK_ERROR`, `TIMEOUT` | banner câu SRS FR-13: "Cập nhật thông tin không thành công do sự cố hệ thống. Vui lòng thử lại sau." |

### Đổi mật khẩu

- 5 tiêu chí: `length >= 8`, `[A-Z]`, `[a-z]`, `[0-9]`, `[^A-Za-z0-9\s]`. Chỉ cho gửi khi đủ 5/5.
- Mật khẩu mới trùng mật khẩu hiện tại → "Mật khẩu mới phải khác mật khẩu hiện tại."
- Xác nhận không khớp → "Xác nhận mật khẩu mới không trùng khớp."
- Gọi `changeHostPassword({ oldPassword, newPassword })`.
  - Thành công: xóa 3 ô, toast "Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất."
  - `OLD_PASSWORD_INCORRECT` → lỗi dưới ô mật khẩu hiện tại.
  - `VALIDATION_ERROR` → lỗi dưới ô mật khẩu mới.
  - Lỗi hệ thống → banner.

### A11y

- Ô có lỗi đặt `aria-invalid` và `aria-describedby` trỏ tới lỗi.
- Banner lỗi dùng `role="alert"`, toast thành công dùng `role="status"`.
- Ô chỉ đọc dùng `readOnly`, có `aria-readonly`, kèm ghi chú "liên hệ Admin để thay đổi" như SRS.

## Test Matrix (viết lại toàn bộ)

Cách mock: `vi.mock('../api/hostApi', async (importOriginal) => ({ ...(await importOriginal()), getHostProfile: vi.fn(), updateHostProfile: vi.fn(), changeHostPassword: vi.fn() }))`. Render trực tiếp, không cần `AuthContext`.

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| PROF-01 | Đang tải | Có spinner, gọi `getHostProfile` 1 lần |
| PROF-02 | Tải xong | Họ tên và SĐT có giá trị API; Email và CCCD `readonly`; CCCD đúng chuỗi đã che; đầu khối hiện tên + "Host"; **không** có Giới tính, Ngày sinh, nút hiện CCCD |
| PROF-03 | Lỗi 500 → Thử lại | Hiện `ErrorState`, gọi lại API, thành công thì hiện form |
| PROF-04 | `ACCOUNT_LOCKED` | Hiện message API |
| PROF-05 | Chưa đổi gì | "Lưu thông tin" và "Hủy thay đổi" đều disabled |
| PROF-06 | Đổi rồi bấm "Hủy thay đổi" | Form về giá trị server, không gọi API |
| PROF-07 | SĐT sai, gõ chữ | Chữ bị lọc; báo lỗi định dạng; không gọi API |
| PROF-08 | Họ tên rỗng | Báo lỗi; không gọi API; ô có `maxLength=100` |
| PROF-09 | Chỉ đổi SĐT | `updateHostProfile({ soDienThoai })`; có toast; giá trị lấy theo response |
| PROF-10 | 409 `ACCOUNT_DUPLICATED` | Lỗi dưới ô SĐT, `aria-invalid=true` |
| PROF-11 | 400 `details[{ field: 'hoTen' }]` | Lỗi dưới ô họ tên |
| PROF-12 | Lỗi mạng / 500 | Banner câu SRS |
| PROF-13 | Bấm Lưu 2 lần | API gọi 1 lần |
| PWD-01 | `Abcdefg1` | Lỗi "Còn thiếu: ký tự đặc biệt"; không gọi API |
| PWD-02 | `Abcdefg1_` | Không báo thiếu tiêu chí |
| PWD-03 | Xác nhận không khớp | Báo lỗi; không gọi API |
| PWD-04 | Mới trùng cũ | Báo lỗi; không gọi API |
| PWD-05 | Hợp lệ | `changeHostPassword({ oldPassword, newPassword })`; 3 ô bị xóa; có toast |
| PWD-06 | `OLD_PASSWORD_INCORRECT` | Lỗi dưới ô mật khẩu hiện tại |
| PWD-07 | `VALIDATION_ERROR` từ server | Lỗi dưới ô mật khẩu mới |

## Tasks & Steps

- [x] Lấy design context của 2 node Figma.
- [x] Viết lại test theo bảng. Chạy, phải đỏ.
- [x] Sửa `HostProfilePage.jsx` theo bố cục Figma và logic ở trên.
- [x] Chạy test cho tới khi xanh.

## Verification

- `npx vitest run src/pages/host/__tests__/HostProfilePage.test.jsx` → pass.
- `npx oxlint src/pages/host/HostProfilePage.jsx` → 0 cảnh báo.
- `grep -nE "Nguyễn Văn Quân|0905123456|056098765432|rawCccd|Giới tính|Ngày sinh" src/pages/host/HostProfilePage.jsx` → không có kết quả.

## Risk Assessment

- **Sidebar vẫn đọc `user.name`** (`src/components/common/Sidebar.jsx:108`), nên chưa cập nhật tên sau khi lưu. Chỉ ghi chú cho team.
- **BE dùng quy tắc ký tự đặc biệt khác:** khi đó server trả `VALIDATION_ERROR`, và message hiện dưới ô mật khẩu mới (PWD-07).
