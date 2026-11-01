import { describe, it, expect } from 'vitest';
import {
  CHECKLIST_ITEMS,
  checklistKeysFromDetails,
  computeChecklist,
  emptyValues,
  fieldPathFromServer,
  formatThousands,
  isDirty,
  parseDigits,
  resolveOptions,
  submitHint,
  toFormValues,
  toPayload,
  validateStep,
} from '../components/listing-form/listingFormModel';

const OPTIONS = resolveOptions({
  wards: [{ maPhuong: 5, tenPhuong: 'Lộc Thọ' }],
  propertyTypes: [{ maLoai: 2, tenLoai: 'Homestay' }],
  amenities: [{ maTienIch: 1, tenTienIch: 'Wifi' }],
});

const filled = (overrides = {}) => ({
  ...emptyValues(),
  tenCSLT: '  Nhà Biển Xanh ',
  maLoai: '2',
  maPhuong: '5',
  diaChiChiTiet: '12 Trần Phú',
  ...overrides,
  lienHe: { ...emptyValues().lienHe, ...(overrides.lienHe ?? {}) },
});

const DETAIL = {
  maCSLT: 12,
  tenCSLT: 'Nhà Biển Xanh',
  maLoai: 2,
  maPhuong: 5,
  diaChiChiTiet: '12 Trần Phú',
  moTa: null,
  latitude: 12.2388,
  longitude: 109.1967,
  gia: 650000,
  lienHe: { soDienThoai: '0905123456', zalo: null, facebook: 'https://facebook.com/nhabienxanh' },
  maTienIch: [1, 3],
};

describe('listingFormModel', () => {
  it('MODEL-01: step 1 reports every required field with Figma copy', () => {
    expect(validateStep(1, emptyValues(), OPTIONS)).toEqual({
      tenCSLT: 'Vui lòng nhập tên cơ sở lưu trú',
      maLoai: 'Vui lòng chọn loại hình',
      maPhuong: 'Vui lòng chọn phường/xã',
      diaChiChiTiet: 'Vui lòng nhập địa chỉ cụ thể',
    });
    expect(validateStep(1, filled({ tenCSLT: 'a'.repeat(151) }), OPTIONS).tenCSLT).toBe('Tối đa 150 ký tự');
    expect(validateStep(1, filled({ maLoai: '99' }), OPTIONS).maLoai).toBe('Vui lòng chọn loại hình');
  });

  it('MODEL-02: phone must be exactly 10 digits (spaces allowed)', () => {
    expect(validateStep(1, filled({ lienHe: { soDienThoai: '09051234' } }), OPTIONS)['lienHe.soDienThoai']).toBe(
      'Số điện thoại phải gồm đúng 10 chữ số',
    );
    expect(validateStep(1, filled({ lienHe: { soDienThoai: '0905 123 456' } }), OPTIONS)).toEqual({});
  });

  it('MODEL-03: facebook link must start with https://facebook.com/', () => {
    expect(validateStep(1, filled({ lienHe: { facebook: 'facebook.com/x' } }), OPTIONS)['lienHe.facebook']).toBe(
      'Link phải bắt đầu bằng https://facebook.com/',
    );
    expect(validateStep(1, filled({ lienHe: { facebook: 'https://facebook.com/x' } }), OPTIONS)).toEqual({});
  });

  it('MODEL-04: zalo accepts a phone number or a zalo.me link', () => {
    expect(validateStep(1, filled({ lienHe: { zalo: '0905123456' } }), OPTIONS)).toEqual({});
    expect(validateStep(1, filled({ lienHe: { zalo: 'zalo.me/0905123456' } }), OPTIONS)).toEqual({});
    expect(validateStep(1, filled({ lienHe: { zalo: 'abc' } }), OPTIONS)['lienHe.zalo']).toBe('Nhập số Zalo hoặc link zalo.me');
  });

  it('MODEL-05: price must be within priceRange', () => {
    expect(validateStep(2, filled({ gia: 400000 }), OPTIONS).gia).toBe('Giá phải từ 500.000 đến 100.000.000 VNĐ');
    expect(validateStep(2, filled({ gia: 350000 }), resolveOptions({ priceRange: { giaMin: 50000, giaMax: 1000000 } }))).toEqual({});
    expect(validateStep(2, filled({ gia: '' }), OPTIONS)).toEqual({});
  });

  it('MODEL-06: coordinates must be complete and inside Nha Trang', () => {
    expect(validateStep(4, filled({ latitude: '12.2388' }), OPTIONS).toaDo).toBe('Vui lòng nhập đủ cả vĩ độ và kinh độ.');
    expect(validateStep(4, filled({ latitude: '10.77', longitude: '106.70' }), OPTIONS).toaDo).toBe(
      'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.',
    );
    expect(validateStep(4, filled({ latitude: '12.2388', longitude: '109.1967' }), OPTIONS)).toEqual({});
    expect(validateStep(4, filled(), OPTIONS)).toEqual({});
  });

  it('MODEL-07: create payload has typed values and drops empty optional fields', () => {
    expect(toPayload(filled({ lienHe: { soDienThoai: '0905 123 456' }, gia: 350000 }), 'create')).toEqual({
      tenCSLT: 'Nhà Biển Xanh',
      maLoai: 2,
      maPhuong: 5,
      diaChiChiTiet: '12 Trần Phú',
      lienHe: { soDienThoai: '0905123456' },
      gia: 350000,
    });
  });

  it('MODEL-08: update payload sends null for cleared optional fields', () => {
    expect(toPayload(filled(), 'update')).toEqual({
      tenCSLT: 'Nhà Biển Xanh',
      maLoai: 2,
      maPhuong: 5,
      diaChiChiTiet: '12 Trần Phú',
      moTa: null,
      lienHe: { soDienThoai: null, zalo: null, facebook: null },
      gia: null,
      maTienIch: [],
      latitude: null,
      longitude: null,
    });
  });

  it('MODEL-09: checklist has the 7 API keys', () => {
    const empty = computeChecklist(emptyValues(), { soAnh: 0 }, OPTIONS);
    expect(Object.keys(empty).sort()).toEqual(CHECKLIST_ITEMS.map((item) => item.key).sort());
    expect(Object.values(empty).every((value) => value === false)).toBe(true);

    const complete = computeChecklist(toFormValues(DETAIL), { soAnh: 3 }, OPTIONS);
    expect(complete).toEqual(Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.key, true])));
    expect(computeChecklist({ ...toFormValues(DETAIL), gia: 350000 }, { soAnh: 3 }, OPTIONS).gia).toBe(false);
    expect(computeChecklist(toFormValues(DETAIL), { soAnh: 2 }, OPTIONS).anhToiThieu3).toBe(false);
  });

  it('MODEL-10: detail → form → payload keeps every value', () => {
    expect(toPayload(toFormValues(DETAIL), 'update')).toEqual({
      tenCSLT: 'Nhà Biển Xanh',
      maLoai: 2,
      maPhuong: 5,
      diaChiChiTiet: '12 Trần Phú',
      moTa: null,
      lienHe: { soDienThoai: '0905123456', zalo: null, facebook: 'https://facebook.com/nhabienxanh' },
      gia: 650000,
      maTienIch: [1, 3],
      latitude: 12.2388,
      longitude: 109.1967,
    });
  });

  it('MODEL-11: dirty check ignores amenity order and trailing spaces', () => {
    const base = toFormValues(DETAIL);
    expect(isDirty({ ...base, maTienIch: [3, 1], tenCSLT: 'Nhà Biển Xanh  ' }, base)).toBe(false);
    expect(isDirty({ ...base, gia: 400000 }, base)).toBe(true);
  });

  it('MODEL-12: helpers for price input, server fields, checklist details and hints', () => {
    expect(formatThousands(350000)).toBe('350.000');
    expect(parseDigits('350.000đ')).toBe(350000);
    expect(parseDigits('')).toBe('');
    expect(fieldPathFromServer('lienHe.soDienThoai')).toEqual({ path: 'lienHe.soDienThoai', step: 1 });
    expect(fieldPathFromServer('longitude')).toEqual({ path: 'toaDo', step: 4 });
    expect(fieldPathFromServer('gia')).toEqual({ path: 'gia', step: 2 });
    expect(checklistKeysFromDetails([{ field: 'anhToiThieu3' }, { field: 'gia' }, { field: 'x' }])).toEqual(['anhToiThieu3', 'gia']);
    expect(submitHint({ hasListing: false, completed: 0 })).toBe('Hoàn thành 7 điều kiện bên phải để gửi kiểm duyệt');
    expect(submitHint({ hasListing: true, completed: 6 })).toBe('Còn 1 điều kiện chưa hoàn thành');
    expect(submitHint({ hasListing: true, completed: 7 })).toBe(
      'Đã đủ điều kiện — sau khi gửi, bạn không thể chỉnh sửa cho đến khi có kết quả duyệt',
    );
  });
});
