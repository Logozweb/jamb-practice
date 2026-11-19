import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS, FACULTY_COMBINATIONS } from '../data/subjects';
import { BookOpen, User, Sparkles, Check, ArrowLeft, Save, AlertTriangle, Lock, HelpCircle } from 'lucide-react';

export const SetupModal = () => {
  const {
    currentUser,
    updateCurrentUser,
    updateCandidateSubjects,
    selectedSubjectIds,
    setSelectedSubjectIds,
    setPhase
  } = useExam();

  const [activeFacultyIndex, setActiveFacultyIndex] = useState(0);
  const [saveToast, setSaveToast] = useState(false);
  const [limitNotice, setLimitNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectChangeCount = Number(currentUser?.subjectChangeCount || 0);
  const isLimitReached = subjectChangeCount >= 2;

  const handleApplyPreset = (combination, index) => {
    setActiveFacultyIndex(index);
    setSelectedSubjectIds([...combination.subjects]);
  };

  const handleToggleSubject = (subId) => {
    if (subId === 'english') return; // English is mandatory

    if (selectedSubjectIds.includes(subId)) {
      if (selectedSubjectIds.length > 2) {
        setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subId));
        setActiveFacultyIndex(-1); // custom
      }
    } else {
      if (selectedSubjectIds.length < 4) {
        setSelectedSubjectIds([...selectedSubjectIds, subId]);
        setActiveFacultyIndex(-1);
      }
    }
  };

  const handleProceed = async () => {
    if (isLimitReached) {
      setLimitNotice("Maximum subject combination modifications reached (2/2). Under JAMB CBT simulation policy, you cannot make further modifications without administrative clearance. Please contact the Center Administrator via the Help Desk.");
      return;
    }

    if (selectedSubjectIds.length !== 4) {
      alert("A valid JAMB candidate profile requires exactly 4 registered subjects. (Use of English is compulsory).");
      return;
    }
    if (!selectedSubjectIds.includes('english')) {
      alert("Use of English is compulsory for all candidates.");
      return;
    }

    setIsSubmitting(true);
    setLimitNotice(null);

    const res = await updateCandidateSubjects(selectedSubjectIds);
    setIsSubmitting(false);

    if (res && !res.success) {
      setLimitNotice(res.error || 'Failed to update subject combination.');
      return;
    }

    setSaveToast(true);
    setTimeout(() => {
      setPhase('dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#006633] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-amber-400">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-amber-400 shadow-md flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
                <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
              </svg>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-300 font-extrabold">
                JAMB Practice Platform
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                4-Subject Combination Manager
              </h1>
              <p className="text-xs text-emerald-100 mt-0.5">
                Customize your registered examination subjects for the 2026/2027 UTME CBT simulation.
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 self-start md:self-auto text-right">
            <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Target Examination</div>
            <div className="text-sm font-black text-white">2026/2027 UTME</div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Modification Limit Notice */}
          {isLimitReached ? (
            <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl flex items-start gap-3 text-rose-900 animate-in fade-in">
              <Lock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-rose-950">
                  Subject Modification Limit Reached (2 of 2 Changes Used)
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Under official JAMB examination regulations, candidates are permitted a maximum of two (2) subject combination alterations. You have exhausted your allowed attempts. To request an exceptional modification, please contact the Center Administrator via the Help Desk.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setPhase('dashboard')}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold uppercase transition-all shadow-sm"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Subject Modification Policy:</strong> Candidates are allowed a maximum of <strong>2 alterations</strong>.
                </span>
              </div>
              <span className="font-mono font-bold text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 whitespace-nowrap self-start sm:self-auto">
                {subjectChangeCount} of 2 Used ({2 - subjectChangeCount} remaining)
              </span>
            </div>
          )}

          {limitNotice && (
            <div className="p-3.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{limitNotice}</span>
            </div>
          )}

          {/* Section 1: Candidate Verification Info */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#006633]" />
              <span>1. Verified Candidate Profile</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Candidate Name</span>
                <span className="text-xs font-black text-slate-900 uppercase truncate block">
                  {currentUser?.name || 'JAMB CANDIDATE'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Registration No</span>
                <span className="text-xs font-mono font-black text-slate-900 block">
                  {currentUser?.regNumber || '202676081547EB'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Examination Centre</span>
                <span className="text-xs font-bold text-[#006633] block">
                  ONLINE JAMB CBT SIMULATION
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Seat Number</span>
                <span className="text-xs font-mono font-bold text-slate-800 block">
                  {currentUser?.seatNumber || 'A-053'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Combinations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#006633]" />
                <span>2. 4-Subject Combination Selection</span>
              </h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedSubjectIds.length === 4
                  ? 'bg-emerald-100 text-[#006633]'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedSubjectIds.length}/4 Selected
              </span>
            </div>

            {/* Quick Faculty Presets */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Combination Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {FACULTY_COMBINATIONS.map((fac, idx) => {
                  const isPresetActive = activeFacultyIndex === idx;
                  return (
                    <button
                      key={fac.name}
                      onClick={() => handleApplyPreset(fac, idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isPresetActive
                          ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {fac.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Checkbox Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                const isCompulsory = sub.compulsory;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleToggleSubject(sub.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#006633] text-[#006633] shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sub.icon}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sub.code} {isCompulsory && '• Compulsory'}
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#006633] border-[#006633] text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-slate-100 p-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPhase('dashboard')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel & Return to Dashboard</span>
            </button>
            {saveToast && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Saved!</span>
              </span>
            )}
          </div>

          <button
            onClick={handleProceed}
            disabled={isLimitReached || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLimitReached || isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-[#006633] hover:bg-[#00552b] text-white hover:shadow-xl active:scale-95'
            }`}
          >
            {isLimitReached ? (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Modification Locked (Limit Reached)</span>
              </>
            ) : isSubmitting ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Combination & Return to Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
