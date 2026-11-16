# Báo cáo: backend Azure trả 500 khi có token, nên chưa chạy được E2E phần Host

Ngày kiểm: 2026-11-11 và 2026-11-12 (10:09 +07) · Nhánh FE: `feature/quan-dashbds` · Người kiểm: Claude (theo yêu cầu của Quân)

> **Cập nhật 2026-11-16:** đã sửa. `Bearer abc` giờ trả 401 `TOKEN_INVALID`, đăng ký và OTP chạy được. Kết quả chạy E2E với backend nằm ở `261116-1141-host-e2e-azure-backend-run-report.md`.

## Tóm tắt

- Backend của nhóm đã chạy trên Azure. Đường dẫn công khai, CORS và các API Host đều có.
- **Lỗi chính:** request nào có header `Authorization: Bearer ...` cũng nhận **500 `INTERNAL_ERROR`**, kể cả token sai. Đúng ra phải là 401 `TOKEN_INVALID`.
- **Nguyên nhân nhiều khả năng nhất:** trên Azure chưa đặt biến môi trường `APP_AUTH_JWT_SECRET`, hoặc giá trị ngắn hơn 32 byte. Thiếu khóa này thì backend không kiểm được token nào, cũng không cấp được token nào. Vì vậy hiện **không ai đăng nhập được**, cả Host lẫn Admin.
- **Người sửa:** người quản lý deploy backend (repo `TheHungrier/hotelnt-backend`; workflow Azure và commit cấu hình do Nguyễn Đức Anh đẩy lên). Phần FE Host của Quân không cần sửa gì cho lỗi này.
- Hậu quả cho Quân: 11 case Selenium (TC_HDB_01–08, TC_PRF_01–03) chạy vào Azure đều báo `Error` "Hệ thống đang gặp sự cố", nên chưa đánh Pass chính thức được.

## 1. Backend đang chạy ở đâu

| Mục | Giá trị |
|---|---|
| Địa chỉ | `https://hotelnt-api-e4fhhvd8bvawfdec.eastasia-01.azurewebsites.net/api` |
| Cách tìm ra | Log của lần deploy GitHub Actions `42687091421` (dòng "App Service Application URL"). `api.hotelnt.com` chưa có bản ghi DNS. `hotelnt-api.azurewebsites.net` không trả lời |
| Mã đang chạy | Nhánh `develop` ở `def4dd7` (09/11 19:49), deploy thành công. Từ đó tới 12/11 chưa có commit mới |
| Đường dẫn gốc | `/api`, **không có** `/v1`. Gọi `/api/v1/...` nhận 404 |

## 2. Kết quả gọi thử (12/11, server đã chạy ổn định)

| Request | Kỳ vọng | Thực tế |
|---|---|---|
| `GET /api/health` | 200 | 200 `{"status":"ok"}` |
| `GET /api/listings` (công khai, có đọc DB) | 200 | 200, trả 4 cơ sở của seed. Riêng lần gọi DB đầu tiên sau khi server để lâu thì nhận 500 một lần (xem mục 6) |
| `GET /api/filter-options` | 200 | 200 |
| `OPTIONS /api/host/listings`, Origin `http://localhost:5199` | Cho phép CORS | Cho phép (`Access-Control-Allow-Origin: http://localhost:5199`, có header `authorization`) |
| `POST /api/auth/signin`, tài khoản không tồn tại | 401 `AUTH_INVALID_CREDENTIALS` | 401 `AUTH_INVALID_CREDENTIALS`, tức DB và module Auth vẫn chạy |
| `GET /api/host/profile`, **không** gửi token | 401 `TOKEN_INVALID` | 401 `TOKEN_INVALID` |
| `GET /api/host/profile`, `Bearer abc` | 401 `TOKEN_INVALID` | **500 `INTERNAL_ERROR`**, cả 3 lần gọi liên tiếp |
| `GET /api/host/listings`, JWT ký bằng khóa sai | 401 `TOKEN_INVALID` | **500 `INTERNAL_ERROR`** |
| `POST /api/auth/refresh`, `refreshToken: "abc"` | 401 | **500 `INTERNAL_ERROR`** |

Bộ E2E chạy ở chế độ backend vào Azure (11/11): 11/11 case báo `Error`, trang hiện "Không tải được danh sách cơ sở / Hệ thống đang gặp sự cố". Trước đó bộ này đã được kiểm chứng: chạy trên mock thì ra 3 Pass (mock), 8 Fail (mock), 0 Error.

Có quy luật rõ ràng: **chỉ lỗi khi request mang token**. Không gửi token thì backend trả lời đúng.

## 3. Nguyên nhân (đọc từ code backend, nhánh `develop`)

Đường đi của một request Host có token:

1. `HostConfiguration` gọi `AuthenticatedAccountService.resolve(header, "HOST")`. Không có header thì trả rỗng, thành 401. Khớp với kết quả đo.
2. Có header thì gọi `AuthTokenService.verify(token, "access")`. `resolve` chỉ bắt `IllegalArgumentException`.
3. Trong `verify`:
   ```java
   try {
       Claims claims = Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
       ...
   } catch (JwtException | IllegalArgumentException ex) {
       throw new IllegalArgumentException("Invalid token", ex);
   }
   ```
4. `key()` đọc `app.auth.jwt-secret` (biến môi trường `APP_AUTH_JWT_SECRET`, mặc định là chuỗi rỗng). Nếu ngắn hơn 32 byte thì ném:
   ```java
   throw new IllegalStateException("APP_AUTH_JWT_SECRET must contain at least 32 bytes");
   ```
   `IllegalStateException` **không** nằm trong `catch`, nên lỗi lọt lên `GlobalExceptionHandler` và thành 500.

Nếu khóa đã đặt đúng, token `abc` sẽ gây `MalformedJwtException` (là `JwtException`). Lỗi này được `catch` đổi thành `IllegalArgumentException`, và kết quả là 401. Thực tế lại là 500, nghĩa là lỗi xảy ra ở `key()`, trước khi kịp đọc token.

Bằng chứng thêm:
- Test của chính backend, `AuthTokenServiceTest`: với khóa 32 byte thì token sai chữ ký ném `IllegalArgumentException` (đường 401). Với khóa rỗng thì ném `IllegalStateException` (test `requiresARealSigningKey`).
- Commit `d68baa3` ("xóa thông tin hardcode khỏi application.yml") ngay trước lần deploy cho thấy cấu hình đã chuyển sang biến môi trường. Workflow `develop_hotelnt-api.yml` chỉ đẩy file `.jar` lên, không đặt biến môi trường nào. Các biến này phải đặt tay trong App Settings của Azure. Báo cáo này không đọc nội dung file cấu hình.

Các khả năng đã loại trừ:

| Khả năng | Vì sao loại |
|---|---|
| Thiếu thư viện JWT khi đóng gói | `pom.xml` có `jjwt-impl` và `jjwt-jackson` 0.12.6 (scope `runtime`), Spring Boot đóng gói cả hai vào `.jar` |
| Lỗi tạm thời, server vừa khởi động | Gọi 3 lần liên tiếp khi server đã chạy ổn, cả 3 lần đều 500. Cùng lúc đó, request không có token vẫn 401 và API công khai vẫn 200 |
| DB lỗi | `POST /auth/signin` với tài khoản không tồn tại có truy vấn DB và vẫn trả 401 đúng. Ngoài ra token `abc` hỏng ngay ở bước kiểm khóa, chưa tới bước đọc DB |

**Mức chắc chắn:** cao, nhưng chưa xác nhận trực tiếp vì không có quyền xem log hay cấu hình Azure. Cách xác nhận nằm ở mục 5.

## 4. Ảnh hưởng

- **Không đăng nhập được.** Sau khi nhập đúng OTP, backend tạo token qua `SessionIssuer.issue` → `tokens.accessToken(...)` → `key()`. Bước này sẽ 500 vì cùng lý do trên. (Suy ra từ code, chưa gọi thử vì cần OTP thật.)
- **Mọi API cần đăng nhập đều 500:** Host, Admin, đổi mật khẩu, refresh token.
- **Trên giao diện**, người dùng có token sẽ thấy "Hệ thống đang gặp sự cố", thay vì bị đưa về trang đăng nhập.
- **E2E Host của Quân:** chưa chạy được case nào với backend thật.

## 5. Cách xác nhận và cách sửa (phía backend)

Xác nhận:
1. Azure Portal → App Service `hotelnt-api` → **Log stream** (hoặc Diagnose and solve problems). Gọi `curl -H 'Authorization: Bearer abc' https://hotelnt-api-e4fhhvd8bvawfdec.eastasia-01.azurewebsites.net/api/host/profile`, rồi tìm trong log dòng `APP_AUTH_JWT_SECRET must contain at least 32 bytes`.
2. **Settings → Environment variables (App settings):** xem có `APP_AUTH_JWT_SECRET` không, và có đủ 32 ký tự trở lên không.

Sửa:
1. Đặt `APP_AUTH_JWT_SECRET` là một chuỗi ngẫu nhiên từ 32 byte trở lên (ví dụ tạo bằng `openssl rand -base64 48`), lưu lại và restart app. Không commit giá trị này vào repo.
2. Kiểm tra cấu hình SMTP gửi OTP. Nếu thiếu, `OtpEmailSender` sẽ ném "SMTP is not configured" và đăng nhập cũng hỏng. Báo cáo này chưa kiểm được phần SMTP, vì cần một tài khoản có email thật.
3. (Đề xuất) Kiểm khóa ngay lúc server khởi động. Khi đó deploy thiếu biến sẽ báo lỗi ngay, thay vì chạy được rồi trả 500 cho mọi request có token.

Sau khi sửa, gọi lại `curl -H 'Authorization: Bearer abc' .../api/host/profile`. Kết quả phải là **401 `TOKEN_INVALID`**.

## 6. Các việc khác còn chặn E2E phần Host

| # | Việc | Ai làm | Ghi chú |
|---|---|---|---|
| 1 | Tài khoản Host test có email thật | Người quản lý backend | Các Host trong seed (`host1@hotelnt.local`, `host2@hotelnt.local`) không nhận được OTP |
| 2 | Dữ liệu đủ cho 11 case | Người quản lý backend, hoặc Quân tạo qua API | host1 hiện có 2 Đã duyệt, 1 Chờ duyệt, 1 Bị từ chối. Còn thiếu Bản nháp, Ẩn và một cơ sở có chữ "Breeze" (TC_HDB_03) |
| 3 | Đồng ý cho test sửa dữ liệu chung | Cả nhóm | TC_HDB_06 rút một cơ sở Chờ duyệt về Bản nháp. TC_HDB_08 xóa một cơ sở Bản nháp và một cơ sở Bị từ chối. TC_PRF_02 đổi họ tên và SĐT của Host. Chạy xong cần nạp lại seed |
| 4 | Màn đăng nhập FE gọi sai đường dẫn | Quỳnh | FE gọi `/auth/login`, `/auth/verify-otp`, `/auth/register`. Backend dùng `/auth/signin`, `/auth/signin/verify`, `/auth/signup` |
| 5 | Địa chỉ API mặc định của FE có `/v1` | Người giữ file dùng chung | `.env.example` và `src/services/axiosClient.js` để mặc định `https://api.hotelnt.com/api/v1`. Backend thật dùng `/api` |
| 6 | Lần gọi DB đầu tiên sau khi để lâu bị 500 | Người quản lý backend (theo dõi) | Gặp 1 lần ngày 12/11 với `GET /api/listings`, gọi lại thì chạy bình thường. Chưa rõ nguyên nhân, có thể do DB tự tạm dừng khi không ai dùng hoặc do kết nối cũ trong pool bị đóng |

Trong lúc chờ màn đăng nhập (mục 4), có thể lấy token bằng curl như hướng dẫn ở mục "Chạy với backend" của `e2e/README.md`. Token chỉ sống 30 phút.

## 7. Khi backend đã sửa xong

1. `curl -H 'Authorization: Bearer abc' <API>/host/profile` phải trả 401.
2. Lấy token của tài khoản Host test: `POST /auth/signin` rồi `POST /auth/signin/verify` với mã OTP nhận qua email.
3. Chạy:
   ```bash
   E2E_TARGET=backend \
   VITE_API_BASE_URL=https://hotelnt-api-e4fhhvd8bvawfdec.eastasia-01.azurewebsites.net/api \
   E2E_HOST_TOKEN=<accessToken> \
     npx vitest run --config e2e/vitest.config.js
   ```
4. Dán `e2e/reports/host-results.csv` vào tab "TC - Host (Chủ cơ sở)". Trạng thái lúc này là `Pass` / `Fail`, không còn đuôi "(mock)".

## Nguồn

- Backend: `TheHungrier/hotelnt-backend`, nhánh `develop` (`def4dd7`). Các file đã đọc: `modules/auth/AuthTokenService.java`, `AuthenticatedAccountService.java`, `SessionIssuer.java`, `SigninVerifyService.java`, `RefreshService.java`, `OtpEmailSender.java`, `modules/host/HostConfiguration.java`, `HostController.java`, `src/test/.../AuthTokenServiceTest.java`, `pom.xml`, `db/seed.sql`, `docs/host/HANDOFF.md`, `.github/workflows/develop_hotelnt-api.yml`
- Lần deploy: GitHub Actions `42687091421` (09/11 19:49, thành công)
- FE: `e2e/README.md`, `plans/261109-0918-host-selenium-e2e-tests/plan.md` (mục "Còn lại")
