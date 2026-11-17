import * as db from './database.js';
import { dispatchEmail } from './emailDispatcher.js';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// -------------------------------------------------------------
// In-Memory Rate Limiter for Abuse & Brute-Force Prevention
// -------------------------------------------------------------
const rateLimitCache = new Map();

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = rateLimitCache.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    rateLimitCache.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  rateLimitCache.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
}

function requireAdminAuth(req, res) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  if (!authHeader) {
    sendJson(res, 401, { success: false, error: 'Unauthorized: Admin authentication token required.' });
    return null;
  }
  const admin = db.verifyAdminSession(authHeader);
  if (!admin) {
    sendJson(res, 403, { success: false, error: 'Forbidden: Invalid or expired admin session token.' });
    return null;
  }
  return admin;
}

export function databaseApiPlugin(env = {}) {
  return {
    name: 'database-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Set strict enterprise cybersecurity response headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;
        const method = req.method.toUpperCase();

        try {
          // -------------------------------------------------------------
          // Candidates Endpoints (Protected by Admin Auth where required)
          // -------------------------------------------------------------
          if (pathname === '/api/candidates' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const list = db.getAllCandidates();
            return sendJson(res, 200, list);
          }

          if (pathname === '/api/candidates' && method === 'POST') {
            const body = await readBody(req);
            const saved = db.saveCandidate(body);
            return sendJson(res, 201, saved);
          }

          if (pathname.startsWith('/api/candidates/') && method === 'GET') {
            const id = pathname.replace('/api/candidates/', '');
            const candidate = db.getCandidateById(id);
            if (!candidate) return sendJson(res, 404, { error: 'Candidate not found' });
            return sendJson(res, 200, candidate);
          }

          if (pathname.startsWith('/api/candidates/') && method === 'PUT') {
            if (!requireAdminAuth(req, res)) return;
            const id = pathname.replace('/api/candidates/', '');
            const body = await readBody(req);
            const updated = db.updateCandidateField(id, body);
            if (!updated) return sendJson(res, 404, { error: 'Candidate not found' });
            return sendJson(res, 200, updated);
          }

          if (pathname.startsWith('/api/candidates/') && method === 'DELETE') {
            if (!requireAdminAuth(req, res)) return;
            req.resume();
            const id = pathname.replace('/api/candidates/', '');
            db.deleteCandidateById(id);
            return sendJson(res, 200, { success: true });
          }

          if (pathname === '/api/auth/candidate/login' && method === 'POST') {
            const ip = getClientIp(req);
            const rateCheck = checkRateLimit(`cand_login_${ip}`, 10, 15 * 60 * 1000);
            if (!rateCheck.allowed) {
              return sendJson(res, 429, { success: false, error: `Too many login attempts. Please wait ${rateCheck.resetInSec}s before retrying.` });
            }

            const body = await readBody(req);
            const candidate = db.authenticateCandidate(body.emailOrReg, body.password);
            if (candidate) {
              return sendJson(res, 200, { success: true, candidate });
            }
            return sendJson(res, 401, { success: false, error: 'Invalid Email/Reg No or Password.' });
          }

          // -------------------------------------------------------------
          // Exam Results Endpoints
          // -------------------------------------------------------------
          if (pathname === '/api/exam-results' && method === 'GET') {
            const candidateId = url.searchParams.get('candidateId');
            const results = db.getAllExamResults(candidateId);
            return sendJson(res, 200, results);
          }

          if (pathname === '/api/exam-results' && method === 'POST') {
            const body = await readBody(req);
            const result = db.saveExamResult(body);
            return sendJson(res, 201, result);
          }

          // -------------------------------------------------------------
          // Platform Settings Endpoints
          // -------------------------------------------------------------
          if (pathname === '/api/settings' && method === 'GET') {
            const settings = db.getPlatformSettings();
            return sendJson(res, 200, settings || {});
          }

          if (pathname === '/api/settings' && method === 'POST') {
            if (!requireAdminAuth(req, res)) return;
            const body = await readBody(req);
            db.savePlatformSettings(body);
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Admin Auth & Management
          // -------------------------------------------------------------
          if (pathname === '/api/admins' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const admins = db.getAllAdmins();
            return sendJson(res, 200, admins);
          }

          if (pathname === '/api/auth/admin/login' && method === 'POST') {
            const ip = getClientIp(req);
            const rateCheck = checkRateLimit(`admin_login_${ip}`, 5, 15 * 60 * 1000);
            if (!rateCheck.allowed) {
              return sendJson(res, 429, { success: false, error: `Too many failed login attempts. Access temporarily suspended for ${rateCheck.resetInSec}s.` });
            }

            const body = await readBody(req);
            const authResult = db.authenticateAdmin(body.email, body.password);
            if (authResult) {
              return sendJson(res, 200, {
                success: true,
                admin: { id: authResult.id, email: authResult.email, name: authResult.name, role: authResult.role },
                token: authResult.token,
                expiresAt: authResult.tokenExpiresAt
              });
            }
            return sendJson(res, 401, { success: false, error: 'Invalid Administrator credentials.' });
          }

          if (pathname === '/api/auth/admin/logout' && method === 'POST') {
            const token = req.headers['authorization'] || req.headers['x-admin-token'];
            if (token) db.destroyAdminSession(token);
            return sendJson(res, 200, { success: true });
          }

          if (pathname === '/api/admins/password' && method === 'POST') {
            if (!requireAdminAuth(req, res)) return;
            const body = await readBody(req);
            db.updateAdminPasswordInDb(body.email, body.newPassword);
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Centralized Email Settings (Database-Backed & Admin Protected)
          // -------------------------------------------------------------
          if (pathname === '/api/email-settings' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const settings = db.getEmailSettingsFromDb();
            return sendJson(res, 200, settings);
          }

          if (pathname === '/api/email-settings' && method === 'POST') {
            if (!requireAdminAuth(req, res)) return;
            const body = await readBody(req);
            const saved = db.saveEmailSettingsToDb(body);
            return sendJson(res, 200, { success: true, settings: saved });
          }

          // -------------------------------------------------------------
          // Centralized Email Outbox & Deliverability Logs (Admin Protected)
          // -------------------------------------------------------------
          if (pathname === '/api/email-outbox' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const limit = parseInt(url.searchParams.get('limit') || '100', 10);
            const logs = db.getEmailOutboxLogsFromDb(limit);
            return sendJson(res, 200, logs);
          }

          if (pathname === '/api/email-outbox' && method === 'DELETE') {
            if (!requireAdminAuth(req, res)) return;
            req.resume();
            db.clearEmailOutboxLogsInDb();
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Database-Backed OTP Generation & Dispatch (Rate-Limited)
          // -------------------------------------------------------------
          if (pathname === '/api/otp/send' && method === 'POST') {
            const ip = getClientIp(req);
            const rateCheck = checkRateLimit(`otp_send_${ip}`, 5, 5 * 60 * 1000);
            if (!rateCheck.allowed) {
              return sendJson(res, 429, { success: false, error: `Too many verification code requests. Please wait ${rateCheck.resetInSec}s before requesting a new code.` });
            }

            const body = await readBody(req);
            const { email, candidateName, purpose } = body;
            if (!email || !email.includes('@')) {
              return sendJson(res, 400, { success: false, error: 'A valid email address is required.' });
            }
            const cleanEmail = email.trim().toLowerCase();
            const cleanName = (candidateName || 'Candidate').trim();
            const cleanPurpose = (purpose || 'registration').trim();

            const otpRecord = db.createOtpInDb(cleanEmail, cleanName, cleanPurpose);
            const mailSubject = cleanPurpose === 'password_reset'
              ? 'JAMB Practice Platform - Password Reset Security Code'
              : 'JAMB Practice Platform - Candidate Verification OTP Code';

            const dispatchResult = await dispatchEmail({
              to: cleanEmail,
              candidateName: cleanName,
              otpCode: otpRecord.code,
              subject: mailSubject,
              env
            });

            return sendJson(res, 200, {
              success: true,
              email: cleanEmail,
              expiresAt: otpRecord.expiresAt,
              delivered: Boolean(dispatchResult.success),
              provider: dispatchResult.provider || 'JAMB Central Mail Relay',
              notConfigured: Boolean(dispatchResult.notConfigured),
              devOtpCode: dispatchResult.notConfigured ? otpRecord.code : undefined,
              message: dispatchResult.success
                ? `Verification code dispatched to ${cleanEmail}.`
                : 'Verification code generated and recorded in Central Database.'
            });
          }

          // -------------------------------------------------------------
          // Database-Backed OTP Verification (Rate-Limited)
          // -------------------------------------------------------------
          if (pathname === '/api/otp/verify' && method === 'POST') {
            const ip = getClientIp(req);
            const rateCheck = checkRateLimit(`otp_verify_${ip}`, 10, 5 * 60 * 1000);
            if (!rateCheck.allowed) {
              return sendJson(res, 429, { success: false, error: `Too many verification attempts. Please wait ${rateCheck.resetInSec}s before trying again.` });
            }

            const body = await readBody(req);
            const { email, otpCode, purpose } = body;
            if (!email || !otpCode) {
              return sendJson(res, 400, { success: false, error: 'Email and verification code are required.' });
            }
            const cleanEmail = email.trim().toLowerCase();
            const cleanCode = otpCode.trim();
            const cleanPurpose = (purpose || 'registration').trim();

            const verifyResult = db.verifyOtpInDb(cleanEmail, cleanCode, cleanPurpose);
            if (verifyResult.success) {
              return sendJson(res, 200, { success: true });
            }
            return sendJson(res, 400, verifyResult);
          }

          // -------------------------------------------------------------
          // ALOC Live Question Stream & Cache Endpoint
          // -------------------------------------------------------------
          if (pathname === '/api/aloc/subject-questions' && method === 'GET') {
            const subject = url.searchParams.get('subject') || 'english';
            const count = parseInt(url.searchParams.get('count') || '40', 10);
            let apiKey = url.searchParams.get('apiKey') || req.headers['x-api-key'];

            if (!apiKey) {
              const platformSettings = db.getPlatformSettings();
              apiKey = platformSettings?.alocApiKey;
            }

            // Check cache first
            let cached = db.getCachedAlocQuestions(subject, count);
            if (cached.length >= count) {
              return sendJson(res, 200, {
                success: true,
                subject,
                source: 'ALOC Past Questions API (Cached)',
                count: cached.length,
                questions: cached
              });
            }

            // If key is available, fetch additional batches from ALOC Station
            if (apiKey) {
              const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
              const ALOC_MAP = {
                english: 'english-language',
                mathematics: 'mathematics',
                physics: 'physics',
                chemistry: 'chemistry',
                biology: 'biology',
                economics: 'economics',
                government: 'government',
                literature: 'literature-in-english',
                commerce: 'commerce',
                crk: 'christian-religious-studies',
                crs: 'christian-religious-studies',
                geography: 'geography',
                accounting: 'accounting'
              };
              const mappedSubject = ALOC_MAP[subject] || subject;
              const years = [null, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012];

              for (const yr of years) {
                if (cached.length >= count) break;
                const yrParam = yr ? `&year=${yr}` : '';
                const targetUrl = `https://dev.aloc.com.ng/api/v1/questions?subject=${mappedSubject}&examType=jamb&limit=15${yrParam}`;

                try {
                  const fetchRes = await fetch(targetUrl, {
                    headers: {
                      'Authorization': `Bearer ${cleanKey}`,
                      'x-api-key': cleanKey,
                      'AccessToken': cleanKey,
                      'Accept': 'application/json'
                    }
                  });
                  if (fetchRes.status === 200) {
                    const data = await fetchRes.json();
                    const batch = data.data || [];
                    if (Array.isArray(batch) && batch.length > 0) {
                      db.saveCachedAlocQuestions(subject, batch);
                    }
                  } else if (fetchRes.status === 429) {
                    // Rate limit encountered, break and serve accumulated
                    break;
                  }
                  await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                  break;
                }
                cached = db.getCachedAlocQuestions(subject, count);
              }
            }

            return sendJson(res, 200, {
              success: true,
              subject,
              source: 'ALOC Past Questions API',
              count: cached.length,
              questions: cached
            });
          }

          next();
        } catch (err) {
          console.error('API Error in database middleware:', err);
          return sendJson(res, 500, { error: err.message });
        }
      });
    }
  };
}
