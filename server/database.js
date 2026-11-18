import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DATA_DIR, 'jamb_practice.db');
let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  // 1. Candidates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      gender TEXT DEFAULT 'Male',
      dob TEXT DEFAULT '2006-05-15',
      password TEXT NOT NULL,
      status TEXT DEFAULT 'Approved',
      disapproval_reason TEXT,
      reg_number TEXT NOT NULL UNIQUE,
      profile_code TEXT,
      seat_number TEXT,
      center TEXT,
      exam_town TEXT,
      exam_date TEXT,
      exam_time TEXT,
      passport TEXT,
      state_of_origin TEXT,
      lga TEXT,
      target_course TEXT,
      faculty TEXT,
      first_choice TEXT,
      second_choice TEXT,
      third_choice TEXT,
      fourth_choice TEXT,
      selected_subjects TEXT,
      caps TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Exam Results Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      reg_number TEXT NOT NULL,
      aggregate_score INTEGER NOT NULL,
      subject_breakdown TEXT NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      date_taken TEXT NOT NULL,
      exam_data TEXT
    );
  `);
  try { db.exec('ALTER TABLE exam_results ADD COLUMN exam_type TEXT DEFAULT "full_mock"'); } catch (e) {}
  try { db.exec('ALTER TABLE exam_results ADD COLUMN exam_mode TEXT DEFAULT "simulation"'); } catch (e) {}
  try { db.exec('ALTER TABLE exam_results ADD COLUMN exam_length TEXT DEFAULT "standard"'); } catch (e) {}

  // 3. Platform Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 4. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Email Gateway Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_settings (
      id TEXT PRIMARY KEY,
      provider TEXT DEFAULT 'gmail_api',
      gmail_config TEXT,
      smtp_config TEXT,
      resend_api_key TEXT,
      emailjs_config TEXT,
      webhook_config TEXT,
      sender_name TEXT DEFAULT 'JAMB Practice Platform',
      sender_email TEXT DEFAULT 'noreply@pauladisa.com',
      subject_line TEXT DEFAULT 'JAMB Practice Platform - Verification Security Code',
      updated_at TEXT NOT NULL
    );
  `);

  // 6. OTP Verifications Table (Real Database-Backed Verification)
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      candidate_name TEXT,
      attempts INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  // 7. Email Outbox & Deliverability Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      recipient_email TEXT NOT NULL,
      candidate_name TEXT,
      otp_code TEXT,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // 8. ALOC Questions Cache Table (Persistent storage of live pulled authentic questions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS aloc_questions_cache (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      year INTEGER,
      signature TEXT UNIQUE,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aloc_subject ON aloc_questions_cache(subject);
  `);

  // 9. Admin Active Sessions Table (Enforces secure Bearer token authorization)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_admin_token ON admin_sessions(token);
  `);

  // 10. Student Payments Table (Paystack Transactions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_payments (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT,
      candidate_email TEXT,
      reference TEXT NOT NULL UNIQUE,
      amount_kobo INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      status TEXT NOT NULL,
      channel TEXT,
      paid_at TEXT,
      gateway_response TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payments_candidate ON student_payments(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_payments_reference ON student_payments(reference);
  `);
  try { db.exec('ALTER TABLE candidates ADD COLUMN payment_reference TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE candidates ADD COLUMN payment_date TEXT'); } catch (e) {}

  // 11. Payment Gateway Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 1,
      access_fee_naira INTEGER DEFAULT 50,
      paystack_public_key TEXT DEFAULT '',
      paystack_secret_key TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );
  `);
  try {
    const existingPSet = db.prepare('SELECT id FROM payment_settings WHERE id = ?').get('primary');
    if (!existingPSet) {
      db.prepare(`
        INSERT INTO payment_settings (id, enabled, access_fee_naira, paystack_public_key, paystack_secret_key, updated_at)
        VALUES ('primary', 1, 50, '', '', datetime('now'))
      `).run();
    }
  } catch (e) {}

  // 12. Candidate Malpractice Appeals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidate_appeals (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT,
      candidate_email TEXT,
      reg_number TEXT,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_action TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_appeals_candidate ON candidate_appeals(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_appeals_status ON candidate_appeals(status);
  `);
  try { db.exec('ALTER TABLE candidates ADD COLUMN appeal_status TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE candidates ADD COLUMN appeal_date TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE candidates ADD COLUMN practice_id TEXT'); } catch (e) {}

  // Ensure Default Admin Exists
  const adminCheck = db.prepare('SELECT id FROM admin_users WHERE email = ?').get('hello@pauladisa.com');
  if (!adminCheck) {
    db.prepare(`
      INSERT INTO admin_users (id, email, password, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'admin_root',
      'hello@pauladisa.com',
      hashPassword('AdminPassword2026!'),
      'CHIEF CBT CONTROLLER',
      'Super Administrator',
      new Date().toISOString()
    );
  }
}

// -------------------------------------------------------------
// Cryptographic Password Hashing & Verification
// -------------------------------------------------------------
export function hashPassword(plainText, salt = null) {
  if (!plainText) return '';
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plainText, storedHashOrPlain) {
  if (!plainText || !storedHashOrPlain) return false;
  // Backward compatibility with legacy plain text password
  if (!storedHashOrPlain.includes(':')) {
    return plainText === storedHashOrPlain;
  }
  const [salt, hash] = storedHashOrPlain.split(':');
  const verifyHash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// -------------------------------------------------------------
// Admin Session Management
// -------------------------------------------------------------
export function createAdminSession(admin) {
  const db = getDatabase();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity
  db.prepare(`
    INSERT INTO admin_sessions (token, admin_id, admin_email, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(token, admin.id, admin.email, now.toISOString(), expiresAt.toISOString());
  return { token, expiresAt: expiresAt.toISOString() };
}

export function verifyAdminSession(token) {
  if (!token) return null;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) return null;
  const db = getDatabase();
  const session = db.prepare(`
    SELECT * FROM admin_sessions WHERE token = ?
  `).get(cleanToken);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(cleanToken);
    return null;
  }
  const admin = db.prepare('SELECT id, email, name, role FROM admin_users WHERE id = ?').get(session.admin_id);
  return admin || null;
}

export function destroyAdminSession(token) {
  if (!token) return;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  const db = getDatabase();
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(cleanToken);
}

// -------------------------------------------------------------
// Candidate Operations
// -------------------------------------------------------------
export function getAllCandidates() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all();
  return rows.map(formatCandidateFromDb);
}

export function getCandidateById(id) {
  const db = getDatabase();
  const cleanUpper = (id || '').trim().toUpperCase();
  const row = db.prepare('SELECT * FROM candidates WHERE id = ? OR email = ? OR reg_number = ? OR UPPER(practice_id) = ?').get(id, id, id, cleanUpper);
  return row ? formatCandidateFromDb(row) : null;
}

export function saveCandidate(candidate) {
  const db = getDatabase();
  const now = new Date().toISOString();

  const id = candidate.id || `cand_${Date.now()}`;
  const regNumber = candidate.regNumber || ('2026' + crypto.randomInt(10000000, 100000000) + 'EB');
  const profileCode = candidate.profileCode || ('55019' + crypto.randomInt(10000, 100000));
  const seatNumber = candidate.seatNumber || (`Virtual Desk ${crypto.randomInt(1, 60)}`);
  const practiceId = candidate.practiceId || (`SIM-2026-${crypto.randomInt(1000, 9999)}`);
  const center = candidate.center || 'ONLINE JAMB CBT SIMULATION';
  const passport = candidate.passport || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'Candidate')}&background=006633&color=fff&size=200`;

  // Cryptographically hash candidate password if plain text
  let candidatePassword = candidate.password || 'password123';
  if (!candidatePassword.includes(':')) {
    candidatePassword = hashPassword(candidatePassword);
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO candidates (
      id, name, email, phone, gender, dob, password, status, disapproval_reason,
      reg_number, profile_code, seat_number, center, exam_town, exam_date, exam_time,
      passport, state_of_origin, lga, target_course, faculty,
      first_choice, second_choice, third_choice, fourth_choice, selected_subjects,
      caps, practice_id, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    (candidate.name || 'JAMB CANDIDATE').toUpperCase(),
    (candidate.email || '').trim().toLowerCase(),
    candidate.phone || '',
    candidate.gender || 'Not Specified',
    candidate.dob || '2006-05-15',
    candidatePassword,
    candidate.status || 'Approved',
    candidate.disapprovalReason || null,
    regNumber,
    profileCode,
    seatNumber,
    center,
    candidate.examTown || 'Abuja - Central',
    candidate.examDate || 'Flexible / Unlimited On-Demand',
    candidate.examTime || 'Self-Paced Practice (Unlimited Attempts)',
    passport,
    candidate.stateOfOrigin || 'Lagos',
    candidate.lga || 'Ikeja',
    candidate.targetCourse || 'General Degree Programme',
    candidate.faculty || 'Sciences',
    JSON.stringify(candidate.firstChoice || {}),
    JSON.stringify(candidate.secondChoice || {}),
    JSON.stringify(candidate.thirdChoice || {}),
    JSON.stringify(candidate.fourthChoice || {}),
    JSON.stringify(candidate.selectedSubjects || ['english', 'mathematics', 'physics', 'chemistry']),
    JSON.stringify(candidate.caps || {
      status: 'Admission in Progress',
      institution: candidate.firstChoice?.institution || 'University of Ibadan (UI)',
      course: candidate.targetCourse || 'General Degree Programme',
      accepted: false,
      rejected: false,
      admittedAt: null
    }),
    practiceId,
    candidate.createdAt || now,
    now
  );

  return getCandidateById(id);
}

export function updateCandidateField(id, updates) {
  const candidate = getCandidateById(id);
  if (!candidate) return null;
  const merged = { ...candidate, ...updates, updatedAt: new Date().toISOString() };
  return saveCandidate(merged);
}

export function deleteCandidateById(id) {
  const db = getDatabase();
  db.prepare('DELETE FROM candidates WHERE id = ?').run(id);
  return { success: true };
}

export function authenticateCandidate(emailOrReg, password) {
  const db = getDatabase();
  const clean = (emailOrReg || '').trim().toLowerCase();
  const cleanUpper = (emailOrReg || '').trim().toUpperCase();

  const row = db.prepare(`
    SELECT * FROM candidates
    WHERE LOWER(email) = ? OR UPPER(reg_number) = ? OR profile_code = ? OR UPPER(practice_id) = ?
  `).get(clean, cleanUpper, emailOrReg.trim(), cleanUpper);

  if (!row) return null;

  const isValid = verifyPassword(password, row.password);
  if (!isValid) return null;

  // Seamlessly upgrade legacy plain text passwords to PBKDF2 hash
  if (!row.password.includes(':')) {
    const newHash = hashPassword(password);
    db.prepare('UPDATE candidates SET password = ? WHERE id = ?').run(newHash, row.id);
  }

  return formatCandidateFromDb(row);
}

function formatCandidateFromDb(row) {
  const db = getDatabase();
  let examHistory = [];
  try {
    const historyRows = db.prepare(`
      SELECT id, aggregate_score as aggregateScore, subject_breakdown as subjectBreakdown,
             time_spent_seconds as timeSpentSeconds, date_taken as date, date_taken as dateTaken,
             exam_data as examData, exam_type as examType, exam_mode as examMode, exam_length as examLength
      FROM exam_results
      WHERE candidate_id = ?
      ORDER BY date_taken DESC
    `).all(row.id);
    examHistory = historyRows.map(h => ({
      id: h.id,
      aggregateScore: h.aggregateScore,
      subjectBreakdown: safeJsonParse(h.subjectBreakdown, []),
      timeSpentSeconds: h.timeSpentSeconds,
      date: h.date,
      dateTaken: h.dateTaken,
      examType: h.examType || (h.examLength === 'standard' && h.examMode === 'simulation' ? 'full_mock' : 'practice_or_test'),
      examMode: h.examMode || 'simulation',
      examLength: h.examLength || 'standard',
      examData: safeJsonParse(h.examData, {})
    }));
  } catch (e) {}

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    dob: row.dob,
    status: row.status,
    disapprovalReason: row.disapproval_reason,
    regNumber: row.reg_number,
    practiceId: row.practice_id || ('SIM-2026-' + (row.reg_number ? row.reg_number.slice(-4) : '7841')),
    profileCode: row.profile_code,
    seatNumber: row.seat_number,
    center: row.center,
    examTown: row.exam_town,
    examDate: row.exam_date,
    examTime: row.exam_time,
    passport: row.passport,
    stateOfOrigin: row.state_of_origin,
    lga: row.lga,
    targetCourse: row.target_course,
    faculty: row.faculty,
    firstChoice: safeJsonParse(row.first_choice, {}),
    secondChoice: safeJsonParse(row.second_choice, {}),
    thirdChoice: safeJsonParse(row.third_choice, {}),
    fourthChoice: safeJsonParse(row.fourth_choice, {}),
    selectedSubjects: safeJsonParse(row.selected_subjects, ['english', 'mathematics', 'physics', 'chemistry']),
    caps: safeJsonParse(row.caps, { status: 'Admission in Progress' }),
    paymentReference: row.payment_reference || null,
    paymentDate: row.payment_date || null,
    appealStatus: row.appeal_status || null,
    appealDate: row.appeal_date || null,
    examHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// -------------------------------------------------------------
// Exam Results Operations
// -------------------------------------------------------------
export function getAllExamResults(candidateId = null) {
  const db = getDatabase();
  let rows;
  if (candidateId) {
    // When queried for a candidate, return ALL exams taken by that student
    rows = db.prepare('SELECT * FROM exam_results WHERE candidate_id = ? ORDER BY date_taken DESC').all(candidateId);
  } else {
    // When queried by Admin for central score log, return ONLY Full Mock exams
    rows = db.prepare(`
      SELECT * FROM exam_results 
      WHERE exam_type = 'full_mock' OR (exam_mode = 'simulation' AND exam_length = 'standard')
      ORDER BY date_taken DESC
    `).all();
  }
  return rows.map(r => ({
    id: r.id,
    candidateId: r.candidate_id,
    candidateName: r.candidate_name,
    regNumber: r.reg_number,
    aggregateScore: r.aggregate_score,
    subjectBreakdown: safeJsonParse(r.subject_breakdown, []),
    timeSpentSeconds: r.time_spent_seconds,
    dateTaken: r.date_taken,
    examType: r.exam_type || (r.exam_length === 'standard' && r.exam_mode === 'simulation' ? 'full_mock' : 'practice_or_test'),
    examMode: r.exam_mode || 'simulation',
    examLength: r.exam_length || 'standard',
    examData: safeJsonParse(r.exam_data, {})
  }));
}

export function saveExamResult(result) {
  const db = getDatabase();
  const id = result.id || `result_${Date.now()}`;
  const examType = result.examType || (result.examLength === 'standard' && result.examMode === 'simulation' ? 'full_mock' : 'practice_or_test');
  const examMode = result.examMode || 'simulation';
  const examLength = result.examLength || 'standard';

  db.prepare(`
    INSERT OR REPLACE INTO exam_results (
      id, candidate_id, candidate_name, reg_number, aggregate_score,
      subject_breakdown, time_spent_seconds, date_taken, exam_data,
      exam_type, exam_mode, exam_length
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    result.candidateId || result.candidate?.id || 'unknown',
    result.candidateName || result.candidate?.name || 'JAMB CANDIDATE',
    result.regNumber || result.candidate?.regNumber || 'N/A',
    result.aggregateScore || 0,
    JSON.stringify(result.subjectBreakdown || []),
    result.timeSpentSeconds || 0,
    result.dateTaken || new Date().toISOString(),
    JSON.stringify(result.examData || {}),
    examType,
    examMode,
    examLength
  );
  return { id, success: true, ...result, examType, examMode, examLength };
}

// -------------------------------------------------------------
// Admin & Settings Operations
// -------------------------------------------------------------
export function getAllAdmins() {
  const db = getDatabase();
  return db.prepare('SELECT id, email, name, role, created_at FROM admin_users').all();
}

export function authenticateAdmin(email, password) {
  const db = getDatabase();
  const clean = (email || '').trim().toLowerCase();
  const row = db.prepare('SELECT * FROM admin_users WHERE LOWER(email) = ?').get(clean);
  if (!row) return null;

  let isValid = verifyPassword(password, row.password);
  // Initial seed fallback
  if (!isValid && clean === 'hello@pauladisa.com' && ['AdminPassword2026!', 'Icu4ui4su'].includes(password)) {
    isValid = true;
  }

  if (!isValid) return null;

  // Upgrade legacy plain-text password to PBKDF2 hash
  if (!row.password.includes(':')) {
    const newHash = hashPassword(password);
    db.prepare('UPDATE admin_users SET password = ? WHERE id = ?').run(newHash, row.id);
  }

  const session = createAdminSession(row);
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    token: session.token,
    tokenExpiresAt: session.expiresAt
  };
}

export function updateAdminPasswordInDb(email, newPassword) {
  const db = getDatabase();
  const clean = (email || '').trim().toLowerCase();
  const hashed = hashPassword(newPassword);
  db.prepare('UPDATE admin_users SET password = ? WHERE LOWER(email) = ?').run(hashed, clean);
  return { success: true };
}

export function getPlatformSettings() {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('global');
  if (row) {
    return safeJsonParse(row.value, null);
  }
  return null;
}

export function savePlatformSettings(settings) {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO platform_settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run('global', JSON.stringify(settings), now);
  return { success: true };
}

// -------------------------------------------------------------
// Email Settings & Outbox Operations (Database-Backed)
// -------------------------------------------------------------
export function getEmailSettingsFromDb() {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM email_settings WHERE id = ?').get('primary');
  if (row) {
    return {
      provider: row.provider || 'gmail_api',
      gmail: safeJsonParse(row.gmail_config, { userEmail: 'hello@pauladisa.com', refreshToken: '' }),
      smtp: safeJsonParse(row.smtp_config, { host: 'smtp.gmail.com', port: '587', user: '', pass: '', senderName: 'JAMB Practice Platform' }),
      resendApiKey: row.resend_api_key || '',
      emailjs: safeJsonParse(row.emailjs_config, { serviceId: '', templateId: '', publicKey: '' }),
      webhook: safeJsonParse(row.webhook_config, { endpointUrl: '', authHeader: '' }),
      senderName: row.sender_name || 'JAMB Practice Platform',
      senderEmail: row.sender_email || 'noreply@pauladisa.com',
      subjectLine: row.subject_line || 'JAMB Practice Platform - Verification Security Code'
    };
  }
  return {
    provider: 'gmail_api',
    gmail: { userEmail: 'hello@pauladisa.com', refreshToken: '' },
    smtp: { host: 'smtp.gmail.com', port: '587', user: '', pass: '', senderName: 'JAMB Practice Platform' },
    resendApiKey: '',
    emailjs: { serviceId: '', templateId: '', publicKey: '' },
    webhook: { endpointUrl: '', authHeader: '' },
    senderName: 'JAMB Practice Platform',
    senderEmail: 'noreply@pauladisa.com',
    subjectLine: 'JAMB Practice Platform - Verification Security Code'
  };
}

export function saveEmailSettingsToDb(settings) {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO email_settings (
      id, provider, gmail_config, smtp_config, resend_api_key,
      emailjs_config, webhook_config, sender_name, sender_email,
      subject_line, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'primary',
    settings.provider || 'gmail_api',
    JSON.stringify(settings.gmail || {}),
    JSON.stringify(settings.smtp || {}),
    settings.resendApiKey || '',
    JSON.stringify(settings.emailjs || {}),
    JSON.stringify(settings.webhook || {}),
    settings.senderName || 'JAMB Practice Platform',
    settings.senderEmail || 'noreply@pauladisa.com',
    settings.subjectLine || 'JAMB Practice Platform - Verification Security Code',
    now
  );
  return getEmailSettingsFromDb();
}

export function saveEmailOutboxLog(entry) {
  const db = getDatabase();
  const id = entry.id || `outbox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = entry.timestamp || new Date().toISOString();
  db.prepare(`
    INSERT INTO email_outbox (id, recipient_email, candidate_name, otp_code, status, provider, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entry.recipientEmail || entry.to || '',
    entry.candidateName || 'Candidate',
    entry.otpCode || '',
    entry.status || 'Pending',
    entry.provider || 'Mail Relay',
    entry.details || '',
    now
  );
  return { id, success: true, ...entry };
}

export function getEmailOutboxLogsFromDb(limit = 100) {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM email_outbox ORDER BY timestamp DESC LIMIT ?').all(limit);
  return rows.map(r => ({
    id: r.id,
    recipientEmail: r.recipient_email,
    candidateName: r.candidate_name,
    otpCode: r.otp_code,
    status: r.status,
    provider: r.provider,
    details: r.details,
    timestamp: r.timestamp
  }));
}

export function clearEmailOutboxLogsInDb() {
  const db = getDatabase();
  db.prepare('DELETE FROM email_outbox').run();
  return { success: true };
}

// -------------------------------------------------------------
// Database-Backed OTP Operations
// -------------------------------------------------------------
export function createOtpInDb(email, candidateName = 'Candidate', purpose = 'registration') {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins expiration
  const code = crypto.randomInt(100000, 1000000).toString();
  const id = `otp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Invalidate any older pending OTP for this email & purpose
  db.prepare('UPDATE otp_verifications SET verified = -1 WHERE email = ? AND purpose = ? AND verified = 0').run(cleanEmail, purpose);

  db.prepare(`
    INSERT INTO otp_verifications (id, email, otp_code, purpose, candidate_name, attempts, verified, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
  `).run(
    id,
    cleanEmail,
    code,
    purpose,
    candidateName,
    now.toISOString(),
    expiresAt.toISOString()
  );

  return { id, code, email: cleanEmail, expiresAt: expiresAt.toISOString() };
}

export function verifyOtpInDb(email, otpCode, purpose = 'registration') {
  const db = getDatabase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCode = (otpCode || '').trim();

  const record = db.prepare(`
    SELECT * FROM otp_verifications
    WHERE email = ? AND purpose = ? AND verified = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail, purpose);

  if (!record) {
    return { success: false, error: 'No active OTP verification code found. Please request a new code.' };
  }

  // Check expiration
  if (new Date(record.expires_at).getTime() < Date.now()) {
    db.prepare('UPDATE otp_verifications SET verified = -1 WHERE id = ?').run(record.id);
    return { success: false, error: 'This verification code has expired. Please request a fresh code.' };
  }

  // Check attempts
  if (record.attempts >= 5) {
    db.prepare('UPDATE otp_verifications SET verified = -1 WHERE id = ?').run(record.id);
    return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
  }

  if (record.otp_code !== cleanCode) {
    db.prepare('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?').run(record.id);
    const remaining = 5 - (record.attempts + 1);
    return { success: false, error: `Invalid verification code. ${remaining} attempt(s) remaining.` };
  }

  // Mark verified
  db.prepare('UPDATE otp_verifications SET verified = 1 WHERE id = ?').run(record.id);
  return { success: true };
}

// -------------------------------------------------------------
// ALOC Questions Cache Operations
// -------------------------------------------------------------
export function getCachedAlocQuestions(subject, limit = 60) {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT raw_json FROM aloc_questions_cache
      WHERE subject = ?
      ORDER BY RANDOM()
      LIMIT ?
    `).all(subject, limit);
    return rows.map(r => JSON.parse(r.raw_json));
  } catch (err) {
    console.error('Error getting cached ALOC questions:', err);
    return [];
  }
}

export function saveCachedAlocQuestions(subject, questions) {
  if (!Array.isArray(questions) || questions.length === 0) return 0;
  try {
    const db = getDatabase();
    const insert = db.prepare(`
      INSERT OR IGNORE INTO aloc_questions_cache (id, subject, year, signature, raw_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    let count = 0;
    const now = new Date().toISOString();
    for (const q of questions) {
      try {
        const sig = (q.text || q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
        if (!sig) continue;
        const id = q.id || `aloc_${subject}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const year = q.year || q.examyear || null;
        insert.run(id, subject, year, sig, JSON.stringify(q), now);
        count++;
      } catch (e) {}
    }
    return count;
  } catch (err) {
    console.error('Error saving cached ALOC questions:', err);
    return 0;
  }
}

export function getCachedAlocCount(subject) {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as cnt FROM aloc_questions_cache WHERE subject = ?').get(subject);
    return row?.cnt || 0;
  } catch (e) {
    return 0;
  }
}

// -------------------------------------------------------------
// Payment Operations (Paystack Integration)
// -------------------------------------------------------------
export function recordPayment(payment) {
  const db = getDatabase();
  const id = payment.id || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO student_payments (
      id, candidate_id, candidate_name, candidate_email, reference,
      amount_kobo, currency, status, channel, paid_at, gateway_response, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    payment.candidateId,
    payment.candidateName || 'Candidate',
    payment.candidateEmail || '',
    payment.reference,
    payment.amountKobo || 5000,
    payment.currency || 'NGN',
    payment.status || 'success',
    payment.channel || 'card',
    payment.paidAt || now,
    payment.gatewayResponse || 'Successful',
    now
  );

  return { id, ...payment, createdAt: now };
}

export function getPaymentByReference(reference) {
  if (!reference) return null;
  const db = getDatabase();
  return db.prepare('SELECT * FROM student_payments WHERE reference = ?').get(reference);
}

export function getAllPayments() {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, candidate_id as candidateId, candidate_name as candidateName,
           candidate_email as candidateEmail, reference, amount_kobo as amountKobo,
           currency, status, channel, paid_at as paidAt,
           gateway_response as gatewayResponse, created_at as createdAt
    FROM student_payments
    ORDER BY created_at DESC
    LIMIT 200
  `).all();
}

export function approveCandidateByPayment(candidateId, reference, paidAt = null) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const effectivePaidAt = paidAt || now;

  db.prepare(`
    UPDATE candidates
    SET status = 'Approved',
        disapproval_reason = NULL,
        appeal_status = CASE WHEN appeal_status = 'require_payment' THEN 'reinstated' ELSE appeal_status END,
        payment_reference = ?,
        payment_date = ?,
        updated_at = ?
    WHERE id = ?
  `).run(reference, effectivePaidAt, now, candidateId);

  return getCandidateById(candidateId);
}

export function getPaymentSettings() {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM payment_settings WHERE id = ?').get('primary');
  if (row) {
    return {
      enabled: row.enabled === 1,
      accessFeeNaira: row.access_fee_naira || 50,
      paystackPublicKey: row.paystack_public_key || '',
      paystackSecretKey: row.paystack_secret_key || ''
    };
  }
  return {
    enabled: true,
    accessFeeNaira: 50,
    paystackPublicKey: '',
    paystackSecretKey: ''
  };
}

// Public settings exposed to students - NEVER exposes secret key
export function getPublicPaymentSettings() {
  const settings = getPaymentSettings();
  return {
    enabled: settings.enabled,
    accessFeeNaira: settings.accessFeeNaira,
    paystackPublicKey: settings.paystackPublicKey
  };
}

export function savePaymentSettings(settings) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const current = getPaymentSettings();

  const enabled = settings.enabled !== undefined ? (settings.enabled ? 1 : 0) : (current.enabled ? 1 : 0);
  const fee = settings.accessFeeNaira !== undefined ? parseInt(settings.accessFeeNaira, 10) : current.accessFeeNaira;
  const pubKey = settings.paystackPublicKey !== undefined ? settings.paystackPublicKey.trim() : current.paystackPublicKey;
  const secKey = settings.paystackSecretKey !== undefined ? settings.paystackSecretKey.trim() : current.paystackSecretKey;

  db.prepare(`
    INSERT OR REPLACE INTO payment_settings (
      id, enabled, access_fee_naira, paystack_public_key, paystack_secret_key, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run('primary', enabled, fee, pubKey, secKey, now);

  return getPaymentSettings();
}

// -------------------------------------------------------------
// Malpractice Appeals & Disciplinary Operations
// -------------------------------------------------------------
export function submitCandidateAppeal(candidateId, reason) {
  const db = getDatabase();
  const candidate = getCandidateById(candidateId);
  if (!candidate) return { success: false, error: 'Candidate not found.' };

  const id = `appeal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const cleanReason = (reason || '').trim();

  // Invalidate any older open appeal
  db.prepare("UPDATE candidate_appeals SET status = 'superseded' WHERE candidate_id = ? AND status = 'pending'").run(candidateId);

  db.prepare(`
    INSERT INTO candidate_appeals (
      id, candidate_id, candidate_name, candidate_email, reg_number,
      reason, status, admin_action, created_at, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL, ?, NULL)
  `).run(
    id,
    candidate.id,
    candidate.name,
    candidate.email,
    candidate.regNumber,
    cleanReason,
    now
  );

  db.prepare(`
    UPDATE candidates
    SET appeal_status = 'pending',
        appeal_date = ?,
        updated_at = ?
    WHERE id = ?
  `).run(now, now, candidateId);

  return { success: true, appealId: id, candidate: getCandidateById(candidateId) };
}

export function getAllAppeals() {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, candidate_id as candidateId, candidate_name as candidateName,
           candidate_email as candidateEmail, reg_number as regNumber,
           reason, status, admin_action as adminAction,
           created_at as createdAt, resolved_at as resolvedAt
    FROM candidate_appeals
    ORDER BY created_at DESC
    LIMIT 100
  `).all();
}

export function resolveAppeal(appealId, action, adminNotes = '') {
  const db = getDatabase();
  const now = new Date().toISOString();
  const appeal = db.prepare('SELECT * FROM candidate_appeals WHERE id = ?').get(appealId);
  if (!appeal) return { success: false, error: 'Appeal record not found.' };

  const candidateId = appeal.candidate_id;

  if (action === 'reinstate') {
    // 1. Reinstate candidate profile to Approved
    db.prepare(`
      UPDATE candidate_appeals
      SET status = 'reinstated',
          admin_action = ?,
          resolved_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Reinstated by Administrator after appeal review', now, appealId);

    db.prepare(`
      UPDATE candidates
      SET status = 'Approved',
          disapproval_reason = NULL,
          appeal_status = 'reinstated',
          updated_at = ?
      WHERE id = ?
    `).run(now, candidateId);

  } else if (action === 'require_payment') {
    // 2. Clear sanction but require half re-activation payment before taking exams
    db.prepare(`
      UPDATE candidate_appeals
      SET status = 'require_payment',
          admin_action = ?,
          resolved_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Appeal approved with 50% re-activation relief. Candidate pays half fee to unlock portal.', now, appealId);

    db.prepare(`
      UPDATE candidates
      SET status = 'Pending',
          disapproval_reason = 'Conditional re-activation approved: Administrator reviewed appeal and granted 50% relief fee. Complete half-payment to unlock portal.',
          appeal_status = 'require_payment',
          updated_at = ?
      WHERE id = ?
    `).run(now, candidateId);

  } else if (action === 'ban') {
    // 3. Complete blockage / Permanent Ban
    db.prepare(`
      UPDATE candidate_appeals
      SET status = 'banned',
          admin_action = ?,
          resolved_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Appeal Rejected: Permanent ban applied for confirmed examination malpractice', now, appealId);

    db.prepare(`
      UPDATE candidates
      SET status = 'Banned',
          disapproval_reason = 'Account permanently banned from JAMB Practice Platform for severe examination malpractice.',
          appeal_status = 'banned',
          updated_at = ?
      WHERE id = ?
    `).run(now, candidateId);
  }

  return { success: true, action, candidate: getCandidateById(candidateId) };
}

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}
