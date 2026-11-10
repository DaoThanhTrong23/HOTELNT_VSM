import { By, until } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from '../support/driver.js';
import { seedHostSession } from '../support/session.js';

const ROW = By.css('[data-testid="desktop-table-row"]');
// The list wrapper reports aria-busy="false" once a (re)load has finished.
const LIST_READY = By.css('div[aria-busy="false"] > [data-testid="desktop-data-table"], [data-testid="host-empty-state"]');
const ERROR_STATE = By.css('[data-testid="error-state"]');

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
    await this.driver.wait(until.elementLocated(By.css('div[aria-busy], [data-testid="host-empty-state"], [data-testid="error-state"]')), timeout);
    const errors = await this.driver.findElements(ERROR_STATE);
    if (errors.length) throw new Error(`Trang danh sách báo lỗi: ${(await errors[0].getText()).replace(/\s+/g, ' ')}`);
    await this.driver.wait(until.elementLocated(LIST_READY), timeout);
  }

  rows() {
    return this.driver.findElements(ROW);
  }
}
