import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Selenium E2E for the Host screens: npx vitest run --config e2e/vitest.config.js
// Specs are named *.e2e.js so the unit test run (root vitest.config.js) never opens a browser.
export default defineConfig({
  test: {
    root: fileURLToPath(new URL('..', import.meta.url)),
    include: ['e2e/host/**/*.e2e.js'],
    environment: 'node',
    globalSetup: ['./e2e/global-setup.js'],
    fileParallelism: false,
    testTimeout: 60000,
    // The first run downloads Chrome for Testing through Selenium Manager.
    hookTimeout: 180000,
    reporters: ['default', ['json', { outputFile: 'e2e/reports/results.json' }]],
  },
});
