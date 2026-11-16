import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { Printer, RotateCcw, CheckCircle, XCircle, AlertCircle, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const ResultSlip = () => {
  const { finalResult, setPhase } = useExam();
  const [activeReviewSubject, setActiveReviewSubject] = useState(
    finalResult?.subjectBreakdown[0]?.subjectId || 'english'
  );
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  if (!finalResult) {
    return (
      <div className="p-12 text-center text-slate-500">
        No examination result found. Please start an exam.
      </div>
    );
  }

  const {
    candidate,
    aggregateScore,
    subjectBreakdown,
    timeSpentSeconds,
    autoTriggered,
    examData
  } = finalResult;

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;

  // Grade Assessment
  let gradeRemark = 'Fair Performance';
  let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  if (aggregateScore >= 280) {
    gradeRemark = 'Outstanding Distinction! (Highly Competitive for Top Tier Programmes)';
    badgeColor = 'bg-emerald-100 text-emerald-950 border-emerald-400';
  } else if (aggregateScore >= 240) {
    gradeRemark = 'Very Good (Competitive for University Admission)';
    badgeColor = 'bg-blue-100 text-blue-950 border-blue-400';
  } else if (aggregateScore >= 200) {
    gradeRemark = 'Good (Eligible for Most Degree Programmes)';
    badgeColor = 'bg-slate-100 text-slate-900 border-slate-300';
  } else {
    gradeRemark = 'Below Average (Requires Dedicated Remedial Revision)';
    badgeColor = 'bg-rose-100 text-rose-950 border-rose-300';
  }

  const reviewSubjectData = examData[activeReviewSubject];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex flex-col items-center">
      {/* Top Action Bar (hidden when printing) */}
      <div className="max-w-4xl w-full mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhase('dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <span>← Candidate Dashboard</span>
          </button>

          <button
            onClick={() => setPhase('instructions')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span>Retake Exam</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetailedReview(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>{showDetailedReview ? 'Hide Question Review' : 'View Detailed Solution Review'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Practice Result Slip</span>
          </button>
        </div>
      </div>

      {/* Official JAMB Result Slip Document */}
      <div id="printable-result-slip" className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden mb-8">
        {/* Document Header */}
        <div className="bg-[#006633] text-white p-6 md:p-8 text-center relative border-b-4 border-amber-400">
          <div className="w-16 h-16 mx-auto rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-amber-400 shadow-md mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
            </svg>
          </div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-extrabold">
            JAMB Practice Platform
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            UTME CBT Practice & Examination Simulation
          </h1>
          <div className="text-xs md:text-sm font-bold text-emerald-100 uppercase tracking-wide mt-1">
            UTME CBT Practice Score Notification
          </div>
        </div>

        {/* Candidate Bio & Aggregate Score Hero */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Passport Photo */}
            <div className="flex flex-col items-center sm:items-start md:flex-row gap-4 md:col-span-2">
              <img
                src={candidate.passport}
                alt="Candidate"
                className="w-24 h-28 object-cover border-2 border-slate-400 rounded-lg shadow-sm bg-slate-200 flex-shrink-0"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Jamb+Candidate&background=006633&color=fff";
                }}
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Candidate Name</div>
                <div className="text-lg font-black text-slate-900 uppercase">{candidate.name}</div>
                <div className="text-xs text-slate-700">
                  Registration Number: <strong className="font-mono text-slate-900">{candidate.regNumber}</strong>
                </div>
                <div className="text-xs text-slate-700">
                  Seat Number: <strong className="font-mono text-slate-900">{candidate.seatNumber}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Center: <strong>{candidate.center}</strong>
                </div>
              </div>
            </div>

            {/* Aggregate Score Ring */}
            <div className="bg-slate-50 border-2 border-[#006633] rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-inner">
              <div className="text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                Aggregate UTME Score
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono text-[#006633] leading-none">
                {aggregateScore}
                <span className="text-lg font-normal text-slate-400">/400</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-2">
                Time Used: {minutesSpent}m {secondsSpent}s
              </div>
            </div>
          </div>
        </div>

        {/* Remark Banner */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Overall Status: <strong className="text-slate-900">{gradeRemark}</strong></span>
          </div>
          {autoTriggered && (
            <span className="text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded font-mono text-[10px]">
              Auto-Submitted on Timer Expiry
            </span>
          )}
        </div>

        {/* Subject-by-Subject Score Breakdown Table */}
        <div className="p-6 md:p-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
            Subject Performance Breakdown
          </h2>

          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#006633] text-white font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Registered Subject</th>
                  <th className="p-3 text-center">Questions</th>
                  <th className="p-3 text-center">Correct</th>
                  <th className="p-3 text-center">Wrong</th>
                  <th className="p-3 text-center">Unanswered</th>
                  <th className="p-3 text-right">Scaled Score (/100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectBreakdown.map((item) => (
                  <tr key={item.subjectId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{item.subjectName}</td>
                    <td className="p-3 text-center font-mono">{item.totalQuestions}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">{item.correctCount}</td>
                    <td className="p-3 text-center font-mono text-rose-700 bg-rose-50/40">{item.wrongCount}</td>
                    <td className="p-3 text-center font-mono text-slate-500">{item.unansweredCount}</td>
                    <td className="p-3 text-right font-mono font-black text-sm text-[#006633]">
                      {item.scaledScore} / 100
                    </td>
                  </tr>
                ))}
                {/* Aggregate Row */}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="p-3 uppercase">Aggregate Total</td>
                  <td className="p-3 text-center font-mono">
                    {subjectBreakdown.reduce((sum, i) => sum + i.totalQuestions, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-emerald-800">
                    {subjectBreakdown.reduce((sum, i) => sum + i.correctCount, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-rose-800">
                    {subjectBreakdown.reduce((sum, i) => sum + i.wrongCount, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-600">
                    {subjectBreakdown.reduce((sum, i) => sum + i.unansweredCount, 0)}
                  </td>
                  <td className="p-3 text-right font-mono text-base text-[#006633]">
                    {aggregateScore} / 400
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Barcode & Security Stamp Simulation */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <div className="space-y-1 font-mono text-[10px]">
              <div>AUTHENTICATION CODE: {Math.random().toString(36).substring(2, 12).toUpperCase()}-UTME</div>
              <div>SYSTEM GENERATED REPORT • NO SIGNATURE REQUIRED</div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex items-center gap-0.5 h-8">
              {[4,2,3,1,5,2,4,1,3,2,6,1,4,2,3,5,2,1,4,3,2,1,5,3,2].map((w, idx) => (
                <div key={idx} className="bg-slate-700 h-full" style={{ width: `${w * 1.5}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Solution Review Section (Expandable) */}
      {showDetailedReview && (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-300 p-6 md:p-8 no-print animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase">
                Detailed Examination Solution & Explanations
              </h2>
              <p className="text-xs text-slate-500">
                Review your chosen answers against verified answers and detailed step-by-step explanations.
              </p>
            </div>

            {/* Subject Selector for Review */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {subjectBreakdown.map(sub => (
                <button
                  key={sub.subjectId}
                  onClick={() => setActiveReviewSubject(sub.subjectId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
                    activeReviewSubject === sub.subjectId
                      ? 'bg-[#006633] text-white border-[#006633]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {sub.subjectName}
                </button>
              ))}
            </div>
          </div>

          {/* List of reviewed questions */}
          <div className="space-y-6">
            {reviewSubjectData?.questions.map((q, idx) => {
              const userChoice = reviewSubjectData.answers[idx];
              const isCorrect = userChoice === q.answer;
              const isUnanswered = userChoice === undefined || userChoice === null;

              return (
                <div
                  key={idx}
                  className={`p-4 md:p-5 rounded-xl border-2 transition-all ${
                    isUnanswered
                      ? 'bg-slate-50 border-slate-300'
                      : isCorrect
                      ? 'bg-emerald-50/50 border-emerald-400'
                      : 'bg-rose-50/50 border-rose-400'
                  }`}
                >
                  {/* Top Q Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">
                      Question {idx + 1} • <span className="text-slate-500 font-normal">{(q.topic && q.topic.length <= 30) ? q.topic : 'UTME Question'}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isUnanswered
                        ? 'bg-slate-200 text-slate-700'
                        : isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isUnanswered ? (
                        <>Unanswered</>
                      ) : isCorrect ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Correct</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Wrong</>
                      )}
                    </span>
                  </div>

                  {/* Reading Passage if present */}
                  {q.passage && (
                    <div className="bg-amber-50/60 border border-amber-200/90 rounded-lg p-3.5 mb-3 text-xs md:text-sm text-slate-800 font-serif whitespace-pre-line max-h-48 overflow-y-auto">
                      <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5 font-sans text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                        <span>{typeof q.passage === 'object' ? (q.passage.title || 'Reading Passage') : 'Reading Passage'}</span>
                      </div>
                      {typeof q.passage === 'object' ? q.passage.text : q.passage}
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-sm md:text-base font-semibold text-slate-900 mb-4 select-text whitespace-pre-line">
                    {q.question}
                  </div>

                  {q.image && (
                    <div className="mb-4 flex justify-center">
                      <img src={q.image} alt="Question Diagram" className="max-h-48 object-contain rounded border p-1 bg-white" />
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {q.options.map((optText, optIdx) => {
                      const letter = optionLetters[optIdx];
                      const isCandidatePick = userChoice === optIdx;
                      const isActualAnswer = optIdx === q.answer;

                      let optStyle = 'bg-white border-slate-200 text-slate-700';
                      if (isActualAnswer) {
                        optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                      } else if (isCandidatePick && !isCorrect) {
                        optStyle = 'bg-rose-100 border-rose-500 text-rose-950 line-through';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${optStyle}`}>
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center font-mono">
                            {letter}
                          </span>
                          <span className="flex-1 select-text">{optText}</span>
                          {isActualAnswer && <span className="text-[10px] uppercase font-bold text-emerald-700">(Correct)</span>}
                          {isCandidatePick && !isActualAnswer && <span className="text-[10px] uppercase font-bold text-rose-700">(Your Answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div className="p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
