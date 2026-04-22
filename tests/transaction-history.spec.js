import { test, expect } from '@playwright/test';
import { loginToAccountsOverview } from '../helpers/session.js';
import { TransactionHistoryPage } from '../pages/transaction-history.page.js';

// Flow: log in → open first account → expect Account Activity UI (table or empty message).
test('opening the first account shows Account Activity and a transaction area', async ({ page }) => {
  const { overview } = await loginToAccountsOverview(page);

  await overview.openFirstLinkedAccountActivity();

  const history = new TransactionHistoryPage(page);
  await history.waitForAccountActivityHeading();

  expect(await page.locator('#transactionTable').count()).toBeGreaterThan(0);

  const rowCount = await history.transactionCount();
  const emptyMessage = await page.getByText(/no transactions found/i).count();
  expect(rowCount > 0 || emptyMessage > 0).toBeTruthy();
});
