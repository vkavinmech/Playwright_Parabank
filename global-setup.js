import { chromium } from '@playwright/test';
import { loadConfig } from './lib/config.js';
import { RegisterPage } from './pages/register.page.js';

export default async function globalSetup() {
  const cfg = loadConfig();
  if (!cfg.registerBeforeSuite()) return;

  const browser = await chromium.launch({
    headless: cfg.isHeadless(),
    slowMo: cfg.getSlowMoMs(),
  });
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  page.setDefaultTimeout(cfg.defaultTimeoutMs());
  page.setDefaultNavigationTimeout(cfg.navigationTimeoutMs());
  try {
    await new RegisterPage(page).registerFromConfig(cfg);
  } finally {
    await context.close();
    await browser.close();
  }
}
