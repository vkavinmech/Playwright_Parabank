/**
 * Open New Account — form: select#type, select#fromAccountId, submit Open New Account.
 */
export class OpenNewAccountPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async gotoFromSidebar() {
    await this.page.locator('#leftPanel').getByRole('link', { name: /Open New Account/i }).click();
    await this.page.waitForURL(/openaccount\.htm/i, { timeout: 15_000 });
    await this.page
      .locator('#rightPanel')
      .getByRole('heading', { name: /Open New Account/i })
      .waitFor();
  }

  typeSelect() {
    return this.page.locator('select#type').first();
  }

  fromAccountSelect() {
    return this.page.locator('select#fromAccountId').first();
  }

  submitButton() {
    const panel = this.page.locator('#rightPanel');
    return panel
      .getByRole('button', { name: /Open New Account/i })
      .or(panel.locator("input[type='submit'][value='Open New Account']"))
      .first();
  }

  /** @param {'CHECKING' | 'SAVINGS'} accountTypeLabel */
  async selectAccountType(accountTypeLabel) {
    const sel = this.typeSelect();
    await sel.waitFor({ state: 'attached' });
    const pattern = new RegExp(accountTypeLabel, 'i');
    const opts = sel.locator('option');
    const count = await opts.count();
    for (let i = 0; i < count; i++) {
      const label = (await opts.nth(i).innerText()).trim();
      if (label && pattern.test(label)) {
        await sel.selectOption({ label });
        return;
      }
    }
    throw new Error(`No account type option matching ${accountTypeLabel}`);
  }

  /** Use first funded account option (index 1 when placeholder at 0). */
  async selectFromAccountFirstRealOption() {
    const sel = this.fromAccountSelect();
    await sel.waitFor({ state: 'attached' });
    const opts = sel.locator('option');
    await opts.first().waitFor({ state: 'attached' });
    const count = await opts.count();
    if (count >= 3) {
      await sel.selectOption({ index: 1 });
      return;
    }
    if (count === 2) {
      await sel.selectOption({ index: 1 });
      return;
    }
    if (count === 1) {
      await sel.selectOption({ index: 0 });
      return;
    }
    await sel.selectOption({ index: 0 });
  }

  async submit() {
    await this.submitButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  successBanner() {
    return this.page
      .locator('#rightPanel')
      .getByText('Congratulations, your account is now open.')
      .first();
  }

  /**
   * Best-effort parse of new account id from the result panel.
   * @returns {Promise<string | null>}
   */
  async readNewAccountId() {
    const panel = this.page.locator('#rightPanel');
    await panel
      .getByText(/Congratulations|Account Opened|new account|account number/i)
      .first()
      .waitFor({ timeout: 6000 })
      .catch(() => {});

    const link = panel.locator('a[href*="activity.htm"]').first();
    if ((await link.count()) > 0) {
      const t = (await link.innerText()).trim();
      if (/^\d+$/.test(t)) return t;
    }

    const text = await panel.innerText();
    const m1 = text.match(/Account Number:\s*(\d+)/i);
    if (m1) return m1[1];
    const m2 = text.match(/#\s*(\d{3,})/);
    if (m2) return m2[1];
    const nums = text.match(/\b(\d{4,})\b/g);
    return nums && nums.length ? nums[nums.length - 1] : null;
  }
}
