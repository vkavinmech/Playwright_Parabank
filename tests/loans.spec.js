import { test, expect } from '@playwright/test';
import { paths } from '../config/site.js';
import { LoginPage } from '../pages/LoginPage.js';
import HomePage from '../pages/homePage.js';
import LoanPage from '../pages/LoanPage.js';
import { testData, loanData, loanApprovalAttempts } from '../utils/testData.js';

test.describe('Loan Request Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.username, testData.password);
  });

  test('Loan Approval', async ({ page }) => {
    const loan = new LoanPage(page);
    await page.goto(paths.requestLoan);
    const fromOptions = page.locator('#fromAccountId option');
    await expect
      .poll(async () => await fromOptions.count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
    const accountCount = await fromOptions.count();

    let result = '';
    outer: for (const pair of loanApprovalAttempts) {
      for (let idx = 0; idx < accountCount; idx++) {
        await page.goto(paths.requestLoan);
        await loan.applyLoan(pair.amount, pair.downPayment, { fromAccountIndex: idx });
        result = await loan.getResultText();
        if (result.includes('Approved')) break outer;
      }
    }
    expect(result).toContain('Approved');
  });

  test('Loan Denial (Low Balance)', async ({ page }) => {
    const home = new HomePage(page);
    const loan = new LoanPage(page);

    await home.navigateToLoanPage();
    await loan.applyLoan(loanData.highAmount.amount, loanData.highAmount.downPayment);

    const result = await loan.getResultText();
    console.log(result);

    await expect(result).toContain('Denied');
  });

  test('Invalid Input', async ({ page }) => {
    const home = new HomePage(page);
    const loan = new LoanPage(page);

    await home.navigateToLoanPage();
    await loan.applyLoan(loanData.invalid.amount, loanData.invalid.downPayment);

    await expect
      .poll(
        async () =>
          (await page.locator('#loanRequestDenied').isVisible()) ||
          (await page.locator('#requestLoanError').isVisible()),
        { timeout: 15_000 }
      )
      .toBeTruthy();
  });
});
