import { expect } from '@playwright/test';

export class TransferPage {
  constructor(page) {
    this.page = page;
    this.amount = page.locator('#amount');
    this.transferBtn = page.getByRole('button', { name: 'Transfer' });
    this.result = page.locator('#showResult');
    this.fromAccountId = page.locator('#fromAccountId');
    this.toAccountId = page.locator('#toAccountId');
  }

  /** ParaBank loads accounts over AJAX; both dropdowns default to the first option (same from/to). */
  async transfer(amount, options = {}) {
    const fromIndex = options.fromIndex ?? 0;
    const toIndex = options.toIndex ?? 1;

    await this.fromAccountId.waitFor({ state: 'visible' });
    await expect
      .poll(async () => await this.fromAccountId.locator('option').count(), { timeout: 20_000 })
      .toBeGreaterThanOrEqual(2);

    await this.fromAccountId.selectOption({ index: fromIndex });
    await this.toAccountId.selectOption({ index: toIndex });

    await this.amount.fill(String(amount));
    await this.transferBtn.click();
  }

  async getMessage() {
    return await this.result.textContent();
  }
}
