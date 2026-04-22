import { parseLargestDollarAmount } from '../utils/money.js';

const ROW_HAS_DOLLAR = /\$\s*[0-9]/;

export class AccountsOverviewPage {
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
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const byText = rows.filter({ hasText: new RegExp(escaped, 'i') });
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
    return parseLargestDollarAmount(await row.innerText());
  }

  async openAccountActivityFor(keyword) {
    const row = await this.accountRowContaining(keyword);
    await row.getByRole('link').first().click();
  }

  async openAccountActivityForAccountNumber(accountNumber) {
    const row = this.rowWithAccountNumberLink(accountNumber).first();
    await row.getByRole('link').first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

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

  async allDisplayedBalances() {
    await this.waitForAccountRows();
    const rows = this.accountDataRows();
    const n = await rows.count();
    const balances = [];
    for (let i = 0; i < n; i++) {
      const text = await rows.nth(i).innerText();
      balances.push(parseLargestDollarAmount(text));
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
    return parseLargestDollarAmount(await row.innerText());
  }

  async openFirstLinkedAccountActivity() {
    const row = this.firstLinkedAccountRow();
    await row.waitFor();
    await row.getByRole('link').first().click();
  }
}
