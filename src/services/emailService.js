/**
 * JAMB Practice Platform Central Email & OTP Gateway Service
 * Fully integrated with SQLite persistent database (/api/otp/*, /api/email-settings, /api/email-outbox)
 * Supports:
 * 1. Authenticated Google Gmail API (OAuth 2.0 with Client ID & Secret)
 * 2. Database-backed Node.js SMTP Relay (/api/send-email)
 * 3. Database-backed Resend REST API
 * 4. Database-backed OTP generation, expiration, and multi-attempt verification
 */

const STORAGE_KEY_SETTINGS = 'jamb_email_settings';
const STORAGE_KEY_OUTBOX = 'jamb_otp_outbox';

export const DEFAULT_EMAIL_SETTINGS = {
  provider: 'gmail_api',
  gmail: {
    userEmail: 'hello@pauladisa.com',
    refreshToken: ''
  },
  smtp: {
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    pass: '',
    senderName: 'JAMB Practice Platform'
  },
  resendApiKey: '',
  emailjs: {
    serviceId: '',
    templateId: '',
    publicKey: ''
  },
  webhook: {
    endpointUrl: '',
    authHeader: ''
  },
  senderName: 'JAMB Practice Platform',
  senderEmail: 'noreply@pauladisa.com',
  subjectLine: 'JAMB Practice Platform - Verification Security Code'
};

let cachedEmailSettings = null;

// Synchronous getter with cache
export const getEmailSettings = () => {
  if (cachedEmailSettings) return cachedEmailSettings;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      cachedEmailSettings = { ...DEFAULT_EMAIL_SETTINGS, ...JSON.parse(saved) };
      return cachedEmailSettings;
    }
  } catch (e) {}
  return DEFAULT_EMAIL_SETTINGS;
};

// Async getter from SQLite Database
export const fetchEmailSettings = async () => {
  try {
    const res = await fetch('/api/email-settings');
    if (res.ok) {
      const data = await res.json();
      cachedEmailSettings = { ...DEFAULT_EMAIL_SETTINGS, ...data };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(cachedEmailSettings));
      return cachedEmailSettings;
    }
  } catch (err) {
    console.warn('Could not fetch email settings from DB API, using cache:', err);
  }
  return getEmailSettings();
};

// Save to SQLite Database
export const saveEmailSettings = async (settings) => {
  cachedEmailSettings = { ...DEFAULT_EMAIL_SETTINGS, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(cachedEmailSettings));
    const res = await fetch('/api/email-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cachedEmailSettings)
    });
    if (res.ok) {
      return { success: true };
    }
  } catch (e) {
    console.warn('Failed saving email settings to DB:', e);
  }
  return { success: true };
};

// Outbox Logs from SQLite Database
export const fetchOtpOutboxLogs = async (limit = 100) => {
  try {
    const res = await fetch(`/api/email-outbox?limit=${limit}`);
    if (res.ok) {
      const logs = await res.json();
      localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(logs));
      return logs;
    }
  } catch (e) {
    console.warn('Failed fetching outbox from DB:', e);
  }
  return getOtpOutboxLogs();
};

export const getOtpOutboxLogs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OUTBOX);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const clearOutboxLogs = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY_OUTBOX);
    await fetch('/api/email-outbox', { method: 'DELETE' });
    return true;
  } catch (e) {
    return false;
  }
};

// -------------------------------------------------------------
// Google Gmail API OAuth Helpers
// -------------------------------------------------------------
export const getGoogleAuthStatus = async () => {
  try {
    const res = await fetch('/api/auth/google/status');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching Google auth status', e);
  }
  return { configured: false, connected: false };
};

export const getGoogleAuthUrl = async () => {
  try {
    const res = await fetch('/api/auth/google/url');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching Google auth url', e);
  }
  return null;
};

export const saveGoogleManualToken = async (refreshToken, userEmail) => {
  try {
    const res = await fetch('/api/auth/google/manual-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, userEmail })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const disconnectGoogleAuth = async () => {
  try {
    const res = await fetch('/api/auth/google/disconnect', { method: 'POST' });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// -------------------------------------------------------------
// Database-Backed OTP Operations
// -------------------------------------------------------------

/**
 * Request server to generate, store in SQLite, and dispatch OTP to candidate's email
 */
export const requestVerificationOtp = async ({ email, candidateName, purpose = 'registration' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (candidateName || 'Candidate').trim();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      error: 'Please enter a valid email address.'
    };
  }

  try {
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        candidateName: cleanName,
        purpose
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        email: data.email,
        expiresAt: data.expiresAt,
        delivered: data.delivered,
        provider: data.provider,
        notConfigured: data.notConfigured,
        devOtpCode: data.devOtpCode,
        message: data.message
      };
    }

    return {
      success: false,
      error: data.error || 'Failed to dispatch verification OTP. Please try again.'
    };
  } catch (err) {
    return {
      success: false,
      error: 'Network error connecting to the verification server. Please check your connection.'
    };
  }
};

/**
 * Verify OTP code against SQLite database records
 */
export const verifyOtpCode = async ({ email, otpCode, purpose = 'registration' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCode = (otpCode || '').trim();

  if (!cleanEmail || !cleanCode) {
    return {
      success: false,
      error: 'Email and 6-digit OTP code are required.'
    };
  }

  try {
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        otpCode: cleanCode,
        purpose
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return {
      success: false,
      error: data.error || 'Invalid or expired verification code.'
    };
  } catch (err) {
    return {
      success: false,
      error: 'Network connection error while verifying code.'
    };
  }
};

/**
 * Backwards compatibility wrapper for components calling sendVerificationOtp
 */
export const sendVerificationOtp = async ({ email, candidateName, purpose = 'registration' }) => {
  return await requestVerificationOtp({ email, candidateName, purpose });
};

/**
 * Send test email from Admin Console
 */
export const sendTestEmail = async (testEmail) => {
  return await requestVerificationOtp({
    email: testEmail,
    candidateName: 'JAMB Administrator',
    purpose: 'admin_test'
  });
};
