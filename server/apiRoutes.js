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

export function databaseApiPlugin(env = {}) {
  return {
    name: 'database-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;
        const method = req.method.toUpperCase();

        try {
          // -------------------------------------------------------------
          // Candidates Endpoints
          // -------------------------------------------------------------
          if (pathname === '/api/candidates' && method === 'GET') {
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
            const id = pathname.replace('/api/candidates/', '');
            const body = await readBody(req);
            const updated = db.updateCandidateField(id, body);
            if (!updated) return sendJson(res, 404, { error: 'Candidate not found' });
            return sendJson(res, 200, updated);
          }

          if (pathname.startsWith('/api/candidates/') && method === 'DELETE') {
            req.resume();
            const id = pathname.replace('/api/candidates/', '');
            db.deleteCandidateById(id);
            return sendJson(res, 200, { success: true });
          }

          if (pathname === '/api/auth/candidate/login' && method === 'POST') {
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
            const body = await readBody(req);
            db.savePlatformSettings(body);
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Admin Auth & Management
          // -------------------------------------------------------------
          if (pathname === '/api/admins' && method === 'GET') {
            const admins = db.getAllAdmins();
            return sendJson(res, 200, admins);
          }

          if (pathname === '/api/auth/admin/login' && method === 'POST') {
            const body = await readBody(req);
            const admin = db.authenticateAdmin(body.email, body.password);
            if (admin) {
              return sendJson(res, 200, { success: true, admin });
            }
            return sendJson(res, 401, { success: false, error: 'Invalid Administrator credentials.' });
          }

          if (pathname === '/api/admins/password' && method === 'POST') {
            const body = await readBody(req);
            db.updateAdminPasswordInDb(body.email, body.newPassword);
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Centralized Email Settings (Database-Backed)
          // -------------------------------------------------------------
          if (pathname === '/api/email-settings' && method === 'GET') {
            const settings = db.getEmailSettingsFromDb();
            return sendJson(res, 200, settings);
          }

          if (pathname === '/api/email-settings' && method === 'POST') {
            const body = await readBody(req);
            const saved = db.saveEmailSettingsToDb(body);
            return sendJson(res, 200, { success: true, settings: saved });
          }

          // -------------------------------------------------------------
          // Centralized Email Outbox & Deliverability Logs
          // -------------------------------------------------------------
          if (pathname === '/api/email-outbox' && method === 'GET') {
            const limit = parseInt(url.searchParams.get('limit') || '100', 10);
            const logs = db.getEmailOutboxLogsFromDb(limit);
            return sendJson(res, 200, logs);
          }

          if (pathname === '/api/email-outbox' && method === 'DELETE') {
            req.resume();
            db.clearEmailOutboxLogsInDb();
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Database-Backed OTP Generation & Dispatch
          // -------------------------------------------------------------
          if (pathname === '/api/otp/send' && method === 'POST') {
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
          // Database-Backed OTP Verification
          // -------------------------------------------------------------
          if (pathname === '/api/otp/verify' && method === 'POST') {
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

          next();
        } catch (err) {
          console.error('API Error in database middleware:', err);
          return sendJson(res, 500, { error: err.message });
        }
      });
    }
  };
}
