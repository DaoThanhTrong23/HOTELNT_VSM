import fs from 'node:fs';
import path from 'node:path';
import { REPORTS_DIR, caseIdOf, screenshotPathOf } from './paths.js';
import { buildSheetRows, toCsv } from './sheet-rows.js';

// Writes e2e/reports/host-results.csv at the end of every run: columns Test Case#, Actual Result, Status, Notes,
// ready to paste next to the matching Test Case# rows of the "TC - Host (Chủ cơ sở)" tab.
const OUTPUT = path.join(REPORTS_DIR, 'host-results.csv');
const ROOT = path.resolve(REPORTS_DIR, '../..');

const toCase = (test, moduleErrors) => {
  const result = test.result();
  const screenshot = screenshotPathOf(caseIdOf(test.name));
  return {
    name: test.name,
    state: result.state,
    // A failing beforeAll (browser did not start) skips the tests and reports the error on the module.
    errors: (result.errors?.length ? result.errors : moduleErrors).map((error) => ({ message: error.message })),
    meta: test.meta(),
    screenshot: fs.existsSync(screenshot) ? path.relative(ROOT, screenshot) : undefined,
  };
};

export default class SheetReporter {
  onTestRunEnd(testModules) {
    const cases = testModules.flatMap((testModule) => {
      const moduleErrors = testModule.errors();
      return [...testModule.children.allTests()].map((test) => toCase(test, moduleErrors));
    });
    const rows = buildSheetRows(cases, { target: process.env.E2E_TARGET || 'mock' });
    if (rows.length === 0) {
      console.log(`\nLần chạy này không có case TC_ nào, giữ nguyên ${path.relative(ROOT, OUTPUT)}`);
      return;
    }
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT, toCsv(rows));
    console.log(`\nKết quả cho sheet: ${path.relative(ROOT, OUTPUT)} (${rows.length} case)`);
  }
}
