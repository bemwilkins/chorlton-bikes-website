import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_ASSETS_PREFIX = 'https://chorltonbikes.coop/assets/';

function localPathForAssetUrl(assetUrl, repoRoot) {
  if (!assetUrl.startsWith(SITE_ASSETS_PREFIX)) {
    return null;
  }
  const relative = assetUrl.slice(SITE_ASSETS_PREFIX.length);
  return path.join(repoRoot, 'assets', relative);
}

export async function hostImagesInMailchimp(html, mailchimp, repoRoot) {
  const imageUrls = [...html.matchAll(/src="(https:\/\/chorltonbikes\.coop\/assets\/[^"]+)"/g)].map(
    (match) => match[1],
  );
  const uniqueUrls = [...new Set(imageUrls)];
  const uploadCache = new Map();
  let hostedCount = 0;

  let hostedHtml = html;
  for (const assetUrl of uniqueUrls) {
    const localPath = localPathForAssetUrl(assetUrl, repoRoot);
    if (!localPath) {
      continue;
    }

    let hostedUrl = uploadCache.get(localPath);
    if (!hostedUrl) {
      const fileBuffer = await fs.readFile(localPath);
      const uploaded = await mailchimp.uploadFile(path.basename(localPath), fileBuffer);
      hostedUrl = uploaded.full_size_url ?? uploaded.url;
      if (!hostedUrl) {
        throw new Error(`Mailchimp did not return a hosted URL for ${path.basename(localPath)}`);
      }
      uploadCache.set(localPath, hostedUrl);
      hostedCount += 1;
    }

    hostedHtml = hostedHtml.replaceAll(assetUrl, hostedUrl);
  }

  return { html: hostedHtml, hostedCount, imageCount: uniqueUrls.length };
}
