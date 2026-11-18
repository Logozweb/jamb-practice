import React from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../../data/subjects';
import { ShieldAlert, Lock, Maximize2, AlertTriangle, ArrowRight, X, CheckCircle2 } from 'lucide-react';

export const PreExamSecurityModal = () => {
  const {
    isPreExamModalOpen,
    setIsPreExamModalOpen,
    startExam,
    examMode,
    examLength,
    currentUser,
    selectedSubjectIds
  } = useExam();

  if (!isPreExamModalOpen) return null;

  const isFullMock = examMode === 'simulation' && examLength === 'standard';
  const isPractice = examMode === 'practice';
  const isStandard = examLength === 'standard';
  const totalQuestions = isStandard ? 180 : 45;
  const timeLimit = isStandard ? '120 Minutes (2 Hours)' : '45 Minutes';

  const modeTitle = isFullMock
    ? 'Full Mock Examination Simulator'
    : isPractice && isStandard
    ? 'Full Practice & Study Mode'
    : !isPractice && !isStandard
    ? 'Quick Sprint Timed Test'
    : 'Quick Practice Drill';

  const handleConfirmAndStart = () => {
    // 1. Immediately request browser fullscreen on this explicit user click gesture
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request note:', err.message);
        });
      }
    } catch (e) {}

    // 2. Close confirmation modal and initiate exam start
    setIsPreExamModalOpen(false);
    startExam();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border-4 border-[#006633] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#006633] text-white p-5 sm:p-6 text-center relative">
          <button
            type="button"
            onClick={() => setIsPreExamModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white transition-all"
            title="Cancel and return"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mx-auto mb-2.5">
            <ShieldAlert className="w-8 h-8 text-amber-300" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/40">
            Examination Environment Protocol • Candidate Compliance
          </span>

          <h2 className="text-xl sm:text-2xl font-black uppercase mt-2 text-white">
            Pre-Examination Environment Guidelines
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Computer Based Test (CBT) Simulation Environment
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Candidate & Exam Session Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">Candidate:</span>
              <strong className="text-slate-900 uppercase font-black">{currentUser?.name || 'CBT CANDIDATE'}</strong>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">Exam Type:</span>
              <span className="font-bold text-[#006633] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {modeTitle}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">Scope & Duration:</span>
              <strong className="text-slate-800 font-mono">{totalQuestions} Questions • {timeLimit}</strong>
            </div>
            {isFullMock && (
              <div className="text-[11px] text-emerald-800 bg-emerald-100/70 p-2 rounded border border-emerald-300 font-semibold flex items-center gap-1.5">
                <span>🌐</span>
                <span>Authentic past questions will be loaded into your secured simulation session.</span>
              </div>
            )}
          </div>

          {/* Critical Security Rules Alert Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-800" />
              <span>Mandatory Simulation Conduct &amp; Full-Screen Regulations:</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-start gap-2.5">
                <Maximize2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950 font-bold block">1. Continuous Full-Screen Display:</strong>
                  <span>Commencing the session locks your browser into exclusive full-screen mode. Minimizing the application window or navigating away is strictly prohibited.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950 font-bold block">2. Prohibited System Interactions:</strong>
                  <span>Pressing the <strong>ESCAPE</strong> key, toggling applications (Alt+Tab/Cmd+Tab), or opening developer tools will be logged as security infractions.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 font-bold block">3. Automated Session Termination:</strong>
                  <ul className="mt-1 space-y-1 text-[11px] list-disc list-inside text-amber-900 font-medium">
                    <li><strong>Infractions 1 &amp; 2:</strong> Real-time compliance advisory notices are displayed.</li>
                    <li>
                      <strong>Infraction 3 (Session Closure):</strong> Immediate automated session termination with zero aggregate scoring, and referral of the candidate profile to the Disciplinary Board.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPreExamModalOpen(false)}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Return to Dashboard
            </button>

            <button
              type="button"
              onClick={handleConfirmAndStart}
              className="w-full sm:flex-1 py-3.5 px-6 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Acknowledge &amp; Launch Full-Screen Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
