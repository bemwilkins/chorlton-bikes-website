import { loadEnvFile } from './google-auth.js';
import { isValidEmail, normalizeEmail } from './mailchimp-audience.js';

const FIELD = {
  email: 'Email',
  jointEmail: 'Email (Joint)',
  fullName: 'Full name',
  salutation: 'Salutation',
  membershipStatus: 'Membership status ',
  phone: 'Mobile number',
  company: 'Organisation Name',
  address: 'Address',
  dob: 'Date of birth',
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

const HONORIFICS = new Set([
  'mr',
  'mrs',
  'ms',
  'miss',
  'dr',
  'prof',
  'professor',
  'sir',
  'lady',
  'lord',
  'rev',
  'reverend',
  'mx',
]);

export function isHonorific(token) {
  const normalized = String(token ?? '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');
  return HONORIFICS.has(normalized);
}

export function isInitial(token) {
  const value = String(token ?? '').trim();
  if (!value) {
    return true;
  }
  if (/^[A-Za-z]\.?$/.test(value)) {
    return true;
  }
  if (/^([A-Za-z]\.){1,3}[A-Za-z]?\.?$/.test(value)) {
    return true;
  }
  return false;
}

function wordLetters(word) {
  return word.replace(/[^A-Za-z]/g, '');
}

function needsProperCase(word) {
  const letters = wordLetters(word);
  if (!letters) {
    return false;
  }
  return letters === letters.toLowerCase() || letters === letters.toUpperCase();
}

function formatWordProperCase(word) {
  if (!word || !needsProperCase(word)) {
    return word;
  }

  if (word.includes('-')) {
    return word
      .split('-')
      .map((part) => formatWordProperCase(part))
      .join('-');
  }

  const mcMatch = word.match(/^(mc|mac)(.+)$/i);
  if (mcMatch) {
    const prefix = mcMatch[1].charAt(0).toUpperCase() + mcMatch[1].slice(1).toLowerCase();
    const rest = mcMatch[2];
    return prefix + rest.charAt(0).toUpperCase() + rest.slice(1).toLowerCase();
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatProperCase(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => formatWordProperCase(word))
    .join(' ');
}

export function parseContactName(fullName, salutation = '') {
  const sal = String(salutation ?? '').trim();
  let parts = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  while (parts.length && isHonorific(parts[0])) {
    parts.shift();
  }

  if (sal && !isHonorific(sal)) {
    return {
      firstName: sal,
      lastName: parts.join(' '),
    };
  }

  while (parts.length && isInitial(parts[0])) {
    parts.shift();
  }

  const firstName = parts.shift() ?? '';
  return {
    firstName,
    lastName: parts.join(' '),
  };
}

function formatBirthday(value) {
  if (!value) {
    return '';
  }
  const date = String(value).slice(0, 10);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return '';
  }
  return `${match[2]}/${match[3]}`;
}

export function airtableRecordToMailchimp(fields) {
  const salutation = String(fields[FIELD.salutation] ?? '').trim();
  const { firstName, lastName } = parseContactName(fields[FIELD.fullName], salutation);

  return {
    FNAME: formatProperCase(firstName),
    LNAME: formatProperCase(lastName),
    MMERGE7: String(fields[FIELD.membershipStatus] ?? '').trim(),
    PHONE: String(fields[FIELD.phone] ?? '').trim(),
    COMPANY: String(fields[FIELD.company] ?? '').trim(),
    BIRTHDAY: formatBirthday(fields[FIELD.dob]),
  };
}

function cleanMergeFields(mergeFields) {
  const cleaned = {};
  for (const [key, value] of Object.entries(mergeFields)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (key === 'ADDRESS' && typeof value === 'object') {
      const addr = Object.fromEntries(
        Object.entries(value).filter(([, part]) => String(part ?? '').trim()),
      );
      if (Object.keys(addr).length > 0) {
        cleaned.ADDRESS = addr;
      }
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

export async function fetchAirtableContacts() {
  await loadEnvFile();
  const token = requireEnv('AIRTABLE_TOKEN');
  const baseId = requireEnv('AIRTABLE_BASE_ID');
  const tableId = requireEnv('AIRTABLE_TABLE_ID');

  const records = [];
  let offset;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set('pageSize', '100');
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Airtable fetch failed (${response.status}): ${data.error?.message ?? 'unknown error'}`);
    }

    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

export function buildAudienceContacts(records) {
  const byEmail = new Map();
  const duplicateEmails = [];

  for (const record of records) {
    const fields = record.fields ?? {};
    const emails = [fields[FIELD.email], fields[FIELD.jointEmail]]
      .map((email) => normalizeEmail(email))
      .filter((email) => email && isValidEmail(email));

    for (const email of emails) {
      const mergeFields = cleanMergeFields(airtableRecordToMailchimp(fields));
      const contact = {
        email,
        mergeFields,
        sourceName: String(fields[FIELD.fullName] ?? '').trim(),
        membershipStatus: String(fields[FIELD.membershipStatus] ?? '').trim(),
        airtableId: record.id,
      };

      if (byEmail.has(email)) {
        duplicateEmails.push({
          email,
          kept: byEmail.get(email).airtableId,
          replacedBy: record.id,
        });
      }
      byEmail.set(email, contact);
    }
  }

  return {
    contacts: [...byEmail.values()],
    duplicateEmails,
  };
}
