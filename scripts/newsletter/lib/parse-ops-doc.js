const MONTH_PATTERN =
  /^(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?\s*$/i;
const SECTION_PATTERN = /^\*\s+(.+)$/;
const DIVIDER_PATTERN = /^[_—\-=\s]{12,}$/;
const C2A_PATTERN = /^C2A:\s*(.+)$/i;
const NESTED_BULLET_PATTERN = /^\s+\*\s+(.+)$/;
const HELLO_PATTERN = /^hello\b/i;

const MONTH_ORDER = [
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
];

function capitalizeMonth(name) {
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function normalizeLine(line) {
  return line.replace(/\u00a0/g, ' ').replace(/^\uFEFF/, '').trim();
}

function isDivider(line) {
  return DIVIDER_PATTERN.test(line);
}

function inferYear(monthName, blocks, explicitYear) {
  if (explicitYear) {
    return explicitYear;
  }

  const thisIndex = MONTH_ORDER.indexOf(monthName.toLowerCase());
  for (const block of blocks) {
    if (block.year) {
      const blockIndex = MONTH_ORDER.indexOf(block.month.toLowerCase());
      if (blockIndex >= 0 && thisIndex > blockIndex) {
        return block.year;
      }
      if (blockIndex >= 0 && thisIndex < blockIndex) {
        return block.year;
      }
    }
  }

  return new Date().getFullYear();
}

export function splitMonthBlocks(lines) {
  const blocks = [];
  let current = null;

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);

    if (line && isDivider(line)) {
      continue;
    }

    const monthMatch = line.match(MONTH_PATTERN);
    if (monthMatch) {
      if (current) {
        blocks.push(current);
      }
      current = {
        month: capitalizeMonth(monthMatch[1]),
        year: monthMatch[2] ? Number(monthMatch[2]) : null,
        lines: [],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    blocks.push(current);
  }

  return blocks.map((block, index, all) => ({
    ...block,
    year: block.year ?? inferYear(block.month, all.slice(index + 1)),
  }));
}

function groupParagraphs(lines) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }
    current.push(line.trim());
  }

  if (current.length) {
    paragraphs.push(current.join(' '));
  }

  return paragraphs;
}

function paragraphUsedForCta(paragraph, cta) {
  if (!cta) {
    return false;
  }
  if (paragraph === cta.label) {
    return true;
  }
  if (cta.label === 'Contact us at hello@chorltonbikes.coop' && /hello@chorltonbikes\.coop/i.test(paragraph)) {
    return true;
  }
  if (cta.label === 'Get in touch' && /\bget in touch\b/i.test(paragraph)) {
    return true;
  }
  return false;
}

function ctaFromParagraph(paragraph) {
  if (/hello@chorltonbikes\.coop/i.test(paragraph)) {
    return {
      label: paragraph.length > 120 ? 'Contact us at hello@chorltonbikes.coop' : paragraph,
      url: 'mailto:hello@chorltonbikes.coop',
    };
  }

  if (/\bget in touch\b/i.test(paragraph) || /\bcontact us\b/i.test(paragraph)) {
    return {
      label: paragraph.length > 80 ? 'Get in touch' : paragraph,
      url: 'mailto:hello@chorltonbikes.coop',
    };
  }

  return undefined;
}

function extractCta(paragraphs, c2aText) {
  if (c2aText) {
    const label = c2aText.trim();
    return {
      label,
      url: 'mailto:hello@chorltonbikes.coop',
    };
  }

  for (let index = paragraphs.length - 1; index >= 0; index -= 1) {
    const cta = ctaFromParagraph(paragraphs[index]);
    if (cta) {
      return cta;
    }
  }

  return undefined;
}

function parseSectionBody(lines) {
  const bullets = [];
  const contentLines = [];
  let c2aText;

  for (const line of lines) {
    const c2aMatch = line.match(C2A_PATTERN);
    if (c2aMatch) {
      c2aText = c2aMatch[1];
      continue;
    }

    const nestedBullet = line.match(NESTED_BULLET_PATTERN);
    if (nestedBullet) {
      bullets.push(nestedBullet[1].trim());
      continue;
    }

    contentLines.push(line);
  }

  const groupedParagraphs = groupParagraphs(contentLines);
  const cta = extractCta(groupedParagraphs, c2aText);

  let contentBullets = bullets;
  if (!contentBullets.length) {
    contentBullets = groupedParagraphs.filter((paragraph) => !paragraphUsedForCta(paragraph, cta));
  }

  if (!contentBullets.length && groupedParagraphs.length && cta) {
    const mainParagraph = groupedParagraphs.find((paragraph) => paragraph !== cta.label) ?? groupedParagraphs[0];
    if (mainParagraph && mainParagraph !== cta.label) {
      contentBullets = [mainParagraph];
    } else if (groupedParagraphs[0] && groupedParagraphs[0] !== cta.label) {
      contentBullets = [groupedParagraphs[0]];
    } else {
      contentBullets = [groupedParagraphs[0].replace(/\s*(If you|Please|Get in touch).*$/i, '').trim()].filter(Boolean);
    }
  }

  return {
    bullets: contentBullets,
    cta,
  };
}

function parsePreamble(lines) {
  const intro = { greeting: '', paragraphs: [] };
  let monthIntro = '';

  if (!lines.length) {
    return { intro, monthIntro };
  }

  if (HELLO_PATTERN.test(lines[0])) {
    intro.greeting = lines[0];
    const rest = lines.slice(1);
    const firstSectionIdx = rest.findIndex((line) => SECTION_PATTERN.test(line));

    if (firstSectionIdx === -1) {
      intro.paragraphs = groupParagraphs(rest);
      return { intro, monthIntro };
    }

    intro.paragraphs = groupParagraphs(rest.slice(0, firstSectionIdx));
    monthIntro = groupParagraphs(rest.slice(firstSectionIdx)).join(' ');
    return { intro, monthIntro };
  }

  const monthIntroMatch = lines[0].match(MONTH_PATTERN);
  if (monthIntroMatch && lines[0].includes(String(monthIntroMatch[2] ?? ''))) {
    monthIntro = groupParagraphs(lines.slice(1)).join(' ');
    return { intro, monthIntro };
  }

  monthIntro = groupParagraphs(lines).join(' ');
  return { intro, monthIntro };
}

export function parseMonthBlock(block) {
  const firstSectionIndex = block.lines.findIndex((line) => SECTION_PATTERN.test(line));
  if (firstSectionIndex === -1) {
    throw new Error(`No sections found for ${block.month} ${block.year}. Use "* Section title" lines.`);
  }

  const preamble = parsePreamble(block.lines.slice(0, firstSectionIndex));
  const sectionLines = block.lines.slice(firstSectionIndex);

  const sections = [];
  let currentTitle = null;
  let currentBody = [];

  const flushSection = () => {
    if (!currentTitle) {
      return;
    }
    const { bullets, cta } = parseSectionBody(currentBody);
    const section = { title: currentTitle, bullets };
    if (cta) {
      section.cta = cta;
    }
    sections.push(section);
    currentTitle = null;
    currentBody = [];
  };

  for (const line of sectionLines) {
    const sectionMatch = line.match(SECTION_PATTERN);
    if (sectionMatch) {
      flushSection();
      currentTitle = sectionMatch[1].trim();
      continue;
    }

    if (currentTitle) {
      currentBody.push(line);
    }
  }

  flushSection();

  if (!sections.length) {
    throw new Error(`No sections parsed for ${block.month} ${block.year}`);
  }

  return {
    month: block.month,
    year: block.year,
    intro: preamble.intro.greeting ? preamble.intro : undefined,
    monthIntro: preamble.monthIntro || undefined,
    sections,
    status: 'DRAFT',
  };
}

export function parseOpsDocText(text, options = {}) {
  const lines = text.split(/\r?\n/);
  const blocks = splitMonthBlocks(lines);

  if (!blocks.length) {
    throw new Error('No month sections found. Expected lines like "June" or "May 2026".');
  }

  let block;
  if (options.month) {
    const target = options.month.toLowerCase();
    const targetYear = options.year ? Number(options.year) : null;
    block = blocks.find(
      (candidate) =>
        candidate.month.toLowerCase() === target &&
        (targetYear === null || candidate.year === targetYear),
    );
    if (!block) {
      const available = blocks.map((item) => `${item.month} ${item.year}`).join(', ');
      throw new Error(`Month "${options.month}" not found. Available: ${available}`);
    }
  } else {
    [block] = blocks;
  }

  return parseMonthBlock(block);
}
