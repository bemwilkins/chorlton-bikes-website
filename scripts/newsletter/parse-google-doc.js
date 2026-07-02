import { parseOpsDocText } from './lib/parse-ops-doc.js';
import { mergeParsedContent } from './lib/merge-defaults.js';

const SECTION_MARKER = /^===\s*SECTION:\s*(.+?)\s*===$/i;
const INTRO_MARKER = /^===\s*INTRO\s*===$/i;

function detectDocFormat(text) {
  if (/^===\s*INTRO\s*===$/im.test(text) || /^===\s*SECTION:/im.test(text)) {
    return 'marked';
  }
  return 'ops';
}

function normalizeLine(line) {
  return line.replace(/\u00a0/g, ' ').trim();
}

function parseMarkedDocText(text) {
  const INTRO_MARKER_LOCAL = /^===\s*INTRO\s*===$/i;
  const MONTH_MARKER = /^===\s*MONTH\s*===$/i;
  const THANK_YOU_MARKER = /^===\s*THANK YOU\s*===$/i;
  const STATUS_MARKER = /^\[STATUS:\s*(DRAFT|READY)\]$/i;
  const FIELD_PATTERNS = {
    image: /^IMAGE:\s*(.+)$/i,
    alt: /^ALT:\s*(.+)$/i,
    layout: /^LAYOUT:\s*(single|two-col|three-col|none)$/i,
    crop: /^CROP:\s*(center|top)$/i,
    cta: /^CTA:\s*(.+?)\s*\|\s*(.+)$/i,
  };

  function parseBullet(line) {
    const trimmed = normalizeLine(line);
    if (trimmed.startsWith('•')) {
      return trimmed.slice(1).trim();
    }
    if (trimmed.startsWith('- ')) {
      return trimmed.slice(2).trim();
    }
    return null;
  }

  function createSection(title) {
    return {
      title: title.trim(),
      bullets: [],
      images: [],
      layout: undefined,
      cta: undefined,
    };
  }

  function finalizeSection(section) {
    if (!section.images.length) {
      delete section.images;
    } else if (!section.layout) {
      section.layout = section.images.length === 1 ? 'single' : undefined;
    } else if (section.layout === 'none') {
      delete section.images;
      delete section.layout;
    }

    if (!section.cta) {
      delete section.cta;
    }

    return section;
  }

  const lines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length > 0);

  const content = {
    intro: { greeting: '', paragraphs: [] },
    month: '',
    year: null,
    monthIntro: '',
    sections: [],
    thankYou: { paragraphs: [] },
    status: 'DRAFT',
  };

  let mode = 'preamble';
  let currentSection = null;
  let pendingImage = null;

  for (const line of lines) {
    const statusMatch = line.match(STATUS_MARKER);
    if (statusMatch) {
      content.status = statusMatch[1].toUpperCase();
      continue;
    }

    if (INTRO_MARKER_LOCAL.test(line)) {
      mode = 'intro';
      continue;
    }
    if (MONTH_MARKER.test(line)) {
      mode = 'month';
      continue;
    }
    if (THANK_YOU_MARKER.test(line)) {
      if (currentSection) {
        content.sections.push(finalizeSection(currentSection));
        currentSection = null;
      }
      mode = 'thankyou';
      continue;
    }

    const sectionMatch = line.match(SECTION_MARKER);
    if (sectionMatch) {
      if (currentSection) {
        content.sections.push(finalizeSection(currentSection));
      }
      currentSection = createSection(sectionMatch[1]);
      pendingImage = null;
      mode = 'section';
      continue;
    }

    if (mode === 'preamble') {
      continue;
    }

    if (mode === 'intro') {
      if (!content.intro.greeting) {
        content.intro.greeting = line;
      } else {
        content.intro.paragraphs.push(line);
      }
      continue;
    }

    if (mode === 'month') {
      if (!content.month) {
        const [monthPart, yearPart] = line.split('|').map((part) => part.trim());
        if (!monthPart || !yearPart) {
          throw new Error(`MONTH block must be formatted as "Month | Year", got: ${line}`);
        }
        content.month = monthPart;
        content.year = Number(yearPart);
      } else {
        content.monthIntro = line;
      }
      continue;
    }

    if (mode === 'thankyou') {
      content.thankYou.paragraphs.push(line);
      continue;
    }

    if (mode === 'section' && currentSection) {
      let matchedField = false;

      for (const [field, pattern] of Object.entries(FIELD_PATTERNS)) {
        const match = line.match(pattern);
        if (!match) {
          continue;
        }

        matchedField = true;

        if (field === 'image') {
          pendingImage = { file: match[1].trim(), alt: '' };
          currentSection.images.push(pendingImage);
        } else if (field === 'alt' && pendingImage) {
          pendingImage.alt = match[1].trim();
        } else if (field === 'layout') {
          currentSection.layout = match[1].toLowerCase();
        } else if (field === 'crop' && pendingImage) {
          pendingImage.crop = match[1].toLowerCase();
        } else if (field === 'cta') {
          currentSection.cta = {
            label: match[1].trim(),
            url: match[2].trim(),
          };
        }
        break;
      }

      if (matchedField) {
        continue;
      }

      const bullet = parseBullet(line);
      if (bullet) {
        currentSection.bullets.push(bullet);
      }
    }
  }

  if (currentSection) {
    content.sections.push(finalizeSection(currentSection));
  }

  return {
    month: content.month,
    year: content.year,
    intro: content.intro,
    monthIntro: content.monthIntro,
    sections: content.sections,
    thankYou: content.thankYou,
    status: content.status,
  };
}

export async function fetchGoogleDocText(docId, credentialsPath) {
  try {
    const { google } = await import('googleapis');
    const { createGoogleAuth, DOCS_SCOPES } = await import('./lib/google-auth.js');
    const auth = await createGoogleAuth(DOCS_SCOPES, { credentialsPath });
    const docs = google.docs({ version: 'v1', auth });
    const response = await docs.documents.get({ documentId: docId });
    const body = response.data.body?.content ?? [];

    const paragraphs = [];
    for (const element of body) {
      const paragraph = element.paragraph;
      if (!paragraph?.elements) {
        continue;
      }
      const text = paragraph.elements
        .map((item) => item.textRun?.content ?? '')
        .join('')
        .replace(/\s+$/g, '');
      if (text.trim()) {
        paragraphs.push(text);
      }
    }

    return paragraphs.join('\n');
  } catch {
    const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const response = await fetch(url);
    if (!response.ok) {
      const { AUTH_HELP } = await import('./lib/google-auth.js');
      throw new Error(`Failed to fetch Google Doc (${response.status}).\n\n${AUTH_HELP}`);
    }
    return response.text();
  }
}

export async function parseGoogleDocText(text, options = {}) {
  const format = options.format ?? detectDocFormat(text);
  if (format === 'marked') {
    return parseMarkedDocText(text);
  }
  return parseOpsDocText(text, options);
}

export async function parseGoogleDoc({ docId, credentialsPath, month, year }) {
  const text = await fetchGoogleDocText(docId, credentialsPath);
  const parsed = await parseGoogleDocText(text, { month, year });
  return mergeParsedContent(parsed);
}

export const GOOGLE_DOC_ID = '1QwkEhglwrNE1n2tvw0ZuMdy20wBqeGupsjN117uSs7M';
