import { By, until } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from '../support/driver.js';
import { seedHostSession } from '../support/session.js';

const ROW = By.css('[data-testid="desktop-table-row"]');
// The list wrapper reports aria-busy="false" once a (re)load has finished.
const LIST_READY = By.css('div[aria-busy="false"] > [data-testid="desktop-data-table"], [data-testid="host-empty-state"]');
const LIST_SETTLED = By.css('div[aria-busy], [data-testid="host-empty-state"], [data-testid="error-state"]');
const ERROR_STATE = By.css('[data-testid="error-state"]');
const DIALOG = By.css('[role="alertdialog"]');
const TOAST = By.css('[data-testid="host-toast"]');

// Reads the desktop table in one round trip. Columns are found by their header text.
const readTable = () => {
  const headers = [...document.querySelectorAll('[data-testid="desktop-data-table"] thead th')].map((th) =>
    th.textContent.trim(),
  );
  const rows = [...document.querySelectorAll('[data-testid="desktop-table-row"]')].map((tr) => {
    const cells = [...tr.querySelectorAll(':scope > td')];
    const cell = (name) => cells[headers.indexOf(name)];
    const badge = cell('Trạng thái')?.querySelector('span');
    const actions = tr.querySelector('[data-testid^="actions-"]');
    const image = cells[0]?.querySelector('img');
    return {
      id: actions ? Number(actions.getAttribute('data-testid').replace('actions-', '')) : null,
      name: cell('Tên cơ sở')?.querySelector('p')?.textContent.trim() ?? '',
      created: cell('Ngày tạo')?.textContent.trim() ?? '',
      status: badge?.textContent.trim() ?? '',
      statusColor: badge ? getComputedStyle(badge).color : '',
      // An <img> counts once it has loaded; the gray placeholder is what the app shows for a listing without photos.
      hasThumbnail: image ? image.complete && image.naturalWidth > 0 : Boolean(cells[0]?.querySelector('[data-testid="thumbnail-placeholder"]')),
    };
  });
  return { headers, rows };
};

export class DashboardPage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async open(query = '') {
    await seedHostSession(this.driver, this.baseUrl, `/host/dashboard${query}`);
    await this.waitLoaded();
  }

  // Waits for the table or the empty state. An error state (e.g. no backend) stops the case as an Error.
  async waitLoaded(timeout = DEFAULT_TIMEOUT) {
    await this.driver.wait(until.elementLocated(LIST_SETTLED), timeout);
    const errors = await this.driver.findElements(ERROR_STATE);
    if (errors.length) throw new Error(`Trang danh sách báo lỗi: ${(await errors[0].getText()).replace(/\s+/g, ' ')}`);
    await this.driver.wait(until.elementLocated(LIST_READY), timeout);
  }

  rows() {
    return this.driver.findElements(ROW);
  }

  readTable() {
    return this.driver.executeScript(readTable);
  }

  async readRows() {
    return (await this.readTable()).rows;
  }

  // Polls the table until predicate(rows) holds, then returns the rows. On timeout returns the last rows read,
  // so the caller's check reports what was actually on screen.
  async waitRows(predicate, timeout = DEFAULT_TIMEOUT) {
    let rows = [];
    try {
      await this.driver.wait(async () => {
        rows = await this.readRows();
        return predicate(rows);
      }, timeout);
    } catch {
      // reported by the caller's check
    }
    return rows;
  }

  // Thumbnails load from their URL after the rows render. On timeout the caller's check reports what loaded.
  async waitThumbnails(timeout = DEFAULT_TIMEOUT) {
    await this.driver
      .wait(
        () =>
          this.driver.executeScript(() =>
            [...document.querySelectorAll('[data-testid="desktop-table-row"] img')].every((img) => img.complete),
          ),
        timeout,
      )
      .catch(() => {});
  }

  async rowByStatus(label) {
    const row = (await this.readRows()).find((item) => item.status === label);
    if (!row) throw new Error(`Không có hàng nào ở trạng thái '${label}'`);
    return row;
  }

  tab(key) {
    return this.driver.findElement(By.css(`[data-testid="filter-chip-${key}"]`));
  }

  async selectTab(key) {
    await (await this.tab(key)).click();
    await this.driver.wait(async () => (await (await this.tab(key)).getAttribute('aria-pressed')) === 'true', DEFAULT_TIMEOUT);
    await this.waitLoaded();
  }

  // Number shown on a status tab. Waits until it matches `expected` (when given) so a refetch can land.
  async tabCount(key, expected) {
    let value = null;
    try {
      await this.driver.wait(async () => {
        const text = (await (await this.tab(key)).getText()).replace(/\s+/g, ' ').trim();
        const match = text.match(/(\d+)$/);
        value = match ? Number(match[1]) : null;
        return value !== null && (expected === undefined || value === expected);
      }, DEFAULT_TIMEOUT);
    } catch {
      // the last value read is returned and checked by the caller
    }
    return value;
  }

  async actionsOf(id) {
    const elements = await this.driver.findElements(By.css(`[data-testid="actions-${id}"] a, [data-testid="actions-${id}"] button`));
    return Promise.all(elements.map(async (el) => ({ el, text: (await el.getText()).trim(), tag: await el.getTagName() })));
  }

  async action(id, text) {
    const found = (await this.actionsOf(id)).find((item) => item.text === text);
    if (!found) throw new Error(`Hàng mã ${id} không có nút '${text}'`);
    return found.el;
  }

  search() {
    return this.driver.findElement(By.css('input[type="search"]'));
  }

  async dialog() {
    return this.driver.wait(until.elementLocated(DIALOG), DEFAULT_TIMEOUT);
  }

  async waitDialogClosed() {
    await this.driver.wait(async () => (await this.driver.findElements(DIALOG)).length === 0, DEFAULT_TIMEOUT);
  }

  async dialogButtons(dialog) {
    const buttons = await dialog.findElements(By.css('button'));
    return Promise.all(
      buttons.map(async (el) => ({ el, text: (await el.getText()).trim(), label: await el.getAttribute('aria-label') })),
    );
  }

  async toast() {
    return this.driver.wait(until.elementLocated(TOAST), DEFAULT_TIMEOUT);
  }
}
