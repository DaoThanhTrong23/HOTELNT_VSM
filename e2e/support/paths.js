import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Shared by the specs, the global setup and the reporter (the last two run outside the test workers).
export const REPORTS_DIR = fileURLToPath(new URL('../reports/', import.meta.url));
export const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots');
// One folder per case with a full-page screenshot of every step: steps/TC_HDB_06/03-hop-xac-nhan-rut-lai.png
export const STEPS_DIR = path.join(REPORTS_DIR, 'steps');

const slugOf = (label) =>
  label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
export const stepDirOf = (caseId) => path.join(STEPS_DIR, caseId);
export const stepShotPathOf = (caseId, index, label) =>
  path.join(stepDirOf(caseId), `${String(index).padStart(2, '0')}-${slugOf(label)}.png`);

// "TC_HDB_01: ..." → "TC_HDB_01"
export const caseIdOf = (testName) => testName.split(':')[0].trim();
export const screenshotPathOf = (caseId) => path.join(SCREENSHOTS_DIR, `${caseId}.png`);
