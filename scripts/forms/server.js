import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile, repoRoot } from '../newsletter/lib/google-auth.js';
import { handleSignupRequest } from './signup-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'config.json');
const port = Number(process.env.FORMS_PORT || 8787);
const monthlyAmounts = [5, 10, 20];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function appendForm(params) {
  const search = new URLSearchParams();
  const walk = (value, key) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${key}[${index}]`));
      return;
    }
    if (typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value)) {
        walk(child, key ? `${key}[${childKey}]` : childKey);
      }
      return;
    }
    search.append(key, String(value));
  };
  walk(params, '');
  return search;
}

async function stripe(method, stripePath, params) {
  const headers = { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` };
  let body;
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = appendForm(params);
  }
  const response = await fetch(`https://api.stripe.com/v1${stripePath}`, { method, headers, body });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Stripe request failed (${response.status})`);
  }
  return data;
}

async function airtable(method, airtablePath, body) {
  const response = await fetch(`https://api.airtable.com${airtablePath}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data.error?.message || data.error || `Airtable request failed (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return data;
}

async function listStripeProducts() {
  const products = [];
  let startingAfter;
  do {
    const page = await stripe(
      'GET',
      `/products?limit=100&active=true${startingAfter ? `&starting_after=${startingAfter}` : ''}`,
    );
    products.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
  return products;
}

async function ensureProduct(products, role, name) {
  const existing = products.find((product) => product.metadata?.cb_role === role);
  if (existing) {
    return existing.id;
  }
  const created = await stripe('POST', '/products', {
    name,
    metadata: { cb_role: role },
  });
  return created.id;
}

async function ensurePrice(productId, pounds, recurring) {
  const page = await stripe('GET', `/prices?product=${productId}&active=true&limit=100`);
  const amount = pounds * 100;
  const match = page.data.find((price) => {
    const interval = price.recurring?.interval || null;
    return price.unit_amount === amount && interval === (recurring ? 'month' : null);
  });
  if (match) {
    return match.id;
  }
  const created = await stripe('POST', '/prices', {
    product: productId,
    currency: 'gbp',
    unit_amount: amount,
    ...(recurring ? { recurring: { interval: 'month' } } : {}),
  });
  return created.id;
}

async function ensureStripePrices() {
  const products = await listStripeProducts();
  const membershipProduct = await ensureProduct(products, 'membership', '£1 membership share');
  const monthlyProduct = await ensureProduct(
    products,
    'monthly_donation',
    'Monthly donation - Friend of Chorlton Bikes',
  );
  const onceProduct = await ensureProduct(
    products,
    'once_donation',
    'One-time donation - Friend of Chorlton Bikes',
  );
  const monthly = {};
  for (const amount of monthlyAmounts) {
    monthly[amount] = await ensurePrice(monthlyProduct, amount, true);
  }
  return {
    membership: await ensurePrice(membershipProduct, 1, false),
    monthly,
    onceProduct,
  };
}

async function ensureAirtableTable(baseId) {
  const schema = await airtable('GET', `/v0/meta/bases/${baseId}/tables`);
  const existing = schema.tables.find((table) => table.name === 'Contacts (test)');
  if (existing) {
    return existing.id;
  }
  const created = await airtable('POST', `/v0/meta/bases/${baseId}/tables`, {
    name: 'Contacts (test)',
    description: 'Signups from the membership-forms branch. Not the live register.',
    fields: [
      { name: 'Full name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Mobile number', type: 'singleLineText' },
      { name: 'Address', type: 'singleLineText' },
      {
        name: 'Membership status',
        type: 'singleSelect',
        options: { choices: [{ name: 'Pending' }, { name: 'Live Member' }, { name: 'Non-member' }] },
      },
      {
        name: 'Membership Type',
        type: 'singleSelect',
        options: { choices: [{ name: 'Individual' }] },
      },
      { name: 'Donation response from form', type: 'singleLineText' },
      { name: 'One-time donation amount', type: 'singleLineText' },
      { name: 'Monthly amount', type: 'singleLineText' },
      { name: 'Monthly amount entered', type: 'number', options: { precision: 0 } },
      { name: 'Subscription ID', type: 'singleLineText' },
      { name: 'Checkout session', type: 'singleLineText' },
      { name: 'Notes', type: 'multilineText' },
    ],
  });
  return created.id;
}

async function readConfigFile() {
  try {
    return JSON.parse(await fs.readFile(configPath, 'utf8'));
  } catch {
    return {};
  }
}

async function writeConfigFile(config) {
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

async function loadConfig() {
  const config = await readConfigFile();
  if (!config.prices) {
    config.prices = await ensureStripePrices();
    await writeConfigFile(config);
  }
  if (!config.airtableTableId) {
    try {
      config.airtableTableId = await ensureAirtableTable(process.env.AIRTABLE_BASE_ID);
      await writeConfigFile(config);
    } catch (error) {
      config.airtableError = error.message;
      console.warn(`Airtable setup skipped: ${error.message}`);
      console.warn(
        'The token in .env can read the base, but it cannot create a test table or records. Edit it at https://airtable.com/create/tokens and add data.records:write and schema.bases:write, then restart.',
      );
    }
  }
  return config;
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function toRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? await readBody(req) : undefined,
  });
}

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = path.normalize(decoded).replace(/^[/\\]+/, '');
  if (
    !relative ||
    relative.startsWith('..') ||
    relative.split(path.sep).includes('..') ||
    relative.startsWith('.git') ||
    relative.startsWith('scripts') ||
    relative.startsWith('node_modules') ||
    relative.includes('.env')
  ) {
    return null;
  }
  const full = path.join(repoRoot, relative);
  if (!full.startsWith(repoRoot)) {
    return null;
  }
  return full;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = safeFilePath(url.pathname === '/' ? '/index.html' : url.pathname);
  if (!filePath) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    let body = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    if (extension === '.html') {
      body = Buffer.from(
        body.toString('utf8').replace(
          '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">',
          '',
        ),
      );
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[extension] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function sendResponse(res, response) {
  const headers = Object.fromEntries(response.headers.entries());
  res.writeHead(response.status, headers);
  response.arrayBuffer().then((buffer) => res.end(Buffer.from(buffer)));
}

await loadEnvFile();
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
  console.error('STRIPE_SECRET_KEY in .env must be a test secret key (sk_test_)');
  process.exit(1);
}
if (!process.env.AIRTABLE_TOKEN || !process.env.AIRTABLE_BASE_ID) {
  console.error('AIRTABLE_TOKEN and AIRTABLE_BASE_ID are required in .env');
  process.exit(1);
}

const config = await loadConfig();
const signupEnv = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  AIRTABLE_TOKEN: process.env.AIRTABLE_TOKEN,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_ID: config.airtableTableId,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  prices: config.prices,
};
console.log(config.airtableTableId ? `Airtable test table ${config.airtableTableId}` : 'Airtable test table not ready');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      const response = await handleSignupRequest(await toRequest(req), signupEnv);
      sendResponse(res, response);
      return;
    }
    if (req.method === 'GET') {
      await serveStatic(req, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: error.message || 'Request failed' }));
    }
  }
});

server.listen(port, () => {
  console.log(`Membership forms: http://localhost:${port}/index.html#membership`);
  console.log(`Donation form: http://localhost:${port}/index.html#donate`);
});
