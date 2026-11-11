// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SoftCheckFailure, createSoftCheck, normalizeText, toHex } from '../soft-check.js';

const fakeTask = () => ({ meta: {} });

describe('createSoftCheck', () => {
  it('records the target, every check and the notes on task.meta', async () => {
    const task = fakeTask();
    const soft = createSoftCheck(task, { target: 'mock' });

    await soft.check('Hiển thị nút Xem', () => ({ ok: true, actual: 'Xem, Sửa' }));
    soft.note('Dùng cơ sở mã 3');

    expect(task.meta.target).toBe('mock');
    expect(task.meta.checks).toEqual([{ label: 'Hiển thị nút Xem', ok: true, actual: 'Xem, Sửa' }]);
    expect(task.meta.notes).toEqual(['Dùng cơ sở mã 3']);
    expect(() => soft.assertAll()).not.toThrow();
    expect(task.meta.softFailed).toBeUndefined();
  });

  it('throws SoftCheckFailure listing every failed check and flags the task', async () => {
    const task = fakeTask();
    const soft = createSoftCheck(task, { target: 'mock' });

    await soft.check('Có nút "Xác nhận rút"', async () => ({ ok: false, actual: 'Nút hiện có: Hủy, Rút lại' }));
    await soft.check('Nhãn đúng màu', () => ({ ok: true, actual: '#15803D' }));
    await soft.check('Màu cảnh báo', () => ({ ok: false, actual: '#000000' }));

    let thrown;
    try {
      soft.assertAll();
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SoftCheckFailure);
    expect(thrown.name).toBe('SoftCheckFailure');
    expect(thrown.message).toContain('2/3');
    expect(thrown.message).toContain('Có nút "Xác nhận rút": Nút hiện có: Hủy, Rút lại');
    expect(thrown.message).toContain('Màu cảnh báo: #000000');
    expect(task.meta.softFailed).toBe(true);
  });

  it('records a check that throws as failed and keeps running the next ones', async () => {
    const task = fakeTask();
    const soft = createSoftCheck(task, { target: 'backend' });

    await soft.check('Có icon ổ khóa', () => {
      throw new Error('no such element: Unable to locate element\n  (Session info: chrome=157)');
    });
    await soft.check('Ô Email chỉ đọc', () => ({ ok: true, actual: 'readonly' }));

    expect(task.meta.checks).toEqual([
      { label: 'Có icon ổ khóa', ok: false, actual: 'Lỗi khi kiểm: no such element: Unable to locate element' },
      { label: 'Ô Email chỉ đọc', ok: true, actual: 'readonly' },
    ]);
    expect(() => soft.assertAll()).toThrow(SoftCheckFailure);
  });

  it('fails assertAll when no check ran, so an empty test cannot pass', () => {
    const soft = createSoftCheck(fakeTask(), { target: 'mock' });
    expect(() => soft.assertAll()).toThrow('Không có ý nào được kiểm');
  });
});

describe('toHex', () => {
  it('converts computed colors to upper-case hex', () => {
    expect(toHex('rgb(180, 83, 9)')).toBe('#B45309');
    expect(toHex('rgba(220, 38, 38, 1)')).toBe('#DC2626');
    expect(toHex('rgb(21 128 61)')).toBe('#15803D');
    expect(toHex('color(srgb 0.862745 0.14902 0.14902)')).toBe('#DC2626');
  });

  it('reports transparent and unknown formats as they are', () => {
    expect(toHex('rgba(0, 0, 0, 0)')).toBe('transparent');
    expect(toHex('oklch(0.5 0.1 30)')).toBe('oklch(0.5 0.1 30)');
  });
});

describe('normalizeText', () => {
  it('collapses spaces and drops the final period', () => {
    expect(normalizeText('  Xóa\n cơ sở. ')).toBe('Xóa cơ sở');
    expect(normalizeText('Mật khẩu cũ không chính xác.')).toBe('Mật khẩu cũ không chính xác');
    expect(normalizeText(null)).toBe('');
  });

  it('compares composed and decomposed Vietnamese the same way', () => {
    expect(normalizeText('Xóa')).toBe(normalizeText('Xóa'));
  });
});
