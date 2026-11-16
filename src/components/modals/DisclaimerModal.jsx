import React from 'react';
import { X, ShieldAlert, BookOpen, CheckCircle, Info, Award, ExternalLink } from 'lucide-react';

export const DisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#004d25] p-5 text-white flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
                <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
              </svg>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                JAMB Practice Platform
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-white">
                Platform Disclaimer & Notice
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Disclaimer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {/* Key Disclaimer Callout */}
          <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-amber-950 uppercase text-xs">
                JAMB Practice Platform • Independent CBT Simulation
              </h3>
              <p className="mt-1 text-amber-900 font-medium">
                This platform is an authentic <strong>CBT Simulation and Practice Environment</strong> designed specifically to help Nigerian candidates familiarize themselves with the official JAMB CBT examination software, 8-key navigation system, 2-hour unified clock, and on-screen tools before their actual test day.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 uppercase">Real JAMB Past Questions:</strong>
                <p className="text-slate-600 mt-0.5">
                  All test questions, comprehension passages, diagrams, and answer choices are pulled from authentic past JAMB UTME examination archives and official question APIs across all registered subjects.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#006633] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 uppercase">Exact CBT Engine Clone:</strong>
                <p className="text-slate-600 mt-0.5">
                  The keyboard navigation keys (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">A</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">B</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">C</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">D</code> for choices; <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">P</code> for Previous, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">N</code> for Next, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">S</code> for Submit, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">R</code> for Reverse/Flag), calculator, split comprehension reading panel, and question palette reflect the exact layout candidates will see at accredited JAMB CBT centers nationwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 uppercase">Educational & Preparatory Purpose Only:</strong>
                <p className="text-slate-600 mt-0.5">
                  This portal is an independent preparatory study and simulation platform. It is not affiliated with, authorized, endorsed by, or in any way officially connected with the Joint Admissions and Matriculation Board (JAMB) or the Federal Government of Nigeria. It does not replace or execute government registration for university admission. To register for the actual national examination or purchase official e-PINs, candidates must visit an accredited JAMB CBT registration center or the official JAMB portal at <span className="font-mono text-emerald-800 font-bold">www.jamb.gov.ng</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            JAMB Practice Platform • Independent Study Resource for 2026/2027 Candidates
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#006633] hover:bg-[#00552b] text-white font-bold text-xs uppercase rounded-lg shadow transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
