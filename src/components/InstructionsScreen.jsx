import React from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../data/subjects';
import { CheckCircle2, Clock, Keyboard, AlertTriangle, ShieldCheck } from 'lucide-react';

export const InstructionsScreen = () => {
  const {
    candidate,
    selectedSubjectIds,
    examMode,
    examLength,
    startExam,
    setPhase
  } = useExam();

  const totalQuestions = examLength === 'standard' ? 180 : 60;
  const timeLimit = examLength === 'standard' ? '2 hours (120 minutes)' : '45 minutes';
  const breakdownLabel = examLength === 'standard'
    ? '60 English + 40 each for other 3 subjects'
    : '15 questions across each subject';

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl border-2 border-[#006633] overflow-hidden">
        {/* Banner */}
        <div className="bg-[#006633] text-white p-6 border-b-4 border-amber-400 text-center">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-extrabold mb-1">
            JAMB Practice Platform
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            Unified Tertiary Matriculation Examination (UTME)
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Candidate Verification & Examination Simulation Instructions
          </p>
        </div>

        {/* Candidate Slip Box */}
        <div className="p-6 md:p-8">
          <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 md:p-6 mb-6 flex flex-col sm:flex-row items-center gap-5">
            <img
              src={candidate.passport}
              alt="Candidate"
              className="w-24 h-28 object-cover border-2 border-[#006633] rounded-lg shadow bg-slate-200 flex-shrink-0"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=Jamb+Candidate&background=006633&color=fff";
              }}
            />
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Name</div>
              <div className="text-base sm:text-lg font-black text-slate-900 uppercase">{candidate.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                <div>Reg No: <strong className="font-mono text-slate-900">{candidate.regNumber}</strong></div>
                <div>Seat No: <strong className="font-mono text-slate-900">{candidate.seatNumber}</strong></div>
              </div>
              <div className="text-xs text-slate-600 truncate">
                Centre: <strong>{candidate.center}</strong>
              </div>
              <div className="text-xs text-emerald-800 font-bold pt-1">
                Registered Subjects: {selectedSubjectIds.map(id => AVAILABLE_SUBJECTS.find(s => s.id === id)?.name).join(' • ')}
              </div>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-4 mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b pb-2">
              General Examination Instructions:
            </h2>

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
                  You may attempt the questions in any order and switch between subjects at any time using the <strong>Subject Tabs</strong> at the top of your screen.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>The 8-Key System:</strong> You can take this entire exam without touching the mouse! Use keys <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">A</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">B</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">C</kbd>, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">D</kbd> to pick options; <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">P</kbd> for previous, <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">N</kbd> for next; <kbd className="font-mono font-bold text-slate-900 bg-slate-200 px-1 rounded">S</kbd> to submit.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
                <span>
                  A built-in <strong>On-Screen Calculator</strong> is provided for calculation subjects.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  When the timer counts down to <strong>00:00:00</strong>, your answers will be automatically submitted by the system.
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
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
              onClick={() => startExam()}
              className="w-full sm:w-auto px-10 py-4 bg-[#006633] hover:bg-[#00552b] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse"
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
