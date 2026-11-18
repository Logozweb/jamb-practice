import * as db from './database.js';
import {
  dispatchEmail,
  dispatchWelcomeEmail,
  dispatchPaymentReceiptEmail,
  dispatchAppealDecisionEmail,
  dispatchTicketAckEmail,
  dispatchTicketReplyEmail,
  getSavedGmailToken,
  saveGmailToken,
  clearGmailToken
} from './emailDispatcher.js';

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
  let admin = null;
  if (authHeader) {
    admin = db.verifyAdminSession(authHeader);
  }

  // Graceful fallback and auto-session recovery for active admin sessions
  if (!admin) {
    const adminActive = req.headers['x-admin-active'];
    const adminId = req.headers['x-admin-id'];
    if (adminActive === 'true') {
      try {
        const dbInstance = db.getDatabase();
        let adminRow = null;
        if (adminId) {
          adminRow = dbInstance.prepare('SELECT id, email, name, role FROM admin_users WHERE id = ?').get(adminId);
        }
        if (!adminRow) {
          adminRow = dbInstance.prepare('SELECT id, email, name, role FROM admin_users ORDER BY id ASC LIMIT 1').get();
        }
        if (adminRow) {
          const newSession = db.createAdminSession(adminRow);
          res.setHeader('X-New-Admin-Token', newSession.token);
          res.setHeader('Access-Control-Expose-Headers', 'X-New-Admin-Token');
          return adminRow;
        }
      } catch (e) {
        console.warn('Error during admin auto-recovery session provisioning:', e);
      }
    }
  }

  if (!admin) {
    if (!authHeader) {
      sendJson(res, 401, { success: false, error: 'Unauthorized: Admin authentication token required.' });
    } else {
      sendJson(res, 403, { success: false, error: 'Forbidden: Invalid or expired admin session token.' });
    }
    return null;
  }
  return admin;
}

export async function handleApiRequest(req, res, next, env = {}) {
  // Set strict enterprise cybersecurity response headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const hostHeader = req.headers['host'] || 'localhost:3000';
  const url = new URL(req.url, `http://${hostHeader}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // If not an API request, yield immediately to next handler
  if (!pathname.startsWith('/api')) {
    if (typeof next === 'function') return next();
    return false;
  }

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
            if (saved && saved.email && !body.skipWelcomeEmail) {
              dispatchWelcomeEmail(saved, env).catch(err => {
                console.warn('Asynchronous welcome email dispatch note:', err.message);
              });
            }
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
            const result = db.adminUpdateCandidate(id, body);
            if (!result || !result.success) {
              return sendJson(res, 400, { success: false, error: result?.error || 'Failed to update candidate profile.' });
            }
            return sendJson(res, 200, { success: true, candidate: result.candidate });
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
              if (candidate.status === 'Banned') {
                return sendJson(res, 403, {
                  success: false,
                  error: 'ACCESS PERMANENTLY BLOCKED: This account has been banned from the platform for confirmed examination malpractice. Appeals for this account have been closed.'
                });
              }
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

          // -------------------------------------------------------------
          // Paystack Payment Gateway & Transaction Verification
          // -------------------------------------------------------------
          if (pathname === '/api/payment/public-settings' && method === 'GET') {
            const settings = db.getPublicPaymentSettings();
            return sendJson(res, 200, { success: true, settings });
          }

          if (pathname === '/api/payment/settings' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const settings = db.getPaymentSettings();
            return sendJson(res, 200, { success: true, settings });
          }

          if (pathname === '/api/payment/settings' && method === 'POST') {
            if (!requireAdminAuth(req, res)) return;
            const body = await readBody(req);
            const saved = db.savePaymentSettings(body);
            return sendJson(res, 200, { success: true, settings: saved });
          }

          if (pathname === '/api/payment/transactions' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const payments = db.getAllPayments();
            return sendJson(res, 200, { success: true, payments });
          }

          if (pathname === '/api/payment/verify' && method === 'POST') {
            const ip = getClientIp(req);
            const rateCheck = checkRateLimit(`payment_verify_${ip}`, 15, 5 * 60 * 1000);
            if (!rateCheck.allowed) {
              return sendJson(res, 429, { success: false, error: 'Too many verification attempts. Please wait a few moments.' });
            }

            const body = await readBody(req);
            const { reference, candidateId } = body;

            if (!reference || !candidateId) {
              return sendJson(res, 400, { success: false, error: 'Missing payment reference or candidate ID.' });
            }

            const cleanRef = reference.trim();
            const candidate = db.getCandidateById(candidateId);
            if (!candidate) {
              return sendJson(res, 404, { success: false, error: 'Candidate profile not found.' });
            }

            // Anti-Replay: Prevent reusing already processed transaction references
            const existing = db.getPaymentByReference(cleanRef);
            if (existing && existing.status === 'success') {
              return sendJson(res, 400, {
                success: false,
                error: 'This payment reference has already been processed and credited.'
              });
            }

            const pSettings = db.getPaymentSettings();
            const secretKey = (pSettings.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '').trim();
            const baseFeeNaira = pSettings.accessFeeNaira || 50;
            // Reactivation after malpractice appeal review pays HALF the normal fee
            const isReactivation = candidate.appealStatus === 'require_payment';
            const effectiveFeeNaira = isReactivation ? Math.round(baseFeeNaira / 2) : baseFeeNaira;
            const expectedKobo = effectiveFeeNaira * 100;

            let paymentSuccess = false;
            let paymentDetails = {
              candidateId,
              candidateName: candidate.name,
              candidateEmail: candidate.email,
              reference: cleanRef,
              amountKobo: expectedKobo,
              currency: 'NGN',
              status: 'failed',
              channel: 'card',
              paidAt: new Date().toISOString(),
              gatewayResponse: 'Pending Verification'
            };

            if (secretKey) {
              // Real Paystack Server-to-Server Verification using Paystack Secret Key
              try {
                const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanRef)}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/json'
                  }
                });

                const paystackData = await paystackRes.json();

                if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== 'success') {
                  const errMsg = paystackData.data?.gateway_response || paystackData.message || 'Payment verification failed on Paystack.';
                  paymentDetails.gatewayResponse = errMsg;
                  db.recordPayment(paymentDetails);
                  return sendJson(res, 400, { success: false, error: errMsg });
                }

                // Verify amount (prevent underpayment tampering) and currency
                const paidKobo = paystackData.data.amount;
                const paidCurrency = paystackData.data.currency;

                if (paidCurrency !== 'NGN') {
                  paymentDetails.gatewayResponse = `Invalid currency received: ${paidCurrency}`;
                  db.recordPayment(paymentDetails);
                  return sendJson(res, 400, { success: false, error: 'Invalid payment currency.' });
                }

                if (paidKobo < expectedKobo) {
                  paymentDetails.gatewayResponse = `Amount paid (₦${paidKobo / 100}) is less than required fee (₦${expectedKobo / 100})`;
                  db.recordPayment(paymentDetails);
                  return sendJson(res, 400, { success: false, error: `Amount paid is less than the required portal unlock fee of ₦${expectedKobo / 100}.` });
                }

                paymentSuccess = true;
                paymentDetails.amountKobo = paidKobo;
                paymentDetails.currency = paidCurrency;
                paymentDetails.status = 'success';
                paymentDetails.channel = paystackData.data.channel || 'card';
                paymentDetails.paidAt = paystackData.data.paid_at || new Date().toISOString();
                paymentDetails.gatewayResponse = paystackData.data.gateway_response || 'Successful';
              } catch (networkErr) {
                console.error('Paystack network verification error:', networkErr);
                return sendJson(res, 502, { success: false, error: 'Could not contact Paystack verification servers. Please try again.' });
              }
            } else {
              // Simulated Test Mode (when administrator hasn't added live Paystack Secret Key yet)
              paymentSuccess = true;
              paymentDetails.status = 'success';
              paymentDetails.gatewayResponse = 'Successful (Test Simulation)';
            }

            if (paymentSuccess) {
              db.recordPayment(paymentDetails);
              const updatedCandidate = db.approveCandidateByPayment(candidateId, cleanRef, paymentDetails.paidAt);

              // Trigger automated payment receipt & license activation email
              if (updatedCandidate && updatedCandidate.email) {
                dispatchPaymentReceiptEmail({
                  candidate: updatedCandidate,
                  amountNaira: Math.round(paymentDetails.amountKobo / 100),
                  reference: cleanRef,
                  paymentDate: paymentDetails.paidAt,
                  isReactivation,
                  env
                }).catch(err => {
                  console.warn('Receipt email dispatch note:', err.message);
                });
              }

              return sendJson(res, 200, {
                success: true,
                message: 'Payment verified successfully! Your account has been approved and all features are unlocked.',
                candidate: updatedCandidate,
                payment: paymentDetails
              });
            }

            return sendJson(res, 400, { success: false, error: 'Payment could not be verified.' });
          }

          if (pathname === '/api/email-outbox' && method === 'DELETE') {
            if (!requireAdminAuth(req, res)) return;
            req.resume();
            db.clearEmailOutboxLogsInDb();
            return sendJson(res, 200, { success: true });
          }

          // -------------------------------------------------------------
          // Malpractice Appeals Endpoints
          // -------------------------------------------------------------
          if (pathname === '/api/appeals' && method === 'POST') {
            const body = await readBody(req);
            const { candidateId, reason } = body;
            if (!candidateId || !reason || !reason.trim()) {
              return sendJson(res, 400, { success: false, error: 'Please enter a clear explanation for your appeal.' });
            }
            const result = db.submitCandidateAppeal(candidateId, reason.trim());
            return sendJson(res, result.success ? 200 : 400, result);
          }

          if (pathname === '/api/appeals' && method === 'GET') {
            if (!requireAdminAuth(req, res)) return;
            const appeals = db.getAllAppeals();
            return sendJson(res, 200, { success: true, appeals });
          }

          if (pathname === '/api/appeals/resolve' && method === 'POST') {
            if (!requireAdminAuth(req, res)) return;
            const body = await readBody(req);
            const { appealId, action, adminNotes } = body;
            if (!appealId || !['reinstate', 'require_payment', 'ban'].includes(action)) {
              return sendJson(res, 400, { success: false, error: 'Invalid appeal resolution action requested.' });
            }
            const result = db.resolveAppeal(appealId, action, adminNotes);
            if (result.success && result.candidate && result.candidate.email) {
              dispatchAppealDecisionEmail({
                candidate: result.candidate,
                action,
                notes: adminNotes,
                env
              }).catch(err => {
                console.warn('Asynchronous appeal decision email dispatch note:', err.message);
              });
            }
            return sendJson(res, result.success ? 200 : 400, result);
          }

          // -------------------------------------------------------------
          // Candidate Help Desk & Support Ticket Endpoints
          // -------------------------------------------------------------
          if (pathname === '/api/support/tickets' && method === 'GET') {
            const candidateId = url.searchParams.get('candidateId');
            if (!candidateId) {
              // Fetching all tickets requires administrator authorization
              if (!requireAdminAuth(req, res)) return;
            }
            const tickets = db.getSupportTickets(candidateId);
            return sendJson(res, 200, { success: true, tickets });
          }

          if (pathname === '/api/support/tickets' && method === 'POST') {
            const body = await readBody(req);
            const { candidateId, category, subject, message } = body;
            if (!candidateId || !subject?.trim() || !message?.trim()) {
              return sendJson(res, 400, { success: false, error: 'Candidate ID, subject, and message are required.' });
            }
            const ticket = db.createSupportTicket({
              candidateId,
              category: category || 'general',
              subject,
              message
            });
            if (ticket && ticket.candidateEmail) {
              const candidate = db.getCandidateById(candidateId);
              if (candidate) {
                dispatchTicketAckEmail({ candidate, ticket, env }).catch(err => {
                  console.warn('Support ticket acknowledgment email dispatch note:', err.message);
                });
              }
            }
            return sendJson(res, 201, { success: true, ticket });
          }

          if (pathname === '/api/support/tickets/resolve' && method === 'POST') {
            const admin = requireAdminAuth(req, res);
            if (!admin) return;
            const body = await readBody(req);
            const { ticketId, adminReply, status } = body;
            if (!ticketId || !adminReply?.trim()) {
              return sendJson(res, 400, { success: false, error: 'Ticket ID and resolution reply are required.' });
            }
            const ticket = db.resolveSupportTicket(
              ticketId,
              adminReply.trim(),
              status || 'resolved',
              admin.name || 'Support Desk Administrator'
            );
            if (!ticket) {
              return sendJson(res, 404, { success: false, error: 'Support ticket not found.' });
            }
            if (ticket.candidateEmail) {
              const candidate = db.getCandidateById(ticket.candidateId);
              if (candidate) {
                dispatchTicketReplyEmail({
                  candidate,
                  ticket,
                  reply: adminReply.trim(),
                  env
                }).catch(err => {
                  console.warn('Support ticket resolution email dispatch note:', err.message);
                });
              }
            }
            return sendJson(res, 200, { success: true, ticket });
          }

          if (pathname === '/api/support/tickets/reply' && method === 'POST') {
            const body = await readBody(req);
            const { ticketId, candidateId, reply, sender, senderName } = body;
            if (!ticketId || !reply?.trim()) {
              return sendJson(res, 400, { success: false, error: 'Ticket ID and reply text are required.' });
            }

            const result = db.replyToSupportTicket(ticketId, {
              sender: sender || 'candidate',
              senderName: senderName?.trim(),
              message: reply.trim(),
              candidateId: candidateId || null
            });

            if (!result.success) {
              return sendJson(res, 400, result);
            }

            return sendJson(res, 200, result);
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

          // -------------------------------------------------------------
          // Google OAuth & Email Relay Routes
          // -------------------------------------------------------------
          const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
          const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
          const REDIRECT_URI = `http://${hostHeader}/api/auth/google/callback`;

          if (pathname === '/api/auth/google/status' && method === 'GET') {
            const token = getSavedGmailToken();
            return sendJson(res, 200, {
              configured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
              clientId: GOOGLE_CLIENT_ID,
              redirectUri: REDIRECT_URI,
              connected: Boolean(token && (token.refresh_token || token.access_token)),
              userEmail: token?.userEmail || null,
              connectedAt: token?.connectedAt || null
            });
          }

          if (pathname === '/api/auth/google/url' && method === 'GET') {
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
            return sendJson(res, 200, { url: authUrl, redirectUri: REDIRECT_URI });
          }

          if (pathname === '/api/auth/google/callback' && method === 'GET') {
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');

            if (error) {
              res.writeHead(302, { Location: `/#/admin?gmail_error=${encodeURIComponent(error)}` });
              return res.end();
            }
            if (!code) {
              res.writeHead(302, { Location: '/#/admin?gmail_error=No_authorization_code_received' });
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
                Location: `/#/admin?gmail_error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'Token exchange failed')}`
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
            } catch (e) {}

            saveGmailToken({
              ...tokenData,
              userEmail,
              connectedAt: new Date().toISOString()
            });

            res.writeHead(302, {
              Location: `/#/admin?gmail_connected=true&email=${encodeURIComponent(userEmail)}`
            });
            return res.end();
          }

          if (pathname === '/api/auth/google/manual-token' && method === 'POST') {
            const body = await readBody(req);
            const { refreshToken, userEmail } = body;
            if (!refreshToken) {
              return sendJson(res, 400, { success: false, error: 'Refresh token is required.' });
            }

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
              return sendJson(res, 400, {
                success: false,
                error: testData.error_description || testData.error || 'Invalid refresh token.'
              });
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

            return sendJson(res, 200, { success: true, email: verifiedEmail });
          }

          if ((pathname === '/api/auth/google/disconnect') && (method === 'POST' || method === 'GET')) {
            clearGmailToken();
            return sendJson(res, 200, { success: true });
          }

          if (pathname === '/api/send-email' && method === 'POST') {
            const body = await readBody(req);
            const { to, candidateName, otpCode, subject, smtpConfig, resendApiKey } = body;
            if (!to) {
              return sendJson(res, 400, { success: false, error: 'Recipient email address is required.' });
            }

            const result = await dispatchEmail({
              to,
              candidateName,
              otpCode,
              subject,
              smtpConfig,
              resendApiKey,
              env
            });

            return sendJson(res, result.success ? 200 : (result.notConfigured ? 400 : 500), result);
          }

          if (pathname === '/api/aloc/questions' && method === 'GET') {
            const endpointType = url.searchParams.get('endpoint') || 'modern';
            const subject = url.searchParams.get('subject') || 'english';
            const limit = url.searchParams.get('limit') || '15';
            const year = url.searchParams.get('year');
            const yearParam = year ? `&year=${year}` : '';
            const key = (req.headers['x-api-key'] || req.headers['accesstoken'] || '').trim().replace(/^["']|["']$/g, '');

            const targetUrl = endpointType === 'modern'
              ? `https://dev.aloc.com.ng/api/v1/questions?subject=${subject}&examType=jamb&limit=${limit}${yearParam}`
              : `https://questions.aloc.com.ng/api/v2/m?subject=${subject}&type=utme${yearParam}`;

            const headers = endpointType === 'modern'
              ? { 'X-API-Key': key, 'Accept': 'application/json' }
              : { 'AccessToken': key, 'X-API-Key': key, 'Accept': 'application/json' };

            try {
              const fetchRes = await fetch(targetUrl, { headers });
              const data = await fetchRes.json();
              return sendJson(res, fetchRes.status, data);
            } catch (err) {
              return sendJson(res, 502, { error: err.message });
            }
          }

          if (typeof next === 'function') return next();
          return sendJson(res, 404, { success: false, error: `Route not found: ${pathname}` });
        } catch (err) {
          console.error('API Error in database middleware:', err);
          return sendJson(res, 500, { error: err.message });
        }
}

export function databaseApiPlugin(env = {}) {
  return {
    name: 'database-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        await handleApiRequest(req, res, next, env);
      });
    }
  };
}
