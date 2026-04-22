export function baseURL() {
  return (process.env.BASE_URL || 'https://parabank.parasoft.com').replace(/\/+$/, '');
}

/** Paths are relative to `baseURL` in playwright.config.js */
export const paths = {
  home: '/parabank/index.htm',
  register: '/parabank/register.htm',
  overview: '/parabank/overview.htm',
  openNewAccount: '/parabank/openaccount.htm',
  requestLoan: '/parabank/requestloan.htm',
};
