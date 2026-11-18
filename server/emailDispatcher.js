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

export function buildPaymentReceiptEmailHtml({ candidate, amountNaira = 50, reference, paymentDate, isReactivation = false }) {
  const formattedDate = paymentDate ? new Date(paymentDate).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) : new Date().toLocaleString('en-NG');
  const itemName = isReactivation ? 'CBT Practice Re-Activation License (50% Relief Concession)' : 'Full CBT Simulation Access License';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; padding: 24px; border: 1px solid #006633; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: #004d25; color: white; padding: 20px; text-align: center; border-radius: 8px; border-bottom: 4px solid #ffc107;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">Independent UTME CBT Simulator</div>
        <h2 style="margin: 6px 0 0; font-size: 20px; text-transform: uppercase;">Payment Receipt &amp; License Confirmation</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #a7f3d0;">Official Practice License Key Activated</p>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 11px; color: #666; text-transform: uppercase;">Receipt Status:</span><br/>
            <strong style="color: #006633; font-size: 13px;">✓ PAYMENT VERIFIED &amp; UNLOCKED</strong>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #666; text-transform: uppercase;">Amount Paid:</span><br/>
            <strong style="color: #006633; font-size: 18px;">₦${amountNaira}.00</strong>
          </div>
        </div>

        <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
          Dear <strong>${candidate.name || 'Candidate'}</strong>,
        </p>
        <p style="margin: 0 0 15px; font-size: 13px; color: #555; line-height: 1.5;">
          Thank you for activating your examination practice license. Your transaction was verified successfully via Paystack and your candidate profile now has full, unrestricted access to all mock tests and scoring analytics.
        </p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 15px 0;">
          <table style="width: 100%; font-size: 12px; color: #333; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #64748b;">License Item:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #0f172a;">${itemName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Candidate Practice ID:</td>
              <td style="padding: 5px 0; font-weight: bold; font-family: monospace; color: #006633;">${candidate.practiceId || 'SIM-2026-7841'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Registration Number:</td>
              <td style="padding: 5px 0; font-weight: bold; font-family: monospace;">${candidate.regNumber}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Paystack Reference:</td>
              <td style="padding: 5px 0; font-family: monospace; font-size: 11px; color: #334155;">${reference}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Transaction Date:</td>
              <td style="padding: 5px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Payment Method:</td>
              <td style="padding: 5px 0; font-weight: bold;">Secured Paystack Checkout</td>
            </tr>
          </table>
        </div>

        <div style="margin: 15px 0; padding: 12px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
          <strong style="color: #166534; font-size: 12px; display: block; margin-bottom: 6px;">Services Unlocked on Your Portal:</strong>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #15803d; line-height: 1.6;">
            <li>Unlimited Full 180-Question Timed Mock CBT Simulations</li>
            <li>Subject Drills &amp; Step-by-Step Question Solutions</li>
            <li>Central Administrative Score Diagnostics &amp; Rank Reporting</li>
            <li>Simulated Central Admission Processing System (CAPS)</li>
          </ul>
        </div>

        <p style="margin: 15px 0 0; font-size: 12px; color: #666; line-height: 1.4;">
          You can log in to your dashboard anytime using your registered email or Practice ID. Please retain this email for your administrative records.
        </p>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #888; line-height: 1.4;">
        Independent UTME CBT Simulator • Transaction &amp; License Record<br/>
        This platform is an independent study tool and is not affiliated with the Joint Admissions and Matriculation Board (JAMB).
      </div>
    </div>
  `;
}

export async function dispatchEmail({
  to,
  candidateName = 'Candidate',
  otpCode = '',
  subject,
  html: customHtml,
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
  const effectiveSenderName = dbSettings.senderName || 'CBT Simulation Platform';

  const mailSubject = subject || dbSettings.subjectLine || 'CBT Simulation Platform - Verification Security Code';
  const html = customHtml || buildEmailHtml(candidateName, otpCode);
  const outboxCode = otpCode || (customHtml ? 'SYSTEM' : 'N/A');

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
        otpCode: outboxCode,
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
          otpCode: outboxCode,
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
        otpCode: outboxCode,
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
        otpCode: outboxCode,
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
    otpCode: outboxCode,
    status: 'Pending Setup (Saved in Database Outbox)',
    provider: 'CBT Central Mail Relay',
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

  const subject = `Welcome to Your CBT Practice Portal - ${candidate.practiceId || candidate.regNumber}`;
  const html = buildWelcomeEmailHtml(candidate);

  // Use the standard dispatch pipeline with custom HTML & subject
  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    html,
    env
  }).catch(err => {
    console.warn('Welcome email dispatch warning:', err.message);
    return { success: false, error: err.message };
  });
}

export async function dispatchPaymentReceiptEmail({ candidate, amountNaira = 50, reference, paymentDate, isReactivation = false, env = {} }) {
  const cleanTo = (candidate?.email || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Candidate email address is invalid.' };
  }

  const subject = `Payment Receipt: CBT Simulation Access License - ₦${amountNaira}.00 (${reference})`;
  const html = buildPaymentReceiptEmailHtml({ candidate, amountNaira, reference, paymentDate, isReactivation });

  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    html,
    env
  }).catch(err => {
    console.warn('Payment receipt email dispatch note:', err.message);
    return { success: false, error: err.message };
  });
}

export function buildAppealDecisionEmailHtml({ candidate, action, notes }) {
  const isReinstated = action === 'reinstate';
  const isRequirePayment = action === 'require_payment';

  const headerColor = isReinstated ? '#006633' : isRequirePayment ? '#d97706' : '#991b1b';
  const badgeColor = isReinstated ? '#dcfce7' : isRequirePayment ? '#fef3c7' : '#fee2e2';
  const badgeTextColor = isReinstated ? '#166534' : isRequirePayment ? '#92400e' : '#991b1b';
  const badgeText = isReinstated
    ? 'APPEAL APPROVED • FULL ACCESS RESTORED'
    : isRequirePayment
    ? 'CONDITIONAL RELIEF • 50% RE-ACTIVATION CONCESSION'
    : 'APPEAL REJECTED • PERMANENT PLATFORM RESTRICTION';

  const statusLabel = isReinstated
    ? 'Reinstated (Full Access Restored)'
    : isRequirePayment
    ? 'Approved with Concession (₦25.00 Fee Required)'
    : 'Permanently Restricted (Banned)';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; padding: 24px; border: 1px solid ${headerColor}; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: ${headerColor}; color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">Independent UTME CBT Simulator</div>
        <h2 style="margin: 6px 0 0; font-size: 18px; text-transform: uppercase;">Disciplinary Review Determination</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #e5e7eb;">Candidate Simulation Integrity Board</p>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0;">
        <div style="display: inline-block; background-color: ${badgeColor}; color: ${badgeTextColor}; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; margin-bottom: 15px; letter-spacing: 0.5px;">
          ${badgeText}
        </div>

        <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
          Dear <strong>${candidate.name || 'Candidate'}</strong>,
        </p>

        <p style="margin: 0 0 15px; font-size: 13px; color: #555; line-height: 1.5;">
          ${isReinstated ? (
            'The Disciplinary Review Board has examined your appeal regarding the recent navigation and full-screen compliance infractions recorded during your CBT simulation. Your explanation has been accepted, and your candidate profile has been <strong>fully reinstated with immediate effect</strong> at no charge.'
          ) : isRequirePayment ? (
            'The Disciplinary Review Board has reviewed your explanation. While the navigation infractions were confirmed, you have been granted a <strong>50% Concession Relief</strong> as a first-time dispensation. You may reactivate your candidate portal by paying a reduced re-activation fee of <strong>₦25.00</strong> (regular access fee: ₦50.00).'
          ) : (
            'The Disciplinary Review Board has reviewed your appeal and confirmed deliberate and repeated non-compliance with examination environment protocols. Consequently, your candidate profile has been <strong>permanently restricted</strong> from accessing full mock CBT simulations.'
          )}
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 15px 0;">
          <table style="width: 100%; font-size: 12px; color: #333; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #666;">Candidate Practice ID:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace;">${candidate.practiceId || 'SIM-2026-7841'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Registration Number:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace;">${candidate.regNumber}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Determination:</td>
              <td style="padding: 4px 0; font-weight: bold; color: ${headerColor};">${statusLabel}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 6px 0 2px 0; color: #666; vertical-align: top;">Reviewer Notes:</td>
              <td style="padding: 6px 0 2px 0; font-style: italic; color: #475569;">"${notes}"</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin: 15px 0; padding: 12px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <strong style="color: #334155; font-size: 12px; display: block; margin-bottom: 4px;">Next Action Required:</strong>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
            ${isReinstated ? (
              'Log in to your candidate dashboard using your Practice ID or email to immediately resume practice and full-length timed CBT simulation tests.'
            ) : isRequirePayment ? (
              'Log in to your candidate dashboard and follow the prompt to complete the concession payment of <strong>₦25.00</strong> to instantly restore your full simulation privileges.'
            ) : (
              'No further action is available for this profile. For general inquiries, you may reach out to support at hello@pauladisa.com.'
            )}
          </p>
        </div>

        <p style="margin: 15px 0 0; font-size: 11px; color: #64748b; line-height: 1.4;">
          Remember to always maintain uninterrupted full-screen operation during CBT simulations to mirror official examination hall standards.
        </p>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #888; line-height: 1.4;">
        Independent UTME CBT Simulator • Disciplinary Review Division<br/>
        This platform is an independent educational tool and is not affiliated with the Joint Admissions and Matriculation Board (JAMB).
      </div>
    </div>
  `;
}

export async function dispatchAppealDecisionEmail({ candidate, action, notes = '', env = {} }) {
  const cleanTo = (candidate?.email || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Candidate email address is invalid.' };
  }

  const subjectMap = {
    reinstate: `Appeal Reinstatement Notice: Full Access Restored - ${candidate.practiceId || candidate.regNumber}`,
    require_payment: `Appeal Decision Notice: 50% Concession Relief Granted (₦25.00) - ${candidate.practiceId || candidate.regNumber}`,
    ban: `Appeal Review Determination: Access Restricted - ${candidate.practiceId || candidate.regNumber}`
  };

  const subject = subjectMap[action] || `Disciplinary Appeal Determination - ${candidate.practiceId || candidate.regNumber}`;
  const html = buildAppealDecisionEmailHtml({ candidate, action, notes });

  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    html,
    env
  }).catch(err => {
    console.warn('Appeal decision email dispatch note:', err.message);
    return { success: false, error: err.message };
  });
}

export function buildTicketAckEmailHtml({ candidate, ticket }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; padding: 24px; border: 1px solid #0284c7; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: #0369a1; color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #bae6fd;">Independent UTME CBT Simulator</div>
        <h2 style="margin: 6px 0 0; font-size: 18px; text-transform: uppercase;">Support Request Acknowledged</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #e0f2fe;">Candidate Help Desk &amp; Technical Support</p>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0;">
        <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; margin-bottom: 15px; letter-spacing: 0.5px;">
          TICKET ID: ${ticket.id} • STATUS: OPEN
        </div>

        <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
          Dear <strong>${candidate.name || 'Candidate'}</strong>,
        </p>

        <p style="margin: 0 0 15px; font-size: 13px; color: #555; line-height: 1.5;">
          We have received your support inquiry regarding <strong>"${ticket.subject}"</strong>. A support officer is reviewing your submission and will provide a resolution shortly.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 15px 0;">
          <table style="width: 100%; font-size: 12px; color: #333; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #666;">Tracking Ticket:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace; color: #0369a1;">${ticket.id}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Practice ID:</td>
              <td style="padding: 4px 0; font-weight: bold; font-family: monospace;">${candidate.practiceId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Category:</td>
              <td style="padding: 4px 0; font-weight: bold; text-transform: uppercase;">${ticket.category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0 2px 0; color: #666; vertical-align: top;">Submitted Message:</td>
              <td style="padding: 6px 0 2px 0; font-style: italic; color: #475569;">"${ticket.message}"</td>
            </tr>
          </table>
        </div>

        <div style="margin: 15px 0; padding: 12px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
          <strong style="color: #0369a1; font-size: 12px; display: block; margin-bottom: 4px;">Desk Response Commitment:</strong>
          <p style="margin: 0; font-size: 12px; color: #0c4a6e; line-height: 1.5;">
            Our support desk operates Monday through Saturday, 8:00 AM – 8:00 PM. Typical resolution is provided within 15–30 minutes during active hours.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #888; line-height: 1.4;">
        Independent UTME CBT Simulator • Candidate Support Service<br/>
        This platform is an independent educational tool and is not affiliated with the Joint Admissions and Matriculation Board (JAMB).
      </div>
    </div>
  `;
}

export async function dispatchTicketAckEmail({ candidate, ticket, env = {} }) {
  const cleanTo = (candidate?.email || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Candidate email address is invalid.' };
  }

  const subject = `Support Request Acknowledged: ${ticket.id} - ${ticket.subject}`;
  const html = buildTicketAckEmailHtml({ candidate, ticket });

  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    html,
    env
  }).catch(err => {
    console.warn('Ticket ack email dispatch note:', err.message);
    return { success: false, error: err.message };
  });
}

export function buildTicketReplyEmailHtml({ candidate, ticket, reply }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; padding: 24px; border: 1px solid #006633; border-radius: 12px; margin: auto; background-color: #fafafa;">
      <div style="background: #004d25; color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #ffc107;">Independent UTME CBT Simulator</div>
        <h2 style="margin: 6px 0 0; font-size: 18px; text-transform: uppercase;">Support Resolution Notice</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #a7f3d0;">Administrator Official Response</p>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 8px; margin-top: 15px; border: 1px solid #e0e0e0;">
        <div style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; margin-bottom: 15px; letter-spacing: 0.5px;">
          TICKET ID: ${ticket.id} • RESOLUTION DISPATCHED
        </div>

        <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
          Dear <strong>${candidate.name || 'Candidate'}</strong>,
        </p>

        <p style="margin: 0 0 15px; font-size: 13px; color: #555; line-height: 1.5;">
          An administrator has reviewed your inquiry (<strong>"${ticket.subject}"</strong>) and provided the official resolution below:
        </p>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 16px; margin: 15px 0;">
          <strong style="color: #166534; font-size: 12px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Official Administrator Response:</strong>
          <div style="font-size: 13px; color: #14532d; line-height: 1.6; white-space: pre-wrap;">
${reply}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 12px; color: #64748b;">
          <div><strong>Ticket ID:</strong> ${ticket.id}</div>
          <div style="margin-top: 4px;"><strong>Your Original Inquiry:</strong> "${ticket.message}"</div>
        </div>

        <p style="margin: 15px 0 0; font-size: 12px; color: #555; line-height: 1.5;">
          You can also review this resolution and all ongoing correspondence anytime by logging into your candidate dashboard and selecting the <strong>Help Desk</strong> tab.
        </p>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #888; line-height: 1.4;">
        Independent UTME CBT Simulator • Candidate Support Service<br/>
        This platform is an independent educational tool and is not affiliated with the Joint Admissions and Matriculation Board (JAMB).
      </div>
    </div>
  `;
}

export async function dispatchTicketReplyEmail({ candidate, ticket, reply, env = {} }) {
  const cleanTo = (candidate?.email || '').trim().toLowerCase();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { success: false, error: 'Candidate email address is invalid.' };
  }

  const subject = `Support Resolution: ${ticket.id} - ${ticket.subject}`;
  const html = buildTicketReplyEmailHtml({ candidate, ticket, reply });

  return dispatchEmail({
    to: cleanTo,
    candidateName: candidate.name,
    subject,
    html,
    env
  }).catch(err => {
    console.warn('Ticket reply email dispatch note:', err.message);
    return { success: false, error: err.message };
  });
}
