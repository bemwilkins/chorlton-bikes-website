import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './image-matcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

export async function loadDefaults() {
  const defaultsPath = path.join(repoRoot, 'newsletter/content/_defaults.json');
  const raw = await fs.readFile(defaultsPath, 'utf8');
  return JSON.parse(raw);
}

export async function loadMapping(month, year) {
  const mm = String(
    [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ].indexOf(month.toLowerCase()) + 1,
  ).padStart(2, '0');
  const mappingPath = path.join(repoRoot, 'newsletter/mappings', `${year}-${mm}.json`);

  try {
    const raw = await fs.readFile(mappingPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function applyImageMappings(content) {
  const mapping = await loadMapping(content.month, content.year);
  if (!mapping?.sections) {
    return content;
  }

  return {
    ...content,
    sections: content.sections.map((section) => {
      const key = slugifyTitle(section.title);
      const mappingEntry = mapping.sections[key] ?? mapping.sections[section.title];
      return applySectionMapping(section, mappingEntry);
    }),
  };
}

function slugifyTitle(title) {
  return slugify(title);
}

function applySectionMapping(section, mappingEntry) {
  if (!mappingEntry) {
    return section;
  }

  const merged = { ...section, ...mappingEntry };
  if (mappingEntry.title) {
    merged.title = mappingEntry.title;
  }
  if (mappingEntry.bullets) {
    merged.bullets = mappingEntry.bullets;
  }
  return merged;
}

export async function mergeParsedContent(parsed) {
  const defaults = await loadDefaults();
  const mapping = await loadMapping(parsed.month, parsed.year);

  const content = {
    month: parsed.month,
    year: parsed.year,
    intro: parsed.intro?.greeting ? parsed.intro : defaults.intro,
    monthIntro: parsed.monthIntro || defaults.monthIntro,
    sections: parsed.sections.map((section) => {
      const key = slugifyTitle(section.title);
      const mappingEntry = mapping?.sections?.[key] ?? mapping?.sections?.[section.title];
      return applySectionMapping(section, mappingEntry);
    }),
    thankYou: parsed.thankYou ?? defaults.thankYou,
    footerYear: defaults.footerYear,
    status: parsed.status ?? 'DRAFT',
  };

  if (parsed.thankYou) {
    content.thankYou = parsed.thankYou;
  }

  return content;
}
