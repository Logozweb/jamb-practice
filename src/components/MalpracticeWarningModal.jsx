import React from 'react';
import { useExam } from '../context/ExamContext';
import { AlertTriangle, ShieldAlert, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export const MalpracticeWarningModal = () => {
  const {
    malpracticeStrikes,
    setMalpracticeStrikes,
    isMalpracticeModalOpen,
    setIsMalpracticeModalOpen,
    isDisqualified,
    setIsDisqualified,
    phase,
    setPhase,
    reEnterFullscreen
  } = useExam();

  // If already on the result phase or modal is closed, do not render
  if (phase === 'result' || !isMalpracticeModalOpen) return null;

  const handleReturnToFullscreen = () => {
    if (reEnterFullscreen) {
      reEnterFullscreen();
    } else {
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}
    }
    setIsMalpracticeModalOpen(false);
  };

  const handleDisqualificationExit = () => {
    setIsMalpracticeModalOpen(false);
    setIsDisqualified(false);
    setMalpracticeStrikes(0);
    setPhase('result');
  };

  // -------------------------------------------------------------
  // STRIKE 3 / DISQUALIFIED
  // -------------------------------------------------------------
  if (malpracticeStrikes >= 3 || isDisqualified) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border-4 border-red-600 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-red-700 text-white p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mx-auto mb-3 animate-pulse">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <span className="text-[11px] font-black tracking-widest uppercase bg-black/30 px-3 py-1 rounded-full text-red-200">
              Anti-Malpractice Security Protocol
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase mt-2">
              Examination Terminated
            </h2>
            <p className="text-xs text-red-100 font-bold mt-1">
              Disqualified for Suspected Examination Malpractice
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-black text-red-900 text-sm">
                <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Candidate Account Disapproved (3/3 Violations)</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                You have exceeded the maximum allowable navigation violations during this CBT session by switching windows, tabbing away, pressing ESCAPE, or exiting fullscreen mode.
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Administrative Action Taken:</strong> Your examination session has been stopped and automatically submitted with a score of 0. Your candidate account has been set to <strong>Disapproved / Suspended</strong>.
              </p>
              <p>
                Under official CBT regulations, you are <strong>strictly barred from taking or retaking any examination</strong> on this platform unless a Platform Administrator reviews your case and approves your account again.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDisqualificationExit}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>View Disqualification Result Record</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STRIKE 1 & STRIKE 2
  // -------------------------------------------------------------
  const isSecondStrike = malpracticeStrikes === 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-2xl border-4 overflow-hidden animate-in zoom-in-95 duration-150 ${
        isSecondStrike ? 'border-amber-600' : 'border-amber-500'
      }`}>
        <div className={`p-5 text-white text-center ${
          isSecondStrike ? 'bg-amber-600' : 'bg-amber-500'
        }`}>
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-black/30 px-2.5 py-0.5 rounded-full text-amber-100">
            Security Warning Violation ({malpracticeStrikes} of 3)
          </span>
          <h3 className="text-lg font-black uppercase mt-2">
            {isSecondStrike ? '🚨 Final Malpractice Warning' : '⚠️ Navigation Violation Detected'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            You navigated away from the active examination window, pressed the <strong>ESCAPE</strong> key, or exited full-screen mode. Under JAMB CBT anti-cheating protocols, all candidates must remain locked in full-screen mode at all times.
          </p>

          <div className={`p-3.5 rounded-xl border text-xs font-bold ${
            isSecondStrike
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            {isSecondStrike ? (
              <p>
                🚨 FINAL CRITICAL WARNING: This is Strike 2 of 3! Pressing ESCAPE or switching tabs one more time will immediately DISQUALIFY your exam and DISAPPROVE your candidate account.
              </p>
            ) : (
              <p>
                Notice (Strike 1 of 3): Do NOT press the ESCAPE (ESC) key or switch tabs. Continued violations will result in automatic submission, zero score, and account disapproval.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReturnToFullscreen}
              className={`w-full py-3 font-black text-xs uppercase tracking-wider rounded-xl text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isSecondStrike ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#006633] hover:bg-[#00552b]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Return to Full-Screen Examination</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
