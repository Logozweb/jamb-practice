import React from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../data/subjects';

export const SubjectTabs = () => {
  const {
    selectedSubjectIds,
    activeSubjectId,
    switchSubject,
    examData
  } = useExam();

  return (
    <div className="bg-slate-100 border-b border-slate-300 px-4 py-1.5 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:inline-block mr-2">
          Subject Tabs:
        </span>
        {selectedSubjectIds.map((subId, index) => {
          const subMeta = AVAILABLE_SUBJECTS.find(s => s.id === subId);
          const isActive = activeSubjectId === subId;
          const subData = examData[subId] || { questions: [], answers: {} };
          const totalQ = subData.questions.length;
          const answeredCount = Object.keys(subData.answers).filter(k => subData.answers[k] !== undefined && subData.answers[k] !== null).length;

          return (
            <button
              key={subId}
              onClick={() => switchSubject(subId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-t-2 font-semibold text-xs md:text-sm transition-all whitespace-nowrap shadow-sm relative ${
                isActive
                  ? 'bg-white border-[#006633] text-[#006633] shadow-md font-bold'
                  : 'bg-slate-200/90 hover:bg-slate-300/80 border-transparent text-slate-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-300/60 text-slate-800 text-[10px] font-bold flex items-center justify-center font-mono">
                {index + 1}
              </span>
              <span>{subMeta ? subMeta.name : subId}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                isActive
                  ? 'bg-emerald-100 text-[#006633]'
                  : 'bg-slate-300/70 text-slate-600'
              }`}>
                {answeredCount}/{totalQ}
              </span>

              {/* Bottom active indicator */}
              {isActive && (
                <div className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
