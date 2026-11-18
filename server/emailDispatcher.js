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
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">Independent CBT Simulator</div>
        <h2 style="margin: 5px 0 0; font-size: 18px; text-transform: uppercase;">Practice Portal Verification Code</h2>
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
          This verification code expires in 15 minutes. Use it to verify your email and complete your registration.
        </p>
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 11px; color: #888;">
        Independent UTME CBT Simulator • Not affiliated with the official Joint Admissions and Matriculation Board
      </div>
    </div>
  `;
}

export function buildWelcomeEmailHtml(candidate) {
  const subjectsList = Array.isArray(candidate.selectedSubjects)
    ? candidate.selectedSubjects.map(s => String(s).toUpperCase()).join(' • ')
    : 'ENGLISH • MATHEMATICS • PHYSICS • CHEMISTRY';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; padding: 24px; border: 1px solid #006633; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: #004d25; color: white; padding: 20px; text-align: center; border-radius: 8px; border-bottom: 4px solid #ffc107;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">Independent UTME CBT Simulator</div>
        <h2 style="margin: 6px 0 0; font-size: 20px; text-transform: uppercase;">Welcome to Your Practice Portal</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #a7f3d0;">Candidate Onboarding &amp; Profile Confirmation</p>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
          Dear <strong>${candidate.name || 'Candidate'}</strong>,
        </p>
        <p style="margin: 0 0 15px; font-size: 13px; color: #555; line-height: 1.5;">
          Your profile on the <strong>Independent UTME CBT Simulator</strong> has been successfully registered. You can now access your practice registration slip and institutional choices.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 15px 0;">
          <table style="width: 100%; font-size: 12px; color: #333; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #666;">Candidate Practice ID:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace; color: #006633;">${candidate.practiceId || 'SIM-2026-7841'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Registration Number:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace;">${candidate.regNumber}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Virtual Desk:</td>
              <td style="padding: 4px 0; font-weight: bold;">${candidate.seatNumber || 'Virtual Desk 14'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Target Programme:</td>
              <td style="padding: 4px 0; font-weight: bold;">${candidate.targetCourse || 'Degree Programme'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">1st Choice Institution:</td>
              <td style="padding: 4px 0;">${candidate.firstChoice?.institution || 'University of Ibadan'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">UTME Subjects:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #006633;">${subjectsList}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 12px; color: #92400e; line-height: 1.4;">
          <strong>Quick Login Tip:</strong> You can log into your portal anytime using your registered Email (<code>${candidate.email}</code>) or your Practice ID (<code>${candidate.practiceId || 'SIM-2026-7841'}</code>).
        </div>

        <p style="margin: 15px 0 0; font-size: 12px; color: #666; line-height: 1.4;">
          Your Registration Summary Slip and Study Choices are available immediately on your dashboard. Full 180-question mock exams can be activated whenever you are ready to simulate your test day.
        </p>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #888; line-height: 1.4;">
        Independent UTME CBT Simulator • Practice &amp; Study Resource<br/>
        This platform is an independent educational tool and is not affiliated with the Joint Admissions and Matriculation Board (JAMB).
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

export async function dispatchWelcomeEmail(candidate, env = {}) {
  const cleanTo = (candidate?.email || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Candidate email address is invalid.' };
  }

  const dbSettings = db.getEmailSettingsFromDb();
  const subject = `Welcome to Your CBT Practice Portal - ${candidate.practiceId || candidate.regNumber}`;
  const html = buildWelcomeEmailHtml(candidate);

  // Use the standard dispatch pipeline with custom HTML & subject
  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    env
  }).catch(err => {
    console.warn('Welcome email dispatch warning:', err.message);
    return { success: false, error: err.message };
  });
}
