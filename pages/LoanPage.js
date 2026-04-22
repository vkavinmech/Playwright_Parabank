export default class LoanPage {
  constructor(page) {
    this.page = page;
    this.loanAmount = page.locator('#amount');
    this.downPayment = page.locator('#downPayment');
    this.fromAccount = page.locator('#fromAccountId');
    /** Matches ParaBank JSP: jQuery binds to `input[type=button]` inside `#requestLoanForm`. */
    this.applyBtn = page.locator('#requestLoanForm input[type="button"]');

    this.resultPanel = page.locator('#requestLoanResult');
    this.resultMsg = page.locator('#loanStatus');
    this.requestError = page.locator('#requestLoanError');
  }

  /** Waits until AJAX loan request finishes (result table or global error). */
  async waitForLoanRequestUi() {
    await Promise.race([
      this.resultPanel.waitFor({ state: 'visible', timeout: 45_000 }),
      this.requestError.waitFor({ state: 'visible', timeout: 45_000 }),
    ]);
  }

  /**
   * @param {string|number} amount
   * @param {string|number} downPayment
   * @param {{ fromAccountIndex?: number }} [options]
   */
  async applyLoan(amount, downPayment, options = {}) {
    await this.fromAccount.waitFor({ state: 'visible' });
    if (options.fromAccountIndex != null) {
      await this.fromAccount.selectOption({ index: options.fromAccountIndex });
    }
    await this.loanAmount.fill(String(amount));
    await this.downPayment.fill(String(downPayment));
    await this.applyBtn.click();
    await this.waitForLoanRequestUi();
  }

  async getResultText() {
    await this.resultPanel.waitFor({ state: 'visible', timeout: 10_000 });
    return (await this.resultMsg.textContent())?.trim() ?? '';
  }
}
