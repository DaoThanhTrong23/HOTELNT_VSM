import { By, Key, until } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from '../support/driver.js';
import { seedHostSession } from '../support/session.js';

const PROFILE_FORM = By.xpath('//form[.//*[@id="profile-hoTen"]]');
const PASSWORD_FORM = By.xpath('//form[.//*[@id="password-oldPassword"]]');
const TOAST = By.css('[data-testid="host-toast"]');
const SELECT_ALL_KEY = process.platform === 'darwin' ? Key.COMMAND : Key.CONTROL;

// For each input id: the lock icons (lucide Lock / LockKeyhole shackle, or a label saying "khóa") next to it.
// The search box is the smallest ancestor holding both the label and the input.
const readLockIcons = (ids) =>
  ids.map((id) => {
    const input = document.getElementById(id);
    let box = input?.parentElement ?? null;
    while (box && !box.querySelector(`label[for="${id}"]`)) box = box.parentElement;
    const isLock = (svg) =>
      Boolean(svg.querySelector('path[d^="M7 11V7"], path[d^="M7 10V7"]')) ||
      /khóa|lock/i.test(`${svg.getAttribute('aria-label') ?? ''} ${svg.querySelector('title')?.textContent ?? ''}`);
    const icon = box ? [...box.querySelectorAll('svg')].find(isLock) : null;
    return { id, color: icon ? getComputedStyle(icon).color : null };
  });

export class ProfilePage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  // Waits for the form. An error state (e.g. no backend) stops the case as an Error.
  async open() {
    await seedHostSession(this.driver, this.baseUrl, '/host/profile');
    await this.driver.wait(until.elementLocated(By.css('#profile-hoTen, [data-testid="error-state"]')), DEFAULT_TIMEOUT);
    const errors = await this.driver.findElements(By.css('[data-testid="error-state"]'));
    if (errors.length) throw new Error(`Trang hồ sơ báo lỗi: ${(await errors[0].getText()).replace(/\s+/g, ' ')}`);
  }

  field(id) {
    return this.driver.findElement(By.id(id));
  }

  async valueOf(id) {
    return (await this.field(id)).getAttribute('value');
  }

  // Select all + Backspace + type, so React's onChange sees every edit (clear() may not fire it).
  async replaceText(id, text) {
    const input = await this.field(id);
    await input.click();
    await input.sendKeys(Key.chord(SELECT_ALL_KEY, 'a'), Key.BACK_SPACE, text);
    return input.getAttribute('value');
  }

  profileForm() {
    return this.driver.findElement(PROFILE_FORM);
  }

  passwordForm() {
    return this.driver.findElement(PASSWORD_FORM);
  }

  async buttonsOf(form) {
    const buttons = await form.findElements(By.css('button'));
    return Promise.all(
      buttons.map(async (el) => ({ el, text: (await el.getText()).trim(), enabled: await el.isEnabled() })),
    );
  }

  async submitButtonOf(form) {
    return form.findElement(By.css('button[type="submit"]'));
  }

  async banners(form) {
    const alerts = await form.findElements(By.css('[role="alert"]'));
    return Promise.all(alerts.map((el) => el.getText()));
  }

  async toast(timeout = DEFAULT_TIMEOUT) {
    return this.driver.wait(until.elementLocated(TOAST), timeout);
  }

  async errorOf(id) {
    const errors = await this.driver.findElements(By.id(`${id}-error`));
    return errors.length ? (await errors[0].getText()).trim() : '';
  }

  async sidebarText() {
    const asides = await this.driver.findElements(By.css('aside'));
    return asides.length ? asides[0].getText() : '';
  }

  lockIcons(ids) {
    return this.driver.executeScript(readLockIcons, ids);
  }
}
