import { escapeAttr, escapeHtml, imageFolder, isExternalUrl } from './utils.js';

function renderImage(image, imageBasePath) {
  const classes = ['newsletter-img'];
  if (image.crop) {
    classes.push('square-crop', image.crop);
  }

  return `<img src="${escapeAttr(`${imageBasePath}${image.file}`)}" alt="${escapeAttr(image.alt)}" class="${classes.join(' ')}" width="552" height="auto">`;
}

function renderImages(section, imageBasePath) {
  if (!section.images?.length) {
    return '';
  }

  const tags = section.images.map((image) => renderImage(image, imageBasePath));

  if (section.layout === 'two-col' || section.layout === 'three-col') {
    return `<div class="newsletter-image-grid ${section.layout}">\n${tags.join('\n')}\n</div>`;
  }

  return tags.join('\n');
}

function renderCta(cta) {
  const attrs = isExternalUrl(cta.url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return [
    '<div class="newsletter-cta">',
    `                <a href="${escapeAttr(cta.url)}"${attrs}>${escapeHtml(cta.label)}</a>`,
    '            </div>',
  ].join('\n');
}

export function prepareSections(content) {
  const folder = imageFolder(content.month, content.year);
  const imageBasePath = `../assets/images/newsletter/${folder}/`;

  return content.sections.map((section, index) => ({
    title: section.title,
    bullets: section.bullets,
    blockClass: index % 2 === 0 ? 'block-cream' : 'block-white',
    imagesHtml: renderImages(section, imageBasePath),
    ctaHtml: section.cta ? renderCta(section.cta) : '',
  }));
}
