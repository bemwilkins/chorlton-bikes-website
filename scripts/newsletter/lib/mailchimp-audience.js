import crypto from 'node:crypto';
import { loadEnvFile } from './google-auth.js';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

export async function createMailchimpClient() {
  await loadEnvFile();
  const apiKey = requireEnv('MAILCHIMP_API_KEY');
  const listId = requireEnv('MAILCHIMP_LIST_ID');
  const datacenter = apiKey.split('-').pop();
  const baseUrl = `https://${datacenter}.api.mailchimp.com/3.0`;
  const authHeader = `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`;

  async function request(method, path, body) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }

    if (!response.ok) {
      const detail = data?.detail ?? data?.title ?? text;
      throw new Error(`Mailchimp ${method} ${path} failed (${response.status}): ${detail}`);
    }

    return data;
  }

  return {
    listId,
    getList: () => request('GET', `/lists/${listId}`),
    listMembers: async (status) => {
      const members = [];
      let offset = 0;

      while (true) {
        const page = await request(
          'GET',
          `/lists/${listId}/members?status=${status}&count=1000&offset=${offset}&fields=members.email_address,members.status,members.merge_fields,total_items`,
        );
        members.push(...(page.members ?? []));
        offset += page.members?.length ?? 0;
        if (offset >= (page.total_items ?? 0) || !page.members?.length) {
          break;
        }
      }

      return members;
    },
    upsertMember: (email, mergeFields) =>
      request('PUT', `/lists/${listId}/members/${subscriberHash(email)}`, {
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: mergeFields,
      }),
    createCampaign: (settings) =>
      request('POST', '/campaigns', {
        type: 'regular',
        recipients: { list_id: listId },
        settings,
      }),
    setCampaignContent: (campaignId, html) =>
      request('PUT', `/campaigns/${campaignId}/content`, { html }),
    updateCampaign: (campaignId, body) => request('PATCH', `/campaigns/${campaignId}`, body),
    uploadFile: (name, buffer) =>
      request('POST', '/file-manager/files', {
        name,
        file_data: buffer.toString('base64'),
      }),
  };
}

export function subscriberHash(email) {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

export function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? '';
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
