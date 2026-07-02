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

function splitName(fullName) {
  const parts = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return { firstName: '', lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
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
  const { firstName, lastName } = splitName(fields[FIELD.fullName]);
  const salutation = String(fields[FIELD.salutation] ?? '').trim();

  return {
    FNAME: salutation || firstName,
    LNAME: lastName,
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
