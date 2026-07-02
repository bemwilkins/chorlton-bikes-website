import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentFile } from './generate-web.js';
import { AUTH_HELP } from './lib/google-auth.js';
import { downloadDriveFolder } from './lib/download-drive-folder.js';
import { fallbacksForMonth } from './lib/image-fallbacks.js';
import {
  SECTION_IMAGE_HINTS,
  buildImageMapping,
  matchFilesToSections,
  slugify,
} from './lib/image-matcher.js';
import { imageFolder, slugId } from './lib/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const DEFAULT_DRIVE_FOLDER_ID = '11JZSPi9Iw_WOv5GJzyn_p2mJJRJps9Qb';

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function listImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      files.push(entry.name);
    }
  }

  return [...new Set(files)].sort();
}

async function loadMappedFilesForMonth(month, year) {
  const mappingPath = path.join(repoRoot, 'newsletter/mappings', `${slugId(month, year)}.json`);
  try {
    const raw = await fs.readFile(mappingPath, 'utf8');
    const mapping = JSON.parse(raw);
    const files = Object.values(mapping.sections ?? {})
      .flatMap((section) => section.images ?? [])
      .map((image) => image.file)
      .filter(Boolean);
    return [...new Set(files)];
  } catch {
    return [];
  }
}

async function copyFallback(sourceRelative, destDir, destName) {
  const sourcePath = path.join(repoRoot, 'assets/images/newsletter', sourceRelative);
  const destPath = path.join(destDir, destName);
  await fs.copyFile(sourcePath, destPath);
  return destName;
}

export async function syncNewsletterImages({
  month,
  year,
  folderId = process.env.NEWSLETTER_DRIVE_FOLDER_ID ?? DEFAULT_DRIVE_FOLDER_ID,
  credentialsPath,
  skipDownload = false,
  useFallbacks = true,
}) {
  const folder = imageFolder(month, year);
  const imageDir = path.join(repoRoot, 'assets/images/newsletter', folder);
  await fs.mkdir(imageDir, { recursive: true });
  let downloaded = [];
  let preferredFiles = await listImageFiles(imageDir);

  // If download is enabled, use the current Drive file set as source-of-truth.
  if (!skipDownload) {
    try {
      downloaded = await downloadDriveFolder({
        folderId,
        destDir: imageDir,
        credentialsPath,
      });
      console.log(`Downloaded ${downloaded.length} image(s) from Google Drive`);
    } catch (error) {
      throw new Error(`${error.message}`);
    }
    preferredFiles = downloaded;
  } else if (preferredFiles.length > 0) {
    console.log(`Using ${preferredFiles.length} existing image(s) in ${folder}/ (skipping Drive download)`);
    const mappedFiles = await loadMappedFilesForMonth(month, year);
    const mappedPresent = mappedFiles.filter((file) => preferredFiles.includes(file));
    if (mappedPresent.length > 0) {
      preferredFiles = mappedPresent;
      console.log(
        `Using ${mappedPresent.length} previously mapped image(s) for local rerun (ignoring extra leftovers)`,
      );
    }
  }

  const contentPath = path.join(repoRoot, 'newsletter/content', `${slugId(month, year)}.json`);
  const content = await loadContentFile(contentPath);
  const sectionSlugs = content.sections.map((section) => slugify(section.title));

  let files = await listImageFiles(imageDir);
  const nestedFolder = path.join(imageDir, folder);
  if (await pathExists(nestedFolder)) {
    const nestedFiles = await listImageFiles(nestedFolder);
    for (const file of nestedFiles) {
      const source = path.join(nestedFolder, file);
      const dest = path.join(imageDir, path.basename(file));
      await fs.copyFile(source, dest);
    }
    files = await listImageFiles(imageDir);
  }
  if (preferredFiles.length === 0) {
    preferredFiles = files;
  }

  const assignments = matchFilesToSections(preferredFiles, sectionSlugs);
  const fallbacks = useFallbacks ? fallbacksForMonth(month, year) : {};
  const mapping = { sections: {} };
  const report = [];

  for (const section of content.sections) {
    const slug = slugify(section.title);
    let assignedFiles = [...(assignments[slug] ?? [])];
    const hints = SECTION_IMAGE_HINTS[slug];

    if (hints?.preferredFiles?.length) {
      const preferred = hints.preferredFiles.filter((file) => preferredFiles.includes(file));
      if (preferred.length > 0) {
        assignedFiles = preferred;
      }
    }

    if (hints?.maxImages && assignedFiles.length > hints.maxImages) {
      assignedFiles = assignedFiles.slice(0, hints.maxImages);
    }

    if (!assignedFiles.length && fallbacks[slug]) {
      const fallback = fallbacks[slug];
      if (fallback.sources) {
        assignedFiles = [];
        for (const item of fallback.sources) {
          assignedFiles.push(await copyFallback(item.source, imageDir, item.dest));
        }
      } else {
        assignedFiles = [await copyFallback(fallback.source, imageDir, fallback.dest)];
      }
      report.push({ section: section.title, source: 'fallback', files: assignedFiles });
    } else if (assignedFiles.length) {
      report.push({ section: section.title, source: 'drive', files: assignedFiles });
    } else {
      report.push({ section: section.title, source: 'none', files: [] });
    }

    const imageMapping = buildImageMapping(slug, assignedFiles, hints?.alt ?? section.title);
    if (imageMapping && fallbacks[slug]?.layout && !(assignments[slug]?.length)) {
      imageMapping.layout = fallbacks[slug].layout;
    }
    if (imageMapping) {
      mapping.sections[slug] = imageMapping;
    }
  }

  const mappingPath = path.join(repoRoot, 'newsletter/mappings', `${slugId(month, year)}.json`);
  await fs.mkdir(path.dirname(mappingPath), { recursive: true });
  await fs.writeFile(mappingPath, `${JSON.stringify(mapping, null, 2)}\n`, 'utf8');

  return { mappingPath, imageDir, report, mapping };
}

export { AUTH_HELP };
