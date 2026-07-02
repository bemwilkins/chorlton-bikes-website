import { monthNumber } from './utils.js';

const LAYOUTS = new Set(['single', 'two-col', 'three-col']);

function assertString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function assertArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array`);
  }
}

export function validateContent(content) {
  assertString(content.month, 'month');
  assertString(String(content.year), 'year');
  monthNumber(content.month);

  if (!content.intro || typeof content.intro !== 'object') {
    throw new Error('intro is required');
  }
  assertString(content.intro.greeting, 'intro.greeting');
  assertArray(content.intro.paragraphs, 'intro.paragraphs');

  assertString(content.monthIntro, 'monthIntro');
  assertArray(content.sections, 'sections');

  content.sections.forEach((section, index) => {
    const prefix = `sections[${index}]`;
    assertString(section.title, `${prefix}.title`);
    assertArray(section.bullets, `${prefix}.bullets`);

    if (section.images) {
      if (!Array.isArray(section.images)) {
        throw new Error(`${prefix}.images must be an array`);
      }
      section.images.forEach((image, imageIndex) => {
        assertString(image.file, `${prefix}.images[${imageIndex}].file`);
        assertString(image.alt, `${prefix}.images[${imageIndex}].alt`);
        if (image.crop && !['center', 'top'].includes(image.crop)) {
          throw new Error(`${prefix}.images[${imageIndex}].crop must be "center" or "top"`);
        }
      });
    }

    if (section.layout && !LAYOUTS.has(section.layout)) {
      throw new Error(`${prefix}.layout must be one of: ${[...LAYOUTS].join(', ')}`);
    }

    const imageCount = section.images?.length ?? 0;
    if (imageCount > 1 && section.layout !== 'two-col' && section.layout !== 'three-col') {
      throw new Error(`${prefix} with multiple images requires layout "two-col" or "three-col"`);
    }
    if (section.layout === 'two-col' && imageCount !== 2) {
      throw new Error(`${prefix} with layout "two-col" requires exactly 2 images`);
    }
    if (section.layout === 'three-col' && imageCount < 3) {
      throw new Error(`${prefix} with layout "three-col" requires at least 3 images`);
    }

    if (section.cta) {
      assertString(section.cta.label, `${prefix}.cta.label`);
      assertString(section.cta.url, `${prefix}.cta.url`);
    }
  });

  if (!content.thankYou || typeof content.thankYou !== 'object') {
    throw new Error('thankYou is required');
  }
  assertArray(content.thankYou.paragraphs, 'thankYou.paragraphs');

  return content;
}
