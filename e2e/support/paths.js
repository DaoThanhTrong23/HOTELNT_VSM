import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Shared by the specs, the global setup and the reporter (the last two run outside the test workers).
export const REPORTS_DIR = fileURLToPath(new URL('../reports/', import.meta.url));
export const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots');

// "TC_HDB_01: ..." → "TC_HDB_01"
export const caseIdOf = (testName) => testName.split(':')[0].trim();
export const screenshotPathOf = (caseId) => path.join(SCREENSHOTS_DIR, `${caseId}.png`);
