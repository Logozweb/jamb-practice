import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { databaseApiPlugin } from './server/apiRoutes.js';
import {
  dispatchEmail,
  getSavedGmailToken,
  saveGmailToken,
  clearGmailToken
} from './server/emailDispatcher.js';

function emailRelayPlugin(loadedEnv = {}) {
  const GOOGLE_CLIENT_ID =
    loadedEnv.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '';
  const GOOGLE_CLIENT_SECRET =
    loadedEnv.GOOGLE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    '';
  const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';

  return {
    name: 'email-relay-plugin',
    configureServer(server) {
      // 1. Google OAuth Status
      server.middlewares.use('/api/auth/google/status', (req, res) => {
        const token = getSavedGmailToken();
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            configured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
            clientId: GOOGLE_CLIENT_ID,
            redirectUri: REDIRECT_URI,
            connected: Boolean(token && (token.refresh_token || token.access_token)),
            userEmail: token?.userEmail || null,
            connectedAt: token?.connectedAt || null
          })
        );
      });

      // 2. Google OAuth URL Generator
      server.middlewares.use('/api/auth/google/url', (req, res) => {
        const scopes = [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/userinfo.email'
        ];
        const authUrl =
          'https://accounts.google.com/o/oauth2/v2/auth?' +
          new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: scopes.join(' '),
            access_type: 'offline',
            prompt: 'consent'
          }).toString();

        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ url: authUrl, redirectUri: REDIRECT_URI }));
      });

      // 3. Google OAuth Callback (exchanges code for tokens)
      server.middlewares.use('/api/auth/google/callback', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');

          if (error) {
            res.writeHead(302, {
              Location: `/#/admin?gmail_error=${encodeURIComponent(error)}`
            });
            return res.end();
          }

          if (!code) {
            res.writeHead(302, {
              Location: '/#/admin?gmail_error=No_authorization_code_received'
            });
            return res.end();
          }

          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokenData = await tokenRes.json();
          if (!tokenRes.ok) {
            res.writeHead(302, {
              Location: `/#/admin?gmail_error=${encodeURIComponent(
                tokenData.error_description || tokenData.error || 'Token exchange failed'
              )}`
            });
            return res.end();
          }

          let userEmail = 'hello@pauladisa.com';
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              userEmail = userData.email || userEmail;
            }
          } catch (e) {
            console.warn('Could not fetch user profile email', e);
          }

          saveGmailToken({
            ...tokenData,
            userEmail,
            connectedAt: new Date().toISOString()
          });

          res.writeHead(302, {
            Location: `/#/admin?gmail_connected=true&email=${encodeURIComponent(userEmail)}`
          });
          return res.end();
        } catch (err) {
          res.writeHead(302, {
            Location: `/#/admin?gmail_error=${encodeURIComponent(err.message)}`
          });
          return res.end();
        }
      });

      // 4. Manual Refresh Token input (e.g. from Google OAuth Playground)
      server.middlewares.use('/api/auth/google/manual-token', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { refreshToken, userEmail } = JSON.parse(body || '{}');
            if (!refreshToken) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Refresh token is required.' }));
            }

            // Test exchange for access token
            const testRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken.trim(),
                grant_type: 'refresh_token'
              })
            });

            const testData = await testRes.json();
            if (!testRes.ok) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: false,
                error: testData.error_description || testData.error || 'Invalid refresh token.'
              }));
            }

            let verifiedEmail = userEmail || 'hello@pauladisa.com';
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${testData.access_token}` }
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                verifiedEmail = userData.email || verifiedEmail;
              }
            } catch (e) {}

            saveGmailToken({
              refresh_token: refreshToken.trim(),
              access_token: testData.access_token,
              userEmail: verifiedEmail,
              connectedAt: new Date().toISOString()
            });

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, email: verifiedEmail }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // 5. Disconnect Gmail
      server.middlewares.use('/api/auth/google/disconnect', (req, res) => {
        clearGmailToken();
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true }));
      });

      // 6. Main Email Dispatcher (Calls shared emailDispatcher with database fallback)
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const { to, candidateName, otpCode, subject, smtpConfig, resendApiKey } = payload;

            if (!to) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Recipient email address is required.' }));
            }

            const result = await dispatchEmail({
              to,
              candidateName,
              otpCode,
              subject,
              smtpConfig,
              resendApiKey,
              env: loadedEnv
            });

            res.statusCode = result.success ? 200 : (result.notConfigured ? 400 : 500);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
          }
        });
      });

      // 7. ALOC Past Questions Proxy (handles dev.aloc.com.ng and questions.aloc.com.ng)
      server.middlewares.use('/api/aloc/questions', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:3000');
          const endpointType = parsedUrl.searchParams.get('endpoint') || 'modern';
          const subject = parsedUrl.searchParams.get('subject') || 'english';
          const limit = parsedUrl.searchParams.get('limit') || '15';
          const year = parsedUrl.searchParams.get('year');
          const yearParam = year ? `&year=${year}` : '';
          const key = (req.headers['x-api-key'] || req.headers['accesstoken'] || '').trim().replace(/^["']|["']$/g, '');

          const targetUrl = endpointType === 'modern'
            ? `https://dev.aloc.com.ng/api/v1/questions?subject=${subject}&examType=jamb&limit=${limit}${yearParam}`
            : `https://questions.aloc.com.ng/api/v2/m?subject=${subject}&type=utme${yearParam}`;

          const headers = endpointType === 'modern'
            ? { 'X-API-Key': key, 'Accept': 'application/json' }
            : { 'AccessToken': key, 'X-API-Key': key, 'Accept': 'application/json' };

          const httpsModule = await import('https');
          const proxyReq = httpsModule.default.get(targetUrl, { headers }, (proxyRes) => {
            res.statusCode = proxyRes.statusCode;
            res.setHeader('Content-Type', 'application/json');
            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), emailRelayPlugin(env), databaseApiPlugin(env)],
    server: {
      port: 3000,
      host: true,
      open: true
    }
  };
});
