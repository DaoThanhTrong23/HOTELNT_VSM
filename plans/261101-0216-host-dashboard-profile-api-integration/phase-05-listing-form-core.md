---
phase: 5
title: "Form CSLT dùng chung: 4 bước, checklist, media, bản đồ"
status: pending
priority: P1
effort: "8h"
dependencies: [1]
---

# Phase 5: Form CSLT dùng chung (Màn 12 + 13)

## Goal

Xây bộ form 4 bước dùng chung cho Thêm mới (Màn 12) và Cập nhật (Màn 13), đúng Figma 12.1–12.6 và 13.1–13.4. Bộ form gồm:
- stepper;
- 4 bước nhập liệu;
- panel "Điều kiện gửi kiểm duyệt";
- upload ảnh/video thật;
- bản đồ ghim tọa độ.

Phase 6 và 7 chỉ lắp luồng nghiệp vụ lên bộ form này.

## Ràng buộc

- Mọi file mới nằm trong `src/pages/host/components/listing-form/`.
- Không thêm package. Google Maps nạp bằng loader động (A5).
- Không sửa `enums.js`. Giới hạn lấy từ `/filter-options`, chỉ dùng `MEDIA_LIMITS` và `NHA_TRANG_MAP_BOUNDS` làm giá trị mặc định khi API không trả.

## Scout trước khi làm

- Đọc skill `/figma-design-to-code`, rồi `get_design_context` cho các node:
  - `79:11549` (12.1), `72:5846` (12.2), `72:6051` (12.3), `72:6238` (12.4), `72:6407` (12.5), `72:6562` (12.6);
  - mobile `126:1060`, `126:1281`, `126:1395`, `126:1484`, `126:1594`.
- Ghi lại nhãn nút trong action bar, vì nhãn nằm trong component instance nên metadata không có chữ.
- Đọc lại `AddHotelPage.jsx` (739 dòng) để giữ những phần UI dùng lại được.

## Files to Create

- `listingFormModel.js`: hàm thuần, không phụ thuộc React.
- `ListingStepper.jsx`
- `BasicInfoStep.jsx`
- `PriceAmenitiesStep.jsx`
- `MediaStep.jsx`
- `MapStep.jsx`, `useGoogleMaps.js`
- `SubmitChecklist.jsx`
- `ListingEditor.jsx`: khung điều phối dùng cho cả 2 chế độ; Phase 6 và 7 bổ sung luồng.
- Test: `src/pages/host/__tests__/listingFormModel.test.js`, `MediaStep.test.jsx`, `MapStep.test.jsx`

## Thiết kế

### `listingFormModel.js`

- **`emptyValues()`:** `{ tenCSLT: '', maLoai: '', maPhuong: '', diaChiChiTiet: '', moTa: '', lienHe: { soDienThoai: '', zalo: '', facebook: '' }, gia: '', maTienIch: [], latitude: '', longitude: '' }`.
- **`toFormValues(detail)`:** chuyển từ `GET /host/listings/:maCSLT`. Giá trị null đổi thành `''`.
- **`toPayload(values, mode)`:**
  - Trim chuỗi; đổi `maLoai`, `maPhuong`, `gia`, `latitude`, `longitude` sang số.
  - `mode='create'`: bỏ trường tùy chọn còn rỗng.
  - `mode='update'`: trường tùy chọn rỗng gửi `null` để xóa (PUT thay toàn bộ).
  - `lienHe` rỗng hoàn toàn: `create` bỏ hẳn, `update` gửi `null` cho từng khóa.
- **`validateStep(step, values, options)`** trả `{ [fieldPath]: message }`. Câu chữ lấy đúng Figma 12.2 nếu Figma có:

  | Trường | Quy tắc | Thông báo |
  |---|---|---|
  | `tenCSLT` | bắt buộc, ≤150 | "Vui lòng nhập tên cơ sở lưu trú" / "Tối đa 150 ký tự" |
  | `maLoai` | bắt buộc, phải có trong `propertyTypes` | "Vui lòng chọn loại hình" |
  | `maPhuong` | bắt buộc, phải có trong `wards` | "Vui lòng chọn phường/xã" |
  | `diaChiChiTiet` | bắt buộc, ≤200 | "Vui lòng nhập địa chỉ cụ thể" |
  | `lienHe.soDienThoai` | tùy chọn, `^0\d{9}$` (bỏ khoảng trắng trước khi kiểm) | "Số điện thoại phải gồm đúng 10 chữ số" |
  | `lienHe.zalo` | tùy chọn: số `^0\d{9}$` hoặc link `^(https://)?zalo\.me/.+` | "Nhập số Zalo hoặc link zalo.me" |
  | `lienHe.facebook` | tùy chọn, `^https://(www\.)?facebook\.com/.+` | "Link phải bắt đầu bằng https://facebook.com/" |
  | `gia` | tùy chọn khi lưu nháp; nếu có thì là số nguyên trong `priceRange` (mặc định 500.000–100.000.000) | "Giá phải từ {min} đến {max} VNĐ" |
  | `latitude` / `longitude` | nhập đủ cả hai hoặc bỏ trống cả hai; phải nằm trong `mapBounds` (mặc định 12.1–12.45 / 109.1–109.3) | "Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang." (đúng sheet Error Format) |

- **`computeChecklist(values, mediaSummary, options)`:** 7 mục, khóa trùng `checklistGuiDuyet` của API.

  | Khóa | Nhãn |
  |---|---|
  | `ten` | Tên cơ sở |
  | `diaChi` | Địa chỉ cụ thể |
  | `phuong` | Phường/Xã |
  | `toaDo` | Tọa độ trong khu vực Nha Trang |
  | `anhToiThieu3` | Ít nhất 3 ảnh |
  | `tienIchToiThieu1` | Ít nhất 1 tiện ích |
  | `gia` | Giá hợp lệ (D1, Figma ghi "Khoảng giá hợp lệ") |

- **`isDirty(values, baseline)`:** so sánh sâu.
- **`fieldPathFromServer(field)`:** ánh xạ `details[].field` của API (ví dụ `lienHe.soDienThoai`, `gia`) sang ô nhập và bước chứa nó.

### `ListingStepper.jsx` (Figma 12.1 / 12.3)

- 4 bước: Thông tin cơ bản, Giá & tiện ích, Hình ảnh & video, Bản đồ.
- Mỗi bước có trạng thái:
  - "Đang nhập": bước đang mở;
  - "Đã xong": bước đã hợp lệ theo dữ liệu đã lưu;
  - "Chưa nhập";
  - "Mở sau khi lưu bước 1": bị khóa khi chưa có `maCSLT`.
- Dòng phụ: `Bước {n}/4 · {tên bước}`.
- Bước bị khóa: `aria-disabled`, có tooltip. Dùng `<nav aria-label>` và đặt `aria-current="step"` cho bước đang mở.

### `BasicInfoStep.jsx` (12.1 / 12.2 / 13.1)

- Tiêu đề "Thông tin cơ bản", ghi chú "Các trường có dấu * là bắt buộc".
- Tên cơ sở lưu trú * (bộ đếm `{n}/150`, placeholder "Ví dụ: Sea Breeze Homestay").
- Loại hình * (select từ `propertyTypes`).
- Tỉnh/Thành phố * "Khánh Hòa" và Quận/Huyện * "TP. Nha Trang": cố định, disabled.
- Phường/Xã * (select từ `wards`).
- Địa chỉ cụ thể * (gợi ý "Ví dụ: 12 Trần Phú. Phường/Xã chọn ở ô phía trên.").
- Mô tả (textarea).
- Khối "Kênh liên hệ" (gợi ý "Khách chỉ thấy nút liên hệ khi bạn đã điền thông tin tương ứng"): Số điện thoại, Zalo, Facebook.
- Banner lỗi tổng (12.2): "Chưa lưu được — có {n} trường cần sửa", kèm link nhảy tới ô lỗi đầu tiên (focus + `scrollIntoView`), `role="alert"`.
- Chế độ chỉ đọc (13.3): mọi ô `readOnly`/`disabled`; ô trống hiện "—".

### `PriceAmenitiesStep.jsx` (12.3, theo D1)

- Khối "Giá tham khảo", ghi chú "Đơn vị VNĐ, từ {min} đến {max}".
- **Một ô** "Giá tham khảo *" có hậu tố ₫. Khi gõ thì định dạng hàng nghìn (350.000), state lưu số nguyên.
- Khối "Tiện ích", ghi chú "Chọn ít nhất 1 tiện ích", bộ đếm "{n} đã chọn".
  - Lưới checkbox theo Figma.
  - Nhóm 1 lấy `amenities`. Nhóm 2 "Tiện ích lân cận" lấy `nearbyPlaces`, chỉ hiện nếu API có dữ liệu.

### `MediaStep.jsx` (12.4)

- **Ảnh:**
  - Ghi chú "JPG, PNG, WEBP · tối đa 10MB/ảnh · tối thiểu 3, tối đa 100 ảnh", bộ đếm `{soAnh}/100 ảnh`.
  - Vùng kéo thả "Kéo thả ảnh vào đây" / "hoặc" + nút chọn file (`input type=file multiple accept`).
  - Lưới ảnh; ảnh đầu có nhãn "Ảnh bìa".
  - Ghi chú "Ảnh đầu tiên được dùng làm ảnh bìa. Kéo để đổi thứ tự."
- **Video:** ghi chú "MP4 · tối đa 100MB/video · tối đa 5 video", bộ đếm `{soVideo}/5 video`, mỗi dòng `{tên} · {MB}MB`, nút upload video.
- **Kiểm tra ở client trước khi gửi:**
  - định dạng theo MIME và đuôi file: ảnh `image/jpeg|png|webp`, video `video/mp4`;
  - dung lượng theo `MEDIA_LIMITS`;
  - số chỗ còn trống.
  - File lỗi vẫn hiện trong lưới với nhãn lỗi (ví dụ "Vượt quá 10MB" như Figma), có nút gỡ, không gọi API.
- **Hàng đợi upload:**
  - Tuần tự, mỗi request 1 file (Excel: "1 file/request"); thứ tự upload quyết định `thuTu`.
  - Mỗi mục hiện "Đang tải {p}%" và có nút hủy (`AbortController`).
  - Thành công: thay mục cục bộ bằng media server (`mediaId`, `url`, `thuTu`) và cập nhật `soAnh`/`soVideo` từ response.
- **Lỗi upload từ server:**
  - `MEDIA_LIMIT_EXCEEDED`, `FILE_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE` → lỗi ngay trên mục đó (message API).
  - `LISTING_LOCKED_PENDING`, `LISTING_REMOVED` → dừng hàng đợi, báo lên `ListingEditor` để hiện banner.
- **Xóa media đã lên server:**
  - Gọi `deleteListingMedia` rồi cập nhật `soAnh`/`soVideo`.
  - 409 `MIN_IMAGES_REQUIRED` → toast "Cơ sở cần có tối thiểu 3 ảnh."
  - 404 `MEDIA_NOT_FOUND` → gỡ mục cục bộ và báo editor tải lại chi tiết.
- **Đổi thứ tự (D3):**
  - Kéo thả HTML5 trên desktop, kèm nút "Đặt làm ảnh bìa" cho bàn phím và mobile.
  - **Chỉ đổi thứ tự cục bộ**, không gọi API.
- **Prop `onBeforeMediaChange()`:** trả Promise<boolean>. Editor dùng prop này để hỏi xác nhận với CSLT Đã duyệt (red-team #3).
- **Prop `readOnly`:** ẩn vùng upload, nút xóa và kéo thả.
- Thu hồi `URL.createObjectURL` khi gỡ mục hoặc unmount.

### `MapStep.jsx` + `useGoogleMaps.js` (12.5)

- **`useGoogleMaps()`** đọc `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
  - Không có key → `status: 'no-key'`.
  - Có key → chèn script `https://maps.googleapis.com/maps/api/js?key=…&v=weekly&libraries=marker&loading=async&callback=…` **một lần cho cả app** (promise cấp module), trả `'loading' | 'ready' | 'error'`.
- **Bản đồ:**
  - Tâm là tọa độ hiện có, chưa có thì lấy `NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER`.
  - `restriction` theo `mapBounds`; tắt UI mặc định, dùng nút +/− riêng như Figma.
  - Ghim kéo được: `AdvancedMarkerElement`, `gmpDraggable`, `mapId: 'DEMO_MAP_ID'`.
  - Kéo ghim hoặc click lên bản đồ thì cập nhật lat/lng (làm tròn 6 chữ số).
- **Ô "Tìm địa chỉ":** dùng `google.maps.Geocoder` với `bounds` Nha Trang, `region: 'vn'`. Có kết quả thì dời ghim, không có thì báo "Không tìm thấy địa chỉ".
- **Hai ô Vĩ độ (lat), Kinh độ (lng):** nhập tay được, đồng bộ hai chiều với ghim.
  - Hợp lệ: "Vị trí hợp lệ — nằm trong khu vực Nha Trang".
  - Không hợp lệ: lỗi ở bảng validate.
- **Fallback** khi `no-key` hoặc `error`: khung "Không tải được bản đồ. Bạn vẫn có thể nhập vĩ độ, kinh độ.", hai ô nhập tay vẫn dùng được.

### `SubmitChecklist.jsx` (panel bên phải; mobile đặt dưới form)

- "Điều kiện gửi kiểm duyệt", `{n}/7 đã hoàn thành`, thanh tiến độ, 7 dòng "Đã xong" / "Còn thiếu".
- Chữ ở chân panel đúng Figma:

  | Tình huống | Chữ |
  |---|---|
  | Chưa có `maCSLT` | "Hoàn thành 7 điều kiện bên phải để gửi kiểm duyệt" |
  | `n < 7` | "Còn {7-n} điều kiện chưa hoàn thành" |
  | `n = 7` | "Đã đủ điều kiện — sau khi gửi, bạn không thể chỉnh sửa cho đến khi có kết quả duyệt" |
  | Đang gửi | "Đang gửi yêu cầu kiểm duyệt…" |

- Lỗi 422 từ server: liệt kê `details[]` dưới panel (`role="alert"`) và đánh dấu "Còn thiếu" các mục tương ứng.
- **Nguồn dữ liệu:** form chưa sửa gì thì dùng `checklistGuiDuyet` của server; đang sửa thì dùng `computeChecklist`.

### `ListingEditor.jsx` (khung, Phase 5 chỉ dựng phần chung)

- **Props:** `{ mode: 'create' | 'edit', maCSLT, initialStep }`.
- **Tải song song:**
  - `getFilterOptions()`;
  - `getHostListingDetail(maCSLT)` nếu đã có `maCSLT`.
  - Mỗi lời gọi có `AbortController`; state chỉ set sau `await`.
  - `/filter-options` lỗi → `ErrorState` + Thử lại (không có danh mục thì form không dùng được).
- **State:** `options`, `detail`, `values`, `baseline`, `step`, `fieldErrors`, `banner`, `isSaving`, `isSubmitting`, `readOnly`.
- **Bố cục:**
  - Breadcrumb; dòng tiêu đề (tên + `StatusBadge` + dòng phụ);
  - vùng banner; stepper; form card của bước hiện tại;
  - panel checklist; action bar (desktop ở cuối form, mobile bám đáy).
- **Chặn rời trang:** `beforeunload` khi `isDirty`. Không dùng `useBlocker` (A6).
- Các hàm `save`, `submit` và quy tắc theo trạng thái được thêm ở Phase 6 và 7.

## Test Matrix

`listingFormModel.test.js`

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| MODEL-01 | `validateStep(1)` với form trống | Đủ lỗi tên, loại hình, phường, địa chỉ, đúng câu chữ |
| MODEL-02 | SĐT `09051234` / `0905 123 456` | Lỗi "Số điện thoại phải gồm đúng 10 chữ số" / hợp lệ |
| MODEL-03 | Facebook `facebook.com/x` / `https://facebook.com/x` | Lỗi Figma / hợp lệ |
| MODEL-04 | Zalo `0905123456`, `zalo.me/0905123456`, `abc` | Hợp lệ, hợp lệ, lỗi |
| MODEL-05 | Giá `400000` với `priceRange` mặc định | Lỗi "Giá phải từ 500.000 đến 100.000.000 VNĐ" |
| MODEL-06 | Chỉ nhập lat / nằm ngoài bounds | Lỗi tương ứng |
| MODEL-07 | `toPayload(create)` | Số đúng kiểu, chuỗi đã trim, trường tùy chọn rỗng bị bỏ |
| MODEL-08 | `toPayload(update)` | Trường tùy chọn rỗng thành `null` |
| MODEL-09 | `computeChecklist` | Đủ 7 khóa trùng `checklistGuiDuyet`, đúng true/false |
| MODEL-10 | `toFormValues(detail)` rồi `toPayload` | Khứ hồi không mất dữ liệu |

`MediaStep.test.jsx` (mock `hostApi`)

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| MED-01 | Chọn ảnh 11MB / file `.gif` | Hiện lỗi trên mục, không gọi `uploadListingMedia` |
| MED-02 | Chọn 3 ảnh hợp lệ | Gọi `uploadListingMedia` **tuần tự** 3 lần, `type: 'IMAGE'`; tiến độ "Đang tải 50%" hiện khi `onProgress(50)` |
| MED-03 | Hủy khi đang tải | `signal.aborted === true`; mục bị gỡ; hàng đợi chạy tiếp file sau |
| MED-04 | Server trả 413 `FILE_TOO_LARGE` | Lỗi trên mục bằng message API |
| MED-05 | Server trả 409 `LISTING_LOCKED_PENDING` | Hàng đợi dừng; gọi callback báo editor |
| MED-06 | Xóa ảnh đã lên server | Gọi `deleteListingMedia(12, 7)`; bộ đếm cập nhật theo response |
| MED-07 | Xóa bị 409 `MIN_IMAGES_REQUIRED` | Toast "Cơ sở cần có tối thiểu 3 ảnh." |
| MED-08 | Đã đủ 100 ảnh | Vùng upload ảnh bị disabled |
| MED-09 | "Đặt làm ảnh bìa" | Thứ tự cục bộ đổi, ảnh đó có nhãn "Ảnh bìa"; **không** gọi API |
| MED-10 | `onBeforeMediaChange` trả false | Không upload, không xóa |
| MED-11 | `readOnly` | Không có vùng upload, nút xóa, kéo thả |
| MED-12 | Video 48MB `.mp4` | Upload với `type: 'VIDEO'`; dòng hiện "… · 48MB" |

`MapStep.test.jsx`

| ID | Trường hợp | Kỳ vọng |
|---|---|---|
| MAP-01 | Không có `VITE_GOOGLE_MAPS_API_KEY` | Không chèn script; hiện fallback và 2 ô nhập tay |
| MAP-02 | Nhập 12.2388 / 109.1967 | Thông báo "Vị trí hợp lệ — nằm trong khu vực Nha Trang"; gọi `onChange` với số |
| MAP-03 | Nhập 10.77 / 106.70 | Lỗi ngoài khu vực |
| MAP-04 | Có key (stub env) | Chèn script đúng 1 lần dù mount 2 lần; script lỗi thì hiện fallback |
| MAP-05 | `google` giả: gọi handler kéo ghim | lat/lng cập nhật, làm tròn 6 chữ số |

## Tasks & Steps

- [x] Lấy design context các node đã liệt kê; ghi nhãn nút action bar vào phase file.
- [x] Viết test MODEL, MED, MAP. Chạy, phải đỏ.
- [x] Viết `listingFormModel.js` → MODEL xanh.
- [x] Viết `MediaStep.jsx` → MED xanh.
- [x] Viết `useGoogleMaps.js` và `MapStep.jsx` → MAP xanh.
- [x] Viết `ListingStepper`, `BasicInfoStep`, `PriceAmenitiesStep`, `SubmitChecklist`, khung `ListingEditor`.

## Nhãn nút đã đọc từ Figma (2026-11-01)

| Frame | Nút |
|---|---|
| 12.1 (trong thẻ) | "Lưu tạo mới" + chữ "Lưu để nhận mã cơ sở và mở khóa bước 2–4" |
| 12.1–12.6 (thanh dưới) | "Lưu nháp", "Gửi kiểm duyệt" |
| 13.1 / 13.2 (thanh dưới) | "Hủy", "Lưu thay đổi" |
| 13.2 (dialog) | "Quay lại", "Vẫn lưu" |
| 13.4 (thanh dưới) | "Hủy", "Gửi kiểm duyệt lại" |
| 11.3 (dialog) | "Hủy", "Xóa cơ sở" |
| 11.1b (thanh chọn) | "Bỏ chọn", "Xóa {n} cơ sở" |

## Verification

- `npx vitest run src/pages/host/__tests__/listingFormModel.test.js src/pages/host/__tests__/MediaStep.test.jsx src/pages/host/__tests__/MapStep.test.jsx` → pass.
- `npx oxlint src/pages/host/components` → 0 cảnh báo.

## Risk Assessment

- **Không có key Google Maps:** form vẫn dùng được nhờ fallback nhập tay. Khi có key thì thêm vào `.env` (file không commit).
- **`DEMO_MAP_ID` chỉ dành cho dev:** khi lên production cần Map ID thật (ghi chú team).
- **Thứ tự ảnh (D3) không được lưu:** tải lại trang thì về thứ tự theo `thuTu`. Đã báo BE (câu hỏi #5).
- **Kiểm tra định dạng ở client chỉ để báo sớm:** server mới là bên kiểm định dạng thật (ghi chú Excel), lỗi 415 từ server vẫn được hiển thị.
