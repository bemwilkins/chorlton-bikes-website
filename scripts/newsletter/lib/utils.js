const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export function monthNumber(monthName) {
  const key = monthName.trim().toLowerCase();
  const value = MONTHS[key];
  if (!value) {
    throw new Error(`Unknown month name: ${monthName}`);
  }
  return value;
}

export function imageFolder(monthName, year) {
  const mm = String(monthNumber(monthName)).padStart(2, '0');
  return `${mm}-${year}`;
}

export function slugId(monthName, year) {
  const mm = String(monthNumber(monthName)).padStart(2, '0');
  return `${year}-${mm}`;
}

export function canonicalUrl(monthName, year) {
  return `https://chorltonbikes.coop/newsletter/${slugId(monthName, year)}.html`;
}

export function isExternalUrl(url) {
  return !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('#');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;');
}
