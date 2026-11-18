import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS, FACULTY_COMBINATIONS } from '../data/subjects';
import { BookOpen, User, Sparkles, Check, ArrowLeft, Save } from 'lucide-react';

export const SetupModal = () => {
  const {
    currentUser,
    updateCurrentUser,
    selectedSubjectIds,
    setSelectedSubjectIds,
    setPhase
  } = useExam();

  const [activeFacultyIndex, setActiveFacultyIndex] = useState(0);
  const [saveToast, setSaveToast] = useState(false);

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

  const handleProceed = () => {
    if (selectedSubjectIds.length !== 4) {
      alert("A valid JAMB candidate profile requires exactly 4 registered subjects. (Use of English is compulsory).");
      return;
    }
    if (!selectedSubjectIds.includes('english')) {
      alert("Use of English is compulsory for all candidates.");
      return;
    }
    setSelectedSubjectIds([...selectedSubjectIds]);
    if (currentUser) {
      updateCurrentUser({
        ...currentUser,
        center: 'ONLINE JAMB CBT SIMULATION',
        selectedSubjects: [...selectedSubjectIds]
      });
    }
    setSaveToast(true);
    setTimeout(() => {
      setPhase('dashboard');
    }, 400);
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
            className="w-full sm:w-auto px-8 py-3.5 bg-[#006633] hover:bg-[#00552b] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Combination & Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
