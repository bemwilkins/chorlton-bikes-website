import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '../../..');

export const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
export const DOCS_SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];
export const NEWSLETTER_SCOPES = [...DRIVE_SCOPES, ...DOCS_SCOPES];

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function loadEnvFile() {
  try {
    const envPath = path.join(repoRoot, '.env');
    const text = await fs.readFile(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const separator = trimmed.indexOf('=');
      if (separator === -1) {
        continue;
      }
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional .env
  }
}

function resolvePath(candidate) {
  return path.isAbsolute(candidate) ? candidate : path.join(repoRoot, candidate);
}

export async function resolveServiceAccountPath(explicitPath) {
  await loadEnvFile();

  const candidates = [
    explicitPath,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    path.join(repoRoot, 'google-service-account.json'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = resolvePath(candidate);
    if (!(await pathExists(resolved))) {
      continue;
    }

    const raw = JSON.parse(await fs.readFile(resolved, 'utf8'));
    if (raw.type === 'service_account' && raw.client_email) {
      return resolved;
    }
  }

  return null;
}

export async function resolveOAuthClientPath() {
  await loadEnvFile();

  const candidates = [
    process.env.GOOGLE_OAUTH_CLIENT_JSON,
    path.join(repoRoot, 'google-oauth-client.json'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = resolvePath(candidate);
    if (await pathExists(resolved)) {
      return resolved;
    }
  }

  return null;
}

export function userTokenPath() {
  return resolvePath(process.env.GOOGLE_USER_TOKEN_PATH ?? '.google-user-token.json');
}

async function createOAuthAuth(clientSecretsPath, tokenPath, scopes) {
  const { OAuth2Client } = await import('google-auth-library');
  const secrets = JSON.parse(await fs.readFile(clientSecretsPath, 'utf8'));
  const installed = secrets.installed ?? secrets.web;
  if (!installed) {
    throw new Error('OAuth client JSON must be a Desktop or Web client secret file');
  }

  const redirectUri = installed.redirect_uris?.[0] ?? 'http://127.0.0.1:8765/oauth2callback';
  const client = new OAuth2Client(installed.client_id, installed.client_secret, redirectUri);
  const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
  client.setCredentials(token);

  client.on('tokens', async (tokens) => {
    const merged = { ...token, ...tokens };
    await fs.writeFile(tokenPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  });

  return client;
}

export async function createGoogleAuth(scopes, options = {}) {
  const { google } = await import('googleapis');
  await loadEnvFile();

  const serviceAccountPath = await resolveServiceAccountPath(options.credentialsPath);
  if (serviceAccountPath && options.preferServiceAccount) {
    return new google.auth.GoogleAuth({ keyFile: serviceAccountPath, scopes });
  }

  const oauthClientPath = await resolveOAuthClientPath();
  const tokenPath = userTokenPath();
  if (oauthClientPath && (await pathExists(tokenPath))) {
    return createOAuthAuth(oauthClientPath, tokenPath, scopes);
  }

  if (serviceAccountPath) {
    return new google.auth.GoogleAuth({ keyFile: serviceAccountPath, scopes });
  }

  return new google.auth.GoogleAuth({ scopes });
}

export async function getAuthIdentity(auth) {
  try {
    const client = await auth.getClient();
    if (client.email) {
      return client.email;
    }

    const accessToken = await client.getAccessToken();
    if (!accessToken.token) {
      return null;
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken.token}` },
    });
    if (!response.ok) {
      return null;
    }
    const profile = await response.json();
    return profile.email ?? null;
  } catch {
    return null;
  }
}

export async function runGoogleLogin({
  emailHint = process.env.GOOGLE_LOGIN_EMAIL ?? 'ben@chorltonbikes.coop',
  scopes = NEWSLETTER_SCOPES,
} = {}) {
  const clientSecretsPath = await resolveOAuthClientPath();
  if (!clientSecretsPath) {
    throw new Error(
      'Missing OAuth client secrets. Save a Desktop OAuth client JSON as google-oauth-client.json (gitignored).',
    );
  }

  const { OAuth2Client } = await import('google-auth-library');
  const secrets = JSON.parse(await fs.readFile(clientSecretsPath, 'utf8'));
  const installed = secrets.installed ?? secrets.web;
  const redirectUri = 'http://127.0.0.1:8765/oauth2callback';
  const client = new OAuth2Client(installed.client_id, installed.client_secret, redirectUri);

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: redirectUri,
    login_hint: emailHint,
  });

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      try {
        const url = new URL(request.url, 'http://127.0.0.1:8765');
        if (url.pathname !== '/oauth2callback') {
          response.writeHead(404);
          response.end();
          return;
        }

        const authCode = url.searchParams.get('code');
        if (!authCode) {
          reject(new Error('No authorization code received'));
          response.writeHead(400);
          response.end('Authorization failed');
          return;
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<p>Google sign-in complete. You can close this tab.</p>');
        resolve(authCode);
        server.close();
      } catch (error) {
        reject(error);
        server.close();
      }
    });

    server.listen(8765, '127.0.0.1', () => {
      console.log(`Open this URL to sign in as ${emailHint}:\n`);
      console.log(authUrl);
      console.log('\nWaiting for authorization...');
    });

    server.on('error', reject);
  });

  const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
  const tokenPath = userTokenPath();
  await fs.writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');
  console.log(`Saved token: ${tokenPath}`);
  return tokenPath;
}

export async function getServiceAccountEmail(credentialsPath) {
  const raw = await fs.readFile(credentialsPath, 'utf8');
  const json = JSON.parse(raw);
  return json.client_email ?? null;
}

export const AUTH_HELP = `Google blocks the default gcloud client for Drive access. Use a project OAuth client:

  1. In Google Cloud Console (any project): enable Drive API + Docs API
  2. OAuth consent screen: Internal (Workspace) or External + add ben@chorltonbikes.coop as Test user
  3. Credentials → Create OAuth client → Desktop app → download JSON
  4. Save as google-oauth-client.json in the repo root (gitignored)
  5. npm run newsletter:google-login

See newsletter/README.md for full steps.`;
