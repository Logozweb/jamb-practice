import React from 'react';
import { useExam } from '../context/ExamContext';
import { ChevronLeft, ChevronRight, Flag, Send, Keyboard, LayoutGrid } from 'lucide-react';

export const BottomNav = () => {
  const {
    currentQuestionIndex,
    activeSubjectId,
    examData,
    goToPrevQuestion,
    goToNextQuestion,
    toggleFlag,
    setIsSubmitModalOpen,
    activeKeyFeedback,
    selectOption,
    setIsMobilePaletteOpen
  } = useExam();

  const subjectData = examData[activeSubjectId];
  const totalQuestions = subjectData ? subjectData.questions.length : 0;
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === totalQuestions - 1;
  const isFlagged = subjectData ? !!subjectData.flags[currentQuestionIndex] : false;

  const eightKeys = [
    { key: 'A', label: 'Option A', action: () => selectOption(0), type: 'opt' },
    { key: 'B', label: 'Option B', action: () => selectOption(1), type: 'opt' },
    { key: 'C', label: 'Option C', action: () => selectOption(2), type: 'opt' },
    { key: 'D', label: 'Option D', action: () => selectOption(3), type: 'opt' },
    { key: 'P', label: 'Previous', action: goToPrevQuestion, type: 'nav' },
    { key: 'N', label: 'Next', action: goToNextQuestion, type: 'nav' },
    { key: 'R', label: 'Review/Flag', action: toggleFlag, type: 'flag' },
    { key: 'S', label: 'Submit', action: () => setIsSubmitModalOpen(true), type: 'submit' }
  ];

  return (
    <div className="bg-white border-t border-slate-300 py-3 px-4 shadow-lg sticky bottom-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mobile Viewport Toolbar (< md) */}
        <div className="flex md:hidden items-center justify-between gap-1.5 w-full">
          <button
            onClick={goToPrevQuestion}
            disabled={isFirst}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-lg font-bold text-xs uppercase transition-all border ${
              isFirst
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobilePaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 shadow-sm"
            title="Open Question Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#006633]" />
            <span>Q{currentQuestionIndex + 1}/{totalQuestions}</span>
          </button>

          <button
            type="button"
            onClick={toggleFlag}
            className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
              isFlagged ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-white text-slate-600 border-slate-300'
            }`}
            title="Flag / Review"
          >
            <Flag className={`w-4 h-4 ${isFlagged ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>

          <button
            onClick={goToNextQuestion}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg font-bold text-xs uppercase bg-[#006633] hover:bg-[#00552b] text-white shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg font-bold text-xs uppercase bg-red-600 hover:bg-red-700 text-white shadow-sm"
            title="Submit / End Exam"
          >
            <span>End</span>
          </button>
        </div>

        {/* Desktop Left: Previous Navigation Button */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={goToPrevQuestion}
            disabled={isFirst}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border ${
              isFirst
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 active:scale-95 shadow-sm'
            }`}
            title="Go to previous question (or Press 'P' on keyboard)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px]">P</kbd>
          </button>
        </div>

        {/* Center: Standard 8-Key System Interactive Bar */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300 shadow-inner">
          <div className="flex items-center gap-1 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-300 mr-1">
            <Keyboard className="w-3.5 h-3.5 text-slate-600" />
            <span>8-Keys</span>
          </div>

          {eightKeys.map(({ key, label, action, type }) => {
            const isFlash = activeKeyFeedback === key;

            let btnStyle = 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300';
            if (type === 'opt') {
              btnStyle = 'bg-white hover:bg-emerald-50 text-[#006633] font-black border-slate-300';
            } else if (type === 'flag') {
              btnStyle = isFlagged ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-white text-slate-700 border-slate-300';
            } else if (type === 'submit') {
              btnStyle = 'bg-red-50 hover:bg-red-100 text-red-700 font-bold border-red-300';
            }

            if (isFlash) {
              btnStyle = 'bg-emerald-600 text-white font-black scale-110 shadow-md ring-2 ring-emerald-400';
            }

            return (
              <button
                key={key}
                onClick={action}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 text-xs font-mono font-bold flex flex-col items-center justify-center transition-all active:scale-90 shadow-sm ${btnStyle}`}
                title={`${label} (Key: ${key})`}
              >
                <span className="text-xs sm:text-sm leading-none">{key}</span>
                <span className="text-[8px] tracking-tighter opacity-70 leading-none scale-90">{label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Next & Submit Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={goToNextQuestion}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#006633] hover:bg-[#00552b] text-white active:scale-95 shadow transition-all"
            title="Go to next question (or Press 'N' on keyboard)"
          >
            <span>Next</span>
            <kbd className="px-1.5 py-0.5 bg-emerald-800 text-emerald-200 rounded font-mono text-[10px]">N</kbd>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
