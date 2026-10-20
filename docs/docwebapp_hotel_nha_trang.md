# WEBAPP HOTEL NHA TRANG

## MỤC LỤC
1. [DANH MỤC VIẾT TẮT](#1-danh-mục-viết-tắt)
2. [LUỒNG HOẠT ĐỘNG](#2-luồng-hoạt-động)
   - 2.1. Luồng khách du lịch
     - 2.1.1. Luồng khám phá, tìm kiếm, lọc
     - 2.1.2. Luồng xem chi tiết, liên hệ
     - 2.1.3. Luồng tương tác AI
   - 2.2. Luồng chủ cơ sở
     - 2.2.1. Luồng xác thực, onboarding
     - 2.2.2. Luồng tạo mới, gửi duyệt cơ sở lưu trú
     - 2.2.3. Luồng cập nhật cơ sở đã duyệt
   - 2.3. Luồng quản trị viên
     - 2.3.1. Luồng kiểm duyệt nội dung
     - 2.3.2. Luồng xử lý vi phạm nội dung đang chạy
     - 2.3.3. Luồng quản lý tài khoản Host
     - 2.3.4. Luồng cấu hình hệ thống (SEO & AI)
3. [MÔ TẢ GIAO DIỆN](#3-mô-tả-giao-diện)
   - 3.1. Khách du lịch
     - 3.1.1. Màn hình home
     - 3.1.2. Màn hình kết quả tìm kiếm và lọc
     - 3.1.3. Màn hình chi tiết cơ sở lưu trú
     - 3.1.4. Global UI component: Cửa sổ chat AI luôn hiện ở góc màn hình
   - 3.2. Host
     - 3.2.1. Màn hình đăng nhập
     - 3.2.2. Màn hình đăng kí
     - 3.2.3. Màn hình quên mật khẩu
     - 3.2.4. Màn hình nhập mã OTP
     - 3.2.5. Màn hình danh sách cơ sở lưu trú
     - 3.2.6. Màn hình thêm mới
     - 3.2.7. Màn hình cập nhật
     - 3.2.8. Màn hình quản lí tài khoản
   - 3.3. Admin
     - 3.3.1. Đăng nhập admin
     - 3.3.2. Màn hình quản lí host
     - 3.3.3. Màn hình quản lí và kiểm duyệt
     - 3.3.4. Màn hình cấu hình SEO

---

## 1. DANH MỤC VIẾT TẮT

| Thuật ngữ / Viết tắt | Giải nghĩa chi tiết |
| :--- | :--- |
| **SRS** | Software Requirements Specification - Tài liệu đặc tả yêu cầu phần mềm |
| **BRD** | Business Requirements Document - Tài liệu yêu cầu nghiệp vụ |
| **FR** | Yêu cầu chức năng (Functional Requirement) |
| **NFR** | Yêu cầu phi chức năng (Non-Functional Requirement) |
| **OTA** | Online Travel Agent - Đại lý du lịch trực tuyến |
| **Deep link** | Liên kết trực tiếp mở ứng dụng thứ ba (Zalo) từ trình duyệt/app |
| **Host** | Chủ cơ sở lưu trú |
| **WebApp** | Ứng dụng Web chạy trên trình duyệt, dùng để tra cứu và quản lý thông tin |
| **API** | Application Programming Interface - Giao diện lập trình ứng dụng |
| **AI** | Artificial Intelligence - Trí tuệ nhân tạo |
| **SEO** | Search Engine Optimization - Tối ưu hóa công cụ tìm kiếm |
| **OTP** | One-Time Password - Mã xác thực dùng một lần |
| **REST API** | Giao diện API theo kiến trúc REST, dùng để trao đổi dữ liệu qua HTTP/HTTPS |
| **HTTPS** | Hypertext Transfer Protocol Secure - Giao thức truyền tải Web có mã hóa |
| **URL** | Uniform Resource Locator - Địa chỉ định danh tài nguyên trên mạng |
| **UUID** | Universally Unique Identifier - Mã định danh duy nhất |
| **SMTP** | Simple Mail Transfer Protocol - Giao thức dùng để gửi email |
| **ID** | Identifier - Mã định danh của đối tượng/dữ liệu trong hệ thống |
| **TBD** | To Be Determined - Nội dung chưa được xác định/chốt |
| **US** | User Story - Mô tả nhu cầu của người dùng |
| **Dev** | Developer/Development - Đội phát triển phần mềm |
| **QC** | Quality Control - Kiểm soát chất lượng và kiểm thử phần mềm |
| **Actor** | Tác nhân tương tác với hệ thống để thực hiện một chức năng |
| **Module** | Mô-đun chức năng, nhóm các chức năng có liên quan trong hệ thống |
| **Workflow** | Quy trình chuyển đổi trạng thái (VD: Bản nháp $\rightarrow$ Chờ duyệt $\rightarrow$ Đã duyệt) |
| **Validation** | Quy tắc kiểm tra tính hợp lệ của dữ liệu trước khi hệ thống xử lý |
| **Asset** | Tài nguyên nội dung (hình ảnh, video) được quản lý trong hệ thống |
| **Enum** | Kiểu dữ liệu liệt kê gồm một tập giá trị được xác định trước |

---

## 2. LUỒNG HOẠT ĐỘNG

### 2.1. Luồng khách du lịch

#### 2.1.1. Luồng khám phá, tìm kiếm, lọc
* **Bước 1:** Khách truy cập vào webapp. Hệ thống mặc định cấp quyền sử dụng ngay không cần qua cổng đăng nhập.
* **Bước 2:** Hệ thống load vị trí hiện tại của khách nếu khách cho phép truy cập location để làm mốc tính khoảng cách, sau đó render bản đồ và danh sách cơ sở lưu trú lân cận.
* **Bước 3 (Thao tác Tìm kiếm/Lọc):**
  * **Cách A:** Khách gõ tên cơ sở lưu trú vào thanh search $\rightarrow$ hệ thống gọi API trả về kết quả khớp tên.
  * **Cách B:** Khách mở bộ lọc, chọn tổ hợp các điều kiện: khoảng giá + khoảng cách + vị trí/khu vực + tiện ích lân cận (gần biển, gần nhà hàng...).
* **Bước 4:** Hệ thống áp dụng quy tắc phải thỏa mãn tất cả tiêu chí lọc.
  * **Trường hợp thành công:** Cập nhật danh sách product card và các điểm ghim trên bản đồ.
  * **Trường hợp ngoại lệ:** Nếu không có kết quả, hiển thị empty state "không tìm thấy cơ sở phù hợp" và gợi ý khách xóa bớt bộ lọc.

#### 2.1.2. Luồng xem chi tiết, liên hệ
* **Bước 1:** Từ màn hình danh sách hoặc từ pin trên bản đồ, khách bấm vào 1 cơ sở cụ thể.
* **Bước 2:** Hệ thống load màn hình chi tiết hiển thị: hình ảnh/video, giá tham khảo, ngày cập nhật giá, tiện ích, khoảng cách từ khách đến cơ sở đó.
* **Bước 3:**
  * **Hành động gọi điện:** Khách bấm nút "Gọi điện" $\rightarrow$ WebApp gọi deeplink (`tel:`) mở trình gọi điện mặc định của điện thoại kèm số của Host.
  * **Hành động truy cập Zalo:** Khách bấm nút "Zalo" $\rightarrow$ WebApp gọi deeplink mở ứng dụng Zalo trên máy khách, trỏ thẳng vào cửa sổ chat với Host.
  * **Hành động truy cập Facebook:** Khách hàng nhấn nút “Facebook” hệ thống sẽ chuyển đến trang được gắn link.

#### 2.1.3. Luồng tương tác AI
* **Bước 1:** Khách bấm icon chatbot nổi ở góc màn hình.
* **Bước 2:** Khách nhập text VD: "Tìm cho tôi khách sạn gần biển giá dưới 500k".
* **Bước 3:** Chatbot AI phân tích NLP, truy xuất database và trả lời bằng text kèm theo các thẻ product card gồm hình ảnh + thông tin ngắn + thông tin liên hệ + nút xem chi tiết, ngay trong khung chat.
* **Bước 4:** Khách bấm vào product card trên khung chat $\rightarrow$ chuyển thẳng tới luồng 1.2 (xem chi tiết).

---

### 2.2. Luồng chủ cơ sở

#### 2.2.1. Luồng xác thực, onboarding
* **Bước 1:** Host truy cập phân hệ dành cho đối tác.
* **Bước 2:** Nhập thông tin đăng ký (họ tên, sđt, email, cccd, mật khẩu) hoặc đăng nhập.
* **Bước 3 (Xác thực OTP):**
  * Hệ thống gửi mã OTP hình thức qua email: Host nhập mã OTP độ dài 6 số.
  * **Thời gian hiệu lực/gửi lại:** Hiệu lực 5 phút, gửi lại sau 60 giây.
  * **Ngoại lệ:** Nếu nhập sai quá số lần quy định (Số lần tối đa: 5 lần), khóa tạm thời chức năng đăng nhập hoặc tài khoản (Thời gian countdown/khóa: 15 phút).
* **Bước 4:** Xác thực thành công $\rightarrow$ điều hướng Host vào dashboard quản lý.

#### 2.2.2. Luồng tạo mới, gửi duyệt cơ sở lưu trú
* **Bước 1:** Host bấm "+ Thêm cơ sở" trong Dashboard.
* **Bước 2:** Tạo base data để lấy ID, Host nhập dữ liệu Text (Tên, mô tả, giá, dropdown vị trí) và Thông tin liên hệ (SĐT Call, Link Zalo, Link Facebook). Sau đó bấm "Lưu thông tin" để hệ thống khởi tạo cơ sở ở trạng thái `[Bản nháp]` và trả về `Listing_ID`.
* **Bước 3 Media (Yêu cầu đã có ID):** Khi đã có `Listing_ID`, hệ thống mở khóa tính năng upload. Host tiến hành upload hình ảnh (max 100 file) và video (max 5 file). API upload sẽ được đính kèm `Listing_ID`.
* **Bước 4 Map:** Host thao tác trên Google Maps, kéo ghim đỏ thả vào đúng vị trí cơ sở để lấy tọa độ (`lat`, `lng`).
* **Bước 5 Gửi duyệt:** Host review lại thông tin, bấm "Gửi kiểm duyệt" $\rightarrow$ trạng thái chuyển từ `[Bản nháp]` sang `[Chờ duyệt]`.

#### 2.2.3. Luồng cập nhật cơ sở đã duyệt
* **Bước 1:** Host chọn một cơ sở đang có trạng thái `[Đã duyệt]` (đang live trên app tourist) và bấm edit.
* **Bước 2:** Host sửa đổi thông tin (VD: tăng giá, thay ảnh) và bấm "Lưu".
* **Bước 3 System Rule:** Hệ thống cảnh báo khi host confirm lưu, hệ thống tự động:
  * Việc bản cũ có tiếp tục hiển thị cho tourist hay bị gỡ tạm thời: `[TBD]`.
  * Chuyển trạng thái cơ sở từ `[Đã duyệt]` lùi về `[Chờ duyệt]`.
* **Bước 4:** Cơ sở rơi lại vào "luồng 3.1" để admin duyệt lại từ đầu.

---

### 2.3. Luồng quản trị viên

#### 2.3.1. Luồng kiểm duyệt nội dung
* **Bước 1:** Admin đăng nhập bằng tài khoản nội bộ $\rightarrow$ truy cập tab "Danh sách chờ duyệt".
* **Bước 2:** Admin chọn 1 cơ sở $\rightarrow$ review toàn bộ nội dung (text, media, tọa độ bản đồ).
* **Bước 3 Ra quyết định:**
  * **Nhánh A:** Admin bấm "Duyệt" $\rightarrow$ trạng thái chuyển thành `[Đã duyệt]`. Cơ sở lập tức được public (live) trên app cho tourist tìm kiếm.
  * **Nhánh B:** Admin bấm "Từ chối" $\rightarrow$ popup hiển thị trường nhập lý do (không bắt buộc) $\rightarrow$ trạng thái chuyển thành `[Từ chối]`. Gửi email thông báo (kèm lý do nếu có) về cho Host để Host sửa lại.

#### 2.3.2. Luồng xử lý vi phạm nội dung đang chạy
* **Bước 1:** Admin nhận được báo cáo hoặc tự phát hiện cơ sở vi phạm (thông tin sai lệch, ảnh phản cảm...).
* **Bước 2:** Admin vào tab "Danh sách Đã duyệt", tìm cơ sở đó.
* **Bước 3:** Admin bấm hành động "Ẩn / Gỡ nội dung".
* **Bước 4:** Hệ thống ngừng hiển thị công khai cơ sở này trên app của tourist. (Trạng thái cụ thể sau khi gỡ: `[TBD]`).

#### 2.3.3. Luồng quản lý tài khoản Host
* **Bước 1:** Admin vào trang quản lý chủ cơ sở.
* **Bước 2:** Tìm kiếm Host theo SĐT hoặc tên.
* **Bước 3:** Admin thực hiện khóa tài khoản Host.
* **Bước 4 Kết quả:** Hành vi cụ thể của hệ thống sau khi khóa Host (như có tự động logout Host hay không, toàn bộ CSLT của Host đó chuyển trạng thái ra sao...) hiện tại: `[TBD]`.

#### 2.3.4. Luồng cấu hình hệ thống (SEO & AI)
* **Bước 1 Cấu hình SEO:** Admin vào trang cấu hình SEO, nhập/cập nhật thông tin các thẻ meta, từ khóa.
* **Bước 2 Cấu hình AI:** Admin vào trang cấu hình Chatbot AI. Các nhóm cấu hình có thể điều chỉnh bao gồm:
  * Nguồn dữ liệu
  * Phạm vi trả lời
  * Nội dung phản hồi
  *(Chi tiết kỹ thuật từng thành phần cấu hình AI: `[TBD]`).*

---

## 3. MÔ TẢ GIAO DIỆN

### 3.1. Khách du lịch

#### 3.1.1. Màn hình home
* **Mục đích:** Hiển thị các danh sách cơ sở lưu trú.
* **Cấu trúc:**
  * **Header:** Thanh search dài và nút ‘Tìm kiếm’ (Chỉ hỗ trợ nhập text là tên cơ sở lưu trú, không hỗ trợ gõ giá tiền). Bên phải nút là bộ lọc icon filter.
  * **Body:** Hiển thị thông tin cơ sở lưu trú theo card. Một phần card là ảnh và thông tin nhanh của cơ sở lưu trú, phần còn lại sẽ là bản đồ của cơ sở lưu trú.
* **Tương tác:** Nhấn vào card sẽ focus và chuyển đến trang chi tiết của cơ sở lưu trú.

#### 3.1.2. Màn hình kết quả tìm kiếm và lọc
* **Mục đích:** Hiển thị kết quả khi người dùng tìm kiếm hoặc lọc.
* **Màn hình bộ lọc popup:**
  * Thanh kéo chọn theo mức giá
  * Check box chọn theo tiện ích
  * Thanh kéo chọn khoảng cách
  * Check box các địa điểm lân cận
  * Nút áp dụng
  * Nút xóa bộ lọc
* **Màn hình hiển thị danh sách kết quả:** Hiển thị các cơ sở lưu trú theo dạng card.

#### 3.1.3. Màn hình chi tiết cơ sở lưu trú
* **Mục đích:** Hiển thị đầy đủ và chi tiết các thông tin cho khách hàng liên hệ.
* **Cấu trúc:**
  * Sử dụng slide ảnh để show ảnh cơ sở lưu trú, chuyển slide tự động, vuốt màn hình, nhấn nút icon điều hướng.
  * **Thông tin chung:**
    * Tên cơ sở
    * Giá
    * Địa chỉ
    * Ngày cập nhật
  * **Thông tin chủ cơ sở:**
    * Tên host
  * **Tiện ích:** Hiển thị thông tin các tiện ích dạng text và icon.
  * **Bản đồ:** Hiển thị bản đồ và ghim vị trí của cơ sở lưu trú và dự đoán khoảng cách từ khách hàng đến cơ sở lưu trú.
  * **Liên hệ:** Hiển thị các nút liên hệ nhanh với cơ sở lưu trú:
    * Nút gọi thông qua số điện thoại
    * Nút chat thông qua Zalo
    * Liên kết Facebook

#### 3.1.4. Global UI component: Cửa sổ chat AI luôn hiện ở góc màn hình
* **Cấu trúc UI:**
  * Một icon Chatbot nổi ở góc dưới bên phải màn hình hiển thị xuyên suốt ở màn Home và Kết quả.
  * **Cửa sổ Chat:** Mở ra dạng popup lên màn hình.
    * **Header:** Tên Chatbot, nút đóng.
    * **Body:** Giao diện tin nhắn bong bóng chat của khách hàng và Bot.
    * **Bottom:** Thanh nhập text, Nút gửi.
* **Tương tác đặc biệt:** Khi AI gợi ý phòng, bot sẽ render trực tiếp một **card thu nhỏ** ngay trong khung chat có ảnh, giá và nút "Xem chi tiết".

---

### 3.2. Host

#### 3.2.1. Màn hình đăng nhập
* **Cấu trúc UI:** Giao diện thẻ card căn giữa màn hình.
* **Form Đăng nhập:** Input Email/SĐT, Input Password, Checkbox "Ghi nhớ mật khẩu", Link "Quên mật khẩu", nút "Đăng nhập", nút "Đăng ký".

#### 3.2.2. Màn hình đăng kí
* **Cấu trúc UI:** Giao diện thẻ card căn giữa màn hình.
* **Form Đăng ký:** Các trường: Họ Tên, SĐT, Email, CCCD, Password, Confirm Password. Nút "Đăng ký".

#### 3.2.3. Màn hình quên mật khẩu
* **Mục đích:** Hỗ trợ Host lấy lại quyền truy cập khi mất mật khẩu.
* **Bước 1: Yêu cầu cấp lại**
  * Input SĐT/Email
  * Nút "Gửi mã xác nhận".
* **Bước 2: Nhập OTP**
  * Giao diện gồm 6 ô
  * Có đồng hồ đếm ngược “Gửi lại mã sau 60s”
  * Nút xác nhận
  * **Số lần sai tối đa:** Nhập sai tối đa 5 lần.
  * **Thời gian khóa:** Nếu sai 5 lần, tạm khóa chức năng nhập trong 15 phút.
* **Bước 3: Đặt lại mật khẩu mới**
  * Sau khi OTP hợp lệ chuyển sang form nhập lại mật khẩu mới
  * Nhập “Mật khẩu mới” và “Xác nhận mật khẩu mới”
  * Nhấn “Lưu và đăng nhập”.

#### 3.2.4. Màn hình nhập mã OTP
* **Nhập OTP:** Giao diện gồm các ô input mã OTP. Đồng hồ đếm ngược "Gửi lại mã sau 60s". Nút "Xác nhận".

#### 3.2.5. Màn hình danh sách cơ sở lưu trú
* **Cấu trúc UI:** Dashboard có sidebar bên trái. Main content gồm header và bảng dữ liệu.
* **Bảng dữ liệu (data table):** Hiển thị ảnh thumbnail, tên cơ sở, ngày tạo, trạng thái (badge màu).
* **Cột thao tác (dynamic actions dựa trên trạng thái):**
  * **Trạng thái `[xám - bản nháp]`:** Hiển thị icon edit (tiếp tục sửa), submit (gửi duyệt), delete (xóa).
  * **Trạng thái `[vàng - chờ duyệt]`:** Hiển thị icon preview (xem trước), withdraw (rút lại yêu cầu duyệt - chuyển về nháp).
  * **Trạng thái `[xanh - đã duyệt]`:** Hiển thị icon preview, edit (hiện cảnh báo sẽ bị hạ xuống chờ duyệt nếu lưu), hide (tạm ẩn khỏi app).
  * **Trạng thái `[đỏ - từ chối]`:** Hiển thị icon edit (vào xem lý do từ chối và sửa), delete.

#### 3.2.6. Màn hình thêm mới
* **Cấu trúc UI các Tab:** Nút "Lưu tạo mới" ở Tab 1 phải được bấm trước để gọi API lấy ID, sau đó Tab 3 mới cho phép thao tác.
  * **Tab 1 - Thông tin cơ bản:** Tên cơ sở, loại hình, địa chỉ, text mô tả, trường thông tin liên hệ bao gồm input SĐT Hotline, input URL Zalo, Input URL Facebook.
  * **Tab 2 - Giá, tiện ích:** Input giá tham khảo (Giá tham khảo từ 500.000 VNĐ đến 100.000.000 VNĐ), checkbox list các tiện ích.
  * **Tab 3 - Hình ảnh, video:** (Chỉ khả dụng sau khi lưu Tab 1) Vùng drag & drop rộng. Hiển thị list ảnh dạng grid. Nút xóa ảnh. Thanh tiến trình khi tải video. Tối thiểu 3 ảnh, tối đa 100 ảnh. Dung lượng $\le 10\text{MB}$/ảnh. Video tối đa 5 file dung lượng $\le 100\text{MB}$/file.
  * **Tab 4 - Bản đồ:** Tích hợp Google Maps. Có thanh Search địa chỉ, host kéo/thả ghim màu đỏ để chốt tọa độ. (Vị trí ghim phải nằm trong tọa độ của Nha Trang, vĩ độ: $12.1$ đến $12.45$, kinh độ: $109.1$ đến $109.3$. Nếu kéo ra ngoài hệ thống sẽ báo lỗi).
* **Action Panel cố định dưới cùng:** Nút "Lưu nháp", Nút "Gửi kiểm duyệt".

#### 3.2.7. Màn hình cập nhật
* **Cấu trúc UI:** Giống hệt Màn hình thêm mới nhưng các trường dữ liệu đã được điền sẵn.
* **Tương tác đặc biệt:** Nếu cơ sở đang ở trạng thái Đã duyệt, khi bấm Edit hệ thống sẽ hiện một Modal cảnh báo: *"Nếu bạn lưu thay đổi, cơ sở này sẽ bị ẩn tạm thời và chuyển về trạng thái Chờ duyệt. Bạn có chắc chắn muốn tiếp tục?"*.

#### 3.2.8. Màn hình quản lí tài khoản
* **Cấu trúc UI:** Form đơn giản hiển thị trong Dashboard.
  * Trường "Căn cước công dân" và “Email” bị disable (read only), chỉ cho sửa “Họ tên” và ”Số điện thoại”.
  * Phân vùng riêng cho chức năng "Đổi mật khẩu": Mật khẩu cũ, mới, xác nhận.

---

### 3.3. Admin

#### 3.3.1. Đăng nhập admin
* Giao diện tách biệt hoàn toàn với Host.

#### 3.3.2. Màn hình quản lí host
* **Cấu trúc UI:**
  * Thanh tìm kiếm theo tên, SĐT, Email của Host.
  * **Bảng dữ liệu:** Tên Host, SĐT, Số lượng cơ sở đang sở hữu, Trạng thái tài khoản.
  * **Cột Thao tác:** Nút để Khóa/Mở khóa tài khoản. Khi bấm Khóa sẽ popup yêu cầu "Nhập lý do khóa".

#### 3.3.3. Màn hình quản lí và kiểm duyệt
* **Cấu trúc UI:** Chia làm 2 Tabs chính.
  * **Tab "Chờ duyệt":** Bảng danh sách cơ sở chờ xử lý.
    * Khi click vào 1 cơ sở mở ra màn hình chi tiết kiểm duyệt.
    * **Review Mode:** Hiển thị đầy đủ mọi thông tin Host đã nhập (Ảnh, Map, Thông tin text). Có 2 nút action cố định: "Approve (Duyệt)" (Màu xanh) và "Reject (Từ chối)" (Màu đỏ).
    * **Tương tác đặc biệt:** Khi bấm “Reject”, hệ thống hiển thị popup và cho phép nhập lý do từ chối (tùy chọn không bắt buộc nhập lý do từ chối) trước khi xác nhận.
  * **Tab "Đã duyệt / Đang hiển thị":** Bảng danh sách cơ sở đang live.
    * Cột Thao tác có nút Ẩn / Gỡ. Bấm vào sẽ hiện popup confirm và nhập lý do vi phạm.

#### 3.3.4. Màn hình cấu hình SEO
* **Cấu trúc UI:**
  * **Tab SEO Config:** Các ô input cho Default Meta Title, Default Meta Description, ô tải lên Default OpenGraph Image.
  * **Tab AI Chatbot Config:** Ô input nhập system prompt. Có nút "Lưu cấu hình".