import { parseOpsDocText, splitMonthBlocks } from '../lib/parse-ops-doc.js';
import { parseGoogleDocText } from '../parse-google-doc.js';

const juneSnippet = `
June
* Chorlton Open Gardens

Supported by MCR Active's Celebration of Cycling in June, we offered free trishaw rides.

If you know a community group who would like to hire one or two trishaws for an event. Please contact us hello@chorltonbikes.coop.

* British Cycling Volunteer Day 3/6

We welcomed representatives from British Cycling.

May 2026
* Chorlton Open Gardens

We will be offering trishaw rides.
`;

const parsed = parseOpsDocText(juneSnippet, { month: 'June', year: 2026 });
if (parsed.sections.length !== 2) throw new Error(`expected 2 sections, got ${parsed.sections.length}`);
if (parsed.sections[0].title !== 'Chorlton Open Gardens') throw new Error('section title');
if (!parsed.sections[0].cta?.url.includes('mailto:')) throw new Error('cta');
if (parsed.year !== 2026) throw new Error('year');

const blocks = splitMonthBlocks(juneSnippet.split('\n'));
if (blocks.length !== 2) throw new Error('month blocks');

const marked = await parseGoogleDocText(`
=== INTRO ===
Hello Friends
Intro paragraph

=== MONTH ===
June | 2026
Month intro

=== SECTION: Test ===
• Bullet one

=== THANK YOU ===
Thanks
`);
if (marked.month !== 'June') throw new Error('marked parser');

console.log('newsletter parser tests: ok');
