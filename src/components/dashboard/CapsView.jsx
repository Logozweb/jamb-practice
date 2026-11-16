import React from 'react';
import { useExam } from '../../context/ExamContext';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Award, GraduationCap, Building } from 'lucide-react';

export const CapsView = () => {
  const { currentUser, acceptCapsAdmission, rejectCapsAdmission, setPhase } = useExam();

  if (!currentUser) return null;

  const caps = currentUser.caps || { status: 'Admission in Progress' };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex flex-col items-center">
      {/* Top Action Bar */}
      <div className="max-w-4xl w-full mb-4 flex items-center justify-between no-print">
        <button
          onClick={() => setPhase('dashboard')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#006633]" />
          <span>Back to Candidate Dashboard</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-500">
          CAPS Portal v4.2
        </span>
      </div>

      {/* CAPS Main Card */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden">
        {/* Banner */}
        <div className="bg-[#004d25] p-6 text-white text-center border-b-4 border-amber-400">
          <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300 mb-1">
            Joint Admissions and Matriculation Board
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            Central Admissions Processing System (CAPS)
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Candidate Admission Status Tracking & Offer Acceptance Portal
          </p>
        </div>

        {/* Candidate Information Header */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={currentUser.passport}
              alt="Passport"
              className="w-20 h-24 object-cover rounded-lg border-2 border-slate-400 shadow bg-slate-200"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=Candidate&background=006633&color=fff";
              }}
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">Candidate Details</div>
              <div className="text-lg font-black text-slate-900 uppercase">{currentUser.name}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 pt-1">
                <div>Reg No: <strong className="font-mono text-slate-900">{currentUser.regNumber}</strong></div>
                <div>Profile Code: <strong className="font-mono text-slate-900">{currentUser.profileCode}</strong></div>
                <div>State: <strong className="text-slate-900">{currentUser.stateOfOrigin}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Admission Offer Status Section */}
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Provisional Admission Status
          </h2>

          {caps.accepted ? (
            <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase">
                    Admission Offer Accepted! 🎉
                  </h3>
                  <p className="text-xs text-emerald-800">
                    You have formally accepted your admission offer into <strong>{caps.institution}</strong>.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div>Admitted Programme: <strong>{caps.course}</strong></div>
                <div>Admitting Institution: <strong>{caps.institution}</strong></div>
                <div className="text-[11px] text-slate-500 pt-1">
                  You may proceed to your institution portal for post-admission screening and clearance.
                </div>
              </div>
            </div>
          ) : caps.rejected ? (
            <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 space-y-2">
              <div className="flex items-center gap-3">
                <XCircle className="w-7 h-7 text-rose-600 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-black uppercase">
                    Admission Offer Rejected
                  </h3>
                  <p className="text-xs text-rose-800">
                    You declined the provisional admission offered by {caps.institution}. Your profile has been returned to the national marketplace.
                  </p>
                </div>
              </div>
            </div>
          ) : caps.status === 'Admitted' ? (
            <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-950 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                  🎓
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-amber-950">
                    Congratulations! Admission Recommended
                  </h3>
                  <p className="text-xs text-amber-800">
                    The Joint Admissions and Matriculation Board has approved your admission.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-200 text-xs space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-bold uppercase block text-[10px]">Institution:</span>
                    <strong className="text-slate-900 text-sm">{caps.institution}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase block text-[10px]">Offered Programme:</span>
                    <strong className="text-emerald-800 text-sm">{caps.course}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admission */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={acceptCapsAdmission}
                  className="w-full sm:w-auto px-6 py-3 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Admission Offer</span>
                </button>

                <button
                  onClick={rejectCapsAdmission}
                  className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Admission Offer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-700 space-y-2">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-slate-500 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-800">
                    Admission Status: {caps.status}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your credentials and UTME performance are currently undergoing institutional screening and ranking by <strong>{currentUser.firstChoice?.institution}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* O'Level Upload Verification */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Verified O'Level Results on CAPS
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Exam Body</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentUser.olevel?.subjects?.map((subj, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-600">{currentUser.olevel.examType}</td>
                      <td className="p-2.5 font-bold text-slate-800">{subj.name}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{subj.grade}</td>
                      <td className="p-2.5 text-center text-emerald-700 font-bold">Verified ✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
