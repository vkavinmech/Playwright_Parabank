import { parseLastDollarAmount } from '../lib/money.js';

/** Account Activity / transaction history for the selected account. */
export class TransactionHistoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async waitForAccountActivityHeading() {
    await this.page.getByRole('heading', { name: 'Account Activity' }).waitFor();
  }

  transactionDataRows() {
    return this.page
      .locator('#transactionTable tr')
      .filter({ has: this.page.locator('td') })
      .filter({ hasNotText: /no transactions found/i });
  }

  async transactionCount() {
    return await this.transactionDataRows().count();
  }

  async panelText() {
    return await this.page.locator('#rightPanel').innerText();
  }

  /** Balance line in the activity / history panel. */
  async readBalanceFromPanel() {
    const panel = this.page.locator('#rightPanel');
    await panel.locator('text=/\\$\\s*[0-9]/').first().waitFor();
    const text = await panel.innerText();
    for (const line of text.split(/\r?\n/)) {
      if (line.toLowerCase().includes('balance') && line.includes('$')) {
        return parseLastDollarAmount(line);
      }
    }
    return parseLastDollarAmount(text);
  }

  async hasHistoryRowMatching(pattern) {
    const rows = this.transactionDataRows();
    return (await rows.filter({ hasText: pattern }).count()) > 0;
  }

  /** Navigate if the app exposes “Find Transactions” in the left panel. */
  async openFindTransactionsIfPresent() {
    const link = this.page.locator('#leftPanel').getByRole('link', { name: /Find Transactions/i });
    if ((await link.count()) === 0) return false;
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    return true;
  }
}
