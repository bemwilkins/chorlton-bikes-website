import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './image-matcher.js';
import { canonicalUrl, escapeHtml, imageFolder } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_BASE = 'https://chorltonbikes.coop';
const MAILCHIMP_GREETING = 'Hello *|FNAME|*';
const LOGO_URL = `${SITE_BASE}/assets/images/logo-green.png`;

const MAILCHIMP_STYLES = fs.readFileSync(
  path.resolve(__dirname, '../../../newsletter/templates/mailchimp-styles.css'),
  'utf8',
);

function assetUrl(month, year, file) {
  return `${SITE_BASE}/assets/images/newsletter/${imageFolder(month, year)}/${file}`;
}

function mceSection(inner, bg = '#ffffff') {
  return `<tbody class="mceWrapper"><tr><td style="background-color:transparent" valign="top" align="center" class="mceSection">
<!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="660" style="width:660px;"><tr><td><![endif]-->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px" role="presentation"><tbody><tr>
<td style="background-color:${bg}" valign="top" class="mceWrapperInner">${inner}</td>
</tr></tbody></table>
<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
</td></tr></tbody>`;
}

function mceTextBlock(inner, { bg = 'transparent', padding = '12px 24px', center = false } = {}) {
  const textClass = center ? 'mceText mceCenterText' : 'mceText mceArticleText';
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate" role="presentation"><tbody><tr>
<td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;border:0;border-radius:0" valign="top">
<table width="100%" style="border:0;background-color:${bg};border-radius:0;border-collapse:separate"><tbody><tr>
<td style="padding:${padding}" class="mceTextBlockContainer">
<div class="${textClass}" style="width:100%">${inner}</div>
</td></tr></tbody></table>
</td></tr></tbody></table>`;
}

function webLinkBlock(webVersionUrl) {
  return mceSection(
    mceTextBlock(
      `<p class="last-child"><a href="${escapeHtml(webVersionUrl)}" target="_blank" style="color:#ffffff;"><span style="text-decoration:underline;">Read this newsletter on our website</span></a></p>`,
      { bg: '#008037', padding: '20px', center: true },
    ),
    '#ffffff',
  );
}

function logoBlock() {
  return mceSection(
    `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr>
<td style="background-color:transparent;padding:12px 16px;border:0;border-radius:0" valign="top" class="mceImageBlockContainer" align="center">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="50%" style="border-collapse:separate;margin:0;vertical-align:top;max-width:50%;width:50%;height:auto" role="presentation"><tbody><tr>
<td style="border:0;border-radius:0;margin:0" valign="top">
<img alt="Chorlton Bikes" src="${LOGO_URL}" width="314" height="auto" style="display:block;max-width:100%;height:auto;border-radius:0" class="mceImage">
</td></tr></tbody></table>
</td></tr></tbody></table>`,
  );
}

function helloBlock(introParagraphs) {
  const body = introParagraphs
    .map(
      (paragraph) =>
        `<p><span style="color:rgb(255, 255, 255);">${escapeHtml(paragraph)}</span></p><p><br></p>`,
    )
    .join('');
  return mceSection(
    mceTextBlock(
      `<p><br></p><h1><span style="color:#ffffff;"><span style="font-size: 30px">${MAILCHIMP_GREETING}</span></span></h1><p><br></p>${body}<p class="last-child"><br></p>`,
      { bg: '#008037', padding: '12px 24px', center: true },
    ),
  );
}

function monthIntroBlock(month, year, introText) {
  const monthLabel = `${month} ${year}`;
  return mceSection(
    `<table border="0" cellpadding="0" cellspacing="24" width="100%" style="table-layout:fixed" role="presentation"><tbody><tr>
<td style="padding-top:0;padding-bottom:0" valign="top" class="mceColumn" colspan="3" width="25%">
${mceTextBlock(
  `<h1 class="last-child"><span style="color:#008037;"><span style="font-size: 30px">${escapeHtml(monthLabel)}</span></span></h1>`,
  { padding: '12px 16px' },
)}
</td>
<td style="padding-top:0;padding-bottom:0" valign="top" class="mceColumn" colspan="9" width="75%">
${mceTextBlock(
  `<p class="mcePastedContent last-child">${escapeHtml(introText)}</p>`,
  { padding: '24px 16px 12px' },
)}
</td>
</tr></tbody></table>`,
  );
}

function articleParagraphs(bullets) {
  return bullets
    .map((bullet, index) => {
      const isLast = index === bullets.length - 1;
      const classAttr = isLast ? ' class="last-child"' : '';
      const justify = index === 0 ? ' style="text-align: justify;"' : '';
      const spacer = isLast ? '' : '<p><br></p>';
      return `<p${justify}${classAttr}><span style="color:rgb(51, 51, 51);">${escapeHtml(bullet)}</span></p>${spacer}`;
    })
    .join('');
}

function imageBlock(src, alt, bg) {
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr>
<td style="background-color:${bg};padding:12px 16px;border:0;border-radius:0" valign="top" class="mceImageBlockContainer" align="center">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;margin:0;vertical-align:top;max-width:100%;width:100%;height:auto" role="presentation"><tbody><tr>
<td style="border:0;border-radius:0;margin:0" valign="top">
<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" width="628" height="auto" style="display:block;max-width:100%;height:auto;border-radius:0" class="mceImage">
</td></tr></tbody></table>
</td></tr></tbody></table>`;
}

function twoColImageBlock(images, bg) {
  const cells = images
    .map(
      (image) => `<td style="padding-top:0;padding-bottom:0" valign="top" class="mceColumn" colspan="6" width="50%">
<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr>
<td style="background-color:${bg};padding:12px 16px;border:0;border-radius:0" valign="top" class="mceImageBlockContainer" align="center">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;margin:0;vertical-align:top;max-width:100%;width:100%;height:auto" role="presentation"><tbody><tr>
<td style="border:0;border-radius:0;margin:0" valign="top">
<img alt="${escapeHtml(image.alt)}" src="${escapeHtml(image.src)}" width="298" height="auto" style="display:block;max-width:100%;height:auto;border-radius:0" class="mceImage">
</td></tr></tbody></table>
</td></tr></tbody></table>
</td>`,
    )
    .join('');
  return `<table border="0" cellpadding="0" cellspacing="24" width="100%" style="table-layout:fixed" role="presentation"><tbody><tr>${cells}</tr></tbody></table>`;
}

function ctaButton(label, url) {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr>
<td style="background-color:transparent;padding:12px 16px;border:0;border-radius:0" valign="top" class="mceButtonBlockContainer" align="center">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px" role="presentation" class="mceButtonContainer"><tbody>
<tr class="mceStandardButton"><td style="background-color:#ff8210;border-radius:0;text-align:center" valign="top" class="mceButton">
<a href="${safeUrl}" target="_blank" class="mceButtonLink" style="background-color:#ff8210;border-radius:0;border:2px none #000000;color:#ffffff;display:block;font-family:'Helvetica Neue', Helvetica, Arial, Verdana, sans-serif;font-size:16px;font-weight:normal;font-style:normal;padding:16px 28px;text-decoration:none;text-align:center;direction:ltr;letter-spacing:0px" rel="noreferrer">${safeLabel}</a>
</td></tr></tbody></table>
</td></tr></tbody></table>`;
}

function articleSection({ bg, images, layout, title, bullets, cta }) {
  const imageHtml =
    layout === 'two-col' && images.length >= 2
      ? twoColImageBlock(images, bg)
      : images.length
        ? imageBlock(images[0].src, images[0].alt, bg)
        : '';

  const textHtml = mceTextBlock(
    `<h1 class="mcePastedContent"><span style="font-size: 27px">${escapeHtml(title)}</span></h1><p><br></p>${articleParagraphs(bullets)}`,
    { bg: 'transparent', padding: '12px 16px' },
  );

  const ctaHtml = cta ? ctaButton(cta.label, cta.url) : '';

  return mceSection(
    `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate" role="presentation"><tbody><tr>
<td style="background-color:${bg};padding:12px 0;padding-right:0;padding-left:0;border:0;border-radius:0" valign="top" class="mceLayoutContainer">
${imageHtml}
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate" role="presentation"><tbody><tr>
<td style="padding:10px" valign="top" class="mceGutterContainer">${textHtml}${ctaHtml}</td>
</tr></tbody></table>
</td></tr></tbody></table>`,
    bg,
  );
}

function thankYouBlock(paragraphs) {
  const body = paragraphs
    .map((paragraph, index) => {
      const lastClass = index === paragraphs.length - 1 ? ' class="last-child"' : '';
      return `<p${lastClass}><span style="color:rgb(51, 51, 51);">${escapeHtml(paragraph)}</span></p>${index < paragraphs.length - 1 ? '<p><br></p>' : ''}`;
    })
    .join('');

  return mceSection(
    `<table border="0" cellpadding="0" cellspacing="24" width="100%" style="table-layout:fixed" role="presentation"><tbody><tr>
<td style="padding-top:0;padding-bottom:0" valign="top" class="mceColumn" colspan="3" width="25%">
${mceTextBlock(
  `<h1 class="last-child"><span style="color:#008037;"><span style="font-size: 30px">Thank You</span></span></h1>`,
  { padding: '12px 16px' },
)}
</td>
<td style="padding-top:0;padding-bottom:0" valign="top" class="mceColumn" colspan="9" width="75%">
${mceTextBlock(body, { padding: '12px 16px' })}
</td>
</tr></tbody></table>`,
  );
}

function socialFooter() {
  return mceSection(
    `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr>
<td style="background-color:#008037;padding:12px 0;border:0;border-radius:0" valign="top" class="mceLayoutContainer">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" class="mceSocialFollowBlock"><tbody><tr>
<td valign="middle" align="center">
<table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;float:left" role="presentation"><tbody><tr>
<td style="padding:3px 12px" valign="top" class="mceSocialFollowIcon" align="center" width="40">
<a href="https://www.facebook.com/chorltonbikedeliveries/" target="_blank" rel="noreferrer"><img width="40" height="40" alt="Facebook icon" src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/facebook-outline-light-40.png"></a>
</td></tr></tbody></table>
<table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;float:left" role="presentation"><tbody><tr>
<td style="padding:3px 12px" valign="top" class="mceSocialFollowIcon" align="center" width="40">
<a href="https://www.instagram.com/chorltonbikes" target="_blank" rel="noreferrer"><img width="40" height="40" alt="Instagram icon" src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/instagram-outline-light-40.png"></a>
</td></tr></tbody></table>
</td></tr></tbody></table>
</td></tr></tbody></table>`,
    '#008037',
  );
}

function sectionBackground(index) {
  return index % 2 === 0 ? '#fffde7' : '#ffffff';
}

export function buildMailchimpEmailHtml({ content, mapping, month, year }) {
  const webVersionUrl = canonicalUrl(month, year);
  const sections = content.sections.map((section, index) => {
    const slug = slugify(section.title);
    const sectionMapping = mapping?.sections?.[slug] ?? {};
    const layout = sectionMapping.layout ?? section.layout ?? 'single';
    const mappedImages = sectionMapping.images ?? section.images ?? [];
    const images = mappedImages.map((image) => ({
      src: assetUrl(month, year, image.file),
      alt: image.alt ?? section.title,
    }));

    return articleSection({
      bg: sectionBackground(index),
      images,
      layout,
      title: section.title,
      bullets: section.bullets,
      cta: section.cta,
    });
  });

  const body = [
    webLinkBlock(webVersionUrl),
    logoBlock(),
    helloBlock(content.intro.paragraphs),
    monthIntroBlock(month, year, content.monthIntro),
    ...sections,
    thankYouBlock(content.thankYou.paragraphs),
    socialFooter(),
  ].join('');

  return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 15]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chorlton Bikes Newsletter – ${escapeHtml(month)} ${year}</title>
<style>${MAILCHIMP_STYLES}</style>
</head>
<body>
<center>
<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" role="presentation" style="background-color: rgb(255, 255, 255);">
<tbody><tr>
<td class="bodyCell" align="center" valign="top">
<table id="root" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
${body}
</table>
</td></tr></tbody></table>
</center>
</body></html>`;
}
