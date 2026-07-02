import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentFile } from './generate-web.js';
import { createMailchimpClient } from './lib/mailchimp-audience.js';
import { hostImagesInMailchimp } from './lib/mailchimp-images.js';
import { prepareEmailHtml } from './lib/prepare-email-html.js';
import { canonicalUrl, slugId } from './lib/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const DEFAULT_FROM_EMAIL = 'members@chorltonbikes.coop';

function campaignAdminUrl(apiKey, webId) {
  const datacenter = apiKey.split('-').pop();
  return `https://${datacenter}.admin.mailchimp.com/campaigns/show?id=${webId}`;
}

function previewText(content) {
  const text = content.monthIntro?.trim();
  if (!text) {
    return '';
  }
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

async function buildHostedEmailHtml({ month, year, content, mapping }) {
  const slug = slugId(month, year);
  const webHtmlPath = path.join(repoRoot, 'newsletter', `${slug}.html`);
  const emailHtml = prepareEmailHtml({ content, mapping, month, year });
  const mailchimp = await createMailchimpClient();
  const hosted = await hostImagesInMailchimp(emailHtml, mailchimp, repoRoot);
  return {
    webHtmlPath,
    emailHtml: hosted.html,
    hostedCount: hosted.hostedCount,
    imageCount: hosted.imageCount,
    mailchimp,
  };
}

async function loadMapping(slug) {
  const mappingPath = path.join(repoRoot, 'newsletter/mappings', `${slug}.json`);
  try {
    return JSON.parse(await fs.readFile(mappingPath, 'utf8'));
  } catch {
    return { sections: {} };
  }
}

export async function createMailchimpCampaign({
  month,
  year,
  dryRun = false,
  subject,
  title,
  campaignId,
  refreshOnly = false,
}) {
  const slug = slugId(month, year);
  const contentPath = path.join(repoRoot, 'newsletter/content', `${slug}.json`);
  const content = await loadContentFile(contentPath);
  const mapping = await loadMapping(slug);

  const campaignSettings = {
    subject_line: subject ?? `Chorlton Bikes Newsletter – ${month} ${year}`,
    preview_text: previewText(content),
    title: title ?? `${month} ${year} Newsletter`,
    from_name: process.env.MAILCHIMP_FROM_NAME ?? 'Chorlton Bikes',
    reply_to:
      process.env.MAILCHIMP_REPLY_TO ??
      process.env.MAILCHIMP_FROM_EMAIL ??
      DEFAULT_FROM_EMAIL,
  };

  if (dryRun) {
    const webHtmlPath = path.join(repoRoot, 'newsletter', `${slug}.html`);
    const emailHtml = prepareEmailHtml({ content, mapping, month, year });
    const imageCount = [...emailHtml.matchAll(/src="https:\/\/chorltonbikes\.coop\/assets\//g)].length;
    return {
      settings: campaignSettings,
      htmlLength: emailHtml.length,
      webVersionUrl: canonicalUrl(month, year),
      webHtmlPath,
      imageCount,
      dryRun: true,
    };
  }

  const { webHtmlPath, emailHtml, hostedCount, imageCount, mailchimp } =
    await buildHostedEmailHtml({ month, year, content, mapping });

  if (!refreshOnly) {
    const list = await mailchimp.getList();
    const defaults = list.campaign_defaults ?? {};
    campaignSettings.from_name =
      process.env.MAILCHIMP_FROM_NAME ?? defaults.from_name ?? campaignSettings.from_name;
  }

  const payload = {
    settings: campaignSettings,
    htmlLength: emailHtml.length,
    webVersionUrl: canonicalUrl(month, year),
    webHtmlPath,
    hostedCount,
    imageCount,
  };

  if (refreshOnly) {
    if (!campaignId) {
      throw new Error('refresh requires --campaign-id');
    }
    await mailchimp.setCampaignContent(campaignId, emailHtml);
    return {
      ...payload,
      campaignId,
      refreshed: true,
    };
  }

  const campaign = await mailchimp.createCampaign(campaignSettings);
  await mailchimp.setCampaignContent(campaign.id, emailHtml);

  return {
    ...payload,
    campaignId: campaign.id,
    webId: campaign.web_id,
    adminUrl: campaignAdminUrl(process.env.MAILCHIMP_API_KEY, campaign.web_id),
    status: campaign.status,
  };
}

export function printCampaignResult(result) {
  console.log(`Subject: ${result.settings.subject_line}`);
  console.log(`Preview: ${result.settings.preview_text || '(none)'}`);
  console.log(`From: ${result.settings.from_name} <${result.settings.reply_to}>`);
  console.log(`Web version: ${result.webVersionUrl}`);
  console.log(`HTML source: ${result.webHtmlPath}`);
  console.log(`Email HTML size: ${result.htmlLength} chars`);
  if (result.imageCount !== undefined) {
    console.log(`Images hosted in Mailchimp: ${result.hostedCount ?? 0}/${result.imageCount}`);
  }
  console.log(`Mode: ${result.dryRun ? 'DRY RUN (no Mailchimp draft created)' : 'LIVE'}`);

  if (result.refreshed) {
    console.log(`Refreshed campaign content: ${result.campaignId}`);
  }

  if (result.adminUrl) {
    console.log('');
    console.log(`Campaign draft: ${result.adminUrl}`);
    console.log(`Campaign ID: ${result.campaignId}`);
  }
}
