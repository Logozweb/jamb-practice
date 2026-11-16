import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { requestVerificationOtp, verifyOtpCode } from '../../services/emailService';
import {
  Key,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const ForgotPasswordModal = ({ isOpen, onClose, role = 'candidate', onSuccess }) => {
  const {
    findCandidateForReset,
    resetCandidatePasswordWithOtp,
    findAdminForReset,
    resetAdminPasswordWithOtp
  } = useExam();

  const [step, setStep] = useState(1); // 1: Email Request, 2: OTP Verification, 3: New Password, 4: Success
  const [emailOrReg, setEmailOrReg] = useState(role === 'admin' ? 'hello@pauladisa.com' : '');
  const [targetAccount, setTargetAccount] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendNotice, setResendNotice] = useState(false);
  const [isGatewayConnected, setIsGatewayConnected] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState('');

  if (!isOpen) return null;

  const isAdminRole = role === 'admin';
  const themePrimary = isAdminRole ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#006633] hover:bg-[#00552b]';
  const themeText = isAdminRole ? 'text-slate-900' : 'text-[#006633]';
  const themeBorder = isAdminRole ? 'border-slate-800' : 'border-[#006633]';

  // STEP 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    const input = emailOrReg.trim();
    if (!input) {
      setError(isAdminRole ? 'Please enter your administrator email.' : 'Please enter your registered email address or Registration Number.');
      return;
    }

    let account = null;
    if (isAdminRole) {
      account = findAdminForReset(input);
      if (!account) {
        setError('No administrator account found with this email address.');
        return;
      }
    } else {
      account = findCandidateForReset(input);
      if (!account) {
        setError('No candidate account found matching this email or registration number.');
        return;
      }
    }

    setTargetAccount(account);
    setIsSending(true);

    try {
      const recipientEmail = account.email;
      const recipientName = account.name || (isAdminRole ? 'Administrator' : 'JAMB Candidate');

      const res = await requestVerificationOtp({
        email: recipientEmail,
        candidateName: recipientName,
        purpose: 'password_reset'
      });

      setIsSending(false);
      if (res.success) {
        setIsGatewayConnected(!res.notConfigured);
        setDeliveryProvider(res.provider || 'JAMB Central Mail Relay');
        if (res.devOtpCode) {
          setGeneratedOtp(res.devOtpCode);
        }
        setStep(2);
      } else {
        setError(res.error || 'Failed to dispatch verification email. Please try again.');
      }
    } catch (err) {
      setIsSending(false);
      setIsGatewayConnected(false);
      setError('Network communication error while dispatching email OTP. Please check your internet connection.');
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!enteredOtp.trim()) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    setIsSending(true);
    const verifyRes = await verifyOtpCode({
      email: targetAccount.email,
      otpCode: enteredOtp.trim(),
      purpose: 'password_reset'
    });
    setIsSending(false);

    if (!verifyRes.success) {
      setError(verifyRes.error || 'Invalid verification code. Please check the 6 digits in your email inbox.');
      return;
    }

    setStep(3);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!targetAccount) return;
    setError('');
    setIsSending(true);
    setResendNotice(true);

    try {
      const res = await requestVerificationOtp({
        email: targetAccount.email,
        candidateName: targetAccount.name || 'User',
        purpose: 'password_reset'
      });
      setIsSending(false);
      if (res.success) {
        setIsGatewayConnected(!res.notConfigured);
        setDeliveryProvider(res.provider || 'JAMB Central Mail Relay');
        if (res.devOtpCode) {
          setGeneratedOtp(res.devOtpCode);
        }
      } else if (res.notConfigured) {
        setIsGatewayConnected(false);
      } else {
        setError(res.error || 'Failed to resend code');
      }
      setTimeout(() => setResendNotice(false), 5000);
    } catch (err) {
      setIsSending(false);
      setError('Failed to resend code: ' + err.message);
    }
  };

  // STEP 3: Set New Password
  const handleSetNewPassword = (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-enter carefully.');
      return;
    }

    if (isAdminRole) {
      const res = resetAdminPasswordWithOtp(targetAccount.email, newPassword);
      if (!res.success) {
        setError(res.error);
        return;
      }
    } else {
      const res = resetCandidatePasswordWithOtp(targetAccount.email, newPassword);
      if (!res.success) {
        setError(res.error);
        return;
      }
    }

    setStep(4);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({ email: targetAccount.email, password: newPassword });
      }
      handleClose();
    }, 2200);
  };

  const handleClose = () => {
    setStep(1);
    setEmailOrReg(role === 'admin' ? 'hello@pauladisa.com' : '');
    setTargetAccount(null);
    setGeneratedOtp('');
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-300 flex flex-col">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between border-b-4 border-amber-400 ${
          isAdminRole ? 'bg-slate-900' : 'bg-[#004d25]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight">
                {isAdminRole ? 'Admin Password Recovery' : 'Candidate Password Reset'}
              </h2>
              <p className="text-[11px] text-emerald-200">
                Secure Email OTP Verification & Credential Reset
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email / Reg Number */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-600">
                  {isAdminRole
                    ? 'Enter your registered administrator email to receive a secure 6-digit password reset OTP.'
                    : 'Enter your registered email address or JAMB Registration Number. We will dispatch a 6-digit verification code to your email.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isAdminRole ? 'Administrator Email' : 'Email Address or Registration No.'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={isAdminRole ? 'email' : 'text'}
                    value={emailOrReg}
                    onChange={(e) => { setEmailOrReg(e.target.value); setError(''); }}
                    placeholder={isAdminRole ? 'hello@pauladisa.com' : 'e.g. candidate@example.com or 2026...'}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2 ${themePrimary} disabled:opacity-50`}
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching OTP to Mailbox...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSending}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Didn't receive code or need to retry? Resend OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit Email OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#006633]" />
                  <span className="text-xs font-bold uppercase text-[#006633]">
                    Verification Code Dispatched to Mailbox
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  A 6-digit verification code has been dispatched to:
                </p>
                <div className="font-mono font-bold text-xs bg-white p-2 rounded border border-emerald-200 text-slate-900">
                  {targetAccount?.email}
                </div>
                <p className="text-[11px] text-slate-500">
                  Please inspect your inbox (and Spam/Junk folder). Enter the 6-digit code below to set your new password.
                </p>
              </div>

              {resendNotice && (
                <div className="p-2.5 bg-blue-50 border border-blue-300 rounded-lg text-blue-900 text-xs font-semibold text-center">
                  ✓ A new verification code has been dispatched to your email!
                </div>
              )}

              <div className="text-center space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit Email Code
                </label>
                <div className="pt-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full py-2.5 text-center text-2xl font-mono font-black tracking-[0.4em] rounded-xl border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2 ${themePrimary}`}
              >
                <span>Verify Code & Continue</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSending}
                  className="font-bold text-[#006633] hover:underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleSetNewPassword} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800">
                  Verification Confirmed
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Set a new, secure password for <strong>{targetAccount?.email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="At least 6 characters"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2 ${themePrimary}`}
              >
                <span>Save New Password & Complete</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success Message */}
          {step === 4 && (
            <div className="py-6 text-center space-y-3 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006633] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your new password has been securely updated. You can now log into your account with your new credentials.
              </p>
              <div className="text-[11px] font-bold text-slate-400 pt-2">
                Redirecting to login...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
