import React from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../../data/subjects';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RegistrationSlipView = () => {
  const { currentUser, setPhase } = useExam();

  if (!currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex flex-col items-center">
      {/* Top Action Bar (hidden on print) */}
      <div className="max-w-4xl w-full mb-4 flex items-center justify-between no-print">
        <button
          onClick={() => setPhase('dashboard')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#006633]" />
          <span>Back to Candidate Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Practice Examination Slip</span>
        </button>
      </div>

      {/* Official Registration Slip Document */}
      <div id="printable-result-slip" className="max-w-4xl w-full bg-white rounded-xl shadow-xl border-2 border-slate-300 overflow-hidden p-6 md:p-8 font-sans">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800 relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow mb-1">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
            </svg>
          </div>
          <div className="text-[11px] uppercase font-bold tracking-widest text-slate-700">
            Independent UTME CBT Simulator
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">
            UTME Examination Simulation &amp; Practice Portal
          </h1>
          <div className="text-xs md:text-sm font-black text-[#006633] uppercase tracking-wide mt-0.5">
            2026 UTME CANDIDATE PRACTICE EXAMINATION SUMMARY SLIP
          </div>
        </div>

        {/* Candidate Bio & Passport Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-b border-slate-300 items-start">
          {/* Passport & Fingerprint box */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={currentUser.passport}
              alt="Passport"
              className="w-28 h-32 object-cover border-2 border-slate-800 rounded bg-slate-100 shadow-sm"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=Candidate&background=006633&color=fff";
              }}
            />
            {/* Biometric Thumbprint stamp */}
            <div className="w-24 h-16 border border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[9px] text-slate-500 bg-slate-50">
              <span className="font-bold text-emerald-800">THUMBPRINT</span>
              <span className="font-semibold text-emerald-700">VERIFIED</span>
            </div>
          </div>

          {/* Bio Data Details */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Practice ID:</span>
                <span className="text-sm sm:text-base font-black font-mono text-[#006633]">{currentUser.practiceId || ('SIM-2026-' + (currentUser.regNumber ? currentUser.regNumber.slice(-4) : '7841'))}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Registration Number:</span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-800">{currentUser.regNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Profile Code:</span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900">{currentUser.profileCode}</span>
              </div>
            </div>

            <div className="pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Candidate Full Name:</span>
              <span className="text-sm font-black uppercase text-slate-900">{currentUser.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Gender:</span>
                <span className="font-bold text-slate-900">{currentUser.gender || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Date of Birth:</span>
                <span className="font-bold text-slate-900">{currentUser.dob || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">State of Origin / LGA:</span>
                <span className="font-bold text-slate-900">{currentUser.stateOfOrigin} ({currentUser.lga})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Email Address:</span>
                <span className="font-medium text-slate-800">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Telephone / Phone No:</span>
                <span className="font-mono font-medium text-slate-800">{currentUser.phone || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Schedule & Center Allocation Box */}
        <div className="py-4 border-b border-slate-300 bg-emerald-50/50 p-4 rounded-lg my-4 border border-emerald-200">
          <div className="text-xs font-black uppercase text-[#006633] tracking-wider mb-2 flex items-center justify-between">
            <span>Practice Examination Schedule & CBT Allocation</span>
            <span className="text-[10px] bg-emerald-100 text-[#006633] font-mono font-bold px-2 py-0.5 rounded border border-emerald-300">
              UNLIMITED CBT PRACTICE
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Assigned CBT Simulation Centre:</span>
              <strong className="text-slate-900">{currentUser.center}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Practice Schedule & Access:</span>
              <strong className="text-emerald-800">{currentUser.examDate || 'Flexible / Unlimited On-Demand'}</strong>
              <div className="text-[11px] font-semibold text-slate-700">{currentUser.examTime || 'Self-Paced Practice (Unlimited Attempts)'}</div>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">CBT Workstation Seat:</span>
              <strong className="text-slate-900 font-mono text-sm">{currentUser.seatNumber}</strong>
            </div>
          </div>
        </div>

        {/* UTME 4-Subject Combination */}
        <div className="py-4 border-b border-slate-300">
          <div className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
            Registered UTME Subjects
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentUser.selectedSubjects.map((subId, idx) => (
              <div key={subId} className="p-2.5 bg-slate-100 rounded border border-slate-300 text-xs font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center font-mono text-[10px]">
                  {idx + 1}
                </span>
                <span>{AVAILABLE_SUBJECTS.find(s => s.id === subId)?.name || subId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Choices */}
        <div className="py-4 border-b border-slate-300">
          <div className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
            Choices of Tertiary Institutions & Programmes
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <strong className="text-slate-900">1st Choice (Degree):</strong> {currentUser.firstChoice?.institution} — <span className="text-emerald-800 font-bold">{currentUser.firstChoice?.course}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <strong className="text-slate-900">2nd Choice (Degree):</strong> {currentUser.secondChoice?.institution} — <span className="text-emerald-800 font-bold">{currentUser.secondChoice?.course}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <strong className="text-slate-900">3rd Choice (Polytechnic):</strong> {currentUser.thirdChoice?.institution} — <span className="text-emerald-800 font-bold">{currentUser.thirdChoice?.course}</span>
            </div>
            {currentUser.fourthChoice && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <strong className="text-slate-900">4th Choice (College of Education):</strong> {currentUser.fourthChoice?.institution} — <span className="text-emerald-800 font-bold">{currentUser.fourthChoice?.course}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barcode and Authentication Footer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="space-y-0.5 font-mono text-[10px]">
            <div>SYSTEM GENERATED SLIP • REG ID: {currentUser.regNumber}</div>
            <div>INDEPENDENT STUDY & CBT SIMULATION RESOURCE (NOT AN OFFICIAL GOVERNMENT DOCUMENT)</div>
          </div>

          <div className="flex items-center gap-0.5 h-7">
            {[3,2,4,1,5,3,2,1,4,2,3,5,2,4,1,3,2,5,3,2,4,1,3,2].map((w, idx) => (
              <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.5}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
