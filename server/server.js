/**
 * Enterprise Production Web & API Server
 * Serves the compiled JAMB CBT Simulator frontend (dist/) and handles all /api/* routes
 * backed by the persistent SQLite database, email dispatcher, and Paystack payment gateway.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './apiRoutes.js';
import * as db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

// Load environment variables from .env file if available
function loadEnvFile() {
  const envPath = path.resolve(ROOT_DIR, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
        if (!process.env[key]) process.env[key] = val;
      }
    });
  } catch (err) {
    console.warn('Note: Could not parse .env file:', err.message);
  }
  return env;
}

const env = { ...loadEnvFile(), ...process.env };
const PORT = parseInt(process.env.PORT || env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

function serveStatic(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers['host'] || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // Security: Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // Check if dist folder exists
  if (!fs.existsSync(DIST_DIR)) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>JAMB CBT Simulator - Build Required</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center; }
          .card { max-width: 580px; margin: 40px auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; font-size: 22px; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          code { background: #0f172a; padding: 4px 8px; border-radius: 4px; color: #4ade80; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Production Build Required</h1>
          <p>The production server is active, but the frontend static distribution folder (<code>dist/</code>) has not been compiled yet.</p>
          <p>Please run the production build command before starting the server:</p>
          <p><code>npm run build && npm start</code></p>
        </div>
      </body>
      </html>
    `);
  }

  // If path is a directory or root, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file exists, stream it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Cache immutable assets for 1 year, no-cache for index.html
    if (safePath.startsWith('/assets/') || safePath.startsWith('assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  }

  // SPA Fallback: Any non-file route falls back to dist/index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    const stream = fs.createReadStream(indexPath);
    stream.pipe(res);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404 Not Found');
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers['host'] || 'localhost'}`);
  
  // API Routes
  if (urlObj.pathname.startsWith('/api')) {
    await handleApiRequest(req, res, () => {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `API endpoint not found: ${urlObj.pathname}` }));
    }, env);
    return;
  }

  // Static Frontend & SPA Fallback
  serveStatic(req, res);
});

// Initialize database connection on startup
try {
  db.getDatabase();
} catch (err) {
  console.error('Fatal: Could not initialize SQLite database on startup:', err);
}

server.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log('   JAMB PRACTICE CBT PLATFORM - PRODUCTION SERVER   ');
  console.log('====================================================');
  console.log(`> Server running on: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`> Environment:      production`);
  console.log(`> Database:         SQLite (server/jamb_practice.db)`);
  console.log(`> Frontend assets:  dist/`);
  console.log('====================================================\n');
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully terminating server...`);
  server.close(() => {
    console.log('HTTP server closed successfully.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
