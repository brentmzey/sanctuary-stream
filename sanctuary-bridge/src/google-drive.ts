import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { logger } from './logger';
import { OAuth2Client } from 'google-auth-library';
import { Option, none, some, isNone } from '@shared/option';
import { Result, fromPromise } from '@shared/result';

/**
 * Handles automatic uploading of OBS recordings to Google Drive.
 * 
 * Flow:
 * 1. Read credentials.json (Service Account or OAuth)
 * 2. Authenticate
 * 3. Stream file to Drive
 * 4. Log result and return File ID
 */

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

/**
 * Loads existing credentials from local file.
 */
async function loadSavedCredentialsIfExist(): Promise<Option<OAuth2Client>> {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH, 'utf8');
    const credentials = JSON.parse(content);
    return some(google.auth.fromJSON(credentials) as OAuth2Client);
  } catch (err) {
    return none();
  }
}

/**
 * Main entry point for file uploads.
 * Triggered by the bridge when a recording session completes.
 */
export async function uploadFile(filePath: string): Promise<Result<string, Error>> {
  logger.info(`🚀 Starting Google Drive upload: ${filePath}`);

  return fromPromise(
    async () => {
      const auth = await loadSavedCredentialsIfExist();

      if (isNone(auth)) {
        // Fallback to service account if no user token exists
        const serviceAuth = new google.auth.GoogleAuth({
          keyFile: CREDENTIALS_PATH,
          scopes: SCOPES,
        });
        const client = await serviceAuth.getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return doUpload(client as any, filePath);
      }

      return doUpload(auth.value, filePath);
    },
    (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function doUpload(auth: any, filePath: string): Promise<string> {
  const drive = google.drive({ version: 'v3', auth });
  const fileName = path.basename(filePath);

  const fileMetadata = {
    name: fileName,
    parents: [], // Can specify a specific "Recordings" folder ID here
  };

  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(filePath),
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  logger.info(`✅ Upload complete! File ID: ${file.data.id}`);
  return file.data.id || 'unknown-id';
}
