export class BillPayPage {
  constructor(page) {
    this.page = page;

    this.name = page.locator('input[name=\"payee.name\"]');
    this.address = page.locator('input[name=\"payee.address.street\"]');
    this.city = page.locator('input[name=\"payee.address.city\"]');
    this.state = page.locator('input[name=\"payee.address.state\"]');
    this.zip = page.locator('input[name=\"payee.address.zipCode\"]');
    this.phone = page.locator('input[name=\"payee.phoneNumber\"]');
    this.account = page.locator('input[name=\"payee.accountNumber\"]');
    this.verify = page.locator('input[name=\"verifyAccount\"]');
    this.amount = page.locator('input[name=\"amount\"]');

    this.sendBtn = page.getByRole('button', { name: 'Send Payment' });
    this.result = page.locator('#billpayResult');
  }

  async payBill(amount) {
    await this.name.fill('Test User');
    await this.address.fill('Chennai');
    await this.city.fill('Chennai');
    await this.state.fill('TN');
    await this.zip.fill('600001');
    await this.phone.fill('9999999999');
    await this.account.fill('12345');
    await this.verify.fill('12345');
    await this.amount.fill(amount.toString());

    await this.sendBtn.click();
  }

  async getMessage() {
    return await this.result.textContent();
  }
}