import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { logger } from './logger';
import { OAuth2Client } from 'google-auth-library';
import { Option, none, some, isNone } from '@shared/option';
import { Result, failure, fromPromise } from '@shared/result';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Load or request or authorization to call APIs.
 */
async function authorize(): Promise<Option<OAuth2Client>> {
  let client_id = process.env.GOOGLE_CLIENT_ID;
  let client_secret = process.env.GOOGLE_CLIENT_SECRET;
  let redirect_uri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';

  // Try to load from credentials.json if env vars are missing
  if (!client_id || !client_secret) {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      try {
        const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        client_id = key.client_id;
        client_secret = key.client_secret;
        redirect_uri = key.redirect_uris ? key.redirect_uris[0] : redirect_uri;
      } catch (err) {
        logger.warn('Error loading credentials.json', err);
      }
    }
  }

  if (!client_id || !client_secret) {
    logger.warn('Google Drive Upload skipped: Missing GOOGLE_CLIENT_ID/SECRET or credentials.json');
    return none();
  }

  const client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

  // Check for saved token
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
      client.setCredentials(JSON.parse(token));
      return some(client);
    } catch (err) {
      logger.warn('Error loading token.json, will need re-auth', err);
    }
  }

  // If we are here, we need a new token. 
  // Since this is a bridge service, we might not be able to interactively prompt easily 
  // without a UI. We will log the URL and hope the user (admin) sees it, 
  // OR we rely on a manual setup step where they generate token.json first.

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  logger.error('Google Drive Token Missing! automatic upload will fail.');
  logger.error('To authorize, visit this URL:', authUrl);
  logger.error('Then create a file named "token.json" in the bridge directory with the JSON response.');

  return none();
}

/**
 * Uploads a file to Google Drive
 */
export async function uploadFile(filePath: string): Promise<Result<string, Error>> {
  if (!fs.existsSync(filePath)) {
    const errorMsg = `File not found for upload: ${filePath}`;
    logger.error(errorMsg);
    return failure(new Error(errorMsg));
  }

  const authOption = await authorize();
  if (isNone(authOption)) return failure(new Error('Google Drive Authorization failed'));

  const auth = authOption.value;

  const service = google.drive({ version: 'v3', auth });
  const fileName = path.basename(filePath);

  return fromPromise(
    async () => {
      logger.info(`Starting upload to Google Drive: ${fileName}`);

      const requestBody = {
        name: fileName,
        fields: 'id, webViewLink',
      };

      const media = {
        mimeType: 'video/mp4', // Assuming mp4 or mkv, drive auto-detects usually
        body: fs.createReadStream(filePath),
      };

      const file = await service.files.create({
        requestBody,
        media: media,
      });

      if (!file.data.id) {
        throw new Error('Upload succeeded but no file ID was returned.');
      }

      logger.info(`✅ Upload complete! File ID: ${file.data.id}`);
      return file.data.id;
    },
    (e) => {
      logger.error('Google Drive upload failed:', e);
      return e instanceof Error ? e : new Error(String(e));
    }
  );
}
