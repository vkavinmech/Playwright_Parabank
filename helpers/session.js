import { loadConfig } from '../lib/config.js';
import { LoginPage } from '../pages/login.page.js';
import { AccountsOverviewPage } from '../pages/accounts-overview.page.js';

/**
 * Log in and stop on Accounts Overview once account rows are visible.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ cfg: ReturnType<typeof loadConfig>, overview: AccountsOverviewPage }>}
 */
export async function loginToAccountsOverview(page) {
  const cfg = loadConfig();
  const login = new LoginPage(page);
  await login.gotoLanding(cfg.baseUrl());
  await login.login(cfg.bankUsername(), cfg.bankPassword());
  const overview = new AccountsOverviewPage(page);
  await overview.waitForHeading();
  await overview.waitForAccountRows();
  return { cfg, overview };
}
