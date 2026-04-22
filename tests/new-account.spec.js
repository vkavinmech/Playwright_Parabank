import { test, expect } from '@playwright/test';
import { loginToAccountsOverview } from '../helpers/session.js';
import { OpenNewAccountPage } from '../pages/open-new-account.page.js';
import { TransactionHistoryPage } from '../pages/transaction-history.page.js';

// Flow: log in → open new Savings account → success → new id on overview → open that account’s activity → id visible.
test('open savings account → appears on overview → activity page shows that account number', async ({
  page,
}) => {
  const { overview } = await loginToAccountsOverview(page);

  const openNew = new OpenNewAccountPage(page);
  await openNew.gotoFromSidebar();
  await openNew.selectAccountType('SAVINGS');
  await openNew.selectFromAccountFirstRealOption();
  await openNew.submit();

  await expect(openNew.successBanner()).toBeVisible({ timeout: 12_000 });

  const newId = await openNew.readNewAccountId();
  expect(newId, 'Could not read new account id from the success page').toMatch(/\d{3,}/);

  await overview.openFromSidebar();
  await expect(overview.rowWithAccountNumberLink(newId).first()).toBeVisible({ timeout: 12_000 });

  await overview.openAccountActivityForAccountNumber(newId);
  const history = new TransactionHistoryPage(page);
  await history.waitForAccountActivityHeading();
  await expect(page.locator('#rightPanel')).toContainText(newId, { timeout: 12_000 });
});
