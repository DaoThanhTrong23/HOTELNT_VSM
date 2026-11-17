import fs from 'node:fs';
import { afterAll, beforeAll, inject } from 'vitest';
import { Builder, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import edge from 'selenium-webdriver/edge.js';
import firefox from 'selenium-webdriver/firefox.js';
import { SCREENSHOTS_DIR, caseIdOf, screenshotPathOf, stepDirOf, stepShotPathOf } from './paths.js';
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

// Extra height needed to show the whole page. The Host layout scrolls inside a container (h-dvh + overflow-y-auto),
// so the document height alone is not enough: the tallest overflow of any scroll container counts too. The window
// is grown by this amount (the browser frame makes the viewport smaller than the window).
const readMissingHeight = () => {
  const overflow = [...document.querySelectorAll('*')].reduce((max, el) => {
    const { overflowY } = getComputedStyle(el);
    return /(auto|scroll)/.test(overflowY) ? Math.max(max, el.scrollHeight - el.clientHeight) : max;
  }, 0);
  return Math.max(document.documentElement.scrollHeight, window.innerHeight + overflow) - window.innerHeight;
};

const allImagesLoaded = () => [...document.images].every((img) => img.complete);
// Every page of the app shows "Đang tải ..." while its data loads.
const pageLoaded = () => !document.body.innerText.includes('Đang tải');

// Waits for the page data, grows the window to the full page height, waits for images, shoots, restores 1440×900.
const saveFullPage = async (driver, file) => {
  await driver.wait(() => driver.executeScript(pageLoaded), 8000).catch(() => {});
  const missing = Math.min(Math.max(0, await driver.executeScript(readMissingHeight)), 8000);
  await driver.manage().window().setRect({ ...WINDOW, height: WINDOW.height + missing });
  await driver.wait(() => driver.executeScript(allImagesLoaded), 3000).catch(() => {});
  fs.mkdirSync(stepDirOf(caseIdOf(file.caseName)), { recursive: true });
  fs.writeFileSync(file.path, await driver.takeScreenshot(), 'base64');
  await driver.manage().window().setRect(WINDOW);
};

// One browser per spec file. session.start(context) begins a case: soft checks plus a screenshot on failure.
// session.shot(label) saves a full-page screenshot of the current step under reports/steps/<case>/.
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
    const caseId = caseIdOf(task.name);
    onTestFailed(() => saveScreenshot(session.driver, caseId));
    fs.rmSync(stepDirOf(caseId), { recursive: true, force: true });
    session.step = { caseName: task.name, count: 0 };
    return createSoftCheck(task, { target: session.target });
  };

  // A failed screenshot never fails the case; it is only missing from the folder.
  session.shot = async (label) => {
    const { caseName } = session.step;
    session.step.count += 1;
    const file = { caseName, path: stepShotPathOf(caseIdOf(caseName), session.step.count, label) };
    await saveFullPage(session.driver, file).catch(() => session.driver.manage().window().setRect(WINDOW).catch(() => {}));
  };

  return session;
};
