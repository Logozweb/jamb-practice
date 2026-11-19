import React from 'react';
import { useExam } from '../../context/ExamContext';
import { ShieldCheck, CheckCircle2, Printer, X, CreditCard, Sparkles, Award } from 'lucide-react';

export const LicenseReceiptModal = ({ isOpen, onClose }) => {
  const { currentUser, paymentSettings } = useExam();

  if (!isOpen || !currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  const accessFee = paymentSettings?.accessFeeNaira || 50;
  const concessionFee = Math.round(accessFee / 2);
  const isReactivation = currentUser.appealStatus === 'reinstated' || Boolean(currentUser.paymentReference && currentUser.paymentReference.includes('reactivat'));
  const amount = currentUser.paymentAmount || (isReactivation ? concessionFee : accessFee);
  const formattedDate = currentUser.paymentDate
    ? new Date(currentUser.paymentDate).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Active Simulation Session';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-[#006633] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#004d25] text-white p-5 text-center relative border-b-4 border-amber-400">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors no-print"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-white mx-auto p-1 flex items-center justify-center border-2 border-amber-400 shadow mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
            </svg>
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
            Independent UTME CBT Simulator
          </span>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide mt-0.5">
            CBT Access License Receipt
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Electronic Payment &amp; Practice Clearance Record
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Status Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#006633] text-white flex items-center justify-center shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">License Status:</span>
                <strong className="text-emerald-950 text-sm">ACTIVE • FULL ACCESS</strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount Paid:</span>
              <strong className="text-lg font-black text-[#006633]">₦{amount}.00</strong>
            </div>
          </div>

          {/* Candidate & Transaction Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Candidate Name:</span>
              <strong className="text-slate-900 uppercase font-mono">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Practice ID:</span>
              <strong className="text-[#006633] font-mono">{currentUser.practiceId || ('SIM-2026-' + (currentUser.regNumber ? currentUser.regNumber.slice(-4) : '7841'))}</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Registration Number:</span>
              <span className="text-slate-900 font-mono font-bold">{currentUser.regNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Paystack Reference:</span>
              <span className="text-slate-700 font-mono text-[11px] truncate max-w-[220px]">
                {currentUser.paymentReference || 'PRE_REGISTERED_LICENSE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Verified Timestamp:</span>
              <span className="text-slate-700">{formattedDate}</span>
            </div>
          </div>

          {/* Enabled Capabilities */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              Enabled Examination Capabilities:
            </span>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Unlimited 180-Question Timed Mock CBT Simulations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Subject Drills &amp; Step-by-Step Question Solutions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Score Performance Diagnostics &amp; Central Score Record</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Simulated Central Admission Processing System (CAPS)</span>
              </div>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="text-[10px] text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-center leading-relaxed">
            Independent UTME Practice Simulator • Payment receipt for academic software access. Not affiliated with or issued by the Joint Admissions and Matriculation Board.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[#006633] hover:bg-[#00552b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
