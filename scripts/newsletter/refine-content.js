import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { newsletterContentSchema } from './lib/content-schema.js';
import { applyImageMappings } from './lib/merge-defaults.js';
import { validateContent } from './lib/validate.js';
import { slugId } from './lib/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

async function loadEnvFile() {
  try {
    const envPath = path.join(repoRoot, '.env');
    const text = await fs.readFile(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const separator = trimmed.indexOf('=');
      if (separator === -1) {
        continue;
      }
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional .env
  }
}

async function loadStyleReference(month, year) {
  const contentDir = path.join(repoRoot, 'newsletter/content');
  const targetSlug = slugId(month, year);
  const files = (await fs.readdir(contentDir))
    .filter((file) => /^\d{4}-\d{2}\.json$/.test(file) && !file.includes('.raw'))
    .sort()
    .reverse();

  const referenceFile = files.find((file) => file.replace('.json', '') < targetSlug) ?? files[0];
  if (!referenceFile) {
    return null;
  }

  const raw = await fs.readFile(path.join(contentDir, referenceFile), 'utf8');
  return JSON.parse(raw);
}

async function loadImageNotes(month, year) {
  const notesPath = path.join(
    repoRoot,
    'newsletter/mappings',
    `${slugId(month, year)}.notes.txt`,
  );
  try {
    return await fs.readFile(notesPath, 'utf8');
  } catch {
    return '';
  }
}

function buildUserPrompt({ rawContent, styleReference, imageNotes }) {
  return `## STYLE REFERENCE (${styleReference.month} ${styleReference.year})

${JSON.stringify(styleReference, null, 2)}

## RAW CONTENT TO REFINE (${rawContent.month} ${rawContent.year})

${JSON.stringify(rawContent, null, 2)}

${imageNotes ? `## IMAGE NOTES (from editor — use for alt text suggestions only, do not invent filenames)\n\n${imageNotes}` : ''}

Refine the RAW CONTENT into publish-ready newsletter JSON.`;
}

export async function refineNewsletterContent(rawContent, options = {}) {
  await loadEnvFile();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey && !options.dryRun) {
    throw new Error(
      'OPENAI_API_KEY is required for refinement. Add it to .env or your environment.',
    );
  }

  const styleReference =
    options.styleReference ??
    (await loadStyleReference(rawContent.month, rawContent.year)) ??
    (await loadStyleReference('May', 2026));

  if (!styleReference) {
    throw new Error(
      'No style reference newsletter found. Add newsletter/content/2026-05.json or pass --style-reference.',
    );
  }

  const imageNotes = await loadImageNotes(rawContent.month, rawContent.year);
  const systemPrompt = await fs.readFile(
    path.join(__dirname, 'prompts/refine-system.txt'),
    'utf8',
  );
  const userPrompt = buildUserPrompt({ rawContent, styleReference, imageNotes });

  if (options.dryRun) {
    return {
      dryRun: true,
      systemPrompt,
      userPrompt,
      model: process.env.NEWSLETTER_AI_MODEL ?? 'gpt-4o',
    };
  }

  const openai = createOpenAI({ apiKey });
  const modelId = process.env.NEWSLETTER_AI_MODEL ?? 'gpt-4o';

  const { output } = await generateText({
    model: openai(modelId),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({ schema: newsletterContentSchema }),
    temperature: 0.4,
  });

  const withMappings = await applyImageMappings({
    ...output,
    status: rawContent.status ?? 'DRAFT',
    footerYear: rawContent.footerYear,
  });

  validateContent(withMappings);
  return withMappings;
}

export async function refineContentFile(inputPath, options = {}) {
  const absoluteInput = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(repoRoot, inputPath);
  const raw = await fs.readFile(absoluteInput, 'utf8');
  const rawContent = JSON.parse(raw);

  let styleReference;
  if (options.styleReference) {
    const stylePath = path.isAbsolute(options.styleReference)
      ? options.styleReference
      : path.join(repoRoot, options.styleReference);
    styleReference = JSON.parse(await fs.readFile(stylePath, 'utf8'));
  }

  return refineNewsletterContent(rawContent, {
    ...options,
    styleReference,
  });
}

export function rawContentPathFor(contentPath) {
  const parsed = path.parse(contentPath);
  if (parsed.name.endsWith('.raw')) {
    return contentPath;
  }
  return path.join(parsed.dir, `${parsed.name}.raw${parsed.ext}`);
}

export function refinedContentPathFor(rawPath) {
  const parsed = path.parse(rawPath);
  const baseName = parsed.name.replace(/\.raw$/, '');
  return path.join(parsed.dir, `${baseName}${parsed.ext}`);
}
