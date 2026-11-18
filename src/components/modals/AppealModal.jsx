import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { apiSubmitAppeal } from '../../services/dbService';
import { ShieldAlert, AlertTriangle, Send, X, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export const AppealModal = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser } = useExam();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const isPendingReview = currentUser.appealStatus === 'pending';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 20) {
      setErrorMsg('Please provide a detailed explanation of at least 20 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    const res = await apiSubmitAppeal(currentUser.id, reason.trim());
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('Your formal statement of representation has been logged and transmitted to the Examination Administrator for disciplinary review.');
      if (res.candidate) {
        updateCurrentUser(res.candidate);
      } else {
        updateCurrentUser({ ...currentUser, appealStatus: 'pending' });
      }
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      setErrorMsg(res.error || 'Failed to submit appeal. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-rose-600 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-rose-700 p-4 sm:p-5 text-white relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-3 right-3 p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
              <ShieldAlert className="w-3 h-3" />
              <span>Candidate Representation Channel</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
            Disciplinary Review &amp; Formal Representation
          </h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Submit an official statement of explanation to the Examination Administrator
          </p>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Sanction Notice */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-1">
            <div className="font-bold text-rose-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>Integrity Protocol Infraction Notice:</span>
            </div>
            <p className="text-rose-900 pl-5">
              {currentUser.disapprovalReason || 'Active session terminated following repeated full-screen and application navigation compliance infractions.'}
            </p>
          </div>

          {/* Candidate Bio */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Candidate:</span>
              <strong className="text-slate-800 uppercase font-mono">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registration Number:</span>
              <strong className="text-slate-800 font-mono">{currentUser.regNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Center:</span>
              <span className="text-slate-700">{currentUser.center}</span>
            </div>
          </div>

          {isPendingReview ? (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center space-y-2">
              <Clock className="w-8 h-8 text-amber-600 mx-auto" />
              <div className="text-xs font-bold text-amber-950 uppercase">
                Official Representation Under Administrative Review
              </div>
              <p className="text-[11px] text-amber-900 max-w-sm mx-auto leading-relaxed">
                Your formal explanation was received and logged. The Examination Administrator is reviewing your case file. Results of the review will update directly on your dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Official Statement &amp; Grounds for Re-Activation:
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a detailed, factual account of the circumstances surrounding the session interruptions (e.g., unintended trackpad/gesture input, electrical disruption, external notification, system prompt)..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 focus:outline-none"
                  disabled={submitting || Boolean(successMsg)}
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Minimum 20 characters required</span>
                  <span>{reason.trim().length} characters</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || Boolean(successMsg) || reason.trim().length < 20}
                  className="w-full py-3 px-4 bg-rose-800 hover:bg-rose-900 active:bg-rose-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Representation to Board...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Official Representation to Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-[10px] text-slate-400 text-center leading-relaxed">
            Note: The Disciplinary Board may restore unconditional clearance, approve conditional re-activation with concession, or maintain the active sanction.
          </div>
        </div>

      </div>
    </div>
  );
};
