import { caseIdOf } from './paths.js';

// Same headers as the result columns of the "TC - Host (Chủ cơ sở)" tab.
export const SHEET_COLUMNS = ['Test Case#', 'Actual Result', 'Status', 'Notes'];

const firstLine = (message) => String(message ?? '').split('\n')[0].trim();

// Mock runs keep "(mock)" in the status: a mock Pass is not the official Pass, which needs the backend.
const statusOf = ({ state, errors, meta }, target) => {
  const suffix = target === 'backend' ? '' : ' (mock)';
  if (state === 'passed') return `Pass${suffix}`;
  if (state === 'failed') return meta.softFailed ? `Fail${suffix}` : 'Error';
  return errors.length ? 'Error' : 'Not Run';
};

const actualOf = ({ errors, meta }, status) => {
  const checks = meta.checks ?? [];
  if (status.startsWith('Pass')) return `Đúng như kỳ vọng (${checks.length}/${checks.length} ý)`;
  if (status.startsWith('Fail')) {
    return checks
      .filter((check) => !check.ok)
      .map((check) => `${check.label}: ${check.actual}`)
      .join('; ');
  }
  return errors.length ? firstLine(errors[0].message) : '';
};

// cases: [{ name, state, errors: [{ message }], meta, screenshot? }] taken from the Vitest results.
export const buildSheetRows = (cases, { target = 'mock' } = {}) =>
  cases
    .filter((item) => item.name.startsWith('TC_'))
    .map((item) => {
      const normalized = { errors: [], ...item, meta: item.meta ?? {} };
      const status = statusOf(normalized, normalized.meta.target ?? target);
      const notes = (normalized.meta.notes ?? []).map((note) => note.replace(/\.$/, ''));
      if (!status.startsWith('Pass') && normalized.screenshot) notes.push(`Ảnh: ${normalized.screenshot}`);
      return {
        'Test Case#': caseIdOf(item.name),
        'Actual Result': actualOf(normalized, status),
        Status: status,
        Notes: notes.join('; '),
      };
    })
    .sort((a, b) => a['Test Case#'].localeCompare(b['Test Case#'], 'en', { numeric: true }));

const csvField = (value) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// UTF-8 BOM so Excel and Google Sheets read the Vietnamese text correctly.
export const toCsv = (rows) =>
  `﻿${[SHEET_COLUMNS, ...rows.map((row) => SHEET_COLUMNS.map((column) => row[column]))]
    .map((fields) => fields.map(csvField).join(','))
    .join('\r\n')}\r\n`;
