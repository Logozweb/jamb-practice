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
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border-4 border-rose-700 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-rose-900 to-rose-700 text-white p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <span className="text-[11px] font-black tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full text-rose-200">
              Examination Integrity Protocol • Session Terminated
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase mt-2">
              Automated Session Termination
            </h2>
            <p className="text-xs text-rose-100 font-bold mt-1">
              Permissible Navigation Tolerances Exceeded
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-black text-rose-950 text-sm">
                <Lock className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>Disciplinary Board Referral (3 of 3 Infractions Recorded)</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                The examination proctoring engine recorded three consecutive navigation infractions (window minimization, application alternation, or exiting full-screen mode). The active session has concluded.
              </p>
            </div>

            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                <strong>Administrative Determination:</strong> In accordance with official CBT regulations, this session has concluded and your responses have been recorded with an aggregate score of 0. Your candidate profile has been placed on <strong>Administrative Hold</strong>.
              </p>
              <p>
                <strong>Next Steps:</strong> Further examination sessions remain restricted pending administrative review. You may review your session record below and submit an official statement of explanation through the Candidate Appeals channel on your dashboard.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDisqualificationExit}
                className="w-full py-3.5 bg-rose-800 hover:bg-rose-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>View Examination Disqualification Record</span>
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
            Examination Integrity • Compliance Notice ({malpracticeStrikes} of 3)
          </span>
          <h3 className="text-lg font-black uppercase mt-2">
            {isSecondStrike ? 'Final Compliance Advisory' : 'Session Navigation Advisory'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            An unexpected window navigation, key sequence (such as <strong>ESCAPE</strong>), or full-screen exit was recorded. Official CBT testing regulations mandate uninterrupted full-screen operation throughout the examination session.
          </p>

          <div className={`p-3.5 rounded-xl border text-xs font-bold ${
            isSecondStrike
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            {isSecondStrike ? (
              <p>
                CRITICAL NOTICE (2 of 3): A subsequent navigation infraction will immediately trigger automated session termination, zero aggregate scoring, and candidate profile referral to the Disciplinary Board.
              </p>
            ) : (
              <p>
                ADVISORY (1 of 3): Refrain from pressing the ESCAPE key, switching applications, or minimizing the browser. Two further infractions will result in automated session termination.
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
              <span>Acknowledge &amp; Resume Full-Screen Examination</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
