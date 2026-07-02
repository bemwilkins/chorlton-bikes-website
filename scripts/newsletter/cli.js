#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateWebPage, loadContentFile } from './generate-web.js';
import { GOOGLE_DOC_ID, parseGoogleDoc, parseGoogleDocText } from './parse-google-doc.js';
import { mergeParsedContent } from './lib/merge-defaults.js';
import {
  refineContentFile,
  refineNewsletterContent,
  rawContentPathFor,
  refinedContentPathFor,
} from './refine-content.js';
import { runGoogleLogin } from './lib/google-auth.js';
import { syncNewsletterImages } from './sync-images.js';
import { printAudienceReport, syncAudience } from './sync-audience.js';
import { createMailchimpCampaign, printCampaignResult } from './create-mailchimp-campaign.js';
import { slugId } from './lib/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

function printUsage() {
  console.log(`Usage:
  npm run newsletter:parse-doc -- --month June --year 2026
  npm run newsletter:refine -- --content newsletter/content/2026-06.raw.json
  npm run newsletter:sync-images -- --month June --year 2026
  npm run newsletter:generate -- --content newsletter/content/2026-06.json
  npm run newsletter:build -- --month June --year 2026
  npm run newsletter:sync-audience -- --dry-run
  npm run newsletter:mailchimp -- --month June --year 2026

Commands:
  parse-doc     Fetch/parse the ops Google Doc → .raw.json
  refine        AI polish of raw JSON → .json (needs OPENAI_API_KEY)
  google-login    One-time browser sign-in as ben@chorltonbikes.coop (OAuth)
  sync-images     Download images from Drive + match + generate
  sync-audience   Sync Airtable contacts to Mailchimp audience
  mailchimp       Create Mailchimp campaign draft from newsletter HTML
  generate      Build newsletter HTML from .json
  build         parse-doc → refine → generate

Options:
  --content         Path to newsletter JSON (raw for refine, refined for generate)
  --doc-id          Google Doc ID
  --credentials     Optional service account JSON (default: your Google login via gcloud or OAuth)
  --email           Google account for google-login (default: ben@chorltonbikes.coop)
  --folder-id       Google Drive folder ID for newsletter images
  --skip-download   Use images already in assets/images/newsletter/MM-YYYY/
  --from-file       Parse a local .txt export instead of fetching the doc
  --month           Month to parse (default: first in doc)
  --year            Year
  --style-reference Path to a finished newsletter JSON for style (default: previous month)
  --refine          Also run AI refinement after parse-doc
  --skip-refine     Skip refine step in build
  --output          Output path
  --dry-run         Print what would happen without writing or calling APIs
  --subject         Mailchimp campaign subject line
  --title           Internal Mailchimp campaign title
  --campaign-id     Update an existing Mailchimp campaign instead of creating a new one
  --refresh         With --campaign-id, replace campaign HTML only (no new draft)
`);
}

function parseArgs(argv) {
  const args = { command: argv[0], flags: {} };
  const rest = argv.slice(1);

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) {
      args.flags[key] = true;
    } else {
      args.flags[key] = next;
      i += 1;
    }
  }

  return args;
}

async function commandGenerate(flags) {
  if (!flags.content) {
    throw new Error('Missing --content <path>');
  }

  const content = await loadContentFile(flags.content);
  const result = await generateWebPage(content, {
    dryRun: Boolean(flags['dry-run']),
    outputPath: flags.output ? path.resolve(flags.output) : undefined,
  });

  if (flags['dry-run']) {
    console.log(`Would write: ${result.outputPath}`);
  } else {
    console.log(`Generated: ${result.outputPath}`);
  }
  console.log(`Image folder: assets/images/newsletter/${result.imageFolder}/`);
  console.log(`Canonical URL: https://chorltonbikes.coop/newsletter/${result.slug}.html`);
}

async function commandParseDoc(flags) {
  const docId = flags['doc-id'] ?? GOOGLE_DOC_ID;
  const parseOptions = {
    month: flags.month,
    year: flags.year,
  };

  let content;
  if (flags['from-file']) {
    const text = await fs.readFile(path.resolve(flags['from-file']), 'utf8');
    const parsed = await parseGoogleDocText(text, parseOptions);
    content = await mergeParsedContent(parsed);
  } else {
    content = await parseGoogleDoc({
      docId,
      credentialsPath: flags.credentials ? path.resolve(flags.credentials) : undefined,
      month: flags.month,
      year: flags.year,
    });
  }

  const slug = slugId(content.month, content.year);
  const rawOutputPath =
    flags.output ??
    path.join(repoRoot, 'newsletter/content', `${slug}.raw.json`);

  if (flags['dry-run']) {
    console.log(`Status: ${content.status}`);
    console.log(`Would write raw: ${rawOutputPath}`);
    console.log(JSON.stringify(content, null, 2));
    return { content, rawOutputPath };
  }

  await fs.mkdir(path.dirname(rawOutputPath), { recursive: true });
  await fs.writeFile(rawOutputPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  console.log(`Parsed: ${content.month} ${content.year}`);
  console.log(`Sections: ${content.sections.length}`);
  console.log(`Wrote raw: ${rawOutputPath}`);

  if (flags.refine) {
    return commandRefine({ content: rawOutputPath, ...flags });
  }

  return { content, rawOutputPath };
}

async function commandRefine(flags) {
  const inputPath = flags.content;
  if (!inputPath) {
    throw new Error('Missing --content <path to .raw.json>');
  }

  const absoluteInput = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(repoRoot, inputPath);
  const outputPath =
    flags.output ?? refinedContentPathFor(absoluteInput);

  if (flags['dry-run']) {
    const preview = await refineContentFile(absoluteInput, {
      dryRun: true,
      styleReference: flags['style-reference'],
    });
    console.log(`Model: ${preview.model}`);
    console.log(`Would write refined: ${outputPath}`);
    console.log(`--- system prompt (${preview.systemPrompt.length} chars) ---`);
    console.log(preview.systemPrompt.slice(0, 500), '...');
    return;
  }

  console.log('Refining with AI...');
  const refined = await refineContentFile(absoluteInput, {
    styleReference: flags['style-reference'],
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(refined, null, 2)}\n`, 'utf8');
  console.log(`Refined: ${refined.month} ${refined.year}`);
  console.log(`Sections: ${refined.sections.length}`);
  console.log(`Wrote: ${outputPath}`);
}

async function commandBuild(flags) {
  if (!flags.month) {
    throw new Error('build requires --month and --year');
  }

  const parseResult = await commandParseDoc({
    ...flags,
    'dry-run': flags['dry-run'],
    refine: false,
  });

  if (flags['dry-run']) {
    const slug = slugId(flags.month, flags.year);
    console.log(`Would refine: newsletter/content/${slug}.raw.json`);
    console.log(`Would generate: newsletter/content/${slug}.json → newsletter/${slug}.html`);
    return;
  }

  const rawPath = parseResult.rawOutputPath;
  const refinedPath = refinedContentPathFor(rawPath);

  if (!flags['skip-refine']) {
    await commandRefine({ content: rawPath, output: refinedPath });
  }

  await commandGenerate({
    content: refinedPath,
    output: path.join(repoRoot, 'newsletter', `${slugId(flags.month, flags.year)}.html`),
  });
}

async function commandSyncImages(flags) {
  if (!flags.month || !flags.year) {
    throw new Error('sync-images requires --month and --year');
  }

  const result = await syncNewsletterImages({
    month: flags.month,
    year: Number(flags.year),
    folderId: flags['folder-id'],
    credentialsPath: flags.credentials ? path.resolve(flags.credentials) : undefined,
    skipDownload: Boolean(flags['skip-download']),
  });

  console.log(`Mapping: ${result.mappingPath}`);
  console.log(`Images:  ${result.imageDir}`);
  for (const row of result.report) {
    const files = row.files.length ? row.files.join(', ') : '(none)';
    console.log(`  [${row.source}] ${row.title ?? row.section}: ${files}`);
  }

  if (!flags['no-generate']) {
    await commandGenerate({
      content: path.join(repoRoot, 'newsletter/content', `${slugId(flags.month, Number(flags.year))}.json`),
    });
  }
}

async function commandGoogleLogin(flags) {
  await runGoogleLogin({
    emailHint: flags.email ?? 'ben@chorltonbikes.coop',
  });
}

async function commandSyncAudience(flags) {
  const report = await syncAudience({ dryRun: Boolean(flags['dry-run']) });
  printAudienceReport(report, { dryRun: Boolean(flags['dry-run']) });
}

async function commandMailchimp(flags) {
  if (!flags.month || !flags.year) {
    throw new Error('mailchimp requires --month and --year');
  }

  const result = await createMailchimpCampaign({
    month: flags.month,
    year: Number(flags.year),
    dryRun: Boolean(flags['dry-run']),
    subject: flags.subject,
    title: flags.title,
    campaignId: flags['campaign-id'],
    refreshOnly: Boolean(flags.refresh),
  });
  printCampaignResult(result);
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const { command, flags } = parseArgs(argv);

  if (command === 'generate') {
    await commandGenerate(flags);
    return;
  }

  if (command === 'parse-doc') {
    await commandParseDoc(flags);
    return;
  }

  if (command === 'refine') {
    await commandRefine(flags);
    return;
  }

  if (command === 'google-login') {
    await commandGoogleLogin(flags);
    return;
  }

  if (command === 'sync-images') {
    await commandSyncImages(flags);
    return;
  }

  if (command === 'build') {
    await commandBuild(flags);
    return;
  }

  if (command === 'sync-audience') {
    await commandSyncAudience(flags);
    return;
  }

  if (command === 'mailchimp') {
    await commandMailchimp(flags);
    return;
  }

  printUsage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
