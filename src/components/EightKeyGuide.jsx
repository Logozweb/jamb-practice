import React from 'react';
import { useExam } from '../context/ExamContext';
import { X, Keyboard, CheckCircle2 } from 'lucide-react';

export const EightKeyGuide = () => {
  const { isEightKeyGuideOpen, setIsEightKeyGuideOpen } = useExam();

  if (!isEightKeyGuideOpen) return null;

  const keyList = [
    { key: 'A', desc: 'Select Option A', group: 'Option Selection' },
    { key: 'B', desc: 'Select Option B', group: 'Option Selection' },
    { key: 'C', desc: 'Select Option C', group: 'Option Selection' },
    { key: 'D', desc: 'Select Option D', group: 'Option Selection' },
    { key: 'P', desc: 'Go to Previous question', group: 'Navigation' },
    { key: 'N', desc: 'Go to Next question', group: 'Navigation' },
    { key: 'S', desc: 'Open Submit confirmation / Confirm submission', group: 'Exam Actions' },
    { key: 'R', desc: 'Flag question for review / Cancel submit dialog', group: 'Exam Actions' },
  ];

  const bonusKeys = [
    { key: '1, 2, 3, 4', desc: 'Switch instantly between your 4 registered subjects' },
    { key: 'Alt + C', desc: 'Toggle the JAMB Onscreen Calculator' },
    { key: 'Esc', desc: 'Close dialogs and modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-[#006633] overflow-hidden">
        {/* Header */}
        <div className="bg-[#006633] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black uppercase tracking-wide">
              Standard 8-Key System Guide
            </h2>
          </div>
          <button
            onClick={() => setIsEightKeyGuideOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            JAMB introduced the <strong>8-Key CBT Navigation System</strong> to allow candidates to complete their UTME entirely without using a mouse. You can answer, navigate, and submit using only these keys on your keyboard:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {keyList.map(({ key, desc, group }) => (
              <div key={key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <kbd className="w-9 h-9 rounded-md bg-[#006633] text-white font-mono font-black text-sm flex items-center justify-center shadow flex-shrink-0">
                  {key}
                </kbd>
                <div>
                  <div className="text-xs font-bold text-slate-800">{desc}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{group}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Simulator Bonus Shortcuts
            </div>
            <div className="space-y-1.5">
              {bonusKeys.map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between text-xs p-2 bg-amber-50/60 rounded border border-amber-200/60">
                  <span className="text-slate-700 font-medium">{desc}</span>
                  <kbd className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono font-bold text-[11px] whitespace-nowrap">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsEightKeyGuideOpen(false)}
            className="px-5 py-2 bg-[#006633] hover:bg-[#00552b] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-colors"
          >
            Got It, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
