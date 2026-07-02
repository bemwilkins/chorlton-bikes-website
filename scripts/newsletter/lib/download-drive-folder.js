import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AUTH_HELP, DRIVE_SCOPES, createGoogleAuth, getAuthIdentity } from './google-auth.js';

const IMAGE_MIME_PREFIXES = ['image/'];

function isImageFile(file) {
  if (file.mimeType && IMAGE_MIME_PREFIXES.some((prefix) => file.mimeType.startsWith(prefix))) {
    return true;
  }

  const ext = path.extname(file.name ?? '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
}

async function listFolderFiles(drive, folderId) {
  const files = [];
  let pageToken;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of response.data.files ?? []) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        const nested = await listFolderFiles(drive, file.id);
        files.push(...nested);
        continue;
      }

      if (isImageFile(file)) {
        files.push(file);
      }
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

async function downloadFile(drive, file, destDir) {
  const safeName = file.name.replace(/[\\/:*?"<>|]/g, '-');
  const destPath = path.join(destDir, safeName);

  const response = await drive.files.get(
    { fileId: file.id, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' },
  );

  await pipeline(response.data, createWriteStream(destPath));
  return safeName;
}

export async function downloadDriveFolder({ folderId, destDir, credentialsPath }) {
  const { google } = await import('googleapis');

  let auth;
  try {
    auth = await createGoogleAuth(DRIVE_SCOPES, { credentialsPath });
    const identity = await getAuthIdentity(auth);
    if (identity) {
      console.log(`Using Google account: ${identity}`);
    }
  } catch (error) {
    throw new Error(`${error.message}\n\n${AUTH_HELP}`);
  }

  const drive = google.drive({ version: 'v3', auth });
  await fs.mkdir(destDir, { recursive: true });

  let files;
  try {
    files = await listFolderFiles(drive, folderId);
  } catch (error) {
    throw new Error(`${error.message}\n\n${AUTH_HELP}`);
  }

  if (!files.length) {
    throw new Error(`No images found in Drive folder ${folderId}. Check the folder ID and account access.`);
  }

  const downloaded = [];
  for (const file of files) {
    downloaded.push(await downloadFile(drive, file, destDir));
  }

  return downloaded;
}
