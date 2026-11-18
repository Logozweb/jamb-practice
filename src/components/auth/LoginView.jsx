import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { ForgotPasswordModal } from '../modals/ForgotPasswordModal';
import { Lock, Mail, ShieldCheck, ArrowRight, Info, CheckCircle2, UserPlus } from 'lucide-react';

export const LoginView = () => {
  const { login, setPhase, setIsDisclaimerOpen } = useExam();
  const [emailOrReg, setEmailOrReg] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrReg || !password) {
      setError('Please provide your Email/Registration Number and Password.');
      return;
    }
    setError('');
    const result = await login(emailOrReg, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleResetSuccess = ({ email, password: newPass }) => {
    setEmailOrReg(email);
    setPassword(newPass);
    setResetSuccessNotice('Your password was reset successfully. Please click below to login.');
    setTimeout(() => setResetSuccessNotice(''), 6000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003b1d] via-[#006633] to-[#012e17] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-800 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="bg-[#004d25] p-6 text-center text-white relative border-b-4 border-amber-400">
          <div className="w-16 h-16 mx-auto rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-amber-400 shadow-md mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
            </svg>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
            Independent Practice &amp; Simulation Portal
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Candidate CBT Portal
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Candidate Sign In • Independent Study Platform
          </p>
        </div>

        {/* Top Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-center">
          <button
            type="button"
            className="flex-1 py-3 text-[#006633] border-b-2 border-[#006633] bg-white font-black"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setPhase('register')}
            className="flex-1 py-3 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="p-6 md:p-8">
          {resetSuccessNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{resetSuccessNotice}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email, Practice ID (SIM-...) or Reg Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={emailOrReg}
                  onChange={(e) => { setEmailOrReg(e.target.value); setError(''); }}
                  placeholder="e.g. SIM-2026-7841 or candidate@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Candidate Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-bold text-[#006633] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Login to Candidate Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sign Up Callout */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={() => setPhase('register')}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#006633] border-2 border-[#006633] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Independent CBT Practice Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDisclaimerOpen(true)}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1"
          >
            <Info className="w-3 h-3 text-amber-700" />
            <span>Disclaimer</span>
          </button>
        </div>
      </div>

      {/* Forgotten Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        role="candidate"
        onSuccess={handleResetSuccess}
      />

      {/* Footer Disclaimer Notice */}
      <div className="mt-4 text-center max-w-md">
        <button
          type="button"
          onClick={() => setIsDisclaimerOpen(true)}
          className="text-[11px] text-emerald-200 hover:text-amber-300 font-medium transition-colors underline decoration-dotted"
        >
          Notice: This platform is an independent CBT simulation and study tool. Not affiliated with JAMB. Read Full Disclaimer
        </button>
      </div>
    </div>
  );
};
