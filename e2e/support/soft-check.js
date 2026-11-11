// Soft checks: every point of a test case's Expected Result is checked and recorded on task.meta,
// so a failed case lists all the points that differ from the sheet, not only the first one.

export class SoftCheckFailure extends Error {
  constructor(message) {
    super(message);
    this.name = 'SoftCheckFailure';
  }
}

const firstLine = (message) => String(message ?? '').split('\n')[0].trim();

export const createSoftCheck = (task, { target }) => {
  task.meta.target = target;
  task.meta.checks = [];
  task.meta.notes = [];

  // fn returns { ok, actual }. A throw counts as a failed point; the next checks still run.
  const check = async (label, fn) => {
    let entry;
    try {
      const { ok, actual } = await fn();
      entry = { label, ok: Boolean(ok), actual: String(actual ?? '') };
    } catch (error) {
      entry = { label, ok: false, actual: `Lỗi khi kiểm: ${firstLine(error?.message)}` };
    }
    task.meta.checks.push(entry);
    return entry.ok;
  };

  const note = (text) => {
    task.meta.notes.push(text);
  };

  const assertAll = () => {
    const { checks } = task.meta;
    if (checks.length === 0) throw new Error('Không có ý nào được kiểm.');
    const failed = checks.filter((entry) => !entry.ok);
    if (failed.length === 0) return;
    task.meta.softFailed = true;
    throw new SoftCheckFailure(
      [`${failed.length}/${checks.length} ý không khớp sheet:`, ...failed.map((entry) => `- ${entry.label}: ${entry.actual}`)].join('\n'),
    );
  };

  return { check, note, assertAll };
};

// Text as the sheet would write it: composed Unicode, single spaces, no final period.
export const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .trim();

const hexByte = (value) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0').toUpperCase();

// Computed CSS color (rgb/rgba or color(srgb ...)) to #RRGGBB. Other formats are returned as they are.
export const toHex = (cssColor) => {
  const value = String(cssColor ?? '').trim();
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  const srgb = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  const match = rgb ?? srgb;
  if (!match) return value;

  const alpha = match[4] === undefined ? 1 : parseFloat(match[4]) / (match[4].endsWith('%') ? 100 : 1);
  if (alpha === 0) return 'transparent';
  const scale = srgb ? 255 : 1;
  return `#${[match[1], match[2], match[3]].map((channel) => hexByte(parseFloat(channel) * scale)).join('')}`;
};
