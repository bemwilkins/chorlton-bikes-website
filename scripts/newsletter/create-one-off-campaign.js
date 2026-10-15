import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMailchimpClient } from './lib/mailchimp-audience.js';
import { hostImagesInMailchimp } from './lib/mailchimp-images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

function readTag(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&#39;/g, "'");
}

export async function createOneOffCampaign({ htmlPath, subject, previewText, title, campaignId, refreshOnly = false }) {
  const absolutePath = path.isAbsolute(htmlPath) ? htmlPath : path.join(repoRoot, htmlPath);
  const sourceHtml = await fs.readFile(absolutePath, 'utf8');

  const settings = {
    subject_line: subject ?? decodeEntities(readTag(sourceHtml, /<title>([^<]+)<\/title>/i)),
    preview_text: previewText ?? decodeEntities(readTag(sourceHtml, /<meta name="preview-text" content="([^"]*)"/i)),
    title: title ?? path.basename(absolutePath, '.html'),
    from_name: process.env.MAILCHIMP_FROM_NAME ?? 'Chorlton Bikes',
    reply_to: process.env.MAILCHIMP_REPLY_TO ?? process.env.MAILCHIMP_FROM_EMAIL ?? 'members@chorltonbikes.coop',
  };
  if (!settings.subject_line) {
    throw new Error('Missing subject: add a <title> to the HTML or pass --subject');
  }

  const mailchimp = await createMailchimpClient();
  const hosted = await hostImagesInMailchimp(sourceHtml, mailchimp, repoRoot);

  if (refreshOnly) {
    if (!campaignId) {
      throw new Error('refresh requires --campaign-id');
    }
    await mailchimp.updateCampaign(campaignId, { settings: { subject_line: settings.subject_line, preview_text: settings.preview_text } });
    await mailchimp.setCampaignContent(campaignId, hosted.html);
    return { settings, campaignId, refreshed: true, ...hosted };
  }

  const campaign = await mailchimp.createCampaign(settings);
  await mailchimp.setCampaignContent(campaign.id, hosted.html);
  const datacenter = process.env.MAILCHIMP_API_KEY.split('-').pop();
  return {
    settings,
    campaignId: campaign.id,
    adminUrl: `https://${datacenter}.admin.mailchimp.com/campaigns/show?id=${campaign.web_id}`,
    ...hosted,
  };
}

export function printOneOffResult(result) {
  console.log(`Subject: ${result.settings.subject_line}`);
  console.log(`Preview: ${result.settings.preview_text || '(none)'}`);
  console.log(`Images hosted in Mailchimp: ${result.hostedCount}/${result.imageCount}`);
  if (result.refreshed) {
    console.log(`Refreshed campaign: ${result.campaignId}`);
    return;
  }
  console.log('');
  console.log(`Campaign draft: ${result.adminUrl}`);
  console.log(`Campaign ID: ${result.campaignId}`);
}
