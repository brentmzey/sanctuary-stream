import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { logger } from './logger';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Load or request or authorization to call APIs.
 */
async function authorize(): Promise<OAuth2Client | null> {
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
    return null;
  }

  const client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

  // Check for saved token
  if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
        client.setCredentials(JSON.parse(token));
        return client;
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
  
  return null;
}

/**
 * Uploads a file to Google Drive
 */
export async function uploadFile(filePath: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) {
    logger.error(`File not found for upload: ${filePath}`);
    return null;
  }

  const auth = await authorize();
  if (!auth) return null;

  const service = google.drive({ version: 'v3', auth });
  const fileName = path.basename(filePath);

  try {
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

    logger.info(`✅ Upload complete! File ID: ${file.data.id}`);
    return file.data.id || null;
  } catch (err) {
    logger.error('Google Drive upload failed:', err);
    return null;
  }
}
