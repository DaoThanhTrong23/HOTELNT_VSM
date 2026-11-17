# Quy ước viết Git Commit (Git Commit Convention)

Tất cả các commit trong dự án này BẮT BUỘC tuân theo chuẩn Conventional Commits:

`<type>(<scope>): <mô tả ngắn gọn>`

### 1. Các Type chính:
- `feat`: Tính năng mới hoặc luồng xử lý mới (ví dụ: `feat(host): bat buoc tai len toi thieu 3 anh`)
- `fix`: Sửa lỗi, sửa bug (ví dụ: `fix(admin): sua loi hien thi gia 0d`)
- `style`: Sửa giao diện, CSS, khoảng cách, màu sắc (ví dụ: `style(host): can chinh nut va dong thong bao`)
- `refactor`: Tái cấu trúc code sạch hơn mà không thay đổi logic hay thêm tính năng
- `test`: Thêm hoặc cập nhật test case (Selenium, Vitest, E2E) (ví dụ: `test: cap nhat kich ban selenium cho buoc ban do`)
- `perf`: Tối ưu hiệu năng, tốc độ tải
- `docs`: Cập nhật tài liệu, file Excel test, README
- `chore`: Cập nhật cấu hình, package.json, lặt vặt

### 2. Quy tắc bắt buộc:
- Sau dấu `:` phải có 1 khoảng trắng (`: `).
- Không để dấu chấm `.` ở cuối commit message.
- Ngắn gọn, súc tích (dưới 72 ký tự).
