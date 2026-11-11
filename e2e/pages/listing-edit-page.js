import { By } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from '../support/driver.js';

// Visible form controls inside <main> that the user can still change.
const readEditableControls = () =>
  [...document.querySelectorAll('main input, main textarea, main select')]
    .filter((el) => el.type !== 'hidden' && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden')
    .map((el) => ({ id: el.id, tag: el.tagName.toLowerCase(), type: el.type, editable: !el.disabled && !el.readOnly }));

// /host/hotels/:id/edit (listing form). Only read here: the dashboard cases check where its buttons lead.
export class ListingEditPage {
  constructor(driver) {
    this.driver = driver;
  }

  // Loaded when the form section is idle and the heading shows the listing name instead of the placeholder.
  async waitLoaded(timeout = DEFAULT_TIMEOUT) {
    await this.driver.wait(async () => {
      const sections = await this.driver.findElements(By.css('main section[aria-busy="false"]'));
      const headings = await this.driver.findElements(By.css('main h1'));
      if (!sections.length || !headings.length) return false;
      const title = (await headings[0].getText()).trim();
      return title !== '' && title !== 'Cơ sở lưu trú';
    }, timeout);
  }

  async title() {
    return (await this.driver.findElement(By.css('main h1')).getText()).trim();
  }

  controls() {
    return this.driver.executeScript(readEditableControls);
  }

  async mainText() {
    return this.driver.findElement(By.css('main')).getText();
  }

  nameInput() {
    return this.driver.findElements(By.css('#listing-tenCSLT'));
  }
}
