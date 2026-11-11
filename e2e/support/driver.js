import fs from 'node:fs';
import { afterAll, beforeAll, inject } from 'vitest';
import { Builder, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import edge from 'selenium-webdriver/edge.js';
import firefox from 'selenium-webdriver/firefox.js';
import { SCREENSHOTS_DIR, caseIdOf, screenshotPathOf } from './paths.js';
import { createSoftCheck } from './soft-check.js';

export const DEFAULT_TIMEOUT = 10000;

// The sheet gives no screen size for these cases; 1440×900 is a desktop layout with the Sidebar visible.
const WINDOW = { x: 0, y: 0, width: 1440, height: 900 };
const BROWSERS = ['chrome', 'firefox', 'MicrosoftEdge', 'safari'];

// E2E_BROWSER picks the browser (Selenium Manager downloads it when missing), E2E_HEADED=1 shows the window.
export const buildDriver = async () => {
  const browser = process.env.E2E_BROWSER || 'chrome';
  if (!BROWSERS.includes(browser)) {
    throw new Error(`E2E_BROWSER="${browser}" không hợp lệ. Dùng một trong: ${BROWSERS.join(', ')}.`);
  }
  const headless = process.env.E2E_HEADED !== '1';
  const size = `--window-size=${WINDOW.width},${WINDOW.height}`;
  const builder = new Builder().forBrowser(browser);

  if (browser === 'chrome') {
    const options = new chrome.Options().addArguments(size);
    if (headless) options.addArguments('--headless=new');
    builder.setChromeOptions(options);
  } else if (browser === 'MicrosoftEdge') {
    const options = new edge.Options().addArguments(size);
    if (headless) options.addArguments('--headless=new');
    builder.setEdgeOptions(options);
  } else if (browser === 'firefox') {
    const options = new firefox.Options().windowSize(WINDOW);
    if (headless) options.addArguments('-headless');
    builder.setFirefoxOptions(options);
  }

  const driver = await builder.build();
  await driver.manage().window().setRect(WINDOW);
  return driver;
};

export const waitFor = (driver, locator, timeout = DEFAULT_TIMEOUT) => driver.wait(until.elementLocated(locator), timeout);

export const waitForUrl = (driver, predicate, timeout = DEFAULT_TIMEOUT) =>
  driver.wait(async () => predicate(new URL(await driver.getCurrentUrl())), timeout);

const saveScreenshot = async (driver, caseId) => {
  if (!driver) return;
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.writeFileSync(screenshotPathOf(caseId), await driver.takeScreenshot(), 'base64');
};

// One browser per spec file. session.start(context) begins a case: soft checks plus a screenshot on failure.
export const browserSession = () => {
  const session = { driver: null, baseUrl: inject('baseUrl'), target: inject('target') };

  beforeAll(async () => {
    if (!session.baseUrl) {
      throw new Error('Không có baseUrl. Chạy bằng: npx vitest run --config e2e/vitest.config.js');
    }
    session.driver = await buildDriver();
  });

  afterAll(async () => {
    await session.driver?.quit();
  });

  session.start = ({ task, onTestFailed }) => {
    onTestFailed(() => saveScreenshot(session.driver, caseIdOf(task.name)));
    return createSoftCheck(task, { target: session.target });
  };

  return session;
};
