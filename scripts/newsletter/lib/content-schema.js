import { z } from 'zod';

const imageSchema = z.object({
  file: z.string(),
  alt: z.string(),
  crop: z.enum(['center', 'top']).optional(),
});

const ctaSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const sectionSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()).min(1),
  images: z.array(imageSchema).optional(),
  layout: z.enum(['single', 'two-col', 'three-col']).optional(),
  cta: ctaSchema.optional(),
});

export const newsletterContentSchema = z.object({
  month: z.string(),
  year: z.number().int(),
  intro: z.object({
    greeting: z.string(),
    paragraphs: z.array(z.string()).min(1),
  }),
  monthIntro: z.string(),
  sections: z.array(sectionSchema).min(1),
  thankYou: z.object({
    paragraphs: z.array(z.string()).min(1),
  }),
  footerYear: z.number().int().optional(),
  status: z.enum(['DRAFT', 'READY']).optional(),
});

export function parseNewsletterContent(data) {
  return newsletterContentSchema.parse(data);
}
