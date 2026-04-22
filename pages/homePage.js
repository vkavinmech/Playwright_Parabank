export default class HomePage {
  constructor(page) {
    this.page = page;
    this.requestLoanLink = page.locator('a[href="requestloan.htm"]');
  }

  async navigateToLoanPage() {
    await this.requestLoanLink.click();
  }
}