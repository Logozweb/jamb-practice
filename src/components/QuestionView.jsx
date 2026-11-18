import React from 'react';
import { useExam } from '../context/ExamContext';
import { Flag, BookOpen, CheckCircle, XCircle, Info } from 'lucide-react';

export const QuestionView = () => {
  const {
    activeSubjectId,
    currentQuestionIndex,
    examData,
    examMode,
    selectOption,
    toggleFlag,
    activeKeyFeedback,
    candidate
  } = useExam();

  const subjectData = examData[activeSubjectId];
  if (!subjectData || !subjectData.questions.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        No questions loaded for this subject.
      </div>
    );
  }

  const currentQ = subjectData.questions[currentQuestionIndex];
  const selectedAnswer = subjectData.answers[currentQuestionIndex];
  const isFlagged = !!subjectData.flags[currentQuestionIndex];
  const totalQuestions = subjectData.questions.length;

  const optionLetters = ['A', 'B', 'C', 'D'];

  // Safe topic title (never allow long passages to leak into top pill)
  const safeTopic = (currentQ.topic && currentQ.topic.length <= 32 && !currentQ.topic.includes('\n'))
    ? currentQ.topic
    : subjectData.subjectName;

  // Normalized passage/instruction object if present
  const passageData = currentQ.passage
    ? (typeof currentQ.passage === 'object'
        ? currentQ.passage
        : { title: 'Reading Comprehension Passage / Instruction', text: currentQ.passage })
    : null;

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-4 md:p-6 flex flex-col h-full min-h-[500px] relative overflow-hidden">
      {/* Subtle CBT Security Watermark */}
      <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.035] -rotate-12 z-0">
        <div className="text-center">
          <div className="text-5xl md:text-7xl font-black font-mono tracking-widest uppercase">
            {candidate?.regNumber || 'CBT SIMULATION'}
          </div>
          <div className="text-2xl md:text-3xl font-extrabold uppercase mt-2">
            INDEPENDENT UTME PRACTICE ENGINE
          </div>
        </div>
      </div>
      {/* Top Question Meta Info Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-base md:text-lg font-black text-slate-900">
            Question <span className="text-[#006633]">{currentQuestionIndex + 1}</span> of {totalQuestions}
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-300">
            {safeTopic}
          </span>
          {currentQ.year && (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              JAMB {currentQ.year}
            </span>
          )}
          {currentQ.source?.includes('ALOC') && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-300 flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping"></span>
              <span>ALOC Live API</span>
            </span>
          )}
        </div>

        {/* Flag for review button */}
        <button
          onClick={toggleFlag}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all border ${
            isFlagged
              ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
          title="Flag this question to review later (or Press 'R' on keyboard)"
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-600' : 'text-slate-500'}`} />
          <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 bg-white/70 border border-slate-300 rounded text-[9px] font-mono">R</kbd>
        </button>
      </div>

      {/* Main Body: Stacked high-readability flow */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* 1. Comprehension Passage / Section Instruction Card (Brought above Question Statement) */}
          {passageData && passageData.text && (
            <div className="bg-amber-50/60 border-2 border-amber-200/90 rounded-xl p-4 md:p-5 shadow-xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-900 mb-2.5 flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>{passageData.title || 'Reading Comprehension Passage'}</span>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300/80">
                  Read passage carefully to answer the question below
                </span>
              </div>
              <div className="text-sm md:text-[15px] leading-relaxed text-slate-900 select-text whitespace-pre-line font-serif max-h-72 overflow-y-auto pr-2">
                {passageData.text}
              </div>
            </div>
          )}

          {/* 2. Dedicated Question Statement Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#006633] mb-2.5 flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span>Question Statement</span>
              {currentQ.year && (
                <span className="font-mono text-slate-600 font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  UTME {currentQ.year}
                </span>
              )}
            </div>
            <div className="text-base md:text-lg font-semibold text-slate-900 leading-relaxed select-text whitespace-pre-line">
              {currentQ.question}
            </div>

            {/* Question Diagram / Image if present */}
            {currentQ.image && (
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-center">
                <img
                  src={currentQ.image}
                  alt="Question Diagram"
                  className="max-h-60 object-contain rounded border border-slate-300 shadow-sm bg-white p-2"
                />
              </div>
            )}
          </div>

          {/* 3. Options List A, B, C, D clearly separated below question */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 pl-1">
              Select your answer:
            </div>

            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => {
                const letter = optionLetters[optIdx];
                const isSelected = selectedAnswer === optIdx;
                const isKeyActive = activeKeyFeedback === letter;

                // Practice mode coloring
                const isPractice = examMode === 'practice';
                const hasAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
                const isCorrectOption = optIdx === currentQ.answer;

                let stateClass = 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800';
                if (isPractice && hasAnswered) {
                  if (isCorrectOption) {
                    stateClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                  } else if (isSelected) {
                    stateClass = 'bg-rose-50 border-rose-500 text-rose-950';
                  }
                } else if (isSelected) {
                  stateClass = 'bg-emerald-50/90 border-[#006633] text-slate-950 ring-2 ring-[#006633]/20 font-medium';
                }

                if (isKeyActive) {
                  stateClass += ' scale-[1.01] transition-transform';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => selectOption(optIdx)}
                    className={`w-full text-left p-3.5 md:p-4 rounded-lg border-2 transition-all flex items-center gap-3.5 group cursor-pointer ${stateClass}`}
                  >
                    {/* Letter Badge (A, B, C, D) */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#006633] text-white shadow-sm'
                        : 'bg-slate-100 group-hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {letter}
                    </div>

                    {/* Option Text */}
                    <div className="text-sm md:text-base leading-snug flex-1 select-text">
                      {optionText}
                    </div>

                    {/* Practice mode indicator icon */}
                    {isPractice && hasAnswered && (
                      <div className="flex-shrink-0">
                        {isCorrectOption ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Practice Mode Explanation Box */}
          {examMode === 'practice' && selectedAnswer !== undefined && selectedAnswer !== null && currentQ.explanation && (
            <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg text-blue-900 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-950">
                <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <span>Comprehensive Solution &amp; Explanation:</span>
              </div>
              <p className="leading-relaxed select-text whitespace-pre-line">{currentQ.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
