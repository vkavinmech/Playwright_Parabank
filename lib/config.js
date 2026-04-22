import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function repoRoot() {
  return path.resolve(__dirname, '..');
}

function parsePropertiesFile(content) {
  const props = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    props[key] = value;
  }
  return props;
}

function mergeDotEnv(dotEnvPath, props) {
  if (!fs.existsSync(dotEnvPath) || !fs.statSync(dotEnvPath).isFile()) return;
  const parsed = parsePropertiesFile(fs.readFileSync(dotEnvPath, 'utf8'));
  for (const [k, v] of Object.entries(parsed)) {
    if (!(k in props)) props[k] = v;
  }
}

function envForKey(key) {
  if (process.env[key] !== undefined && process.env[key] !== '') return process.env[key];
  const underscored = key.replace(/\./g, '_').toUpperCase();
  if (process.env[underscored] !== undefined && process.env[underscored] !== '')
    return process.env[underscored];
  return undefined;
}

let cached;

export function loadConfig() {
  if (cached) return cached;
  const configPath = path.join(repoRoot(), 'config', 'Config.property');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config file: ${configPath}`);
  }
  const props = parsePropertiesFile(fs.readFileSync(configPath, 'utf8'));
  mergeDotEnv(path.join(repoRoot(), '.env'), props);
  cached = createConfigApi(props);
  return cached;
}

function createConfigApi(props) {
  const get = (key, defaultValue) => {
    const fromEnv = envForKey(key);
    if (fromEnv !== undefined) return fromEnv;
    return props[key] ?? defaultValue;
  };

  const getRequired = (key) => {
    const v = get(key, undefined);
    if (v === undefined || v === '') throw new Error(`Missing required config key: ${key}`);
    return v;
  };

  return {
    get,
    getRequired,
    baseUrl() {
      const fromEnv = envForKey('base.url');
      if (fromEnv) return fromEnv.replace(/\/+$/, '');
      const b = props['base.url'];
      if (b && String(b).trim()) return String(b).replace(/\/+$/, '');
      return getRequired('url').replace(/\/+$/, '');
    },
    isHeadless() {
      return String(get('browser.headless', 'true')).toLowerCase() === 'true';
    },
    getSlowMoMs() {
      return parseInt(get('browser.slow.mo.ms', '0'), 10) || 0;
    },
    defaultTimeoutMs() {
      return parseFloat(get('default.timeout.ms', '45000')) || 45000;
    },
    navigationTimeoutMs() {
      return parseFloat(get('navigation.timeout.ms', '60000')) || 60000;
    },
    bankUsername() {
      return get('bank.username', 'john');
    },
    bankPassword() {
      return get('bank.password', 'demo');
    },
    registerBeforeSuite() {
      return String(get('bank.register.before.suite', 'false')).toLowerCase() === 'true';
    },
    registerUrl() {
      const u = String(get('register.url', '') || '').trim();
      if (u) return u;
      const base = this.baseUrl();
      if (base.endsWith('index.htm')) {
        return base.slice(0, -'index.htm'.length) + 'register.htm';
      }
      const slash = base.lastIndexOf('/');
      if (slash > 0) return base.slice(0, slash + 1) + 'register.htm';
      return 'https://parabank.parasoft.com/parabank/register.htm';
    },
    registerFirstName() {
      return get('register.first.name', 'Playwright');
    },
    registerLastName() {
      return get('register.last.name', 'Parabank');
    },
    registerStreet() {
      return get('register.address.street', '1 Test Lane');
    },
    registerCity() {
      return get('register.address.city', 'Los Angeles');
    },
    registerState() {
      return get('register.address.state', 'CA');
    },
    registerZip() {
      return get('register.zip', '90001');
    },
    registerPhone() {
      return get('register.phone', '3105550100');
    },
    registerSsn() {
      return get('register.ssn', '123456789');
    },
  };
}
