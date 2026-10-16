import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeAttr, escapeHtml, imageFolder } from './lib/utils.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function plainText(value) {
  return String(value)
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function summary(value) {
  const text = plainText(value);
  const sentence = text.split(/(?<=\.)\s+/)[0] || text;
  if (sentence.length <= 220) return sentence;
  return `${sentence.slice(0, 217).replace(/\s+\S*$/, '')}…`;
}

function storyTag(value) {
  const match = plainText(value).match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
  if (!match) return '';
  const month = MONTHS.find((name) => name.toLowerCase() === match[2].toLowerCase());
  return `${Number(match[1])} ${month}`;
}

export async function listNewsletterIssues() {
  const dir = path.join(repoRoot, 'newsletter');
  const names = await fs.readdir(dir);
  return names
    .filter((name) => /^\d{4}-\d{2}\.html$/.test(name))
    .map((name) => {
      const slug = name.replace(/\.html$/, '');
      const [year, month] = slug.split('-').map(Number);
      return { slug, year, month, name: `${MONTHS[month - 1]} ${year}` };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

function imageSize(filePath) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], { encoding: 'utf8' });
  return {
    width: Number(out.match(/pixelWidth: (\d+)/)[1]),
    height: Number(out.match(/pixelHeight: (\d+)/)[1]),
  };
}

function cornerColor(filePath, x, y) {
  const raw = execFileSync('ffmpeg', [
    '-v', 'error',
    '-i', filePath,
    '-vf', `crop=12:12:${x}:${y},scale=1:1`,
    '-frames:v', '1',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    '-',
  ], { encoding: 'buffer', maxBuffer: 64 });
  return [raw[0], raw[1], raw[2]];
}

function graphicClass(filePath) {
  try {
    const { width, height } = imageSize(filePath);
    const ratio = width / height;
    if (ratio > 1.55 || ratio < 0.62) return ' is-fit';
    if (ratio >= 0.68 && ratio <= 0.9) return '';
    const spots = [
      [0, 0],
      [Math.max(0, width - 12), 0],
      [0, Math.max(0, height - 12)],
      [Math.max(0, width - 12), Math.max(0, height - 12)],
    ].map(([x, y]) => cornerColor(filePath, x, y));
    const average = spots.reduce((sum, sample) => [sum[0] + sample[0], sum[1] + sample[1], sum[2] + sample[2]], [0, 0, 0]).map((value) => value / spots.length);
    const spread = spots.reduce((max, sample) => Math.max(
      max,
      Math.abs(sample[0] - average[0]),
      Math.abs(sample[1] - average[1]),
      Math.abs(sample[2] - average[2]),
    ), 0);
    return spread < 28 ? ' is-fit' : '';
  } catch {
    return '';
  }
}

function renderStory(section, folder) {
  const image = section.images?.[0];
  const bullet = section.bullets?.[0] || '';
  const tag = storyTag(bullet);
  const src = image
    ? `assets/images/newsletter/${folder}/${encodeURIComponent(image.file).replace(/%2F/g, '/')}`
    : 'assets/images/carousel/04.png';
  const alt = image?.alt || section.title;
  const fit = image
    ? graphicClass(path.join(repoRoot, 'assets/images/newsletter', folder, image.file))
    : '';
  const tagHtml = tag ? `\n                            <p class="story-tag">${escapeHtml(tag)}</p>` : '';
  return `                    <article class="story">
                        <img${fit ? ` class="${fit.trim()}"` : ''} src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">
                        <div class="story-body">${tagHtml}
                            <h3>${escapeHtml(section.title)}</h3>
                            <p>${escapeHtml(summary(bullet))}</p>
                        </div>
                    </article>`;
}

function renderRoad(content, issue) {
  const folder = imageFolder(content.month, content.year);
  const stories = content.sections.filter((section) => section.images?.length).map((section) => renderStory(section, folder));
  return `        <section class="section" id="road">
            <div class="wrap">
                <div class="section-head arrive">
                    <div>
                        <p class="kicker">${escapeHtml(content.month)}</p>
                        <h2>On the road</h2>
                    </div>
                    <div class="road-nav">
                        <button type="button" data-nudge="-1" aria-label="Previous stories">←</button>
                        <button type="button" data-nudge="1" aria-label="Next stories">→</button>
                    </div>
                </div>
                <div class="road">
${stories.join('\n')}
                </div>
                <p class="newsletter-links">
                    <a href="newsletter/${issue.slug}.html">Read the ${escapeHtml(content.month)} newsletter</a>
                    <a href="newsletter/index.html">Newsletter archive</a>
                </p>
            </div>
        </section>`;
}

function renderArchivePage(issues) {
  const items = issues
    .map((issue) => `            <li><a href="${issue.slug}.html">${escapeHtml(issue.name)}</a></li>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletters — Chorlton Bikes</title>
    <link rel="icon" type="image/png" href="../assets/images/logo.png">
    <link rel="stylesheet" href="../redesign.css">
</head>
<body>
    <header class="nav">
        <div class="nav-inner">
            <a href="../index.html" aria-label="Chorlton Bikes, back to the homepage">
                <img class="logo" src="../assets/images/logo-white.png" alt="Chorlton Bikes">
            </a>
        </div>
    </header>
    <main class="section">
        <div class="wrap">
            <div class="section-head">
                <div>
                    <p class="kicker">On the road</p>
                    <h2>Newsletters</h2>
                </div>
            </div>
            <p>Every issue, newest first. The latest one is also on the homepage.</p>
            <ul class="archive-list">
${items}
            </ul>
        </div>
    </main>
</body>
</html>
`;
}

export async function updateRoadFromNewsletters() {
  const issues = await listNewsletterIssues();
  if (!issues.length) return null;
  const latest = issues[0];
  const contentPath = path.join(repoRoot, 'newsletter/content', `${latest.slug}.json`);
  const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
  const indexPath = path.join(repoRoot, 'index.html');
  const index = await fs.readFile(indexPath, 'utf8');
  const start = '<!-- road:start -->';
  const end = '<!-- road:end -->';
  if (!index.includes(start) || !index.includes(end)) {
    throw new Error('index.html is missing the road:start / road:end markers');
  }
  const next = index.replace(
    new RegExp(`${start}[\\s\\S]*?${end}`),
    `${start}\n${renderRoad(content, latest)}\n        ${end}`,
  );
  await fs.writeFile(indexPath, next);
  await fs.writeFile(path.join(repoRoot, 'newsletter/index.html'), renderArchivePage(issues));
  return latest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const latest = await updateRoadFromNewsletters();
  console.log(latest ? `On the road is now ${latest.name}` : 'No newsletters found');
}
