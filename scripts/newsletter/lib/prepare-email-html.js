import { buildMailchimpEmailHtml } from './mailchimp-email-blocks.js';

export function prepareEmailHtml({ content, mapping, month, year }) {
  if (!content) {
    throw new Error('prepareEmailHtml requires newsletter content JSON');
  }

  return buildMailchimpEmailHtml({ content, mapping: mapping ?? { sections: {} }, month, year });
}
