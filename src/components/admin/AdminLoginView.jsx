import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { ForgotPasswordModal } from '../modals/ForgotPasswordModal';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

export const AdminLoginView = () => {
  const { adminLogin, setPhase, setIsDisclaimerOpen } = useExam();
  const [email, setEmail] = useState('hello@pauladisa.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your Administrator Email and Password.');
      return;
    }
    setError('');
    const res = await adminLogin(email, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleResetSuccess = ({ email: resetEmail, password: newPass }) => {
    setEmail(resetEmail);
    setPassword(newPass);
    setResetSuccessNotice('Administrator password updated successfully! Click below to enter.');
    setTimeout(() => setResetSuccessNotice(''), 6000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center text-white relative border-b-4 border-amber-400">
          <div className="w-14 h-14 mx-auto rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
            </svg>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
            Joint Admissions and Matriculation Board
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            JAMB Admin Command Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform Administrator Authentication & CBT Control
          </p>
        </div>

        {/* Form Body */}
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
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Admin Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Access Administrator Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Back to student portal */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                setPhase('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Candidate Portal</span>
            </button>
          </div>
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Authorized Administrators Only</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDisclaimerOpen(true)}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Disclaimer</span>
          </button>
        </div>
      </div>

      {/* Forgot Admin Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        role="admin"
        onSuccess={handleResetSuccess}
      />
    </div>
  );
};
