export class AccountsPage {
  constructor(page) {
    this.page = page;
    this.balance = page.locator('#accountTable tbody tr:first-child td:nth-child(2)');
    this.transferFunds = page.getByText('Transfer Funds');
    this.billPay = page.getByText('Bill Pay');
  }

  async getBalance() {
    const text = await this.balance.textContent();
    return parseFloat(text.replace('$', '').trim());
  }

  /** Balance cell for the account row whose id link matches `accountId`. */
  async getBalanceForAccount(accountId) {
    const id = String(accountId).trim();
    const row = this.page
      .locator('#accountTable tbody tr')
      .filter({ has: this.page.getByRole('link', { name: new RegExp(`^\\s*${id}\\s*$`) }) })
      .first();
    await row.waitFor({ state: 'visible', timeout: 30_000 });
    const text = await row.locator('td').nth(1).textContent();
    return parseFloat((text ?? '').replace('$', '').trim());
  }
}