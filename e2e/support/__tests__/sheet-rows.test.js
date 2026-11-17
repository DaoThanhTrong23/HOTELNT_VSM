// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SHEET_COLUMNS, buildSheetRows, toCsv } from '../sheet-rows.js';

const passed = (name, target = 'mock') => ({
  name,
  state: 'passed',
  errors: [],
  meta: {
    target,
    checks: [
      { label: 'Ý 1', ok: true, actual: 'a' },
      { label: 'Ý 2', ok: true, actual: 'b' },
    ],
    notes: [],
  },
});

const softFailed = (name, target = 'mock') => ({
  name,
  state: 'failed',
  errors: [{ message: 'SoftCheckFailure: 2/3 ý không khớp sheet:\n- ...' }],
  meta: {
    target,
    softFailed: true,
    checks: [
      { label: "Bấm 'Xác nhận rút'", ok: false, actual: "Không có nút 'Xác nhận rút'" },
      { label: 'Popup hiển thị', ok: true, actual: 'Có' },
      { label: "'Rút lại' màu cảnh báo", ok: false, actual: 'chữ #000000' },
    ],
    notes: ['Dùng cơ sở mã 3'],
  },
  screenshot: 'e2e/reports/screenshots/TC_HDB_06.png',
});

const rowOf = (rows, id) => rows.find((row) => row['Test Case#'] === id);

describe('buildSheetRows', () => {
  it('maps a passed mock case to "Pass (mock)" with the number of points checked', () => {
    const [row] = buildSheetRows([passed('TC_HDB_03: Tìm kiếm')]);
    expect(row).toEqual({
      'Test Case#': 'TC_HDB_03',
      'Actual Result': 'Đúng như kỳ vọng (2/2 ý)',
      Status: 'Pass (mock)',
      Notes: '',
    });
  });

  it('maps a soft failure to "Fail (mock)" listing every failed point with what was seen', () => {
    const [row] = buildSheetRows([softFailed('TC_HDB_06: Rút lại')]);
    expect(row.Status).toBe('Fail (mock)');
    expect(row['Actual Result']).toBe("Bấm 'Xác nhận rút': Không có nút 'Xác nhận rút'; 'Rút lại' màu cảnh báo: chữ #000000");
    expect(row.Notes).toBe('Dùng cơ sở mã 3; Ảnh: e2e/reports/screenshots/TC_HDB_06.png');
  });

  it('maps any other failure (timeout, missing page) to "Error" with the first line of the error', () => {
    const [row] = buildSheetRows([
      {
        name: 'TC_PRF_01: Hồ sơ',
        state: 'failed',
        errors: [{ message: 'TimeoutError: Waiting for element\n    at Driver.wait' }],
        meta: { target: 'mock', checks: [], notes: [] },
      },
    ]);
    expect(row.Status).toBe('Error');
    expect(row['Actual Result']).toBe('TimeoutError: Waiting for element');
  });

  it('drops the "(mock)" suffix when the run targets the backend', () => {
    const rows = buildSheetRows([passed('TC_HDB_04: A', 'backend'), softFailed('TC_HDB_05: B', 'backend')]);
    expect(rows.map((row) => row.Status)).toEqual(['Pass', 'Fail']);
  });

  it('marks skipped cases "Not Run", or "Error" when a hook failed before them', () => {
    const rows = buildSheetRows(
      [
        { name: 'TC_HDB_01: A', state: 'skipped', errors: [], meta: {} },
        { name: 'TC_HDB_02: B', state: 'skipped', errors: [{ message: 'SessionNotCreatedError: Chrome failed to start' }], meta: {} },
      ],
      { target: 'mock' },
    );
    expect(rows.map((row) => [row.Status, row['Actual Result']])).toEqual([
      ['Not Run', ''],
      ['Error', 'SessionNotCreatedError: Chrome failed to start'],
    ]);
  });

  it('keeps only TC_ cases, in sheet order', () => {
    const rows = buildSheetRows([
      passed('TC_PRF_01: P'),
      passed('smoke: dashboard'),
      passed('TC_HDB_10: later'),
      passed('TC_HDB_02: B'),
    ]);
    expect(rows.map((row) => row['Test Case#'])).toEqual(['TC_HDB_02', 'TC_HDB_10', 'TC_PRF_01']);
    expect(rowOf(rows, 'TC_HDB_02')).toBeDefined();
  });
});

describe('toCsv', () => {
  it('writes a UTF-8 BOM, a header and RFC 4180 rows', () => {
    const csv = toCsv([
      { 'Test Case#': 'TC_HDB_06', 'Actual Result': 'Nút "Rút lại", màu đen', Status: 'Fail (mock)', Notes: 'dòng 1\ndòng 2' },
    ]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.slice(1)).toBe(
      `${SHEET_COLUMNS.join(',')}\r\nTC_HDB_06,"Nút ""Rút lại"", màu đen",Fail (mock),"dòng 1\ndòng 2"\r\n`,
    );
  });
});
