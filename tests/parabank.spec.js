import { test, expect } from '@playwright/test';
import { paths } from '../config/site.js';
import { LoginPage } from '../pages/LoginPage.js';
import { AccountsPage } from '../pages/AccountsPage.js';
import { TransferPage } from '../pages/TransferPage.js';
import { BillPayPage } from '../pages/BillPayPage.js';
import { testData } from '../utils/testData.js';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.loginToApplication(testData.username, testData.password);
});


// Transfer Funds - SUCCESS

test('Transfer funds between accounts', async ({ page }) => {
  const accounts = new AccountsPage(page);
  const transfer = new TransferPage(page);

  await accounts.transferFunds.click();
  await expect
    .poll(async () => await page.locator('#fromAccountId').locator('option').count(), { timeout: 20_000 })
    .toBeGreaterThanOrEqual(2);
  const fromAccountId = await page.locator('#fromAccountId').inputValue();

  await page.goto(paths.overview);
  const beforeBalance = await accounts.getBalanceForAccount(fromAccountId);

  await accounts.transferFunds.click();
  await transfer.transfer(50, { fromIndex: 0, toIndex: 1 });

  const message = await transfer.getMessage();
  expect(message).toContain('Transfer Complete');

  await page.goto(paths.overview);
  const afterBalance = await accounts.getBalanceForAccount(fromAccountId);

  expect(afterBalance).toBeLessThan(beforeBalance);
});



//  Transfer Funds - INSUFFICIENT
test('Transfer fails with insufficient balance', async ({ page }) => {
  const accounts = new AccountsPage(page);
  const transfer = new TransferPage(page);

  await accounts.transferFunds.click();
  await transfer.transfer(999999);

  const bodyText = await page.textContent('body');
  expect(bodyText.toLowerCase()).toContain('error');
});



//  Bill Payment - SUCCESS

test('Bill payment success', async ({ page }) => {
  const accounts = new AccountsPage(page);
  const bill = new BillPayPage(page);

  await accounts.billPay.click();
  await bill.payBill(100);

  const message = await bill.getMessage();
  expect(message).toContain('Bill Payment Complete');
});



// Bill Payment - FAILURE

test('Bill payment failure with invalid amount', async ({ page }) => {
  const accounts = new AccountsPage(page);
  const bill = new BillPayPage(page);

  await accounts.billPay.click();
  await bill.payBill('');

  const bodyText = await page.textContent('body');
  expect(bodyText.toLowerCase()).toContain('error');
});