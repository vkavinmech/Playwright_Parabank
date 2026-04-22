function env(key, fallback = '') {
  const v = process.env[key];
  return v !== undefined && v !== '' ? v : fallback;
}

export const testData = {
  username: env('BANK_USERNAME', 'john'),
  password: env('BANK_PASSWORD', 'demo'),

  registerBeforeSuite: env('REGISTER_BEFORE_SUITE', 'false').toLowerCase() === 'true',

  registerFirstName: env('REGISTER_FIRST_NAME', 'Playwright'),
  registerLastName: env('REGISTER_LAST_NAME', 'Parabank'),
  registerStreet: env('REGISTER_ADDRESS_STREET', '1 Test Lane'),
  registerCity: env('REGISTER_ADDRESS_CITY', 'Los Angeles'),
  registerState: env('REGISTER_ADDRESS_STATE', 'CA'),
  registerZip: env('REGISTER_ZIP', '90001'),
  registerPhone: env('REGISTER_PHONE', '3105550100'),
  registerSsn: env('REGISTER_SSN', '123456789'),
};

export const users = {
  validUser: {
    username: env('VALID_USER_USERNAME', 'Nantha2602'),
    password: env('VALID_USER_PASSWORD', 'Nantha@123'),
  },
};

const loanEdgeCase = { amount: '999999', downPayment: '0' };

export const loanData = {
  valid: { amount: '1000', downPayment: '100' },
  highAmount: loanEdgeCase,
  edge: loanEdgeCase,
  invalid: { amount: 'Nantha', downPayment: 'Hello' },
};

export const loanApprovalAttempts = [
  { amount: '10', downPayment: '1' },
  { amount: '20', downPayment: '1' },
  { amount: '35', downPayment: '1' },
  { amount: '50', downPayment: '2' },
  { amount: '75', downPayment: '5' },
  { amount: '100', downPayment: '8' },
  { amount: '150', downPayment: '12' },
  { amount: '200', downPayment: '20' },
];
