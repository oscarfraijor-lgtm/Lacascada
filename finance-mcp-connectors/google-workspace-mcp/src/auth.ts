#!/usr/bin/env node
/**
 * One-time OAuth2 authentication script.
 * Run with: npm run auth
 * This opens a browser for Google login and saves the refresh token to .env
 */
import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben estar en .env');
  console.error('Copia los valores del JSON descargado de Google Cloud Console.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n🔐 Autenticación de Google Workspace\n');
console.log('Abriendo navegador para autorización...\n');
console.log('Si no se abre automáticamente, visita:');
console.log(authUrl + '\n');

// Open browser
import('child_process').then(({ exec }) => {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${authUrl}"`);
});

// Start temporary server to receive the callback
const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) return;

  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Error: No se recibió código de autorización');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      res.writeHead(400);
      res.end('Error: No se recibió refresh token. Intenta revocar acceso en myaccount.google.com/permissions y ejecuta de nuevo.');
      server.close();
      return;
    }

    // Update .env file with refresh token
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${refreshToken}`);
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Autenticación exitosa!</h1>
          <p>El refresh token se guardó en .env</p>
          <p>Ya puedes cerrar esta ventana y usar el MCP server.</p>
        </body>
      </html>
    `);

    console.log('✅ Refresh token guardado en .env');
    console.log('Ya puedes iniciar el MCP server con: npm run dev\n');
    
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al obtener tokens:', error);
    res.writeHead(500);
    res.end('Error al obtener tokens');
    server.close();
    process.exit(1);
  }
});

server.listen(3000, () => {
  console.log('Esperando autorización en http://localhost:3000...\n');
});
