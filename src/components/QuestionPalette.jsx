import React from 'react';
import { useExam } from '../context/ExamContext';

export const QuestionPalette = () => {
  const {
    activeSubjectId,
    currentQuestionIndex,
    examData,
    jumpToQuestion,
    setIsMobilePaletteOpen
  } = useExam();

  const subjectData = examData[activeSubjectId];
  if (!subjectData) return null;

  const questions = subjectData.questions || [];
  const answers = subjectData.answers || {};
  const flags = subjectData.flags || {};

  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).length;
  const flaggedCount = Object.keys(flags).filter(k => flags[k]).length;
  const unansweredCount = totalCount - answeredCount;

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Question Palette
        </h3>
        <span className="text-[11px] font-mono font-bold text-slate-500">
          {answeredCount}/{totalCount}
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 p-2 bg-slate-50 rounded border border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#006633]" />
          <span className="text-slate-700 font-medium">Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-400" />
          <span className="text-slate-700 font-medium">Unanswered ({unansweredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-600" />
          <span className="text-slate-700 font-medium">Flagged ({flaggedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-600" />
          <span className="text-slate-700 font-medium">Current Question</span>
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-1.5">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
            const isFlagged = !!flags[idx];

            let cellClass = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300';
            if (isCurrent) {
              cellClass = 'bg-blue-600 text-white font-extrabold ring-2 ring-blue-300 shadow';
            } else if (isFlagged) {
              cellClass = 'bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold border-amber-600';
            } else if (isAnswered) {
              cellClass = 'bg-[#006633] hover:bg-[#00552b] text-white font-bold';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  jumpToQuestion(idx);
                  setIsMobilePaletteOpen?.(false);
                }}
                className={`h-8 rounded text-xs transition-all flex items-center justify-center font-mono font-bold ${cellClass}`}
                title={`Question ${idx + 1}${isFlagged ? ' (Flagged)' : isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
