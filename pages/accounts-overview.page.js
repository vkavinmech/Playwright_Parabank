import { parseLastDollarAmount } from '../lib/money.js';

const ROW_HAS_DOLLAR = /\$\s*[0-9]/;

function accountTypePattern(keyword) {
  const u = keyword.toUpperCase();
  if (u.includes('CHECK')) {
    return /CHECK(ING)?|\*\s*CHECK|CHK\b|PERSONAL\s+CHECK/i;
  }
  if (u.includes('SAV')) {
    return /SAV(INGS)?|\*\s*SAV|PERSONAL\s+SAV/i;
  }
  return new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

/** Accounts Overview — balances and navigation to account activity / new account. */
export class AccountsOverviewPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  leftPanel() {
    return this.page.locator('#leftPanel');
  }

  async openFromSidebar() {
    await this.leftPanel().getByRole('link', { name: 'Accounts Overview' }).click();
    await this.waitForHeading();
    await this.waitForAccountRows();
  }

  /** Table markup can appear before funded account rows render. */
  async waitForAccountRows() {
    await this.page.locator('#accountTable').first().waitFor();
    await this.accountDataRows().first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async waitForHeading() {
    const h = this.page.getByRole('heading', { name: 'Accounts Overview' });
    if ((await h.count()) > 0) {
      await h.waitFor();
    } else {
      await this.page.locator('#accountTable').first().waitFor();
    }
  }

  accountDataRows() {
    return this.page
      .locator('#accountTable tr')
      .filter({ has: this.page.locator('td') })
      .filter({ hasText: ROW_HAS_DOLLAR })
      .filter({ hasNotText: /subject to holds|Balance includes/i });
  }

  async accountRowContaining(keyword) {
    await this.waitForAccountRows();
    const rows = this.accountDataRows();
    const p = accountTypePattern(keyword);
    const byText = rows.filter({ hasText: p });
    if ((await byText.count()) > 0) return byText.first();
    const linked = rows.filter({ has: this.page.getByRole('link') });
    const n = await linked.count();
    const u = keyword.toUpperCase();
    if (u.includes('CHECK') && n >= 1) return linked.nth(0);
    if (u.includes('SAV') && n >= 2) return linked.nth(1);
    if (u.includes('SAV') && n === 1) return linked.nth(0);
    const rc = await rows.count();
    if (u.includes('CHECK') && rc >= 1) return rows.nth(0);
    if (u.includes('SAV') && rc >= 2) return rows.nth(1);
    if (u.includes('SAV') && rc === 1) return rows.nth(0);
    return byText.first();
  }

  async balanceOnRow(keyword) {
    const row = await this.accountRowContaining(keyword);
    return parseLastDollarAmount(await row.innerText());
  }

  async openAccountActivityFor(keyword) {
    const row = await this.accountRowContaining(keyword);
    await row.getByRole('link').first().click();
  }

  /** Open Account Activity for the row whose account link matches this id (e.g. newly opened account). */
  async openAccountActivityForAccountNumber(accountNumber) {
    const row = this.rowWithAccountNumberLink(accountNumber).first();
    await row.getByRole('link').first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Row whose first account link text matches (e.g. newly opened account id). */
  rowWithAccountNumberLink(accountNumber) {
    const id = String(accountNumber).trim();
    return this.accountDataRows().filter({
      has: this.page.getByRole('link', { name: new RegExp(`^\\s*${id}\\s*$`) }),
    });
  }

  async hasAccountNumberInTable(accountNumber) {
    await this.waitForAccountRows();
    return (await this.rowWithAccountNumberLink(accountNumber).count()) > 0;
  }

  /**
   * Every account row exposes a numeric balance.
   * @returns {Promise<number[]>}
   */
  async allDisplayedBalances() {
    await this.waitForAccountRows();
    const rows = this.accountDataRows();
    const n = await rows.count();
    const balances = [];
    for (let i = 0; i < n; i++) {
      const text = await rows.nth(i).innerText();
      balances.push(parseLastDollarAmount(text));
    }
    return balances;
  }

  async isAccountsTableVisible() {
    return (await this.page.locator('#accountTable').count()) > 0;
  }

  firstLinkedAccountRow() {
    return this.accountDataRows().filter({ has: this.page.getByRole('link') }).first();
  }

  async balanceOnFirstLinkedRow() {
    const row = this.firstLinkedAccountRow();
    await row.waitFor();
    return parseLastDollarAmount(await row.innerText());
  }

  async openFirstLinkedAccountActivity() {
    const row = this.firstLinkedAccountRow();
    await row.waitFor();
    await row.getByRole('link').first().click();
  }
}
