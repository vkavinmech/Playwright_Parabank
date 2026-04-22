import { test, expect } from '@playwright/test';
import { loginToAccountsOverview } from '../helpers/session.js';
import { TransactionHistoryPage } from '../pages/transaction-history.page.js';

// Flow: log in → read balance on overview → open same account’s activity → balances should match.
test('balance on Accounts Overview matches Account Activity for that account', async ({ page }) => {
  const { overview } = await loginToAccountsOverview(page);

  const onOverview = await overview.balanceOnFirstLinkedRow();
  await overview.openFirstLinkedAccountActivity();

  const history = new TransactionHistoryPage(page);
  await history.waitForAccountActivityHeading();
  const onActivity = await history.readBalanceFromPanel();

  expect(onOverview).toBeCloseTo(onActivity, 2);
});
