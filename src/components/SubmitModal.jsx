import React from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../data/subjects';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

export const SubmitModal = () => {
  const {
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    selectedSubjectIds,
    examData,
    submitExam,
    timerSeconds
  } = useExam();

  if (!isSubmitModalOpen) return null;

  let totalQuestionsOverall = 0;
  let totalAnsweredOverall = 0;

  const subjectStats = selectedSubjectIds.map(subId => {
    const subData = examData[subId] || { questions: [], answers: {} };
    const totalQ = subData.questions.length;
    const answered = Object.keys(subData.answers).filter(k => subData.answers[k] !== undefined && subData.answers[k] !== null).length;
    const unanswered = totalQ - answered;

    totalQuestionsOverall += totalQ;
    totalAnsweredOverall += answered;

    return {
      subId,
      name: AVAILABLE_SUBJECTS.find(s => s.id === subId)?.name || subId,
      totalQ,
      answered,
      unanswered
    };
  });

  const totalUnansweredOverall = totalQuestionsOverall - totalAnsweredOverall;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-red-700 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
              JAMB Examination Submission Confirmation
            </h2>
            <p className="text-xs text-red-100">
              Please review your attempt breakdown across all 4 subjects before final submission.
            </p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Subject Attempt Summary
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5 text-center">Total</th>
                  <th className="p-2.5 text-center text-emerald-700">Answered</th>
                  <th className="p-2.5 text-center text-rose-700">Unanswered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectStats.map(stat => (
                  <tr key={stat.subId} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">{stat.name}</td>
                    <td className="p-2.5 text-center font-mono">{stat.totalQ}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-600 bg-emerald-50/50">{stat.answered}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-600 bg-rose-50/50">{stat.unanswered}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="p-2.5 uppercase">Grand Total</td>
                  <td className="p-2.5 text-center font-mono">{totalQuestionsOverall}</td>
                  <td className="p-2.5 text-center font-mono text-emerald-700">{totalAnsweredOverall}</td>
                  <td className="p-2.5 text-center font-mono text-rose-700">{totalUnansweredOverall}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Warning Message */}
          {totalUnansweredOverall > 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> You still have <strong className="text-rose-700">{totalUnansweredOverall} unanswered questions</strong> across your subjects! Once you submit, your scores will be finalized immediately.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Great job! You have attempted all {totalQuestionsOverall} questions.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              title="Return to exam (Key: R)"
            >
              <span>Return to Exam</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">R</kbd>
            </button>

            <button
              onClick={() => submitExam(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
              title="Confirm Submit (Key: S)"
            >
              <span>Yes, Submit Examination</span>
              <kbd className="px-1.5 py-0.5 bg-red-800 text-red-100 rounded text-[10px] font-mono">S</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
