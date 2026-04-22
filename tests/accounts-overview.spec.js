import { test, expect } from '@playwright/test';
import { loginToAccountsOverview } from '../helpers/session.js';

// Flow: log in → read every balance on Accounts Overview → each must be a valid non‑negative number.
test('after login, every overview row has a valid balance', async ({ page }) => {
  const { overview } = await loginToAccountsOverview(page);

  expect(await overview.isAccountsTableVisible()).toBeTruthy();

  const balances = await overview.allDisplayedBalances();
  expect(balances.length).toBeGreaterThan(0);
  for (const b of balances) {
    expect(Number.isFinite(b)).toBeTruthy();
    expect(b).toBeGreaterThanOrEqual(0);
  }
});
