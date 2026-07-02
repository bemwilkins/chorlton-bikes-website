import { buildAudienceContacts, fetchAirtableContacts } from './lib/airtable-contacts.js';
import {
  createMailchimpClient,
  isValidEmail,
  normalizeEmail,
} from './lib/mailchimp-audience.js';

const PROTECTED_STATUSES = new Set(['unsubscribed', 'cleaned']);

function mergeFieldsEqual(target, existing) {
  for (const [key, value] of Object.entries(target ?? {})) {
    const current = existing?.[key];
    if (key === 'ADDRESS') {
      const left = JSON.stringify(value ?? {});
      const right = JSON.stringify(current ?? {});
      if (left !== right) {
        return false;
      }
      continue;
    }
    if (String(current ?? '').trim() !== String(value ?? '').trim()) {
      return false;
    }
  }
  return true;
}

function cleanMergeFields(mergeFields) {
  const cleaned = {};
  for (const [key, value] of Object.entries(mergeFields ?? {})) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

export async function syncAudience({ dryRun = false } = {}) {
  const mailchimp = await createMailchimpClient();
  const list = await mailchimp.getList();
  const airtableRecords = await fetchAirtableContacts();
  const { contacts, duplicateEmails } = buildAudienceContacts(airtableRecords);

  const existingMembers = new Map();
  for (const status of ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']) {
    const members = await mailchimp.listMembers(status);
    for (const member of members) {
      existingMembers.set(normalizeEmail(member.email_address), member);
    }
  }

  const report = {
    audience: list.name,
    airtableRecords: airtableRecords.length,
    uniqueEmails: contacts.length,
    duplicateEmails,
    wouldAdd: [],
    wouldUpdate: [],
    unchanged: [],
    skippedProtected: [],
    invalidEmails: [],
    errors: [],
  };

  for (const contact of contacts) {
    if (!isValidEmail(contact.email)) {
      report.invalidEmails.push(contact.email);
      continue;
    }

    const existing = existingMembers.get(contact.email);
    const mergeFields = cleanMergeFields(contact.mergeFields);

    if (!existing) {
      report.wouldAdd.push({
        email: contact.email,
        name: contact.sourceName,
        membershipStatus: contact.membershipStatus,
      });
      if (!dryRun) {
        try {
          await mailchimp.upsertMember(contact.email, mergeFields);
        } catch (error) {
          report.errors.push({ email: contact.email, action: 'add', message: error.message });
        }
      }
      continue;
    }

    if (PROTECTED_STATUSES.has(existing.status)) {
      report.skippedProtected.push({
        email: contact.email,
        status: existing.status,
        name: contact.sourceName,
      });
      continue;
    }

    const existingFields = cleanMergeFields(existing.merge_fields ?? {});
    if (mergeFieldsEqual(existingFields, mergeFields)) {
      report.unchanged.push({
        email: contact.email,
        name: contact.sourceName,
      });
      continue;
    }

    report.wouldUpdate.push({
      email: contact.email,
      name: contact.sourceName,
      from: existingFields,
      to: mergeFields,
    });

    if (!dryRun) {
      try {
        await mailchimp.upsertMember(contact.email, mergeFields);
      } catch (error) {
        report.errors.push({ email: contact.email, action: 'update', message: error.message });
      }
    }
  }

  return report;
}

export function printAudienceReport(report, { dryRun = false } = {}) {
  console.log(`Audience: ${report.audience}`);
  console.log(`Airtable records: ${report.airtableRecords}`);
  console.log(`Unique emails from Airtable: ${report.uniqueEmails}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('');

  if (report.duplicateEmails.length) {
    console.log(`Duplicate emails in Airtable (${report.duplicateEmails.length}) — latest record wins:`);
    for (const row of report.duplicateEmails) {
      console.log(`  - ${row.email}`);
    }
    console.log('');
  }

  console.log(`Would add: ${report.wouldAdd.length}`);
  for (const row of report.wouldAdd) {
    console.log(`  + ${row.email} (${row.name || 'no name'})`);
  }

  console.log(`Would update: ${report.wouldUpdate.length}`);
  for (const row of report.wouldUpdate) {
    console.log(`  ~ ${row.email} (${row.name || 'no name'})`);
  }

  console.log(`Unchanged: ${report.unchanged.length}`);
  console.log(`Skipped (unsubscribed/cleaned in Mailchimp): ${report.skippedProtected.length}`);
  for (const row of report.skippedProtected) {
    console.log(`  ! ${row.email} [${row.status}]`);
  }

  if (report.invalidEmails.length) {
    console.log(`Invalid emails: ${report.invalidEmails.length}`);
    for (const email of report.invalidEmails) {
      console.log(`  ? ${email}`);
    }
  }

  if (report.errors.length) {
    console.log(`Errors: ${report.errors.length}`);
    for (const row of report.errors) {
      console.log(`  x ${row.email} (${row.action}): ${row.message}`);
    }
  }
}
