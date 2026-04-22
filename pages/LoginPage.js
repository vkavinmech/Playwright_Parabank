import { paths } from '../config/site.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  formRoot() {
    return this.page.locator("#loginPanel, form[name='login']").first();
  }

  async gotoLanding() {
    await this.page.goto(paths.home, { waitUntil: 'load' });
    await this.formRoot().locator("input[name='username']").waitFor();
  }

  async goto() {
    await this.gotoLanding();
  }

  async login(username, password) {
    const root = this.formRoot();
    await root.locator("input[name='username']").fill(username);
    await root.locator("input[name='password']").fill(password);
    await root.locator("input[type='submit']").click();
  }

  async loginToApplication(username, password) {
    await this.gotoLanding();
    await this.login(username, password);
  }
}
