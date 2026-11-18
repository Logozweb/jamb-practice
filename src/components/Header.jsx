import React from 'react';
import { useExam } from '../context/ExamContext';
import { Calculator, Keyboard, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const {
    candidate,
    timerSeconds,
    examMode,
    setIsCalculatorOpen,
    setIsEightKeyGuideOpen,
    setIsSubmitModalOpen
  } = useExam();

  // Format time HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isLowTime = timerSeconds <= 900; // < 15 mins
  const isCriticalTime = timerSeconds <= 300; // < 5 mins

  return (
    <header className="bg-white border-b-2 border-jamb-border shadow-sm sticky top-0 z-30">
      {/* Official Top Green Banner */}
      <div className="bg-[#006633] text-white px-3 sm:px-4 py-1.5 sm:py-2 flex flex-wrap items-center justify-between border-b border-[#004d25]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1 border-2 border-amber-400 shadow-sm flex-shrink-0">
            {/* JAMB Emblem Vector Style */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
            </svg>
          </div>
          <div>
            <div className="text-[9px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase leading-none">
              Independent UTME Practice &amp; Simulation Engine
            </div>
            <div className="text-xs sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">UTME CBT SIMULATION</span>
              <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-black tracking-wide uppercase ${
                examMode === 'simulation' ? 'bg-amber-400 text-slate-900' : 'bg-blue-200 text-blue-900'
              }`}>
                {examMode === 'simulation' ? 'Exam' : 'Practice'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Tools: Calculator, 8-Key Guide & Auto-save Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/25 text-emerald-300 rounded text-[10px] font-mono border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Auto-Saved Locally</span>
          </div>

          <button
            onClick={() => setIsCalculatorOpen(prev => !prev)}
            title="Open On-Screen Calculator (or press Alt+C)"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] sm:text-xs font-semibold border border-white/20 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>Calc</span>
          </button>

          <button
            onClick={() => setIsEightKeyGuideOpen(true)}
            title="JAMB 8-Key System Guide (A, B, C, D, P, N, S, R)"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded text-[11px] sm:text-xs font-bold shadow-sm transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>8-Key</span>
          </button>
        </div>
      </div>

      {/* Candidate Information Bar & Timer */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Candidate Bio Bar (Just like real JAMB CBT screen) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={candidate.passport}
              alt="Candidate Passport"
              className="w-10 h-12 sm:w-12 sm:h-14 object-cover border-2 border-slate-300 rounded shadow-sm bg-slate-200"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=Jamb+Candidate&background=006633&color=fff";
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-0.5 border border-white" title="Candidate Verified">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="leading-snug min-w-0">
            <div className="text-xs font-bold text-slate-900 uppercase truncate">
              {candidate.name}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-slate-600 font-medium">
              <span>Reg: <strong className="font-mono text-slate-900">{candidate.regNumber}</strong></span>
              <span>Desk: <strong className="font-mono text-slate-900">{candidate.seatNumber || 'Virtual Desk'}</strong></span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
              Centre: {candidate.center}
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer Widget & Submit CTA */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          <div className={`flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg border-2 shadow-inner transition-all ${
            isCriticalTime
              ? 'bg-red-50 border-red-500 text-red-700 animate-pulse'
              : isLowTime
              ? 'bg-amber-50 border-amber-500 text-amber-800'
              : 'bg-slate-900 border-slate-700 text-emerald-400'
          }`}>
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCriticalTime ? 'text-red-600' : isLowTime ? 'text-amber-600' : 'text-emerald-400'}`} />
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                Time Left
              </span>
              <span className="font-mono text-base sm:text-xl font-black tracking-wider leading-tight">
                {formatTime(timerSeconds)}
              </span>
            </div>
            {isCriticalTime && (
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 ml-0.5" />
            )}
          </div>

          {/* Direct End Exam button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-md shadow transition-colors flex items-center gap-1.5"
            title="Submit Exam (or Press 'S' on keyboard)"
          >
            <span>Submit</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-red-800 rounded font-mono font-normal">S</kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
