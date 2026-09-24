const monthlyAmounts = [5, 10, 20];
const paperformMonthlyPrices = {
  price_1SVr81IkHkkpJoWn1zEt7VTP: 5,
  price_1SVrANIkHkkpJoWn47QawSZD: 10,
  price_1SVrANIkHkkpJoWnfAj6gJrS: 20,
};
const inflight = new Map();

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

async function stripe(env, method, stripePath, params) {
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
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

async function airtable(env, method, airtablePath, body) {
  const response = await fetch(`https://api.airtable.com${airtablePath}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
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

function cleanText(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function emailError(value) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return 'Enter an email address like name@example.com.';
  }
  return '';
}

export function phoneError(value) {
  const compact = String(value).replace(/[\s().-]/g, '');
  if (!/^\+?\d+$/.test(compact)) {
    return 'Enter a phone number using digits, for example 07123 456789.';
  }
  if (compact.startsWith('+') && !compact.startsWith('+44')) {
    const count = compact.length - 1;
    if (count < 8 || count > 15) {
      return 'Enter the full phone number, including the country code.';
    }
    return '';
  }
  let national = compact;
  if (national.startsWith('+44')) national = national.slice(3);
  else if (national.startsWith('0044')) national = national.slice(4);
  else if (national.startsWith('0')) national = national.slice(1);
  else {
    return 'Start a UK phone number with 0 or +44.';
  }
  if (national.startsWith('0')) national = national.slice(1);
  if (national.length !== 10) {
    return 'That phone number looks short or long. A UK number is 11 digits, or +44 followed by 10 digits.';
  }
  return '';
}

export function addressError(value) {
  if (value.length < 12 || !/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(value)) {
    return 'Include the house number, street and postcode, for example 12 Beech Road, M21 9EG.';
  }
  return '';
}

export function parseSignup(body) {
  const form = body.form === 'donation' ? 'donation' : body.form === 'membership' ? 'membership' : '';
  if (!form) {
    throw new Error('Choose the membership or donation form');
  }
  const name = cleanText(body.name, 200);
  const email = cleanText(body.email, 200).toLowerCase();
  const phone = cleanText(body.phone, 40);
  const address = cleanText(body.address, 500);
  if (!name || !email || !phone || !address) {
    throw new Error('Name, email, phone and address are required');
  }
  const invalid = emailError(email) || phoneError(phone) || addressError(address);
  if (invalid) {
    throw new Error(invalid);
  }
  if (form === 'membership' && (!body.confirmRules || !body.confirmApproval)) {
    throw new Error('Both membership confirmations are required');
  }

  const donationType = body.donationType;
  if (form === 'donation' && donationType !== 'monthly' && donationType !== 'once') {
    throw new Error('Choose a monthly or one-time donation');
  }
  if (!['monthly', 'once', 'none'].includes(donationType)) {
    throw new Error('Choose whether to add a donation');
  }

  let monthlyAmount = '';
  let onceAmount = '';
  if (donationType === 'monthly') {
    monthlyAmount = String(body.monthlyAmount);
    if (!monthlyAmounts.map(String).includes(monthlyAmount)) {
      throw new Error('Choose a monthly amount of £5, £10 or £20');
    }
  }
  if (donationType === 'once') {
    const pounds = Number(body.onceAmount);
    if (!Number.isFinite(pounds) || pounds < 1 || pounds > 10000) {
      throw new Error('Enter a one-time donation of at least £1');
    }
    onceAmount = (Math.round(pounds * 100) / 100).toFixed(2);
  }

  return { form, name, email, phone, address, donationType, monthlyAmount, onceAmount };
}

function donationResponse(signup) {
  if (signup.donationType === 'monthly') {
    return 'Monthly';
  }
  if (signup.donationType === 'once') {
    return 'One-time';
  }
  return 'No';
}

export function combinedDonationResponse(existingText, donationType) {
  const text = String(existingText || '').toLowerCase();
  const monthly = text.includes('monthly') || donationType === 'monthly';
  const once = text.includes('one') || donationType === 'once';
  if (monthly && once) {
    return 'Monthly and one-time';
  }
  if (monthly) {
    return 'Monthly';
  }
  if (once) {
    return 'One-time';
  }
  return 'No';
}

function poundsFrom(value) {
  const match = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  if (!match) {
    return 0;
  }
  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : 0;
}

export function existingMonthlyPounds(existing) {
  if (!existing) {
    return 0;
  }
  const entered = existing['Monthly amount entered'];
  if (entered !== undefined && entered !== null && String(entered).trim() !== '') {
    const amount = Number(entered);
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }
  const fromPrice = paperformMonthlyPrices[existing['Subscription ID']];
  if (fromPrice) {
    return fromPrice;
  }
  return poundsFrom(existing['Monthly amount']);
}

export function existingOncePounds(existing) {
  if (!existing) {
    return 0;
  }
  return poundsFrom(existing['One-time donation amount']);
}

function signupMetadata(signup) {
  return {
    cb_form: signup.form,
    cb_name: signup.name,
    cb_email: signup.email,
    cb_phone: signup.phone,
    cb_address: signup.address,
    cb_donation: signup.donationType,
    cb_monthly: signup.monthlyAmount,
    cb_once: signup.onceAmount,
  };
}

function lineItems(signup, prices) {
  const items = [];
  if (signup.form === 'membership') {
    items.push({ price: prices.membership, quantity: 1 });
  }
  if (signup.donationType === 'monthly') {
    items.push({ price: prices.monthly[signup.monthlyAmount], quantity: 1 });
  }
  if (signup.donationType === 'once') {
    items.push({
      quantity: 1,
      price_data: {
        currency: 'gbp',
        unit_amount: Math.round(Number(signup.onceAmount) * 100),
        product: prices.onceProduct,
      },
    });
  }
  return items;
}

export function createCheckout(env, signup, origin) {
  const metadata = signupMetadata(signup);
  const mode = signup.donationType === 'monthly' ? 'subscription' : 'payment';
  const cancelHash = signup.form === 'donation' ? '#donate' : '#membership';
  const payload = {
    mode,
    customer_email: signup.email,
    client_reference_id: signup.form,
    success_url: `${origin}/signup-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/index.html${cancelHash}`,
    line_items: lineItems(signup, env.prices),
    metadata,
  };
  if (mode === 'subscription') {
    payload.subscription_data = { metadata };
  } else {
    payload.payment_intent_data = { metadata };
  }
  return stripe(env, 'POST', '/checkout/sessions', payload);
}

function signupFromSession(session) {
  const metadata = session.metadata || {};
  return {
    form: metadata.cb_form,
    name: metadata.cb_name,
    email: metadata.cb_email,
    phone: metadata.cb_phone,
    address: metadata.cb_address,
    donationType: metadata.cb_donation,
    monthlyAmount: metadata.cb_monthly || '',
    onceAmount: metadata.cb_once || '',
  };
}

export async function recordSignup(env, session) {
  if (!env.AIRTABLE_TABLE_ID) {
    throw new Error('Payment succeeded, but the Airtable test table is not configured.');
  }
  const signup = signupFromSession(session);
  if (!signup.form || !signup.email) {
    throw new Error('This payment is missing the signup details');
  }
  const tablePath = `/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}`;
  const sessionFormula = encodeURIComponent(`{Checkout session}="${formulaValue(session.id)}"`);
  const existingSession = await airtable(env, 'GET', `${tablePath}?filterByFormula=${sessionFormula}&maxRecords=1`);
  if (existingSession.records?.length) {
    const pending = signup.form === 'membership' && membershipStatus(existingSession.records[0].fields) === 'Pending';
    return { created: false, pending, signup };
  }

  const emailFormula = encodeURIComponent(contactFormula(env, signup.email));
  const matches = await airtable(env, 'GET', `${tablePath}?filterByFormula=${emailFormula}&maxRecords=10`);
  const match = chooseContact(matches.records || []);
  const memberId = !match && env.AIRTABLE_TABLE_ID === 'tblqgtpXroIv0cmZc' ? await nextMemberId(env) : '';
  const fields = fieldsForSignup(env, signup, session, match?.fields, memberId);
  const pending = signup.form === 'membership' && !['Live Member', 'Cancelled', 'Deceased'].includes(membershipStatus(match?.fields));
  if (match) {
    await airtable(env, 'PATCH', `${tablePath}/${match.id}`, { fields, typecast: true });
    console.log(`Updated ${signup.form} for ${signup.email} (${session.id})`);
    return { created: false, updated: true, pending, signup };
  }
  await airtable(env, 'POST', tablePath, { fields, typecast: true });
  console.log(`Recorded ${signup.form} for ${signup.email} (${session.id})`);
  return { created: true, pending, signup };
}

function formulaValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function nextMemberId(env) {
  let max = 0;
  let offset = '';
  do {
    const params = new URLSearchParams({ pageSize: '100' });
    params.append('fields[]', 'Member ID');
    if (offset) params.set('offset', offset);
    const page = await airtable(env, 'GET', `/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}?${params}`);
    for (const record of page.records || []) {
      const value = Number(record.fields['Member ID']);
      if (Number.isInteger(value) && value > max) max = value;
    }
    offset = page.offset || '';
  } while (offset);
  return String(max + 1);
}

function contactFormula(env, email) {
  const quoted = `"${formulaValue(email)}"`;
  if (env.AIRTABLE_TABLE_ID === 'tblqgtpXroIv0cmZc') {
    return `OR(LOWER({Email})=${quoted}, LOWER({Email (Joint)})=${quoted})`;
  }
  return `LOWER({Email})=${quoted}`;
}

function membershipStatus(fields) {
  return fields?.['Membership status'] || fields?.['Membership status '] || '';
}

function statusRank(status) {
  if (status === 'Live Member') return 0;
  if (status === 'Pending') return 1;
  if (status === 'Non-member') return 2;
  return 3;
}

function chooseContact(records) {
  if (!records.length) return null;
  return [...records].sort((a, b) => {
    const rank = statusRank(membershipStatus(a.fields)) - statusRank(membershipStatus(b.fields));
    if (rank !== 0) return rank;
    return String(b.createdTime || '').localeCompare(String(a.createdTime || ''));
  })[0];
}

function fieldsForSignup(env, signup, session, existing, memberId = '') {
  const liveTable = env.AIRTABLE_TABLE_ID === 'tblqgtpXroIv0cmZc';
  const statusField = liveTable ? 'Membership status ' : 'Membership status';
  const fields = {
    'Full name': signup.name,
    'Mobile number': signup.phone,
    Address: signup.address,
    'Checkout session': session.id,
  };
  if (!existing || String(existing.Email || '').toLowerCase() === signup.email) {
    fields.Email = signup.email;
  }
  if (!existing) {
    fields[statusField] = signup.form === 'membership' ? 'Pending' : 'Non-member';
    fields['Membership Type'] = 'Individual';
    fields['Donation response from form'] = donationResponse(signup);
    fields.Notes = liveTable
      ? 'Signup from the Chorlton Bikes website form.'
      : 'Test signup from the hosted membership-forms preview.';
    if (memberId) fields['Member ID'] = memberId;
  } else {
    const currentStatus = membershipStatus(existing);
    if (signup.form === 'membership' && (currentStatus === 'Non-member' || currentStatus === '')) {
      fields[statusField] = 'Pending';
    }
    if (signup.donationType === 'monthly' || signup.donationType === 'once') {
      fields['Donation response from form'] = combinedDonationResponse(
        existing['Donation response from form'],
        signup.donationType,
      );
      const when = new Date().toISOString().slice(0, 10);
      const added = signup.donationType === 'monthly' ? `£${signup.monthlyAmount} monthly` : `£${signup.onceAmount} one-time`;
      fields['Latest signup'] = `${when}: additional ${added}. Checkout ${session.id}.`;
    }
    const when = new Date().toISOString().slice(0, 10);
    const previous = existing.Notes ? `${existing.Notes}\n` : '';
    fields.Notes = `${previous}${when}: ${signup.form} signup, donation ${donationResponse(signup)}. Checkout ${session.id}.`;
  }
  if (signup.onceAmount) {
    const total = existingOncePounds(existing) + Number(signup.onceAmount);
    fields['One-time donation amount'] = total.toFixed(2);
  }
  if (signup.monthlyAmount) {
    const total = existingMonthlyPounds(existing) + Number(signup.monthlyAmount);
    fields['Monthly amount entered'] = total;
    if (!liveTable) {
      fields['Monthly amount'] = String(total);
    }
  }
  if (session.subscription) {
    fields['Subscription ID'] = session.subscription;
  }
  return fields;
}

export function completeSignup(env, sessionId) {
  if (inflight.has(sessionId)) {
    return inflight.get(sessionId);
  }
  const job = (async () => {
    const session = await stripe(env, 'GET', `/checkout/sessions/${sessionId}`);
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      throw new Error('Payment is not complete yet');
    }
    return recordSignup(env, session);
  })().finally(() => {
    inflight.delete(sessionId);
  });
  inflight.set(sessionId, job);
  return job;
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyStripeSignature(rawBody, header, secret) {
  if (!header || !secret) {
    return false;
  }
  const parts = Object.fromEntries(header.split(',').map((part) => part.split('=')));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return false;
  }
  const expected = await hmacHex(secret, `${timestamp}.${rawBody}`);
  if (expected.length !== signature.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function handleSignupRequest(request, env) {
  const url = new URL(request.url);
  if (request.method === 'POST' && url.pathname === '/api/checkout') {
    const signup = parseSignup(await request.json());
    const session = await createCheckout(env, signup, url.origin);
    return json(200, { url: session.url });
  }
  if (request.method === 'GET' && url.pathname === '/api/signup-complete') {
    const sessionId = url.searchParams.get('session_id') || '';
    if (!sessionId.startsWith('cs_')) {
      return json(400, { error: 'Missing payment session' });
    }
    const result = await completeSignup(env, sessionId);
    return json(200, {
      ok: true,
      name: result.signup.name,
      kind: result.signup.form,
        created: result.created,
        updated: Boolean(result.updated),
        pending: Boolean(result.pending),
    });
  }
  if (request.method === 'POST' && url.pathname === '/api/stripe-webhook') {
    const raw = await request.text();
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return json(503, { error: 'STRIPE_WEBHOOK_SECRET is not set' });
    }
    const valid = await verifyStripeSignature(raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return json(400, { error: 'Invalid Stripe signature' });
    }
    const event = JSON.parse(raw);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        await recordSignup(env, session);
      }
    }
    return json(200, { received: true });
  }
  return json(404, { error: 'Not found' });
}
