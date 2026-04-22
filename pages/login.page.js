/** Customer login (#loginPanel). */
export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  formRoot() {
    return this.page.locator("#loginPanel, form[name='login']").first();
  }

  async gotoLanding(fullUrl) {
    await this.page.goto(fullUrl, { waitUntil: 'load' });
    await this.formRoot().locator("input[name='username']").waitFor();
  }

  async login(username, password) {
    const root = this.formRoot();
    await root.locator("input[name='username']").fill(username);
    await root.locator("input[name='password']").fill(password);
    await root.locator("input[type='submit']").click();
  }
}
