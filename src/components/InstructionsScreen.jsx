import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../data/subjects';
import { CheckCircle2, Clock, Keyboard, AlertTriangle, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const InstructionsScreen = () => {
  const {
    candidate,
    selectedSubjectIds,
    examMode,
    examLength,
    startExam,
    setPhase,
    setIsPreExamModalOpen
  } = useExam();

  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const isPractice = examMode === 'practice';
  const isStandard = examLength === 'standard';
  const totalQuestions = isStandard ? 180 : 45;
  const timeLimit = isStandard ? '2 hours (120 minutes)' : '45 minutes';
  const breakdownLabel = isStandard
    ? '60 English + 40 each for other 3 subjects'
    : '15 English + 10 each for other 3 subjects';

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-4 sm:py-8 px-3 sm:px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border-2 border-[#006633] overflow-hidden">
        {/* Banner */}
        <div className="bg-[#006633] text-white p-4 sm:p-6 border-b-4 border-amber-400 text-center">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-300 font-extrabold mb-1">
            JAMB Practice Platform
          </div>
          <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight">
            Unified Tertiary Matriculation Examination (UTME)
          </h1>
          <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
            Candidate Verification &amp; Examination Simulation Instructions
          </p>
        </div>

        {/* Candidate Slip Box */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 sm:p-5 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            <img
              src={candidate.passport}
              alt="Candidate"
              className="w-16 h-20 sm:w-24 sm:h-28 object-cover border-2 border-[#006633] rounded-lg shadow bg-slate-200 flex-shrink-0"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=Jamb+Candidate&background=006633&color=fff";
              }}
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Candidate Name</div>
              <div className="text-sm sm:text-lg font-black text-slate-900 uppercase">{candidate.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-0.5">
                <div>Reg No: <strong className="font-mono text-slate-900">{candidate.regNumber}</strong></div>
                <div>Seat No: <strong className="font-mono text-slate-900">{candidate.seatNumber}</strong></div>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-600 truncate">
                Centre: <strong>{candidate.center}</strong>
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-800 font-bold pt-0.5">
                Registered Subjects: {selectedSubjectIds.map(id => AVAILABLE_SUBJECTS.find(s => s.id === id)?.name).join(' • ')}
              </div>
            </div>
          </div>

          {/* Instructions Accordion / Collapsible Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => setIsAccordionOpen(prev => !prev)}
              className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200/80 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                  Examination Guidelines &amp; Security Protocol
                </span>
                <span className="text-[10px] bg-emerald-100 text-[#006633] font-bold px-2 py-0.5 rounded-full">
                  {totalQuestions} Qs • {timeLimit}
                </span>
              </div>
              {isAccordionOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {isAccordionOpen && (
              <div className="p-4 space-y-3 bg-white">
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                    <span>
                      The examination consists of <strong>{totalQuestions} questions</strong> ({breakdownLabel}). Total allowable time is <strong>{timeLimit}</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                    <span>
                      You may attempt the questions in any order and switch between subjects at any time using the <strong>Subject Tabs</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>The 8-Key System:</strong> Use keys <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">A</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">B</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">C</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">D</kbd> to pick options; <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">P</kbd> (prev), <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">N</kbd> (next); <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">S</kbd> (submit).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                    <span>
                      A built-in <strong>On-Screen Calculator</strong> is available for computation subjects.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 bg-red-50 p-2.5 rounded-lg border border-red-200 text-red-950 font-medium">
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Anti-Malpractice Security Protocol:</strong> Clicking Start enters <strong>Fullscreen Mode</strong>. Exiting fullscreen, switching tabs, or navigating away triggers violation warnings. On the <strong>3rd strike</strong>, your session is terminated, submitted, and your account suspended.
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase('dashboard')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                ← Return to Dashboard
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setPhase('setup')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Change Combination
              </button>
            </div>

            <button
              onClick={() => setIsPreExamModalOpen(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>START EXAMINATION NOW</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
