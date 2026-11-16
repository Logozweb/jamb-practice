import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import * as db from './database.js';

const TOKEN_FILE = path.resolve(process.cwd(), '.gmail-token.json');

export function getSavedGmailToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed reading token file', e);
  }
  return null;
}

export function saveGmailToken(tokenData) {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed saving token file', e);
  }
}

export function clearGmailToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
  } catch (e) {
    console.error('Failed clearing token file', e);
  }
}

export function buildEmailHtml(candidateName, otpCode) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #006633; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: #004d25; color: white; padding: 18px; text-align: center; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">JAMB Practice Platform</div>
        <h2 style="margin: 5px 0 0; font-size: 18px; text-transform: uppercase;">CBT Practice &amp; Examination Simulation</h2>
      </div>
      <div style="padding: 20px 0; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0; padding: 15px;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
          Dear <strong>${candidateName || 'Candidate'}</strong>,
        </p>
        <p style="margin: 0 0 15px; font-size: 14px; color: #555;">
          Your 6-digit security verification OTP code is:
        </p>
        <div style="background: #e8f5e9; border: 2px dashed #006633; border-radius: 8px; padding: 15px; text-align: center; margin: 15px 0;">
          <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #006633;">
            ${otpCode}
          </span>
        </div>
        <p style="margin: 10px 0 0; font-size: 12px; color: #777;">
          This OTP expires in 15 minutes. If you did not request this verification, please disregard this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 11px; color: #888;">
        JAMB Practice Platform • Independent Examination Preparation System
      </div>
    </div>
  `;
}

export async function dispatchEmail({
  to,
  candidateName = 'Candidate',
  otpCode = '',
  subject,
  smtpConfig,
  resendApiKey,
  env = {}
}) {
  const cleanTo = (to || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Recipient email address is invalid.' };
  }

  // Load database email settings as fallback if client didn't supply them
  const dbSettings = db.getEmailSettingsFromDb();
  const effectiveSmtp = (smtpConfig && smtpConfig.user && smtpConfig.pass) ? smtpConfig : dbSettings.smtp;
  const effectiveResendKey = resendApiKey || dbSettings.resendApiKey || env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const effectiveSenderName = dbSettings.senderName || 'JAMB Practice Platform';

  const mailSubject = subject || dbSettings.subjectLine || 'JAMB Practice Platform - Verification Security Code';
  const html = buildEmailHtml(candidateName, otpCode);

  const googleClientId =
    env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '';
  const googleClientSecret =
    env.GOOGLE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    '';

  // 1. Check Google Gmail API
  const gmailToken = getSavedGmailToken();
  if (gmailToken?.refresh_token) {
    try {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          refresh_token: gmailToken.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      const tokenData = await refreshRes.json();
      if (!refreshRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to refresh Gmail OAuth token.');
      }

      const sender = gmailToken.userEmail || 'hello@pauladisa.com';
      const emailLines = [
        `From: "${effectiveSenderName}" <${sender}>`,
        `To: ${cleanTo}`,
        `Subject: =?utf-8?B?${Buffer.from(mailSubject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html
      ];
      const raw = Buffer.from(emailLines.join('\r\n'))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        throw new Error(sendData.error?.message || 'Gmail API send error');
      }

      db.saveEmailOutboxLog({
        recipientEmail: cleanTo,
        candidateName,
        otpCode,
        status: 'Delivered',
        provider: 'Google Gmail API',
        details: `Dispatched via Gmail API ID: ${sendData.id} (Sender: ${sender})`
      });

      return {
        success: true,
        provider: 'Google Gmail API',
        sender,
        id: sendData.id
      };
    } catch (err) {
      console.warn('Gmail API delivery failed, trying fallbacks:', err.message);
    }
  }

  // 2. Check Resend API
  if (effectiveResendKey && effectiveResendKey.trim()) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveResendKey.trim()}`
        },
        body: JSON.stringify({
          from: effectiveSmtp?.senderEmail
            ? `${effectiveSenderName} <${effectiveSmtp.senderEmail}>`
            : `${effectiveSenderName} <onboarding@resend.dev>`,
          to: [cleanTo],
          subject: mailSubject,
          html
        })
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        db.saveEmailOutboxLog({
          recipientEmail: cleanTo,
          candidateName,
          otpCode,
          status: 'Delivered',
          provider: 'Resend',
          details: `Dispatched via Resend ID: ${resendData.id}`
        });

        return {
          success: true,
          provider: 'Resend',
          id: resendData.id
        };
      } else {
        console.warn('Resend API rejected dispatch:', resendData);
      }
    } catch (err) {
      console.warn('Resend API error:', err.message);
    }
  }

  // 3. Check Direct SMTP
  const host = effectiveSmtp?.host || env.SMTP_HOST || process.env.SMTP_HOST;
  const port = parseInt(effectiveSmtp?.port || env.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  const user = effectiveSmtp?.user || env.SMTP_USER || process.env.SMTP_USER;
  const pass = effectiveSmtp?.pass || env.SMTP_PASS || process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from: `"${effectiveSenderName}" <${user}>`,
        to: cleanTo,
        subject: mailSubject,
        html
      });

      db.saveEmailOutboxLog({
        recipientEmail: cleanTo,
        candidateName,
        otpCode,
        status: 'Delivered',
        provider: 'SMTP',
        details: `Dispatched via SMTP: ${info.messageId}`
      });

      return {
        success: true,
        provider: 'SMTP',
        messageId: info.messageId
      };
    } catch (err) {
      console.warn('SMTP error:', err.message);
      db.saveEmailOutboxLog({
        recipientEmail: cleanTo,
        candidateName,
        otpCode,
        status: 'Provider Error',
        provider: 'SMTP',
        details: err.message
      });
      return { success: false, provider: 'SMTP', error: err.message };
    }
  }

  // 4. No gateway credentials configured yet
  db.saveEmailOutboxLog({
    recipientEmail: cleanTo,
    candidateName,
    otpCode,
    status: 'Pending Setup (Saved in Database Outbox)',
    provider: 'JAMB Central Mail Relay',
    details: 'No active Google Gmail API token, Resend API key, or SMTP credentials configured in database.'
  });

  return {
    success: false,
    notConfigured: true,
    otpCode,
    error: 'No active Google Gmail API, SMTP credentials, or Resend API key configured in database.'
  };
}
