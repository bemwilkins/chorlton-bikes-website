import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { applyImageMappings } from './lib/merge-defaults.js';
import { prepareSections } from './lib/render-sections.js';
import { canonicalUrl, imageFolder, slugId } from './lib/utils.js';
import { validateContent } from './lib/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export async function generateWebPage(content, options = {}) {
  const withImages = await applyImageMappings(content);
  const validated = validateContent(withImages);
  const templatePath = path.join(repoRoot, 'newsletter/templates/web.html.hbs');
  const templateSource = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource, { noEscape: false });

  const footerYear = validated.footerYear ?? new Date().getFullYear();
  const html = template({
    month: validated.month,
    year: validated.year,
    intro: validated.intro,
    monthIntro: validated.monthIntro,
    sections: prepareSections(validated),
    thankYou: validated.thankYou,
    canonicalUrl: canonicalUrl(validated.month, validated.year),
    footerYear,
  });

  const outputPath =
    options.outputPath ??
    path.join(repoRoot, 'newsletter', `${slugId(validated.month, validated.year)}.html`);

  if (!options.dryRun) {
    await fs.writeFile(outputPath, html, 'utf8');
  }

  return {
    outputPath,
    slug: slugId(validated.month, validated.year),
    imageFolder: imageFolder(validated.month, validated.year),
    html,
  };
}

export async function loadContentFile(contentPath) {
  const absolutePath = path.isAbsolute(contentPath)
    ? contentPath
    : path.join(repoRoot, contentPath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw);
}
