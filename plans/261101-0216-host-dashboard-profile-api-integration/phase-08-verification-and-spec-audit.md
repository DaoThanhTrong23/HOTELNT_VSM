---
phase: 8
title: "Kiểm tra tổng & đối chiếu Excel/Figma"
status: pending
priority: P1
effort: "1.5h"
dependencies: [2, 4, 6, 7]
---

# Phase 8: Kiểm tra tổng & đối chiếu Excel/Figma

## Goal

Chứng minh bằng lệnh chạy được rằng:
- 13 endpoint và mọi mã lỗi thuộc phạm vi đều đã được nối và có test;
- 4 màn khớp Figma, trừ các quyết định D1–D5;
- không còn dữ liệu giả;
- không có file nào ngoài `src/pages/host/` bị đụng tới.

## Files to Create / Modify

Không sửa code. Chỉ cập nhật checkbox và `## Validation Log` trong `plan.md`.

## Tasks & Steps

- [x] Chạy toàn bộ test, lint, build (xem mục Verification).
- [x] Đối chiếu Excel → test theo 2 bảng dưới, đánh dấu ✓ khi test tương ứng đã xanh.
- [x] Đối chiếu Figma:
  - chạy `npm run dev` (cổng mặc định 5173);
  - với mỗi frame trong bảng Figma, so giao diện với `get_screenshot` của node đó, ở cả desktop 1440px và mobile 402px;
  - ghi lại chỗ lệch;
  - xong thì dừng dev server vừa bật.
  - Chưa có BE thì các trang hiện `ErrorState`. Để xem đủ trạng thái, dùng các test render, không thêm mock server.
- [x] Kiểm tra ranh giới file.
- [ ] Gửi team mục "Câu hỏi cần gửi BE" và "Ghi chú gửi team" trong `plan.md`. Chỉ gửi ghi chú, không sửa file của người khác.

## Bảng đối chiếu Excel → test

| Endpoint | Test hợp đồng | Test giao diện |
|---|---|---|
| `GET /host/profile` | SVC-01 | PROF-01..04 |
| `PATCH /host/profile` | SVC-02, SVC-03 | PROF-05..13 |
| `POST /host/profile/change-password` | SVC-04 | PWD-01..07 |
| `GET /host/listings` | SVC-05, SVC-06 | DASH-01..14 |
| `DELETE /host/listings/:maCSLT` | SVC-14 | ACT-06..12 |
| `POST …/withdraw` | SVC-13 | ACT-04, ACT-05, EDIT-07 |
| `GET /filter-options` | SVC-15 | ADD-01, ADD-02 |
| `POST /host/listings` | SVC-08 | ADD-03..05 |
| `GET /host/listings/:maCSLT` | SVC-07 | ADD-06, ADD-07, EDIT-01..03 |
| `PUT /host/listings/:maCSLT` | SVC-09 | ADD-08, ADD-09, ADD-11, EDIT-04, EDIT-10, EDIT-11 |
| `POST …/media` | SVC-10, SVC-17 | MED-01..05, MED-12, EDIT-05 |
| `DELETE …/media/:mediaId` | SVC-11 | MED-06, MED-07 |
| `POST …/submit-review` | SVC-12, SVC-17 | ADD-10..12, EDIT-08 |

| Mã lỗi | Test |
|---|---|
| VALIDATION_ERROR | SVC-03, SVC-16, PROF-11, PWD-07, ADD-05 |
| ACCOUNT_DUPLICATED | ERR-01, PROF-10 |
| FIELD_NOT_EDITABLE | SVC-02 (không bao giờ gửi `email`/`cccd`) |
| OLD_PASSWORD_INCORRECT | PWD-06 |
| ACCOUNT_LOCKED | PROF-04, DASH-13 |
| NOT_OWNER | EDIT-01 |
| LISTING_NOT_FOUND | EDIT-02 |
| LOCATION_OUT_OF_RANGE | MODEL-06, ADD-09 |
| LISTING_LOCKED_PENDING | MED-05, EDIT-10 |
| LISTING_REMOVED | EDIT-11 |
| LISTING_NOT_DELETABLE | ACT-08, ACT-11 |
| INVALID_STATE_TRANSITION | ACT-05 |
| CHECKLIST_INCOMPLETE | SVC-17, ADD-12 |
| MEDIA_LIMIT_EXCEEDED / FILE_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE | MED-01, MED-04, SVC-17 |
| MEDIA_NOT_FOUND / MIN_IMAGES_REQUIRED | MED-06, MED-07 |
| TOKEN_INVALID (401) | Interceptor sẵn có; ERR-02 kiểm phần suy mã theo status |
| INTERNAL_ERROR / NETWORK_ERROR / TIMEOUT | ERR-02..04, PROF-12, DASH-12, ADD-02 |

## Bảng đối chiếu Figma

| Frame | Node | Kiểm |
|---|---|---|
| 11.1 / M11.1 | `72:4664` / `126:694` | Tab + số đếm, bảng 8 cột, nhãn nút theo trạng thái, phân trang |
| 11.1b / M11.1b | `72:4946` / `126:810` | Thanh "Đã chọn n cơ sở…", checkbox `indeterminate` |
| 11.2 / M11.2 | `72:5237` / `126:918` | Chữ ở trạng thái trống |
| 11.3 / M11.3 | `72:5274` / `126:947` | Modal / bottom sheet xóa |
| 12.1–12.6 / M12.x | `79:11549`, `72:5846`, `72:6051`, `72:6238`, `72:6407`, `72:6562` | Stepper, câu lỗi, giá (D1), tiện ích, media (D3), bản đồ, checklist, toast |
| 13.1–13.5 / M13.x | `72:6726`, `72:6907`, `72:7103`, `72:7276`, `72:7463` | Dòng phụ, banner, chỉ đọc, cảnh báo, 403 |
| Hồ sơ | `153:1039` / `161:1468` | Avatar, lưới 2 cột (D2), 3 ô mật khẩu |

## Verification

```bash
npx vitest run                                    # toàn bộ test pass
npm run lint                                      # 0 lỗi; 0 cảnh báo mới ở src/pages/host/**
npm run build                                     # build pass
grep -rnE "MOCK_HOST_HOTELS|Nguyễn Văn Quân|0905123456|056098765432|Mường Thanh|unsplash|alert\(|window\.confirm" src/pages/host --include='*.jsx' | grep -v __tests__   # không có kết quả
git diff --name-only 2332ce8 -- . ':!plans'       # chỉ có file trong src/pages/host/
```

## Risk Assessment

- **Khi có BE thật,** chạy smoke test thủ công bằng tài khoản Host:
  1. Hồ sơ: lưu SĐT, đổi mật khẩu.
  2. Thêm mới: lưu bước 1 → upload 3 ảnh → ghim bản đồ → gửi duyệt.
  3. Dashboard: lọc, tìm, xóa bản nháp.
  4. Cập nhật: sửa CSLT Đã duyệt (có cảnh báo), xem CSLT Chờ duyệt (chỉ đọc).
- **Nếu field thật lệch Excel:** sửa ở `hostApi.js` hoặc `listingFormModel.js`, rồi thêm test cho trường hợp đó.
